import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  sortBy = 'name';
  sortDirection = 'asc';
  currentPage = 1;
  itemsPerPage = 10;
  loading = true;
  showProductForm = false;
  editingProduct: Product | null = null;

  productForm: Product = {
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    images: [],
    rating: 0,
    reviews: []
  };

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products = response.products;
        this.filteredProducts = [...response.products];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  searchProducts() {
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.currentPage = 1;
  }

  sortProducts() {
    this.filteredProducts.sort((a, b) => {
      let aValue = a[this.sortBy as keyof Product];
      let bValue = b[this.sortBy as keyof Product];
      
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (this.sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  get paginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  addProduct() {
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      images: [],
      rating: 0,
      reviews: []
    };
    this.editingProduct = null;
    this.showProductForm = true;
  }

  editProduct(product: Product) {
    this.productForm = { ...product };
    this.editingProduct = product;
    this.showProductForm = true;
  }

  saveProduct() {
    if (this.editingProduct) {
      this.productService.updateProduct(this.editingProduct._id!, this.productForm).subscribe(() => {
        this.loadProducts();
        this.cancelEdit();
      });
    } else {
      this.productService.addProduct(this.productForm).subscribe(() => {
        this.loadProducts();
        this.cancelEdit();
      });
    }
  }

  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product._id!).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  cancelEdit() {
    this.showProductForm = false;
    this.editingProduct = null;
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      images: [],
      rating: 0,
      reviews: []
    };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // In a real app, you'd upload to a file server/cloud storage
      // For now, we'll just use a placeholder
      const imageUrl = `https://via.placeholder.com/300x300?text=${encodeURIComponent(file.name)}`;
      this.productForm.images = [imageUrl];
    }
  }
}
