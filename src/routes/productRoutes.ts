import Router from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductBySlug,
  updateProduct,
  addVariant,
  updateVariant,
  deleteVariant,
} from "../controllers/productController.js";
import {
  createProductValidation,
  updateProductValidation,
  addVariantValidation,
  updateVariantValidation,
} from "../validations/productValidation.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authProtect } from "../middleware/authProtect.js";
import { restrictTo } from "../middleware/roleHandler.js";

export const router = Router();
/**
 * @swagger
 * tags:
 *  name: Products
 *  description: Product management and variant controls
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve a list of products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         description: Comma-separated tags
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc, newest]
 *           default: newest
 *     responses:
 *       200:
 *         description: Paginated list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */

router.get("/", getAllProducts);

/**
 * @swagger
 * /products/{slug}:
 *   get:
 *     summary: Get product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get("/:slug", getProductBySlug);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 *       409:
 *         description: Product or SKU already exists
 *       422:
 *         description: Validation error
 */
router.post(
  "/",
  authProtect,
  restrictTo("admin"),
  createProductValidation,
  validateRequest,
  createProduct
);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update an existing product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 *       409:
 *         description: Product or variant already exists
 *       422:
 *         description: Validation error
 */
router.patch(
  "/:id",
  authProtect,
  restrictTo("admin"),
  updateProductValidation,
  validateRequest,
  updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.delete("/:id", authProtect, restrictTo("admin"), deleteProduct);

/**
 * @swagger
 * /products/{id}/variants:
 *   post:
 *     summary: Add a new variant to a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductVariant'
 *     responses:
 *       201:
 *         description: Variant added
 *       404:
 *         description: Product not found
 *       409:
 *         description: Variant already exists or SKU collision
 *       422:
 *         description: Validation error
 */
router.post(
  "/:id/variants",
  authProtect,
  restrictTo("admin"),
  addVariantValidation,
  validateRequest,
  addVariant
);

/**
 * @swagger
 * /products/{id}/variants/{sku}:
 *   patch:
 *     summary: Update variant stock or price
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               discount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Variant updated
 *       404:
 *         description: Product or variant not found
 *       422:
 *         description: Validation error
 */
router.patch(
  "/:id/variants/:sku",
  authProtect,
  restrictTo("admin"),
  updateVariantValidation,
  validateRequest,
  updateVariant
);

/**
 * @swagger
 * /products/{id}/variants/{sku}:
 *   delete:
 *     summary: Delete a product variant
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Variant deleted successfully
 *       404:
 *         description: Variant not found
 */

router.delete(
  "/:id/variants/:sku",
  authProtect,
  restrictTo("admin"),
  deleteVariant
);
