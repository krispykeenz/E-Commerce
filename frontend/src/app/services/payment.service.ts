import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  constructor(private http: HttpClient) {
    this.initializeStripe();
  }

  private async initializeStripe(): Promise<void> {
    try {
      this.stripe = await loadStripe(environment.stripePublishableKey);
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
    }
  }

  async createElements(): Promise<StripeElements | null> {
    if (!this.stripe) {
      await this.initializeStripe();
    }
    
    if (this.stripe) {
      this.elements = this.stripe.elements();
      return this.elements;
    }
    
    return null;
  }

  createPaymentIntent(amount: number, currency: string = 'usd'): Observable<PaymentIntentResponse> {
    const paymentData = {
      amount: Math.round(amount * 100), // Convert to cents
      currency
    };

    return this.http.post<PaymentIntentResponse>(`${environment.apiUrl}/payments/create-intent`, paymentData)
      .pipe(catchError(this.handleError));
  }

  async confirmPayment(
    clientSecret: string,
    cardElement: StripeCardElement,
    billingDetails: {
      name: string;
      email: string;
      address?: {
        line1: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
      };
    }
  ): Promise<PaymentResult> {
    if (!this.stripe) {
      return { success: false, error: 'Stripe not initialized' };
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (paymentIntent?.status === 'succeeded') {
        return { success: true, paymentIntentId: paymentIntent.id };
      }

      return { success: false, error: 'Payment failed' };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  confirmPaymentWithBackend(paymentIntentId: string): Observable<{ success: boolean; order?: any }> {
    return this.http.post<{ success: boolean; order?: any }>(
      `${environment.apiUrl}/payments/confirm`,
      { paymentIntentId }
    ).pipe(catchError(this.handleError));
  }

  getPaymentHistory(page: number = 1, limit: number = 10): Observable<{
    payments: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      orderId: string;
      createdAt: Date;
    }>;
    totalPages: number;
    currentPage: number;
  }> {
    return this.http.get<any>(`${environment.apiUrl}/payments/history?page=${page}&limit=${limit}`)
      .pipe(catchError(this.handleError));
  }

  refundPayment(paymentIntentId: string, amount?: number): Observable<{
    success: boolean;
    refundId?: string;
    error?: string;
  }> {
    const refundData = {
      paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined
    };

    return this.http.post<any>(`${environment.apiUrl}/payments/refund`, refundData)
      .pipe(catchError(this.handleError));
  }

  validateCard(cardElement: StripeCardElement): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!cardElement) {
        resolve({ valid: false, error: 'Card element not found' });
        return;
      }

      // Basic validation - Stripe handles most validation internally
      cardElement.on('change', ({ error, complete }) => {
        if (error) {
          resolve({ valid: false, error: error.message });
        } else if (complete) {
          resolve({ valid: true });
        }
      });
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Payment service error:', error);
    return throwError(() => error.error?.message || 'A payment service error occurred');
  }
}
