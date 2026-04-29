export interface Transaction {
  id: string;
  invoice: string;
  date: string;
  salesperson: string;
  product: string;
  quantity: number;
  total: number;
  initials: string;
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
