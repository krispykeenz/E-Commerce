import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product, Review } from '../../models/product.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error = '';
  quantity = 1;
  selectedImageIndex = 0;
  currentUser: User | null = null;
  
  reviewForm: FormGroup;
  submittingReview = false;
  reviewError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadProduct();
  }

  loadProduct(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/shop']);
      return;
    }

    this.loading = true;
    this.error = '';

    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
      }
    });
  }

  addToCart(): void {
    if (this.product && this.product._id && this.quantity > 0) {
      this.cartService.addToCart({ productId: this.product._id, quantity: this.quantity }).subscribe({
        next: () => {
          // Show success message
          console.log('Product added to cart');
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
        }
      });
    }
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onQuantityChange(event: any): void {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0 && this.product && value <= this.product.stock) {
      this.quantity = value;
    }
  }

  submitReview(): void {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.reviewForm.valid && this.product) {
      this.submittingReview = true;
      this.reviewError = '';

      const reviewData = {
        ...this.reviewForm.value,
        userId: this.currentUser._id,
        userName: this.currentUser.name
      };

      this.productService.addReview(this.product._id!, reviewData).subscribe({
        next: (updatedProduct) => {
          this.product = updatedProduct;
          this.reviewForm.reset({ rating: 5, comment: '' });
          this.submittingReview = false;
        },
        error: (error) => {
          this.reviewError = error;
          this.submittingReview = false;
        }
      });
    }
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  getRatingArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  canUserReview(): boolean {
    if (!this.currentUser || !this.product) return false;
    
    // Check if user already reviewed this product
    return !this.product.reviews.some(review => review.userId === this.currentUser!._id);
  }

  goBack(): void {
    this.router.navigate(['/shop']);
  }
}
