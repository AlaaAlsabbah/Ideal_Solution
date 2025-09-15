import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, ChangeDetectorRef, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { ChartStat, CountStat } from '../../helperApi/model';
import { Service } from '../../services/requestApi';
import { AfternoonShift } from '../afternoon-shift/afternoon-shift';
import { combineLatest, timer } from 'rxjs';
import { MessageService } from 'primeng/api';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableModule, InputTextModule, ButtonModule, SkeletonModule, ToastModule, AfternoonShift],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  providers: [MessageService]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('chartCanvas') chartCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  chartStats: (ChartStat & { value: number })[] = [];
  countStats: CountStat[] = [];
  totalDistanceDriven: string = '';
  totalHoursDriven: string = '';
  loading: boolean = true;
  private charts: Chart[] = [];

  constructor(
    private service: Service,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    combineLatest([
      this.service.getChartStats(),
      this.service.getCountStats(),
      timer(1500)
    ]).subscribe({
      next: ([chartData, countData]) => {
        this.chartStats = chartData.map(item => ({
          ...item,
          value: item.total && item.used ? Math.round((item.used / item.total) * 100) : 0
        }));
        this.countStats = countData.filter(stat => !['Total Distance Driven', 'Total Hours Driven'].includes(stat.label));
        this.totalDistanceDriven = countData.find(stat => stat.label === 'Total Distance Driven')?.value || '0 km';
        this.totalHoursDriven = countData.find(stat => stat.label === 'Total Hours Driven')?.value || '0 hr : 0 min';
        this.loading = false;
        if (isPlatformBrowser(this.platformId)) this.cdr.detectChanges();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load dashboard data' });
        this.loading = false;
        if (isPlatformBrowser(this.platformId)) this.cdr.detectChanges();
      }
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

    if (!this.chartCanvases || this.chartCanvases.length === 0) return;
    if (this.chartStats.length === 0) return;

    this.chartCanvases.forEach((canvasRef, index) => {
      const canvas = canvasRef.nativeElement;
      const stat = this.chartStats[index];
      if (stat && canvas) {
        const chart = this.createChart(canvas, stat.value, stat.label);
        this.charts.push(chart);
      }
    });
  }

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
  }
}