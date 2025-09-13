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


export interface action {
    name: string;

}