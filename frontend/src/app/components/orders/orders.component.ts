import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus, PaymentStatus } from '../../models/order.model';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error = '';
  currentPage = 1;
  totalPages = 0;
  selectedOrder: Order | null = null;
  showOrderDetails = false;

  // Order status filters
  statusFilters = [
    { value: '', label: 'All Orders' },
    { value: OrderStatus.PENDING, label: 'Pending' },
    { value: OrderStatus.CONFIRMED, label: 'Confirmed' },
    { value: OrderStatus.SHIPPED, label: 'Shipped' },
    { value: OrderStatus.DELIVERED, label: 'Delivered' },
    { value: OrderStatus.CANCELLED, label: 'Cancelled' }
  ];
  
  selectedStatusFilter = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if we're viewing a specific order
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.viewOrderDetails(orderId);
    }

    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';

    const loadOrdersObservable = this.selectedStatusFilter 
      ? this.orderService.getOrdersByStatus(this.selectedStatusFilter as OrderStatus, this.currentPage)
      : this.orderService.getOrders(this.currentPage);

    loadOrdersObservable.subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
      }
    });
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  viewOrderDetails(orderId: string): void {
    this.loading = true;
    
    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.selectedOrder = order;
        this.showOrderDetails = true;
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
      }
    });
  }

  closeOrderDetails(): void {
    this.showOrderDetails = false;
    this.selectedOrder = null;
    // Update URL to remove order ID
    this.router.navigate(['/orders']);
  }

  cancelOrder(order: Order): void {
    if (order._id && order.status === OrderStatus.PENDING && 
        confirm('Are you sure you want to cancel this order?')) {
      
      this.orderService.cancelOrder(order._id).subscribe({
        next: (updatedOrder) => {
          // Update the order in the list
          const index = this.orders.findIndex(o => o._id === order._id);
          if (index !== -1) {
            this.orders[index] = updatedOrder;
          }
          
          // Update selected order if it's the same one
          if (this.selectedOrder && this.selectedOrder._id === order._id) {
            this.selectedOrder = updatedOrder;
          }
        },
        error: (error) => {
          this.error = error;
        }
      });
    }
  }

  reorder(order: Order): void {
    // Add all items from this order to cart and navigate to cart
    // This would require implementing an "add multiple items to cart" method
    // For now, just navigate to the product pages
    console.log('Reorder functionality would be implemented here');
  }

  downloadInvoice(order: Order): void {
    if (order._id) {
      this.orderService.downloadInvoice(order._id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `invoice-${order._id}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          this.error = 'Failed to download invoice';
        }
      });
    }
  }

  trackOrder(order: Order): void {
    if (order._id) {
      this.router.navigate(['/orders', order._id, 'track']);
    }
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.CONFIRMED:
        return 'info';
      case OrderStatus.SHIPPED:
        return 'primary';
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getPaymentStatusClass(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'warning';
      case PaymentStatus.COMPLETED:
        return 'success';
      case PaymentStatus.FAILED:
        return 'danger';
      case PaymentStatus.REFUNDED:
        return 'info';
      default:
        return 'secondary';
    }
  }

  canCancelOrder(order: Order): boolean {
    return order.status === OrderStatus.PENDING;
  }

  canTrackOrder(order: Order): boolean {
    return order.status === OrderStatus.CONFIRMED || 
           order.status === OrderStatus.SHIPPED;
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  continueShopping(): void {
    this.router.navigate(['/shop']);
  }
}
