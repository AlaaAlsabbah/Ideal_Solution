import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID,
  OnDestroy
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { FormsModule } from '@angular/forms'; 
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { ChartStat, CountStat  } from '../../helperApi/model';
import { Service } from '../../services/requestApi';
import { AfternoonShift } from '../afternoon-shift/afternoon-shift';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, InputTextModule, ButtonModule ,AfternoonShift],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('chartCanvas') chartCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  chartStats: (ChartStat & { value: number })[] = [];
  countStats: CountStat[] = [];
  private charts: Chart[] = [];

  constructor(
    private service: Service,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.service.getChartStats().subscribe({
      next: (data) => {
        this.chartStats = data.map(item => ({
          ...item,
          value: item.total && item.used ? Math.round((item.used / item.total) * 100) : 0
        }));
        if (isPlatformBrowser(this.platformId)) this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching chart stats:', err)
    });

    this.service.getCountStats().subscribe({
      next: (data) => this.countStats = data,
      error: (err) => console.error('Error fetching count stats:', err)
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.chartCanvases.changes.subscribe(() => this.createCharts());
      if (this.chartStats.length > 0 && this.chartCanvases.length > 0) this.createCharts();
    }
  }

  ngOnDestroy(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  createCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];

    if (!this.chartCanvases || this.chartCanvases.length === 0) {
      console.warn('No chart canvases available');
      return;
    }
    if (this.chartStats.length === 0) {
      console.warn('No chart stats available');
      return;
    }

    this.chartCanvases.forEach((canvasRef, index) => {
      const canvas = canvasRef.nativeElement;
      const stat = this.chartStats[index];
      if (stat && canvas) {
        const chart = this.createChart(canvas, stat.value, stat.label);
        this.charts.push(chart);
      } else {
        console.warn(`Missing stat or canvas at index ${index}`);
      }
    });
  }

  // createChart(canvas: HTMLCanvasElement, percentage: number, label: string): Chart {
  //   return new Chart(canvas.getContext('2d')!, {
  //     type: 'doughnut',
  //     data: {
  //       labels: [label, 'Remaining'],
  //       datasets: [{
  //         data: [percentage, 100 - percentage],
  //         backgroundColor: ['#00C5D6', '#1F1D2B'],
  //         borderWidth: 0,
  //         borderRadius: 10
  //       }]
  //     },
  //     options: {
  //       cutout: '90%',
  //       responsive: true,
  //       plugins: { legend: { display: false }, tooltip: { enabled: true } }
  //     }
  //   });
  // }}


  createChart(canvas: HTMLCanvasElement, percentage: number, label: string): Chart {
  return new Chart(canvas.getContext('2d')!, {
    type: 'doughnut',
    data: {
      labels: [label, 'Remaining'],
      datasets: [{
        data: [percentage, 100 - percentage],
        backgroundColor: ['#00C5D6', '#1F1D2B'],
        borderWidth: 0,
        borderRadius: 10
      }]
    },
    options: {
      cutout: '90%',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      }
    },
    plugins: [
      {
        id: 'centerText',
        beforeDraw(chart) {
          const { ctx, chartArea: { width, height } } = chart;
          ctx.save();

          ctx.font = 'bold 16px Poppins';  
          ctx.fillStyle = '#00C5D6';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(`${percentage}%`, width / 2, height / 2 - 10);

          ctx.restore();
        }
      }
    ]
  });
   }}
