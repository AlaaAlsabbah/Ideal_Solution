import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, ChangeDetectorRef, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate, animateChild, animate as animateFn } from '@angular/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { ChartStat, CountStat } from '../../helperApi/model';
import { Service } from '../../services/requestApi';
import { AfternoonShift } from '../afternoon-shift/afternoon-shift';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableModule, InputTextModule, ButtonModule, AfternoonShift],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('2s ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('2s ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
  
  
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('chartCanvas') chartCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  chartStats: (ChartStat & { value: number })[] = [];
  countStats: CountStat[] = [];
  private charts: Chart[] = [];
  loading: boolean = true;

  constructor(
    private service: Service,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.service.getChartStats().subscribe({
      next: (data) => {
        this.chartStats = data.map(item => ({
          ...item,
          value: item.total && item.used ? Math.round((item.used / item.total) * 100) : 0
        }));
        this.loading = false;
        if (isPlatformBrowser(this.platformId)) this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching chart stats:', err);
        this.loading = false;
        if (isPlatformBrowser(this.platformId)) this.cdr.detectChanges();
      }
    });

    this.service.getCountStats().subscribe({
      next: (data) => {
        this.countStats = data;
        this.loading = false;
        if (isPlatformBrowser(this.platformId)) this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching count stats:', err);
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
