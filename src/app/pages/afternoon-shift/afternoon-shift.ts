
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfternoonShiftVehicle, action } from '../../helperApi/model';
import { Service } from '../../services/requestApi';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-afternoon-shift',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TableModule, DragDropModule],
  templateUrl: './afternoon-shift.html',
  styleUrl: './afternoon-shift.scss'
})
export class AfternoonShift implements OnInit {
  @Input() showToolbar: boolean = true;
  @Input() withBorder: boolean = false;

  vehicles: AfternoonShiftVehicle[] = [];
  filteredVehicles: AfternoonShiftVehicle[] = [];
  searchTerm = new FormControl('');
  actions: action[] | undefined;
  Active: action | undefined;
  sortField: keyof Pick<AfternoonShiftVehicle, 'vehicle' | 'plateNum'> = 'vehicle';
  sortOrder: number = 1; // 1 for ascending, -1 for descending
  dragStartIndex: number | null = null;
  columns: { field: keyof AfternoonShiftVehicle; header: string; sortable: boolean }[] = [
    { field: 'vehicle', header: 'Vehicle', sortable: true },
    { field: 'plateNum', header: 'Plate Num.', sortable: true },
    { field: 'odometer', header: 'Odometer', sortable: false },
    { field: 'gps', header: 'GPS', sortable: false },
    { field: 'device', header: 'Device', sortable: false },
    { field: 'sim', header: 'SIM', sortable: false },
    { field: 'fleet', header: 'Fleet', sortable: false },
    { field: 'status', header: 'Status', sortable: false }
  ];

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
        this.filteredVehicles = [...data];
      },
      error: (err) => console.error('Error fetching afternoon shift vehicles:', err)
    });

    // Subscribe to searchTerm value changes with debounce
    this.searchTerm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.onSearch(term || ''));
  }

  sort(field: keyof Pick<AfternoonShiftVehicle, 'vehicle' | 'plateNum'>): void {
    if (this.sortField === field) {
      this.sortOrder = -this.sortOrder;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }

    this.filteredVehicles.sort((a, b) => {
      const valueA = a[field].toLowerCase();
      const valueB = b[field].toLowerCase();
      if (valueA < valueB) return -1 * this.sortOrder;
      if (valueA > valueB) return 1 * this.sortOrder;
      return 0;
    });
  }

  onSelectAction(action: action): void {
    this.Active = action;
  }

  onSearch(term: string): void {
    const searchTerm = term.toLowerCase();
    this.filteredVehicles = this.vehicles.filter(vehicle =>
      vehicle.vehicle.toLowerCase().includes(searchTerm) ||
      vehicle.plateNum.toLowerCase().includes(searchTerm) ||
      vehicle.device.toLowerCase().includes(searchTerm) ||
      vehicle.fleet.toLowerCase().includes(searchTerm) ||
      vehicle.status.toLowerCase().includes(searchTerm)
    );
    if (this.sortField) {
      this.sort(this.sortField);
    }
  }

  onExport(): void {
    const exportData = this.filteredVehicles.map(v => ({
      Vehicle: v.vehicle,
      PlateNum: v.plateNum,
      Odometer: v.odometer,
      GPS: v.gps,
      Device: v.device,
      SIM: v.sim,
      Fleet: v.fleet,
      Status: v.status
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AfternoonShift');
    XLSX.writeFile(wb, 'AfternoonShift.xlsx'); 
  }

  // 🔹 IMPORT
  onImport(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        const importedVehicles: AfternoonShiftVehicle[] = jsonData.map(item => ({
          id: uuidv4(),
          vehicle: item['Vehicle'] || '',
          plateNum: item['PlateNum'] || '',
          odometer: item['Odometer'] || '',
          gps: item['GPS'] || '',
          device: item['Device'] || '',
          sim: item['SIM'] || '',
          fleet: item['Fleet'] || '',
          status: item['Status'] || ''
        }));
        

        // 🔹 Merge with existing list
        this.vehicles = [...this.vehicles, ...importedVehicles];
        this.filteredVehicles = [...this.vehicles];
      };
      reader.readAsArrayBuffer(file);
    };

    input.click(); // trigger hidden file input
  }


  onDragStart(event: DragEvent, index: number): void {
    this.dragStartIndex = index;
    event.dataTransfer?.setData('text/plain', index.toString());
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Allow dropping
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    if (this.dragStartIndex === null) return;
    const dragIndex = this.dragStartIndex;
    const draggedItem = this.filteredVehicles[dragIndex];
    this.filteredVehicles.splice(dragIndex, 1);
    this.filteredVehicles.splice(dropIndex, 0, draggedItem);
    this.dragStartIndex = null;
    this.filteredVehicles = [...this.filteredVehicles];
  }

  onColumnDrop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    this.columns = [...this.columns];
  }
}