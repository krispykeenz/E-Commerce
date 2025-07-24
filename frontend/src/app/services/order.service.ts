import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order, CreateOrderRequest, OrderResponse, OrderStatus } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${environment.apiUrl}/orders`, orderData)
      .pipe(catchError(this.handleError));
  }

  getOrders(page: number = 1, limit: number = 10): Observable<OrderResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<OrderResponse>(`${environment.apiUrl}/orders`, { params })
      .pipe(catchError(this.handleError));
  }

  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${environment.apiUrl}/orders/${orderId}`)
      .pipe(catchError(this.handleError));
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${environment.apiUrl}/orders/${orderId}/status`, { status })
      .pipe(catchError(this.handleError));
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.http.patch<Order>(`${environment.apiUrl}/orders/${orderId}/cancel`, {})
      .pipe(catchError(this.handleError));
  }

  getOrdersByStatus(status: OrderStatus, page: number = 1, limit: number = 10): Observable<OrderResponse> {
    const params = new HttpParams()
      .set('status', status)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<OrderResponse>(`${environment.apiUrl}/orders`, { params })
      .pipe(catchError(this.handleError));
  }

  getOrderHistory(page: number = 1, limit: number = 10): Observable<OrderResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<OrderResponse>(`${environment.apiUrl}/orders/history`, { params })
      .pipe(catchError(this.handleError));
  }

  trackOrder(orderId: string): Observable<{
    order: Order;
    trackingInfo: {
      currentStatus: OrderStatus;
      statusHistory: Array<{
        status: OrderStatus;
        timestamp: Date;
        note?: string;
      }>;
      estimatedDelivery?: Date;
    };
  }> {
    return this.http.get<any>(`${environment.apiUrl}/orders/${orderId}/track`)
      .pipe(catchError(this.handleError));
  }

  downloadInvoice(orderId: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/orders/${orderId}/invoice`, {
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  requestReturn(orderId: string, reason: string, items?: string[]): Observable<Order> {
    const requestData = {
      reason,
      items: items || []
    };

    return this.http.post<Order>(`${environment.apiUrl}/orders/${orderId}/return`, requestData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Order service error:', error);
    return throwError(() => error.error?.message || 'An order service error occurred');
  }
}
