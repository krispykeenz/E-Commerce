import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { Cart } from '../../models/cart.model';
import { User } from '../../models/user.model';
import { CreateOrderRequest, ShippingAddress } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  @ViewChild('cardElement', { static: false }) cardElement!: ElementRef;

  checkoutForm: FormGroup;
  cart: Cart | null = null;
  currentUser: User | null = null;
  loading = false;
  error = '';
  processing = false;
  
  // Stripe elements
  private stripe: StripeElements | null = null;
  private card: StripeCardElement | null = null;
  clientSecret = '';

  // Calculated values
  subtotal = 0;
  tax = 0;
  shipping = 0;
  total = 0;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['United States', Validators.required],
      saveAddress: [false]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    this.loadCart();
    this.prefillUserData();
  }

  ngAfterViewInit(): void {
    this.initializeStripe();
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        if (cart.items.length === 0) {
          this.router.navigate(['/cart']);
          return;
        }
        this.calculateTotals();
        this.createPaymentIntent();
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
      }
    });
  }

  prefillUserData(): void {
    if (this.currentUser) {
      this.checkoutForm.patchValue({
        email: this.currentUser.email,
        firstName: this.currentUser.name.split(' ')[0] || '',
        lastName: this.currentUser.name.split(' ').slice(1).join(' ') || ''
      });

      // Prefill address if user has a default address
      if (this.currentUser.addresses && this.currentUser.addresses.length > 0) {
        const defaultAddress = this.currentUser.addresses.find(addr => addr.isDefault) || this.currentUser.addresses[0];
        this.checkoutForm.patchValue({
          street: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          zipCode: defaultAddress.zipCode,
          country: defaultAddress.country
        });
      }
    }
  }

  async initializeStripe(): Promise<void> {
    try {
      this.stripe = await this.paymentService.createElements();
      if (this.stripe && this.cardElement) {
        this.card = this.stripe.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
          },
        });
        this.card.mount(this.cardElement.nativeElement);
      }
    } catch (error) {
      this.error = 'Failed to initialize payment system';
    }
  }

  calculateTotals(): void {
    if (!this.cart) return;
    
    this.subtotal = this.cart.totalPrice;
    this.tax = this.subtotal * 0.08; // 8% tax
    this.shipping = this.subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    this.total = this.subtotal + this.tax + this.shipping;
  }

  createPaymentIntent(): void {
    if (!this.cart) return;

    this.paymentService.createPaymentIntent(this.total).subscribe({
      next: (response) => {
        this.clientSecret = response.clientSecret;
      },
      error: (error) => {
        this.error = 'Failed to initialize payment';
        console.error('Payment intent error:', error);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.checkoutForm.valid || !this.cart || !this.card || !this.clientSecret) {
      return;
    }

    this.processing = true;
    this.error = '';

    try {
      // Confirm payment with Stripe
      const billingDetails = {
        name: `${this.checkoutForm.value.firstName} ${this.checkoutForm.value.lastName}`,
        email: this.checkoutForm.value.email,
        address: {
          line1: this.checkoutForm.value.street,
          city: this.checkoutForm.value.city,
          state: this.checkoutForm.value.state,
          postal_code: this.checkoutForm.value.zipCode,
          country: this.checkoutForm.value.country
        }
      };

      const paymentResult = await this.paymentService.confirmPayment(
        this.clientSecret,
        this.card,
        billingDetails
      );

      if (!paymentResult.success) {
        this.error = paymentResult.error || 'Payment failed';
        this.processing = false;
        return;
      }

      // Create order
      const shippingAddress: ShippingAddress = {
        street: this.checkoutForm.value.street,
        city: this.checkoutForm.value.city,
        state: this.checkoutForm.value.state,
        zipCode: this.checkoutForm.value.zipCode,
        country: this.checkoutForm.value.country
      };

      const orderRequest: CreateOrderRequest = {
        items: this.cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingAddress
      };

      this.orderService.createOrder(orderRequest).subscribe({
        next: (order) => {
          // Clear cart and redirect to success page
          this.cartService.clearCart().subscribe();
          this.router.navigate(['/orders', order._id], { 
            queryParams: { success: true } 
          });
        },
        error: (error) => {
          this.error = 'Order creation failed. Please contact support.';
          this.processing = false;
        }
      });

    } catch (error) {
      this.error = 'An unexpected error occurred';
      this.processing = false;
    }
  }

  getFormErrors(fieldName: string): string[] {
    const field = this.checkoutForm.get(fieldName);
    const errors: string[] = [];
    
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        errors.push(`${fieldName} is required`);
      }
      if (field.errors['email']) {
        errors.push('Please enter a valid email address');
      }
    }
    
    return errors;
  }

  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }
}
