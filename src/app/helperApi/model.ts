export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  subMenu?: MenuItem[];
}


export interface ChartStat {
  id: string;
  label: string;
  used: number;
  total: number;
}

export interface CountStat {
  id: string;
  count: number;
  label: string;
}

export interface AfternoonShiftVehicle {
  id: string;
  vehicle: string;
  plateNum: string;
  odometer: string;
  gps: string;
  device: string;
  sim: string;
  fleet: string;
  status: string;
}

export interface User {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  rfid: string;
  role: string;
  department: string;
  fleet: string;
  image?: string; 
}


export interface Role {
  id: string;
  label: string;
  value: string;
}

export interface Department {
  id: string;
  label: string;
  value: string;
}

export interface action {
    name: string;

}