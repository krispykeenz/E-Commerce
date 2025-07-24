import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  sortBy = 'name';
  sortDirection = 'asc';
  currentPage = 1;
  itemsPerPage = 10;
  loading = true;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    // In a real app, you'd have a user management service
    // For now, we'll simulate loading users
    setTimeout(() => {
      this.users = [
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          createdAt: new Date('2024-01-15')
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'admin',
          createdAt: new Date('2024-02-01')
        },
        {
          _id: '3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'user',
          createdAt: new Date('2024-02-10')
        }
      ];
      this.filteredUsers = [...this.users];
      this.loading = false;
    }, 1000);
  }

  searchUsers() {
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.currentPage = 1;
  }

  sortUsers() {
    this.filteredUsers.sort((a, b) => {
      let aValue = a[this.sortBy as keyof User];
      let bValue = b[this.sortBy as keyof User];
      
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

  get paginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  toggleUserRole(user: User) {
    user.role = user.role === 'admin' ? 'user' : 'admin';
    // In a real app, you'd call a service to update the user role
    console.log(`Updated ${user.name} role to ${user.role}`);
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete "${user.name}"?`)) {
      this.users = this.users.filter(u => u._id !== user._id);
      this.searchUsers();
    }
  }

  getUserCountByRole(role: string): number {
    return this.users.filter(user => user.role === role).length;
  }
}
