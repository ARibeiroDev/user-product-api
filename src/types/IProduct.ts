export interface IProductVariant {
  readonly _id?: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  price: number;
  discount?: number;
}

export interface IProduct {
  readonly _id?: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  category: string;
  tags?: string[];
  featured: boolean;
  variants: IProductVariant[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
