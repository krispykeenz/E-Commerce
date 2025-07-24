import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Cart, CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = false;
  error = '';
  updating: string[] = [];

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadCart();
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });
  }

  loadCart(): void {
    this.loading = true;
    this.error = '';

    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
      }
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1 || !item.product || newQuantity > item.product.stock) {
      return;
    }

    this.updating.push(item.productId);

    this.cartService.updateCartItem({ 
      productId: item.productId, 
      quantity: newQuantity 
    }).subscribe({
      next: () => {
        this.updating = this.updating.filter(id => id !== item.productId);
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        this.updating = this.updating.filter(id => id !== item.productId);
      }
    });
  }

  increaseQuantity(item: CartItem): void {
    this.updateQuantity(item, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateQuantity(item, item.quantity - 1);
    }
  }

  onQuantityInputChange(item: CartItem, event: any): void {
    const newQuantity = parseInt(event.target.value);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      this.updateQuantity(item, newQuantity);
    }
  }

  removeItem(item: CartItem): void {
    this.updating.push(item.productId);

    this.cartService.removeFromCart(item.productId).subscribe({
      next: () => {
        this.updating = this.updating.filter(id => id !== item.productId);
      },
      error: (error) => {
        console.error('Error removing item:', error);
        this.updating = this.updating.filter(id => id !== item.productId);
      }
    });
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.loading = true;
      
      this.cartService.clearCart().subscribe({
        next: () => {
          this.loading = false;
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
          this.loading = false;
        }
      });
    }
  }

  isUpdating(productId: string): boolean {
    return this.updating.includes(productId);
  }

  getItemSubtotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  continueShopping(): void {
    this.router.navigate(['/shop']);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  viewProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
  }
}
