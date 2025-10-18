import { Component, ChangeDetectionStrategy, inject, computed, signal, effect, viewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { Order } from '../../models/order.model';

// Let TypeScript know that d3 is a global variable
declare var d3: any;

interface ChartData {
  label: string;
  value: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  imports: [CommonModule, CurrencyPipe, DatePipe],
})
export class AdminDashboardComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  currentUser = this.authService.currentUser;
  
  users = signal<User[]>([]);
  products = this.productService.getProducts();
  orders = this.orderService.orders;

  // Chart related signals
  chartContainer = viewChild<ElementRef>('chartContainer');
  tooltip = viewChild<ElementRef>('tooltip');
  activeChart = signal<'daily' | 'weekly' | 'monthly'>('daily');

  constructor() {
    this.users.set(this.authService.getUsers());
    
    effect(() => {
      // Re-draw chart when data or type changes
      if (this.chartContainer()) {
        this.drawChart();
      }
    });
  }

  ngAfterViewInit() {
      // Initial chart draw
      this.drawChart();
      this.cdr.detectChanges();
  }

  // --- Computed values for reports ---
  completedOrders = computed(() => this.orders().filter(o => o.status === 'completado'));
  totalRevenue = computed(() => this.completedOrders().reduce((acc, order) => acc + order.total, 0));
  completedOrdersCount = computed(() => this.completedOrders().length);
  pendingOrdersCount = computed(() => this.orders().filter(o => o.status !== 'completado' && o.status !== 'cancelado').length);
  
  waiters = computed(() => this.users().filter(u => u.role === 'mesero'));

  waiterPerformance = computed(() => {
    const completed = this.completedOrders();
    return this.waiters().map(waiter => {
      const waiterOrders = completed.filter(o => o.waiterId === waiter.id);
      const totalSales = waiterOrders.reduce((sum, order) => sum + order.total, 0);
      const tablesServed = waiterOrders.length;
      const recentOrders = waiterOrders.slice(-5).reverse();
      return {
        waiterId: waiter.id,
        waiterName: waiter.name,
        totalSales,
        tablesServed,
        recentOrders
      };
    });
  });
  
  // --- Computed values for charts ---
  private dailySalesData = computed(() => {
    const salesByDay = new Map<string, number>();
    this.completedOrders().forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0];
      salesByDay.set(day, (salesByDay.get(day) || 0) + order.total);
    });
    return Array.from(salesByDay.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());
  });

  private weeklySalesData = computed(() => {
    const salesByWeek = new Map<string, number>();
    const getWeekLabel = (d: Date) => {
        const date = new Date(d.getTime());
        const day = date.getDay() || 7;
        date.setDate(date.getDate() + 4 - day);
        const year = date.getFullYear();
        const week = Math.ceil((((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + 1) / 7);
        return `${year}-W${String(week).padStart(2, '0')}`;
    };
    this.completedOrders().forEach(order => {
        const week = getWeekLabel(order.createdAt);
        salesByWeek.set(week, (salesByWeek.get(week) || 0) + order.total);
    });
    return Array.from(salesByWeek.entries()).map(([label, value]) => ({ label, value })).sort((a,b) => a.label.localeCompare(b.label));
  });

  private monthlySalesData = computed(() => {
    const salesByMonth = new Map<string, number>();
    this.completedOrders().forEach(order => {
        const month = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
        salesByMonth.set(month, (salesByMonth.get(month) || 0) + order.total);
    });
    return Array.from(salesByMonth.entries()).map(([label, value]) => ({ label, value })).sort((a,b) => a.label.localeCompare(b.label));
  });

  activeChartData = computed<ChartData[]>(() => {
    switch(this.activeChart()) {
      case 'daily': return this.dailySalesData();
      case 'weekly': return this.weeklySalesData();
      case 'monthly': return this.monthlySalesData();
      default: return [];
    }
  });


  // --- User/Product Management ---
  deleteUser(userId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.authService.deleteUser(userId);
      this.users.set(this.authService.getUsers());
    }
  }

  deleteProduct(productId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productService.deleteProduct(productId);
    }
  }

  // --- D3 Chart Drawing ---
  private drawChart() {
    const data = this.activeChartData();
    const container = this.chartContainer()?.nativeElement;
    const tooltipEl = this.tooltip()?.nativeElement;
    if (!container || !data.length) return;

    d3.select(container).select('svg').remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 70 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    const svg = d3.select(container).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map((d: ChartData) => d.label))
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: ChartData) => d.value) * 1.1 || 100])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g')
      .call(d3.axisLeft(y).tickFormat((d: number) => `$${(d/1000)}k`));

    const tooltipDiv = d3.select(tooltipEl);

    svg.selectAll('mybar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: ChartData) => x(d.label))
      .attr('width', x.bandwidth())
      .attr('fill', '#f97316')
      .attr('height', (d: ChartData) => height - y(0))
      .attr('y', (d: ChartData) => y(0))
      .on('mouseover', function(event: MouseEvent, d: ChartData) {
        d3.select(this).attr('fill', '#ea580c');
        tooltipDiv.transition().duration(200).style('opacity', .95);
        tooltipDiv.html(`<strong>${d.label}</strong><br/>${new CurrencyPipe('en-US', 'COP').transform(d.value, 'symbol-narrow', '1.0-0')}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function(d: any) {
         d3.select(this).attr('fill', '#f97316');
         tooltipDiv.transition().duration(500).style('opacity', 0);
      });

    svg.selectAll('rect')
      .transition()
      .duration(800)
      .attr('y', (d: ChartData) => y(d.value))
      .attr('height', (d: ChartData) => height - y(d.value))
      .delay((d: any, i: number) => i * 20);
  }
}