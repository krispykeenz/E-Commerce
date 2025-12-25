import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { Cart } from '../models/cart.model';
import { Order, OrderResponse, OrderStatus, PaymentStatus, ShippingAddress } from '../models/order.model';
import { Product, ProductResponse, Review } from '../models/product.model';
import { AuthResponse, User } from '../models/user.model';

@Injectable()
export class DemoInterceptor implements HttpInterceptor {
  private demoUser: User = {
    _id: 'u_demo_1',
    name: 'Demo User',
    email: 'demo@shop.local',
    role: 'user',
    addresses: [
      {
        street: '123 Demo Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        country: 'United States',
        isDefault: true
      }
    ]
  };

  private readonly demoProducts: Product[] = [
    {
      _id: 'p_1',
      name: 'Wireless Headphones',
      description: 'Noise-cancelling over-ear headphones with rich bass and long battery life.',
      price: 79.99,
      category: 'electronics',
      images: ['https://placehold.co/900x600?text=Headphones'],
      stock: 24,
      rating: 4.7,
      reviews: [
        { userId: 'u_2', userName: 'Jordan', rating: 5, comment: 'Great sound and comfy!', createdAt: new Date() }
      ]
    },
    {
      _id: 'p_2',
      name: 'Minimal Desk Lamp',
      description: 'Warm LED desk lamp with adjustable brightness and angle.',
      price: 29.5,
      category: 'home',
      images: ['https://placehold.co/900x600?text=Lamp'],
      stock: 40,
      rating: 4.4,
      reviews: []
    },
    {
      _id: 'p_3',
      name: 'Running Shoes',
      description: 'Lightweight running shoes for daily training with breathable mesh.',
      price: 64.0,
      category: 'sports',
      images: ['https://placehold.co/900x600?text=Shoes'],
      stock: 18,
      rating: 4.6,
      reviews: []
    },
    {
      _id: 'p_4',
      name: 'Stainless Water Bottle',
      description: 'Insulated 750ml bottle keeps drinks cold for 24h or hot for 12h.',
      price: 22.99,
      category: 'outdoors',
      images: ['https://placehold.co/900x600?text=Bottle'],
      stock: 60,
      rating: 4.8,
      reviews: []
    },
    {
      _id: 'p_5',
      name: 'Mechanical Keyboard',
      description: 'Compact mechanical keyboard with tactile switches and RGB lighting.',
      price: 99.0,
      category: 'electronics',
      images: ['https://placehold.co/900x600?text=Keyboard'],
      stock: 12,
      rating: 4.5,
      reviews: []
    },
    {
      _id: 'p_6',
      name: 'Coffee Beans (1kg)',
      description: 'Single-origin medium roast with chocolate and citrus notes.',
      price: 18.75,
      category: 'grocery',
      images: ['https://placehold.co/900x600?text=Coffee'],
      stock: 100,
      rating: 4.3,
      reviews: []
    },
    {
      _id: 'p_7',
      name: 'Smart Watch',
      description: 'Fitness tracking, notifications, and sleep insights in a slim design.',
      price: 129.99,
      category: 'electronics',
      images: ['https://placehold.co/900x600?text=Watch'],
      stock: 9,
      rating: 4.2,
      reviews: []
    },
    {
      _id: 'p_8',
      name: 'Yoga Mat',
      description: 'Non-slip yoga mat with comfortable cushioning for home workouts.',
      price: 24.0,
      category: 'sports',
      images: ['https://placehold.co/900x600?text=Yoga+Mat'],
      stock: 35,
      rating: 4.6,
      reviews: []
    },
    {
      _id: 'p_9',
      name: 'Classic Cotton T-Shirt',
      description: 'Soft, breathable tee with a relaxed fit — an everyday staple.',
      price: 14.99,
      category: 'clothing',
      images: ['https://placehold.co/900x600?text=T-Shirt'],
      stock: 55,
      rating: 4.1,
      reviews: []
    },
    {
      _id: 'p_10',
      name: 'Productivity Book',
      description: 'A practical guide to building habits, focus, and momentum in daily work.',
      price: 12.5,
      category: 'books',
      images: ['https://placehold.co/900x600?text=Book'],
      stock: 80,
      rating: 4.0,
      reviews: []
    }
  ];

  private cart: Cart = {
    _id: 'c_demo_1',
    userId: this.demoUser._id || 'u_demo_1',
    items: [],
    totalItems: 0,
    totalPrice: 0
  };

  private orders: Order[] = [];

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!environment.demoMode) {
      return next.handle(request);
    }

    const method = request.method.toUpperCase();
    const path = this.getApiPath(request.url);

    // AUTH
    if (method === 'POST' && path === '/auth/login') {
      const email = (request.body?.email || '').toString();
      const role: User['role'] = email.toLowerCase().includes('admin') ? 'admin' : 'user';
      const user: User = { ...this.demoUser, email: email || this.demoUser.email, role };
      const token = this.createDemoToken(user);

      const body: AuthResponse = {
        user,
        token,
        message: 'Demo login successful'
      };

      return of(new HttpResponse({ status: 200, body }));
    }

    if (method === 'POST' && path === '/auth/register') {
      const name = (request.body?.name || this.demoUser.name).toString();
      const email = (request.body?.email || this.demoUser.email).toString();
      const user: User = { ...this.demoUser, name, email, role: 'user' };
      const token = this.createDemoToken(user);

      const body: AuthResponse = {
        user,
        token,
        message: 'Demo registration successful'
      };

      return of(new HttpResponse({ status: 200, body }));
    }

    if (method === 'PUT' && path === '/auth/profile') {
      const updates = request.body || {};
      const updatedUser: User = {
        ...this.demoUser,
        ...updates
      };

      // Keep demoUser changes reflected in future calls.
      this.demoUser = updatedUser;

      return of(new HttpResponse({ status: 200, body: updatedUser }));
    }

    // PRODUCTS
    if (method === 'GET' && path === '/products') {
      return of(new HttpResponse({ status: 200, body: this.getProductsResponse(request) }));
    }

    if (method === 'GET' && path === '/products/categories') {
      const categories = Array.from(new Set(this.demoProducts.map(p => p.category))).sort();
      return of(new HttpResponse({ status: 200, body: categories }));
    }

    if (method === 'GET' && path === '/products/featured') {
      const featured = [...this.demoProducts].sort((a, b) => b.rating - a.rating).slice(0, 8);
      return of(new HttpResponse({ status: 200, body: featured }));
    }

    if (method === 'GET' && path.startsWith('/products/search')) {
      const term = (request.params.get('search') || '').toLowerCase();
      const results = this.demoProducts.filter(p =>
        p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
      );
      return of(new HttpResponse({ status: 200, body: results }));
    }

    if (method === 'POST' && path === '/products') {
      const body = request.body || {};
      const created: Product = {
        _id: `p_${Date.now()}`,
        name: (body.name || 'New Product').toString(),
        description: (body.description || '').toString(),
        price: Number(body.price || 0),
        category: (body.category || 'misc').toString(),
        images: Array.isArray(body.images) ? body.images : [],
        stock: Number(body.stock || 0),
        rating: 0,
        reviews: []
      };

      this.demoProducts.unshift(created);
      return of(new HttpResponse({ status: 200, body: created }));
    }

    if (method === 'POST' && path === '/products/upload') {
      return of(
        new HttpResponse({
          status: 200,
          body: {
            imageUrl: `https://placehold.co/600x600?text=Uploaded+Image`
          }
        })
      );
    }

    const productByIdMatch = path.match(/^\/products\/([^/]+)$/);
    if (productByIdMatch) {
      const id = productByIdMatch[1];
      const product = this.demoProducts.find(p => p._id === id);

      if (!product) {
        if (method === 'DELETE') {
          // Delete is idempotent in demo mode.
          return of(new HttpResponse({ status: 200 }));
        }
        return this.notFound(request, `Product ${id} not found (demo)`);
      }

      if (method === 'GET') {
        return of(new HttpResponse({ status: 200, body: product }));
      }

      if (method === 'PUT') {
        Object.assign(product, request.body || {});
        return of(new HttpResponse({ status: 200, body: product }));
      }

      if (method === 'DELETE') {
        const idx = this.demoProducts.findIndex(p => p._id === id);
        if (idx !== -1) {
          this.demoProducts.splice(idx, 1);
        }
        return of(new HttpResponse({ status: 200 }));
      }
    }

    const addReviewMatch = path.match(/^\/products\/([^/]+)\/reviews$/);
    if (method === 'POST' && addReviewMatch) {
      const id = addReviewMatch[1];
      const product = this.demoProducts.find(p => p._id === id);
      if (!product) return this.notFound(request, `Product ${id} not found (demo)`);

      const review: Review = {
        _id: `r_${Date.now()}`,
        userId: request.body?.userId || (this.demoUser._id || 'u_demo_1'),
        userName: request.body?.userName || this.demoUser.name,
        rating: Number(request.body?.rating || 5),
        comment: (request.body?.comment || '').toString(),
        createdAt: new Date()
      };

      product.reviews = [...(product.reviews || []), review];
      const avg = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
      product.rating = Math.round(avg * 10) / 10;

      return of(new HttpResponse({ status: 200, body: product }));
    }

    const reviewByIdMatch = path.match(/^\/products\/([^/]+)\/reviews\/([^/]+)$/);
    if (reviewByIdMatch) {
      const productId = reviewByIdMatch[1];
      const reviewId = reviewByIdMatch[2];
      const product = this.demoProducts.find(p => p._id === productId);
      if (!product) return this.notFound(request, `Product ${productId} not found (demo)`);

      const idx = (product.reviews || []).findIndex(r => r._id === reviewId);
      if (idx === -1) return this.notFound(request, `Review ${reviewId} not found (demo)`);

      if (method === 'PUT') {
        product.reviews[idx] = { ...product.reviews[idx], ...(request.body || {}) };
        return of(new HttpResponse({ status: 200, body: product }));
      }

      if (method === 'DELETE') {
        product.reviews = product.reviews.filter(r => r._id !== reviewId);
        const avg = product.reviews.length
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
          : 0;
        product.rating = Math.round(avg * 10) / 10;
        return of(new HttpResponse({ status: 200, body: product }));
      }
    }

    // CART
    if (method === 'GET' && path === '/cart') {
      return of(new HttpResponse({ status: 200, body: this.cart }));
    }

    if (method === 'POST' && path === '/cart/add') {
      const productId = request.body?.productId;
      const quantity = Number(request.body?.quantity || 1);
      return of(new HttpResponse({ status: 200, body: this.addToCart(productId, quantity) }));
    }

    if (method === 'PUT' && path === '/cart/update') {
      const productId = request.body?.productId;
      const quantity = Number(request.body?.quantity || 1);
      return of(new HttpResponse({ status: 200, body: this.updateCartItem(productId, quantity) }));
    }

    const removeFromCartMatch = path.match(/^\/cart\/remove\/([^/]+)$/);
    if (method === 'DELETE' && removeFromCartMatch) {
      const productId = removeFromCartMatch[1];
      return of(new HttpResponse({ status: 200, body: this.removeFromCart(productId) }));
    }

    if (method === 'DELETE' && path === '/cart/clear') {
      this.cart.items = [];
      this.recalculateCart();
      return of(new HttpResponse({ status: 200, body: this.cart }));
    }

    // PAYMENTS
    if (method === 'POST' && path === '/payments/create-intent') {
      const body = {
        clientSecret: 'demo_client_secret',
        paymentIntentId: `pi_demo_${Date.now()}`
      };
      return of(new HttpResponse({ status: 200, body }));
    }

    if (method === 'POST' && path === '/payments/confirm') {
      return of(new HttpResponse({ status: 200, body: { success: true } }));
    }

    if (method === 'GET' && path === '/payments/history') {
      const page = Number(request.params.get('page') || 1);
      const limit = Number(request.params.get('limit') || 10);

      const payments = this.orders.map(o => ({
        id: o.paymentIntentId || `pi_demo_${o._id}`,
        amount: o.totalAmount,
        currency: 'usd',
        status: 'succeeded',
        orderId: o._id,
        createdAt: o.createdAt
      }));

      const start = (page - 1) * limit;
      const paged = payments.slice(start, start + limit);

      return of(
        new HttpResponse({
          status: 200,
          body: {
            payments: paged,
            totalPages: Math.max(1, Math.ceil(payments.length / limit)),
            currentPage: page
          }
        })
      );
    }

    if (method === 'POST' && path === '/payments/refund') {
      return of(
        new HttpResponse({
          status: 200,
          body: {
            success: true,
            refundId: `re_demo_${Date.now()}`
          }
        })
      );
    }

    // ORDERS
    if (method === 'POST' && path === '/orders') {
      const created = this.createOrder(request.body);
      return of(new HttpResponse({ status: 200, body: created }));
    }

    if (method === 'GET' && path === '/orders') {
      const status = (request.params.get('status') || '').toString();
      const page = Number(request.params.get('page') || 1);
      const limit = Number(request.params.get('limit') || 10);

      const filtered = status
        ? this.orders.filter(o => o.status === status)
        : [...this.orders];

      const start = (page - 1) * limit;
      const paged = filtered.slice(start, start + limit);

      const resp: OrderResponse = {
        orders: paged,
        totalOrders: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        currentPage: page
      };

      return of(new HttpResponse({ status: 200, body: resp }));
    }

    if (method === 'GET' && path === '/orders/history') {
      const resp: OrderResponse = {
        orders: [...this.orders],
        totalOrders: this.orders.length,
        totalPages: 1,
        currentPage: 1
      };
      return of(new HttpResponse({ status: 200, body: resp }));
    }

    const orderByIdMatch = path.match(/^\/orders\/([^/]+)$/);
    if (method === 'GET' && orderByIdMatch) {
      const id = orderByIdMatch[1];
      const order = this.orders.find(o => o._id === id);
      if (!order) return this.notFound(request, `Order ${id} not found (demo)`);
      return of(new HttpResponse({ status: 200, body: order }));
    }

    const orderStatusMatch = path.match(/^\/orders\/([^/]+)\/status$/);
    if (method === 'PATCH' && orderStatusMatch) {
      const id = orderStatusMatch[1];
      const order = this.orders.find(o => o._id === id);
      if (!order) return this.notFound(request, `Order ${id} not found (demo)`);

      const status = (request.body?.status || '').toString();
      if (status) {
        order.status = status as any;
      }
      order.updatedAt = new Date();

      return of(new HttpResponse({ status: 200, body: order }));
    }

    const cancelOrderMatch = path.match(/^\/orders\/([^/]+)\/cancel$/);
    if (method === 'PATCH' && cancelOrderMatch) {
      const id = cancelOrderMatch[1];
      const order = this.orders.find(o => o._id === id);
      if (!order) return this.notFound(request, `Order ${id} not found (demo)`);
      order.status = OrderStatus.CANCELLED;
      order.paymentStatus = PaymentStatus.REFUNDED;
      order.updatedAt = new Date();
      return of(new HttpResponse({ status: 200, body: order }));
    }

    const invoiceMatch = path.match(/^\/orders\/([^/]+)\/invoice$/);
    if (method === 'GET' && invoiceMatch) {
      const id = invoiceMatch[1];
      const content = `Invoice (demo) for order ${id}\n\nThis is a demo invoice generated client-side.`;
      const blob = new Blob([content], { type: 'application/pdf' });
      return of(new HttpResponse({ status: 200, body: blob }));
    }

    // Not implemented in demo mode: fall back to a 404 so the UI can show an error.
    return this.notFound(request, `Demo mode: no mock for ${method} ${path}`);
  }

  private getApiPath(url: string): string {
    // Normalize absolute/relative URLs to a path we can match.
    let pathname = url;
    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        pathname = new URL(url).pathname;
      }
    } catch {
      pathname = url;
    }

    // Strip query string if present.
    pathname = pathname.split('?')[0];

    // Remove base apiUrl prefix.
    if (pathname.startsWith(environment.apiUrl)) {
      pathname = pathname.slice(environment.apiUrl.length);
    }

    return pathname.startsWith('/') ? pathname : `/${pathname}`;
  }

  private getProductsResponse(request: HttpRequest<any>): ProductResponse {
    const search = (request.params.get('search') || '').toLowerCase();
    const category = (request.params.get('category') || '').toString();
    const minPrice = Number(request.params.get('minPrice') || NaN);
    const maxPrice = Number(request.params.get('maxPrice') || NaN);
    const sortBy = (request.params.get('sortBy') || 'createdAt').toString();
    const sortOrder = (request.params.get('sortOrder') || 'desc').toString();
    const page = Number(request.params.get('page') || 1);
    const limit = Number(request.params.get('limit') || 12);

    let products = [...this.demoProducts];

    if (search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)
      );
    }

    if (category) {
      products = products.filter(p => p.category === category);
    }

    if (!Number.isNaN(minPrice)) {
      products = products.filter(p => p.price >= minPrice);
    }

    if (!Number.isNaN(maxPrice)) {
      products = products.filter(p => p.price <= maxPrice);
    }

    products.sort((a, b) => {
      const dir = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'price':
          return (a.price - b.price) * dir;
        case 'rating':
          return (a.rating - b.rating) * dir;
        case 'name':
          return a.name.localeCompare(b.name) * dir;
        default:
          // createdAt not present in demo; just keep stable-ish order.
          return 0;
      }
    });

    const totalProducts = products.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / limit));
    const start = (page - 1) * limit;
    const paged = products.slice(start, start + limit);

    return {
      products: paged,
      totalProducts,
      totalPages,
      currentPage: page
    };
  }

  private addToCart(productId: string, quantity: number): Cart {
    const product = this.demoProducts.find(p => p._id === productId);
    if (!product) {
      return this.cart;
    }

    const existing = this.cart.items.find(i => i.productId === productId);
    if (existing) {
      existing.quantity = Math.min(product.stock, existing.quantity + quantity);
    } else {
      this.cart.items.push({
        productId,
        quantity: Math.min(product.stock, quantity),
        price: product.price,
        product: {
          _id: product._id!,
          name: product.name,
          price: product.price,
          images: product.images,
          stock: product.stock
        }
      });
    }

    this.recalculateCart();
    return this.cart;
  }

  private updateCartItem(productId: string, quantity: number): Cart {
    const item = this.cart.items.find(i => i.productId === productId);
    if (!item) return this.cart;

    const product = this.demoProducts.find(p => p._id === productId);
    if (!product) return this.cart;

    item.quantity = Math.max(1, Math.min(product.stock, quantity));
    this.recalculateCart();
    return this.cart;
  }

  private removeFromCart(productId: string): Cart {
    this.cart.items = this.cart.items.filter(i => i.productId !== productId);
    this.recalculateCart();
    return this.cart;
  }

  private recalculateCart(): void {
    this.cart.totalItems = this.cart.items.reduce((sum, i) => sum + i.quantity, 0);
    this.cart.totalPrice = this.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    this.cart.updatedAt = new Date();
  }

  private createOrder(body: any): Order {
    const items = (body?.items || []).map((i: any) => {
      const product = this.demoProducts.find(p => p._id === i.productId);
      const quantity = Number(i.quantity || 1);
      const price = product?.price || 0;

      return {
        productId: i.productId,
        productName: product?.name || 'Unknown Product',
        quantity,
        price,
        totalPrice: price * quantity
      };
    });

    const totalAmount = items.reduce((sum: number, i: any) => sum + i.totalPrice, 0);

    const order: Order = {
      _id: `o_${Date.now()}`,
      userId: this.demoUser._id || 'u_demo_1',
      items,
      totalAmount,
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentIntentId: `pi_demo_${Date.now()}`,
      shippingAddress:
        (body?.shippingAddress as ShippingAddress) ||
        {
          street: '123 Demo Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103',
          country: 'United States'
        },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.orders = [order, ...this.orders];
    return order;
  }

  private createDemoToken(user: User): string {
    // This is NOT a real signed JWT. It only exists to satisfy client-side token parsing.
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        user,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 // 1 year
      })
    );

    return `${header}.${payload}.demo`;
  }

  private notFound(request: HttpRequest<any>, message: string): Observable<HttpEvent<any>> {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 404,
          statusText: 'Not Found',
          url: request.url,
          error: { message }
        })
    );
  }
}
