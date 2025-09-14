import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { User, Role, Department } from '../../helperApi/model';
import { Service } from '../../services/requestApi';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileUploadModule,
    InputTextModule,
    InputMaskModule,
    ButtonModule
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

    // Fetch users, roles, and departments concurrently
    combineLatest([
      this.service.getUsers(),
      this.service.getRoles(),
      this.service.getDepartments()
    ]).subscribe({
      next: ([users, roles, departments]) => {
        // Set roles and departments
        this.roles = roles;
        this.departments = departments;

        // Prefill form with first user if available
        if (users && users.length > 0) {
          const user = users[0];
          this.userId = user.id;
          this.userForm.patchValue(user);
          this.uploadedImage = user.image || null;
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
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
    if (this.userForm.valid) {
      const userData: User = {
        ...this.userForm.value,
        id: this.userId || Date.now().toString(),
        image: this.uploadedImage ? this.uploadedImage.toString() : ''
      };

      if (this.userId) {
        this.service.updateUser(this.userId, userData).subscribe({
          next: () => {
            console.log('User updated successfully');
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Error updating user:', err);
          }
        });
      } else {
        this.service.createUser(userData).subscribe({
          next: () => {
            console.log('User created successfully');
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Error creating user:', err);
          }
        });
      }
    }
  }

  onCancel() {
    this.router.navigate(['/dashboard']);
  }
}