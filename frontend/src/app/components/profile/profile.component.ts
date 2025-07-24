import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, Address } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  addressForm: FormGroup;
  currentUser: User | null = null;
  loading = false;
  error = '';
  success = '';
  showAddressForm = false;
  editingAddressIndex = -1;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['United States', Validators.required],
      isDefault: [false]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserProfile();
  }

  loadUserProfile(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        name: this.currentUser.name,
        email: this.currentUser.email
      });
    }
  }

  onProfileSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const updateData = {
        name: this.profileForm.value.name,
        email: this.profileForm.value.email
      };

      this.authService.updateProfile(updateData).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.success = 'Profile updated successfully';
          this.loading = false;
        },
        error: (error) => {
          this.error = error;
          this.loading = false;
        }
      });
    }
  }

  showAddAddress(): void {
    this.showAddressForm = true;
    this.editingAddressIndex = -1;
    this.addressForm.reset({ country: 'United States', isDefault: false });
  }

  editAddress(index: number): void {
    if (this.currentUser && this.currentUser.addresses && this.currentUser.addresses[index]) {
      const address = this.currentUser.addresses[index];
      this.addressForm.patchValue(address);
      this.showAddressForm = true;
      this.editingAddressIndex = index;
    }
  }

  onAddressSubmit(): void {
    if (this.addressForm.valid && this.currentUser) {
      this.loading = true;
      this.error = '';

      const addressData: Address = this.addressForm.value;
      
      // Create a copy of current addresses
      const addresses = [...(this.currentUser.addresses || [])];
      
      // If setting as default, remove default from other addresses
      if (addressData.isDefault) {
        addresses.forEach(addr => addr.isDefault = false);
      }

      if (this.editingAddressIndex >= 0) {
        // Update existing address
        addresses[this.editingAddressIndex] = addressData;
      } else {
        // Add new address
        addresses.push(addressData);
      }

      // Update user profile with new addresses
      this.authService.updateProfile({ addresses }).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.showAddressForm = false;
          this.success = this.editingAddressIndex >= 0 ? 'Address updated successfully' : 'Address added successfully';
          this.loading = false;
        },
        error: (error) => {
          this.error = error;
          this.loading = false;
        }
      });
    }
  }

  deleteAddress(index: number): void {
    if (this.currentUser && this.currentUser.addresses && confirm('Are you sure you want to delete this address?')) {
      this.loading = true;
      
      const addresses = [...this.currentUser.addresses];
      addresses.splice(index, 1);

      this.authService.updateProfile({ addresses }).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.success = 'Address deleted successfully';
          this.loading = false;
        },
        error: (error) => {
          this.error = error;
          this.loading = false;
        }
      });
    }
  }

  setDefaultAddress(index: number): void {
    if (this.currentUser && this.currentUser.addresses) {
      this.loading = true;
      
      const addresses = [...this.currentUser.addresses];
      addresses.forEach((addr, i) => {
        addr.isDefault = i === index;
      });

      this.authService.updateProfile({ addresses }).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.success = 'Default address updated';
          this.loading = false;
        },
        error: (error) => {
          this.error = error;
          this.loading = false;
        }
      });
    }
  }

  cancelAddressForm(): void {
    this.showAddressForm = false;
    this.editingAddressIndex = -1;
    this.addressForm.reset({ country: 'United States', isDefault: false });
  }

  getFormErrors(form: FormGroup, fieldName: string): string[] {
    const field = form.get(fieldName);
    const errors: string[] = [];
    
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        errors.push(`${fieldName} is required`);
      }
      if (field.errors['email']) {
        errors.push('Please enter a valid email address');
      }
      if (field.errors['minlength']) {
        errors.push(`${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`);
      }
    }
    
    return errors;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
