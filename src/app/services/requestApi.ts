import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ChartStat, CountStat, AfternoonShiftVehicle } from '../helperApi/model';

@Injectable({
  providedIn: 'root'
})
export class Service {
  private chartApiUrl = 'http://localhost:3000/charts';
  private statApiUrl = 'http://localhost:3000/stats';
  private vehiclesApiUrl = 'http://localhost:3000/afternoonShifts';

  constructor(private http: HttpClient) {}

  getChartStats(): Observable<ChartStat[]> {
    return this.http.get<ChartStat[]>(this.chartApiUrl);
  }

  getCountStats(): Observable<CountStat[]> {
    return this.http.get<CountStat[]>(this.statApiUrl);
  }

  getAfternoonShiftVehicles(): Observable<AfternoonShiftVehicle[]> {
    return this.http.get<AfternoonShiftVehicle[]>(this.vehiclesApiUrl);
  }
}