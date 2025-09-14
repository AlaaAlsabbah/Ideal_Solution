import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { User, Role, Department } from '../../helperApi/model';
import { Service } from '../../services/requestApi';
import { combineLatest, timer } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileUploadModule,
    InputTextModule,
    InputMaskModule,
    ButtonModule,
    SkeletonModule
  ],
  templateUrl: './add-user.html',
  styleUrls: ['./add-user.scss']
})
export class AddUser implements OnInit {
  userForm!: FormGroup;
  uploadedImage: string | ArrayBuffer | null = null;
  userId: string | null = null;
  roles: Role[] = [];
  departments: Department[] = [];
  isLoading: boolean = true;

  constructor(
    private fb: FormBuilder,
    private service: Service,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      rfid: [''],
      role: ['', Validators.required],
      department: ['', Validators.required],
      fleet: ['']
    });

    combineLatest([
      this.service.getUsers(),
      this.service.getRoles(),
      this.service.getDepartments(),
      timer(1500) 
    ]).subscribe({
      next: ([users, roles, departments]) => {
        this.roles = roles;
        this.departments = departments;

        if (users && users.length > 0) {
          const user = users[0];
          this.userId = user.id;
          this.userForm.patchValue(user);
          this.uploadedImage = user.image || null;
        }
        this.isLoading = false; 
      },
      error: (err) => {
        console.error('AddUser: Error fetching data', err);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load data. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          background: '#1e2230',
          color: '#c7c7d3',
          confirmButtonColor: '#28a745'
        });
        this.isLoading = false; 
      }
    });
  }

  onImageUpload(event: any) {
    const file: File = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImage = e.target?.result ?? null;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (!this.userForm.valid) {
      const errors: string[] = [];
      if (this.userForm.get('firstName')?.hasError('required')) {
        errors.push('First Name is required');
      } else if (this.userForm.get('firstName')?.hasError('minlength')) {
        errors.push('First Name must be at least 2 characters');
      }
      if (this.userForm.get('lastName')?.hasError('required')) {
        errors.push('Last Name is required');
      } else if (this.userForm.get('lastName')?.hasError('minlength')) {
        errors.push('Last Name must be at least 2 characters');
      }
      if (this.userForm.get('email')?.hasError('required')) {
        errors.push('Email is required');
      } else if (this.userForm.get('email')?.hasError('email')) {
        errors.push('Email must be a valid email address');
      }
      if (this.userForm.get('role')?.hasError('required')) {
        errors.push('Role is required');
      }
      if (this.userForm.get('department')?.hasError('required')) {
        errors.push('Department is required');
      }

      Swal.fire({
        title: 'Validation Error',
        html: errors.join('<br>') || 'Please fill all required fields',
        icon: 'error',
        confirmButtonText: 'OK',
        background: '#1e2230',
        color: '#c7c7d3',
        confirmButtonColor: '#dc3545'
      });
      this.userForm.markAllAsTouched(); 
      return;
    }

    const userData: User = {
      ...this.userForm.value,
      id: this.userId || Date.now().toString(),
      image: this.uploadedImage ? this.uploadedImage.toString() : ''
    };

    this.isLoading = true; 
    if (this.userId) {
      this.service.updateUser(this.userId, userData).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Success',
            text: 'User updated successfully',
            icon: 'success',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            background: '#1e2230',
            color: '#c7c7d3'
          });
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 3000); 
        },
        error: (err) => {
          console.error('AddUser: Error updating user', err);
          Swal.fire({
            title: 'Error',
            text: 'Error updating user. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
            background: '#1e2230',
            color: '#c7c7d3',
            confirmButtonColor: '#dc3545'
          });
          this.isLoading = false;
        }
      });
    } else {
      this.service.createUser(userData).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Success',
            text: 'User created successfully',
            icon: 'success',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            background: '#1e2230',
            color: '#c7c7d3'
          });
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 3000);
        },
        error: (err) => {
          console.error('AddUser: Error creating user', err);
          Swal.fire({
            title: 'Error',
            text: 'Error creating user. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
            background: '#1e2230',
            color: '#c7c7d3',
            confirmButtonColor: '#dc3545'
          });
          this.isLoading = false;
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/dashboard']);
  }
}