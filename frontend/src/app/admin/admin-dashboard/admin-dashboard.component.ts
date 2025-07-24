import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  };

  recentOrders: any[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Load products count
    this.productService.getProducts().subscribe(response => {
      this.stats.totalProducts = response.totalProducts;
    });

    // Load orders data
    this.orderService.getOrders().subscribe(response => {
      this.stats.totalOrders = response.totalOrders;
      this.stats.pendingOrders = response.orders.filter(o => o.status === 'pending').length;
      this.stats.completedOrders = response.orders.filter(o => o.status === 'delivered').length;
      this.stats.totalRevenue = response.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      this.recentOrders = response.orders.slice(0, 5);
      this.loading = false;
    });
  }
}
