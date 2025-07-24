export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  reviews: Review[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Review {
  _id?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}

export interface ProductQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  products: Product[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
}
