import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  categories: string[] = [];
  loading = false;
  error = '';

  // Hero section data
  heroTitle = 'Welcome to Our E-Commerce Store';
  heroSubtitle = 'Discover amazing products at unbeatable prices';
  heroImage = 'assets/hero-banner.svg';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCategories();
  }

  loadFeaturedProducts(): void {
    this.loading = true;
    this.error = '';

    this.productService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts = products.slice(0, 8); // Show only 8 featured products
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
        // Fallback: load regular products if featured products fail
        this.loadRegularProducts();
      }
    });
  }

  loadRegularProducts(): void {
    this.productService.getProducts({ limit: 8, sortBy: 'rating', sortOrder: 'desc' }).subscribe({
      next: (response) => {
        this.featuredProducts = response.products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.slice(0, 6); // Show only 6 categories
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  addToCart(product: Product): void {
    if (product._id) {
      this.cartService.addToCart({ productId: product._id, quantity: 1 }).subscribe({
        next: () => {
          // Show success message or toast
          console.log('Product added to cart');
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
        }
      });
    }
  }

  viewProduct(productId?: string): void {
    if (productId) {
      this.router.navigate(['/product', productId]);
    }
  }

  browseCategory(category: string): void {
    this.router.navigate(['/shop'], { queryParams: { category } });
  }

  shopAll(): void {
    this.router.navigate(['/shop']);
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }
}
