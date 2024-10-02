import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import {
  Chart,
  ChartConfiguration,
  Filler,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Legend,
} from 'chart.js';

interface DataSets {
  label: string;
  data: number[];
  fill?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  pointBackgroundColor?: string;
  pointBorderColor?: string;
  pointHoverBackgroundColor?: string;
  pointHoverBorderColor?: string;
}

@Component({
  selector: 'app-radar',
  standalone: true,
  imports: [],
  templateUrl: './radar.component.html',
  styleUrl: './radar.component.scss',
})
export class RadarComponent {
  @ViewChild('radarChart') private chartRef!: ElementRef;
  @Input() dataSets!: DataSets[];
  @Input() minScaleValue?: number = 0;
  @Input() maxScaleValue?: number = 100;

  private chart!: Chart;
  private fromAnimation: number = 400;

  ngOnInit() {
    Chart.register(
      RadarController,
      RadialLinearScale,
      PointElement,
      LineElement,
      Filler,
      Legend
    );
  }

  ngAfterViewInit() {
    this.createChart();
  }

  private createChart() {
    const ctx = this.chartRef.nativeElement.getContext('2d');

    const datasets = [
      {
        label: 'My First Dataset',
        data: [65, 59, 90, 81, 55],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)',
      },
      {
        label: 'My First Dataset',
        data: [30, 64, 76, 72, 85],
        fill: true,
        backgroundColor: 'rgba(40, 160, 255, 0.1)',
        borderColor: 'rgb(40, 160, 255)',
        pointBackgroundColor: 'rgb(40, 160, 255)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(40, 160, 255)',
      },
    ];

    const data = {
      labels: ['PJ', 'G', 'PG', 'PE', 'PP'],
      datasets: datasets,
    };

    const config: ChartConfiguration = {
      type: 'radar',
      data: data,
      options: {
        elements: {
          line: {
            borderWidth: 2,
          },
        },
        responsive: true,
        scales: {
          r: {
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 14,
                weight: 'bold',
              },
              color: '#000',
            },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  // private updateChartAnimation() {
  //   if (this.chart) {
  //     const chartHeight = this.chart.height || 400;
  //     console.log('UPDATE ANIMATION', chartHeight);

  //     this.chart.options.animations = {
  //       ...this.chart.options.animations,
  //       numbers: {
  //         type: 'number',
  //         properties: ['x', 'y'],
  //         from: chartHeight / 2,
  //         duration: 1200,
  //         easing: 'easeOutBounce',
  //       },
  //     };
  //   }
  // }
}
