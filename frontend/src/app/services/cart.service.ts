import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '../models/cart.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  loadCart(): void {
    this.http.get<Cart>(`${environment.apiUrl}/cart`)
      .pipe(catchError(() => {
        // Return empty cart if user not authenticated or cart doesn't exist
        return throwError(() => null);
      }))
      .subscribe({
        next: (cart) => this.cartSubject.next(cart),
        error: () => this.cartSubject.next(this.createEmptyCart())
      });
  }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${environment.apiUrl}/cart`)
      .pipe(
        map(cart => {
          this.cartSubject.next(cart);
          return cart;
        }),
        catchError(this.handleError)
      );
  }

  addToCart(request: AddToCartRequest): Observable<Cart> {
    return this.http.post<Cart>(`${environment.apiUrl}/cart/add`, request)
      .pipe(
        map(cart => {
          this.cartSubject.next(cart);
          return cart;
        }),
        catchError(this.handleError)
      );
  }

  updateCartItem(request: UpdateCartItemRequest): Observable<Cart> {
    return this.http.put<Cart>(`${environment.apiUrl}/cart/update`, request)
      .pipe(
        map(cart => {
          this.cartSubject.next(cart);
          return cart;
        }),
        catchError(this.handleError)
      );
  }

  removeFromCart(productId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${environment.apiUrl}/cart/remove/${productId}`)
      .pipe(
        map(cart => {
          this.cartSubject.next(cart);
          return cart;
        }),
        catchError(this.handleError)
      );
  }

  clearCart(): Observable<Cart> {
    return this.http.delete<Cart>(`${environment.apiUrl}/cart/clear`)
      .pipe(
        map(cart => {
          this.cartSubject.next(cart);
          return cart;
        }),
        catchError(this.handleError)
      );
  }

  getCartItemCount(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart ? cart.totalItems : 0)
    );
  }

  getCartTotal(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart ? cart.totalPrice : 0)
    );
  }

  getCurrentCart(): Cart | null {
    return this.cartSubject.value;
  }

  isProductInCart(productId: string): Observable<boolean> {
    return this.cart$.pipe(
      map(cart => {
        if (!cart) return false;
        return cart.items.some(item => item.productId === productId);
      })
    );
  }

  getProductQuantityInCart(productId: string): Observable<number> {
    return this.cart$.pipe(
      map(cart => {
        if (!cart) return 0;
        const item = cart.items.find(item => item.productId === productId);
        return item ? item.quantity : 0;
      })
    );
  }

  private createEmptyCart(): Cart {
    return {
      userId: '',
      items: [],
      totalItems: 0,
      totalPrice: 0
    };
  }

  private handleError(error: any): Observable<never> {
    console.error('Cart service error:', error);
    return throwError(() => error.error?.message || 'A cart service error occurred');
  }
}
