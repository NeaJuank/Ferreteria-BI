import { supabase } from '../lib/supabaseClient';
import { Transaction, MonthlyData, CategoryData, ZoneData, DashboardFilters } from './types';

const applyFilters = (query: any, filters?: DashboardFilters) => {
  if (!filters) return query;

  if (filters.vendedor && filters.vendedor !== 'Todos los Vendedores') {
    query = query.eq('dim_vendedor.nombre', filters.vendedor);
  }
  if (filters.ciudad && filters.ciudad !== 'Todas las Ciudades') {
    query = query.eq('dim_segmento_venta.ciudad', filters.ciudad);
  }
  if (filters.categoria && filters.categoria !== 'Todas las Categorías') {
    query = query.eq('dim_producto.categoria', filters.categoria);
  }
  if (filters.periodo && filters.periodo !== 'Todo el Tiempo') {
    const today = new Date();
    let startDate: string | null = null;
    const endDate: string = today.toISOString().split('T')[0];

    if (filters.periodo === 'Este Mes') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = firstDay.toISOString().split('T')[0];
    } else if (filters.periodo === 'Último Trimestre') {
      const past = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      startDate = past.toISOString().split('T')[0];
    } else if (filters.periodo === 'Año Actual') {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      startDate = firstDay.toISOString().split('T')[0];
    }

    if (startDate) {
      query = query.gte('dim_tiempo.fecha', startDate).lte('dim_tiempo.fecha', endDate);
    }
  }

  return query;
};

/**
 * Obtiene todas las transacciones desde Supabase con join a dimensiones
 */
export async function fetchTransactions(filters?: DashboardFilters): Promise<Transaction[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  try {
    let query = supabase
      .from('fact_ventas')
      .select(`
        id,
        factura,
        cantidad,
        valor_unitario,
        valor_total,
        dim_vendedor!vendedor_id (nombre),
        dim_producto!producto_id (nombre, categoria),
        dim_segmento_venta!segmento_venta_id (ciudad, zona),
        dim_tiempo!tiempo_id (fecha)
      `)
      .order('id', { ascending: false })
      .limit(1000);

    query = applyFilters(query, filters);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    const transactions: Transaction[] = (data || []).map((row: any, index: number) => ({
      id: String(row.id),
      invoice: row.factura || `INV-${String(index + 1).padStart(3, '0')}`,
      date: row.dim_tiempo?.fecha || new Date().toISOString().split('T')[0],
      salesperson: row.dim_vendedor?.nombre || 'N/A',
      product: row.dim_producto?.nombre || 'Producto',
      quantity: row.cantidad || 0,
      total: parseFloat(row.valor_total) || 0,
      initials: (row.dim_vendedor?.nombre || 'N/A')
        .split(' ')
        .map((word: string) => word[0])
        .join('')
        .toUpperCase(),
      ciudad: row.dim_segmento_venta?.ciudad || undefined,
      zona: row.dim_segmento_venta?.zona || undefined,
      categoria: row.dim_producto?.categoria || undefined,
    }));

    return transactions;
  } catch (err) {
    console.error('Error in fetchTransactions:', err);
    return [];
  }
}

/**
 * Obtiene datos de ventas mensuales para gráficos
 */
export async function fetchMonthlySales(filters?: DashboardFilters): Promise<MonthlyData[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  try {
    let query = supabase
      .from('fact_ventas')
      .select(`
        valor_total,
        dim_tiempo!tiempo_id (mes, ano, fecha),
        dim_vendedor!vendedor_id (nombre),
        dim_segmento_venta!segmento_venta_id (ciudad),
        dim_producto!producto_id (categoria)
      `);

    query = applyFilters(query, filters);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching monthly sales:', error);
      return [];
    }

    const monthMap = new Map<string, number>();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    (data || []).forEach((row: any) => {
      if (!row.dim_tiempo) return;
      const monthKey = `${row.dim_tiempo.mes}-${row.dim_tiempo.ano}`;
      const currentSum = monthMap.get(monthKey) || 0;
      monthMap.set(monthKey, currentSum + parseFloat(row.valor_total || 0));
    });

    const monthlySales: MonthlyData[] = Array.from(monthMap.entries())
      .map(([key, total]) => {
        const [month, year] = key.split('-');
        const monthIndex = parseInt(month, 10) - 1;
        const monthName = monthNames[monthIndex] || 'Desconocido';
        return {
          month: monthName,
          sales: total,
          objective: total * 1.1,
          year: parseInt(year, 10),
          monthIndex,
        } as MonthlyData & { year: number; monthIndex: number };
      })
      .sort((a, b) => a.year - b.year || a.monthIndex - b.monthIndex)
      .map(({ year, monthIndex, ...rest }) => rest)
      .slice(-12);

    return monthlySales;
  } catch (err) {
    console.error('Error in fetchMonthlySales:', err);
    return [];
  }
}

/**
 * Obtiene distribución de ventas por categoría de productos
 */
export async function fetchCategoryDistribution(filters?: DashboardFilters): Promise<CategoryData[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  try {
    let query = supabase
      .from('fact_ventas')
      .select(`
        valor_total,
        dim_producto!producto_id (categoria),
        dim_vendedor!vendedor_id (nombre),
        dim_segmento_venta!segmento_venta_id (ciudad),
        dim_tiempo!tiempo_id (fecha)
      `);

    query = applyFilters(query, filters);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching category distribution:', error);
      return [];
    }

    const categoryMap = new Map<string, number>();
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    let colorIndex = 0;

    (data || []).forEach((row: any) => {
      const category = row.dim_producto?.categoria || 'Otros';
      const currentSum = categoryMap.get(category) || 0;
      categoryMap.set(category, currentSum + parseFloat(row.valor_total || 0));
    });

    const distribution: CategoryData[] = Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        color: colors[colorIndex++ % colors.length],
      }))
      .sort((a, b) => b.value - a.value);

    return distribution;
  } catch (err) {
    console.error('Error in fetchCategoryDistribution:', err);
    return [];
  }
}

export async function fetchVendors(): Promise<string[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('dim_vendedor')
      .select('nombre')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }

    return (data || []).map((row: any) => row.nombre).filter(Boolean);
  } catch (err) {
    console.error('Error in fetchVendors:', err);
    return [];
  }
}

export async function fetchCities(): Promise<string[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('dim_segmento_venta')
      .select('ciudad')
      .order('ciudad', { ascending: true });

    if (error) {
      console.error('Error fetching cities:', error);
      return [];
    }

    return Array.from(new Set((data || []).map((row: any) => row.ciudad).filter(Boolean)));
  } catch (err) {
    console.error('Error in fetchCities:', err);
    return [];
  }
}

export async function fetchCategories(): Promise<string[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('dim_producto')
      .select('categoria')
      .order('categoria', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return Array.from(new Set((data || []).map((row: any) => row.categoria).filter(Boolean)));
  } catch (err) {
    console.error('Error in fetchCategories:', err);
    return [];
  }
}

/**
 * Obtiene KPIs generales
 */
export async function fetchKPIs(filters?: DashboardFilters) {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  try {
    let query = supabase
      .from('fact_ventas')
      .select(`
        valor_total,
        cantidad,
        factura,
        dim_vendedor!vendedor_id (nombre),
        dim_segmento_venta!segmento_venta_id (ciudad),
        dim_producto!producto_id (categoria),
        dim_tiempo!tiempo_id (fecha)
      `);

    query = applyFilters(query, filters);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching KPIs:', error);
      return null;
    }

    const rows = data || [];
    const totalSales = rows.reduce((sum: number, row: any) => sum + parseFloat(row.valor_total || 0), 0);
    const totalUnits = rows.reduce((sum: number, row: any) => sum + (row.cantidad || 0), 0);
    const uniqueClients = new Set(rows.map((row: any) => row.factura)).size;
    const avgOrder = rows.length > 0 ? totalSales / rows.length : 0;

    return {
      totalSales,
      totalUnits,
      avgMargin: avgOrder,
      totalClients: uniqueClients,
    };
  } catch (err) {
    console.error('Error in fetchKPIs:', err);
    return null;
  }
}

export async function fetchZoneSales(filters?: DashboardFilters): Promise<ZoneData[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  try {
    let query = supabase
      .from('fact_ventas')
      .select(`
        valor_total,
        dim_segmento_venta!segmento_venta_id (zona, ciudad),
        dim_vendedor!vendedor_id (nombre),
        dim_producto!producto_id (categoria),
        dim_tiempo!tiempo_id (fecha)
      `);

    query = applyFilters(query, filters);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching zone sales:', error);
      return [];
    }

    const zoneMap = new Map<string, number>();
    (data || []).forEach((row: any) => {
      const zone = row.dim_segmento_venta?.zona || row.dim_segmento_venta?.ciudad || 'Sin Zona';
      const current = zoneMap.get(zone) || 0;
      zoneMap.set(zone, current + parseFloat(row.valor_total || 0));
    });

    const totalSales = Array.from(zoneMap.values()).reduce((sum, value) => sum + value, 0);

    return Array.from(zoneMap.entries()).map(([zone, totalSalesZone]) => ({
      zone,
      totalSales: totalSalesZone,
      percentage: totalSales > 0 ? (totalSalesZone / totalSales) * 100 : 0,
    }));
  } catch (err) {
    console.error('Error in fetchZoneSales:', err);
    return [];
  }
}