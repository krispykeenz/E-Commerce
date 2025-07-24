import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'E-Commerce Platform';
  currentUser$: Observable<User | null>;
  cartItemCount$: Observable<number>;

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.cartItemCount$ = this.cartService.getCartItemCount();
  }

  ngOnInit(): void {
    // Load cart data when app initializes
    if (this.authService.isAuthenticated()) {
      this.cartService.loadCart();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
