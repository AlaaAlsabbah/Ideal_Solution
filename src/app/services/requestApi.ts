import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ChartStat, CountStat, AfternoonShiftVehicle, User, Role, Department } from '../helperApi/model';

@Injectable({
  providedIn: 'root'
})
export class Service {
  private chartApiUrl = 'http://localhost:3000/charts';
  private statApiUrl = 'http://localhost:3000/stats';
  private vehiclesApiUrl = 'http://localhost:3000/afternoonShifts';
  private usersApiUrl = 'http://localhost:3000/users';
  private rolesApiUrl = 'http://localhost:3000/roles';
  private departmentsApiUrl = 'http://localhost:3000/departments';

  constructor(private http: HttpClient) { }

  getChartStats(): Observable<ChartStat[]> {
    return this.http.get<ChartStat[]>(this.chartApiUrl);
  }

  getCountStats(): Observable<CountStat[]> {
    return this.http.get<CountStat[]>(this.statApiUrl);
  }

  getAfternoonShiftVehicles(): Observable<AfternoonShiftVehicle[]> {
    return this.http.get<AfternoonShiftVehicle[]>(this.vehiclesApiUrl);
  }
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersApiUrl);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.usersApiUrl, user);
  }

  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.usersApiUrl}/${id}`, user);
  }


  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.rolesApiUrl);
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.departmentsApiUrl);
  }

}