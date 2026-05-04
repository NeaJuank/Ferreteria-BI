export interface Transaction {
  id: string;
  invoice: string;
  date: string;
  salesperson: string;
  product: string;
  quantity: number;
  total: number;
  initials: string;
  ciudad?: string;
  zona?: string;
  metodo_pago?: string;
  categoria?: string;
}

export interface KPIStats {
  label: string;
  value: string;
  trend: number;
  iconName: string;
}

export interface MonthlyData {
  month: string;
  sales: number;
  objective: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface ZoneData {
  zone: string;
  totalSales: number;
  percentage: number;
}

export interface PaymentData {
  name: string;
  value: number;
  color: string;
}

export interface ProductData {
  name: string;
  value: number;
}

export interface DashboardFilters {
  vendedor?: string;
  ciudad?: string;
  categoria?: string;
  periodo?: string;
}
