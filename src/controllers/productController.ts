import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ProductService } from "../services/ProductService.js";
import { parseQuery, type QueryOptions } from "../utils/queryHelper.js";
import { ApiError } from "../middleware/errorHandler.js";

/**
 * @desc Get all products
 * @route GET /products
 * @access Public
 */
export const getAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const options: QueryOptions = parseQuery(req.query);

    const products = await ProductService.getAllProducts(options);

    const { data, total, page, limit } = products;

    res.json({
      success: true,
      message: products.data.length
        ? "Products fetched successfully"
        : "No products found",
      pagination: {
        total,
        page,
        limit,
        totalPages: limit ? Math.ceil(total / limit) : 1, // prevents potential division by zero if limit is 0
      },
      data,
    });
  }
);

/**
 * @desc Get a single product by slug
 * @route GET /products/:slug
 * @access Public
 */
export const getProductBySlug = asyncHandler(
  async (req: Request<{ slug?: string }>, res: Response) => {
    const { slug } = req.params;
    if (!slug) throw new ApiError("Slug is required", 400);

    const product = await ProductService.getProductBySlug(slug);

    res.json({
      success: true,
      message: "Product fetched",
      data: product,
    });
  }
);

/**
 * @desc Create a new product
 * @route POST /products
 * @access Private
 */
export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await ProductService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  }
);

/**
 * @desc Update a product by ID
 * @route PATCH /products/:id
 * @access Private
 */
export const updateProduct = asyncHandler(
  async (req: Request<{ id?: string }>, res: Response) => {
    const { id } = req.params;
    if (!id) throw new ApiError("ID is required", 400);

    const updated = await ProductService.updateProduct(id, req.body);

    res.json({
      success: true,
      message: "Product updated successfully",
      data: updated,
    });
  }
);

/**
 * @desc Delete a product by ID
 * @route DELETE /products/:id
 * @access Private
 */
export const deleteProduct = asyncHandler(
  async (req: Request<{ id?: string }>, res: Response) => {
    const { id } = req.params;
    if (!id) throw new ApiError("ID is required", 400);

    const deleted = await ProductService.deleteProduct(id);

    res.json({
      success: true,
      message: `Product ${deleted.name} deleted successfully`,
    });
  }
);

/**
 * @desc Add a Variant
 * @route POST /products/:id/variants
 * @access Private
 */
export const addVariant = asyncHandler(
  async (req: Request<{ id?: string }>, res: Response) => {
    const { id } = req.params;
    if (!id) throw new ApiError("ID is required", 400);

    const variant = await ProductService.addVariant(id, req.body);

    res.status(201).json({
      success: true,
      message: "Variant added successfully",
      data: variant,
    });
  }
);

/**
 * @desc Update a Variant
 * @route PATCH /products/:id/variants/:sku
 * @access Private
 */
export const updateVariant = asyncHandler(
  async (req: Request<{ id?: string; sku?: string }>, res: Response) => {
    const { id, sku } = req.params;
    if (!id || !sku) throw new ApiError("ID and SKU are required", 400);

    const variant = await ProductService.updateVariant(id, sku, req.body);

    res.json({
      success: true,
      message: "Variant updated successfully",
      data: variant,
    });
  }
);

/**
 * @desc Delete a Variant
 * @route DELETE /products/:id/variants/:sku
 * @access Private
 */
export const deleteVariant = asyncHandler(
  async (req: Request<{ id?: string; sku?: string }>, res: Response) => {
    const { id, sku } = req.params;
    if (!id || !sku) throw new ApiError("ID and SKU are required", 400);

    await ProductService.deleteVariant(id, sku);

    res.json({
      success: true,
      message: `Variant deleted successfully`,
    });
  }
);
