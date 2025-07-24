import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product, ProductQuery } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  @Input() showFilters = true;
  @Input() limit?: number;
  @Input() category?: string;

  products: Product[] = [];
  categories: string[] = [];
  filterForm: FormGroup;
  loading = false;
  error = '';
  totalPages = 0;
  currentPage = 1;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      category: [''],
      minPrice: [''],
      maxPrice: [''],
      sortBy: ['createdAt'],
      sortOrder: ['desc']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.setupFilterWatch();
  }

  setupFilterWatch(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadProducts();
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    const query: ProductQuery = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.limit || 12
    };

    if (this.category) {
      query.category = this.category;
    }

    // Remove empty values
    Object.keys(query).forEach(key => {
      if (query[key as keyof ProductQuery] === '' || query[key as keyof ProductQuery] === null) {
        delete query[key as keyof ProductQuery];
      }
    });

    this.productService.getProducts(query).subscribe({
      next: (response) => {
        this.products = response.products;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
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

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  clearFilters(): void {
    this.filterForm.patchValue({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }
}
