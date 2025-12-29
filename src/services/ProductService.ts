import { ApiError } from "../middleware/errorHandler.js";
import { Product } from "../models/ProductModel.js";
import type { IProduct, IProductVariant } from "../types/IProduct.js";
import { Types, type QueryFilter } from "mongoose";
import { generateSlug } from "../utils/generateSlug.js";
import { generateSku } from "../utils/generateSku.js";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  filters?: {
    category?: string | undefined;
    tags?: string[] | undefined;
  };
  sort?: "asc" | "desc" | "newest";
}

export class ProductService {
  // Get All Products
  static async getAllProducts(options: PaginationOptions) {
    const { page = 1, limit = 10, filters, sort = "newest" } = options;

    const query: QueryFilter<IProduct> = {};
    if (filters?.category) query.category = filters.category;
    if (filters?.tags) query.tags = { $in: filters.tags };

    const sortOpt: any =
      sort === "asc"
        ? { name: 1 }
        : sort === "desc"
        ? { name: -1 }
        : { createdAt: -1 };

    const [total, data] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort(sortOpt)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<IProduct[]>(),
    ]);

    return { data, total, page, limit };
  }

  // Get Product By Slug
  static async getProductBySlug(slug: string) {
    const product = await Product.findOne({ slug }).lean<IProduct>();
    if (!product) throw new ApiError("Product not found", 404);
    return product;
  }

  // Create Product
  static async createProduct(input: Partial<IProduct>): Promise<IProduct> {
    const slug = generateSlug(input.name!);

    const exists = await Product.findOne({
      $or: [{ name: input.name! }, { slug: slug }],
    });

    if (exists) throw new ApiError("Product already exists", 409);

    const variants =
      input.variants?.map((v) => ({
        ...v,
        sku: generateSku(input.category!, v.color, v.size),
        discount: v.discount ?? 0,
      })) || [];

    const skus = variants.map((v) => v.sku);
    const duplicateSku = await Product.findOne({
      "variants.sku": { $in: skus },
    });
    if (duplicateSku)
      throw new ApiError("SKU already exists, please try again", 409);

    const newProduct = await Product.create({
      ...input,
      slug,
      variants,
    });
    return newProduct.toObject();
  }

  // Update Product
  static async updateProduct(
    id: string,
    input: Partial<IProduct>
  ): Promise<IProduct> {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError("Invalid product ID", 400);

    const product = await Product.findById(id);
    if (!product) throw new ApiError("Product not found", 404);

    const categoryChanged =
      input.category && input.category !== product.category;

    if (input.description) product.description = input.description;
    if (input.category) product.category = input.category;
    if (input.tags) product.tags = input.tags;
    if (input.featured !== undefined) product.featured = input.featured;
    if (input.images) product.images = input.images;

    if (input.name && input.name !== product.name) {
      const newSlug = generateSlug(input.name);

      const slugExists = await Product.exists({
        slug: newSlug,
        _id: { $ne: id },
      });

      if (slugExists) throw new ApiError("Product already exists", 409);

      product.name = input.name;
      product.slug = newSlug;
    }

    if (categoryChanged) {
      product.variants.forEach((v) => {
        v.sku = generateSku(input.category!, v.color, v.size);
      });
    }

    if (input.variants) {
      const categoryForSku = input.category || product.category;

      const processedVariants = input.variants.map((v) => {
        return {
          ...v,
          sku: generateSku(categoryForSku, v.color, v.size),
          discount: v.discount ?? 0,
        };
      });

      const newSkus = processedVariants.map((v) => v.sku);

      const duplicateSku = await Product.findOne({
        "variants.sku": { $in: newSkus },
        _id: { $ne: id },
      });

      if (duplicateSku)
        throw new ApiError("One of the variants already exists", 409);

      product.variants = processedVariants;
    }

    await product.save();

    return product.toObject();
  }

  // Delete Product
  static async deleteProduct(id: string): Promise<IProduct> {
    if (!Types.ObjectId.isValid(id))
      throw new ApiError("Invalid product ID", 400);

    const deleted = await Product.findByIdAndDelete(id).lean<IProduct>();

    if (!deleted) throw new ApiError("Product not found", 404);

    return deleted;
  }

  // Add Variant
  static async addVariant(id: string, input: IProductVariant) {
    const product = await Product.findById(id);
    if (!product) throw new ApiError("Product not found", 404);

    const sku = generateSku(product.category, input.color, input.size);

    const existsInProduct = product.variants.some(
      (v) => v.color === input.color && v.size === input.size
    );
    if (existsInProduct)
      throw new ApiError(
        `Variant "${input.color}" - "${input.size}" already exists`,
        409
      );

    const existsGlobal = await Product.exists({
      "variants.sku": sku,
      _id: { $ne: id },
    });
    if (existsGlobal)
      throw new ApiError("Variant SKU collision with another product", 409);

    product.variants.push({
      ...input,
      sku,
      discount: input.discount ?? 0,
    });

    await product.save();
    return product.toObject();
  }

  // Update Variant
  static async updateVariant(
    productId: string,
    sku: string,
    input: Partial<IProductVariant>
  ) {
    const updateQuery: any = {};
    if (input.price !== undefined)
      updateQuery["variants.$.price"] = input.price;
    if (input.stock !== undefined)
      updateQuery["variants.$.stock"] = input.stock;
    if (input.discount !== undefined)
      updateQuery["variants.$.discount"] = input.discount;

    const product = await Product.findOneAndUpdate(
      { _id: productId, "variants.sku": sku },
      { $set: updateQuery },
      { new: true, runValidators: true }
    );

    if (!product) throw new ApiError("Product or Variant not found", 404);
    return product.toObject();
  }

  // Delete Variant
  static async deleteVariant(productId: string, sku: string) {
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        $pull: { variants: { sku: sku } }, // Atomic removal
      },
      { new: true }
    );

    if (!product) throw new ApiError("Product not found", 404);
    return product;
  }
}
