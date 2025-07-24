import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product, ProductQuery, ProductResponse, Review } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  getProducts(query?: ProductQuery): Observable<ProductResponse> {
    let params = new HttpParams();
    
    if (query) {
      if (query.search) params = params.set('search', query.search);
      if (query.category) params = params.set('category', query.category);
      if (query.minPrice) params = params.set('minPrice', query.minPrice.toString());
      if (query.maxPrice) params = params.set('maxPrice', query.maxPrice.toString());
      if (query.sortBy) params = params.set('sortBy', query.sortBy);
      if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
    }

    return this.http.get<ProductResponse>(`${environment.apiUrl}/products`, { params })
      .pipe(catchError(this.handleError));
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/${id}`)
      .pipe(catchError(this.handleError));
  }

  createProduct(product: Omit<Product, '_id' | 'createdAt' | 'updatedAt' | 'reviews'>): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/products`, product)
      .pipe(catchError(this.handleError));
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${environment.apiUrl}/products/${id}`, product)
      .pipe(catchError(this.handleError));
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/products/${id}`)
      .pipe(catchError(this.handleError));
  }

  addProduct(product: Omit<Product, '_id' | 'createdAt' | 'updatedAt' | 'reviews'>): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/products`, product)
      .pipe(catchError(this.handleError));
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/products/categories`)
      .pipe(catchError(this.handleError));
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products/featured`)
      .pipe(catchError(this.handleError));
  }

  searchProducts(searchTerm: string): Observable<Product[]> {
    const params = new HttpParams().set('search', searchTerm);
    return this.http.get<Product[]>(`${environment.apiUrl}/products/search`, { params })
      .pipe(catchError(this.handleError));
  }

  addReview(productId: string, review: Omit<Review, '_id' | 'createdAt'>): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/products/${productId}/reviews`, review)
      .pipe(catchError(this.handleError));
  }

  updateReview(productId: string, reviewId: string, review: Partial<Review>): Observable<Product> {
    return this.http.put<Product>(`${environment.apiUrl}/products/${productId}/reviews/${reviewId}`, review)
      .pipe(catchError(this.handleError));
  }

  deleteReview(productId: string, reviewId: string): Observable<Product> {
    return this.http.delete<Product>(`${environment.apiUrl}/products/${productId}/reviews/${reviewId}`)
      .pipe(catchError(this.handleError));
  }

  uploadProductImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.http.post<{ imageUrl: string }>(`${environment.apiUrl}/products/upload`, formData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Product service error:', error);
    return throwError(() => error.error?.message || 'A product service error occurred');
  }
}
