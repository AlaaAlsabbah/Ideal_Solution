import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { AfternoonShiftVehicle, action } from '../../helperApi/model';
import { Service } from '../../services/requestApi';


@Component({
  selector: 'app-afternoon-shift',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TableModule,],
  templateUrl: './afternoon-shift.html',
  styleUrl: './afternoon-shift.scss'
})
export class AfternoonShift implements OnInit {
   @Input() showToolbar: boolean = true;
   @Input() withBorder: boolean = false;

  vehicles: AfternoonShiftVehicle[] = [];
  filteredVehicles: AfternoonShiftVehicle[] = [];
  searchTerm: string = '';
  actions: action[] | undefined;
  Active: action | undefined;

  constructor(private service: Service) { }

  ngOnInit(): void {
    this.actions = [
      { name: 'Active' },
      { name: 'Non-active' },
      { name: 'Pinding' },
    ];

    this.service.getAfternoonShiftVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.filteredVehicles = data;
      },
      error: (err) => console.error('Error fetching afternoon shift vehicles:', err)
    });
  }


  onSelectAction(action: action): void {
    this.Active = action;
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = term;
    this.filteredVehicles = this.vehicles.filter(vehicle =>
      vehicle.vehicle.toLowerCase().includes(term) ||
      vehicle.plateNum.toLowerCase().includes(term) ||
      vehicle.device.toLowerCase().includes(term) ||
      vehicle.fleet.toLowerCase().includes(term) ||
      vehicle.status.toLowerCase().includes(term)
    );
  }

  onExport(): void {
    console.log('Export clicked - implement CSV/Excel export');
  }

  onImport(): void {
    console.log('Import clicked - implement file upload');
  }
}
