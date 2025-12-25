import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'ecommerce_token';

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const token = this.getToken();

    if (token) {
      // Decode token to get user info or make API call to verify
      const userData = this.decodeToken(token);
      if (userData) {
        this.currentUserSubject.next(userData);
      }
      return;
    }

    if (environment.demoMode) {
      const demoUser: User = {
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

      const demoToken = this.createDemoToken(demoUser);
      this.setToken(demoToken);
      this.currentUserSubject.next(demoUser);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        map(response => {
          this.setToken(response.token);
          this.currentUserSubject.next(response.user);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData)
      .pipe(
        map(response => {
          this.setToken(response.token);
          this.currentUserSubject.next(response.user);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/auth/profile`, userData)
      .pipe(
        map(user => {
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(this.handleError)
      );
  }

  private decodeToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user || null;
    } catch (error) {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
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

  private handleError(error: any): Observable<never> {
    console.error('Auth service error:', error);
    return throwError(() => error.error?.message || 'An authentication error occurred');
  }
}
