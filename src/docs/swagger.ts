import type { Express } from "express";
import swaggerJSDoc, { type Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export const setupSwagger = (app: Express) => {
  const options: Options = {
    definition: {
      openapi: "3.1.0",
      info: {
        title: "E-Commerce User/Product API",
        version: "1.0.0",
        description: "REST API for e-commerce clothing platform.",
        contact: {
          name: "Alberto Ribeiro",
          url: "https://aribeirodev.onrender.com",
        },
      },
      servers: [
        {
          url: "/api/v1",
          description: "API v1",
        },
      ],
      components: {
        schemas: {
          Product: {
            type: "object",
            required: ["name", "slug", "description", "category", "variants"],
            properties: {
              _id: {
                type: "string",
                example: "672c4e8f8c8e12a53b52e91a",
                readOnly: true,
              },
              name: {
                type: "string",
                example: "Classic Oxford Shirt",
                minLength: 2,
                maxLength: 100,
              },
              slug: {
                type: "string",
                example: "classic-oxford-shirt",
                readOnly: true,
              },
              description: {
                type: "string",
                example:
                  "A premium cotton oxford shirt perfect for business casual.",
                minLength: 10,
                maxLength: 2000,
              },
              category: {
                type: "string",
                example: "Shirts",
                minLength: 2,
                maxLength: 50,
              },
              featured: { type: "boolean", default: false },
              images: {
                type: "array",
                items: { type: "string", format: "uri" },
                example: ["https://example.com/image1.jpg"],
              },
              tags: {
                type: "array",
                items: { type: "string" },
                example: ["formal", "cotton", "essential"],
              },
              variants: {
                type: "array",
                minItems: 1,
                items: { $ref: "#/components/schemas/ProductVariant" },
              },
              createdAt: {
                type: "string",
                format: "date-time",
                readOnly: true,
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                readOnly: true,
              },
            },
          },
          ProductVariant: {
            type: "object",
            required: ["size", "color", "stock", "price"],
            properties: {
              sku: {
                type: "string",
                example: "SHIR-WHIT-M-A1B2C3",
                readOnly: true,
              },
              size: {
                type: "string",
                example: "M",
                minLength: 1,
                maxLength: 20,
              },
              color: {
                type: "string",
                example: "White",
                minLength: 1,
                maxLength: 30,
              },
              stock: { type: "integer", example: 50, minimum: 0 },
              price: { type: "number", example: 45.0, minimum: 0 },
              discount: {
                type: "number",
                example: 0,
                minimum: 0,
                maximum: 100,
              },
            },
          },
          Error: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: { type: "string", example: "Resource not found" },
            },
          },
          User: {
            type: "object",
            required: ["username", "email", "role", "isVerified", "isActive"],
            properties: {
              _id: { type: "string", readOnly: true },
              username: { type: "string", example: "john_doe" },
              email: {
                type: "string",
                example: "john@example.com",
                readOnly: true,
              },
              role: { type: "string", example: "user" },
              isVerified: {
                type: "boolean",
                example: true,
                description: "Whether the user's email is verified",
                readOnly: true,
              },
              isActive: {
                type: "boolean",
                example: true,
                description: "Whether the account is active (admin-controlled)",
                readOnly: true,
              },
              createdAt: {
                type: "string",
                format: "date-time",
                readOnly: true,
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                readOnly: true,
              },
            },
          },
        },
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: ["./src/routes/*.ts"],
  };

  const specs = swaggerJSDoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
