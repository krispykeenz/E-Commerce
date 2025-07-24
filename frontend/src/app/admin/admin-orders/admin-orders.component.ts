import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchTerm = '';
  statusFilter = '';
  sortBy = 'createdAt';
  sortDirection = 'desc';
  currentPage = 1;
  itemsPerPage = 10;
  loading = true;

  orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.filteredOrders = [...response.orders];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  searchOrders() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm || 
        order._id?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.userId?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || order.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    this.currentPage = 1;
  }

  sortOrders() {
    this.filteredOrders.sort((a, b) => {
      let aValue = a[this.sortBy as keyof Order];
      let bValue = b[this.sortBy as keyof Order];
      
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

  get paginatedOrders() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  updateOrderStatus(order: Order, newStatus: string) {
    this.orderService.updateOrderStatus(order._id!, newStatus as any).subscribe({
      next: () => {
        order.status = newStatus as any;
      },
      error: (error) => {
        console.error('Error updating order status:', error);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'confirmed': return 'bg-info';
      case 'shipped': return 'bg-primary';
      case 'delivered': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getOrderCountByStatus(status: string): number {
    return this.orders.filter(order => order.status === status).length;
  }

  viewOrderDetails(order: Order) {
    // In a real app, this might open a modal or navigate to a detail page
    console.log('View order details:', order);
  }
}
