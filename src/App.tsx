/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar, Header, KPICard, ZoneSales } from './components/DashboardElements';
import { MonthlySalesChart, CategoryChart } from './components/Charts';
import { TransactionsTable } from './components/TransactionTable';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  Users, 
  Download,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { fetchTransactions, fetchVendors, fetchCities, fetchCategories } from './services/supabaseService';
import { Transaction, MonthlyData, CategoryData, ZoneData, DashboardFilters } from './services/types';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vendorOptions, setVendorOptions] = useState<string[]>([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<DashboardFilters>({
    periodo: 'Todo el Tiempo',
    vendedor: 'Todos los Vendedores',
    ciudad: 'Todas las Ciudades',
    categoria: 'Todas las Categorías',
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [vendors, cities, categoriesList] = await Promise.all([
          fetchVendors(),
          fetchCities(),
          fetchCategories(),
        ]);
        setVendorOptions(vendors);
        setCityOptions(cities);
        setCategoryOptions(categoriesList);
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const txns = await fetchTransactions(filters);
        setTransactions(txns);
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
        setError('Error al cargar datos de Supabase');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [filters]);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return transactions.filter((t) => {
      const matchSearch =
        !query ||
        t.product.toLowerCase().includes(query) ||
        t.salesperson.toLowerCase().includes(query) ||
        t.ciudad?.toLowerCase().includes(query) ||
        t.zona?.toLowerCase().includes(query);

      const matchVendedor =
        filters.vendedor === 'Todos los Vendedores' ||
        t.salesperson === filters.vendedor;
      const matchCiudad =
        filters.ciudad === 'Todas las Ciudades' ||
        t.ciudad === filters.ciudad;
      const matchCategoria =
        filters.categoria === 'Todas las Categorías' ||
        t.categoria === filters.categoria;

      // Filtro de periodo sobre la fecha de la transacción
      let matchPeriodo = true;
      if (filters.periodo && filters.periodo !== 'Todo el Tiempo') {
        const date = new Date(t.date);
        const year = date.getFullYear();
        const month = date.getMonth();

        if (filters.periodo === 'Año 2024') {
          matchPeriodo = year === 2024;
        } else if (filters.periodo === 'Año 2023') {
          matchPeriodo = year === 2023;
        } else if (filters.periodo === 'Año 2022') {
          matchPeriodo = year === 2022;
        } else if (filters.periodo === 'Último Semestre 2024') {
          matchPeriodo = year === 2024 && month >= 6;
        } else if (filters.periodo === 'Primer Semestre 2024') {
          matchPeriodo = year === 2024 && month < 6;
        }
      }

      return matchSearch && matchVendedor && matchCiudad && matchCategoria && matchPeriodo;
    });
  }, [searchQuery, filters, transactions]);

  const totalSales = useMemo(
    () => filteredTransactions.reduce((sum, row) => sum + row.total, 0),
    [filteredTransactions]
  );

  const totalUnits = useMemo(
    () => filteredTransactions.reduce((sum, row) => sum + row.quantity, 0),
    [filteredTransactions]
  );

  const totalClients = useMemo(
    () => new Set(filteredTransactions.map((row) => row.invoice)).size,
    [filteredTransactions]
  );

  const avgMargin = useMemo(
    () => (filteredTransactions.length > 0 ? totalSales / filteredTransactions.length : 0),
    [filteredTransactions, totalSales]
  );

  const monthlySales = useMemo<MonthlyData[]>(() => {
    const monthMap = new Map<string, number>();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    filteredTransactions.forEach((row) => {
      const date = new Date(row.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const currentSum = monthMap.get(key) || 0;
      monthMap.set(key, currentSum + row.total);
    });

    return Array.from(monthMap.entries())
      .map(([key, sales]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          year,
          monthIndex: month,
          month: monthNames[month - 1] || 'Desconocido',
          sales,
          objective: sales * 1.1,
        } as MonthlyData & { year: number; monthIndex: number };
      })
      .sort((a, b) => a.year - b.year || a.monthIndex - b.monthIndex)
      .map(({ year, monthIndex, ...rest }) => rest);
  }, [filteredTransactions]);

  const categoryDistribution = useMemo<CategoryData[]>(() => {
    const categoryMap = new Map<string, number>();
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    let colorIndex = 0;

    filteredTransactions.forEach((row) => {
      const category = row.categoria || 'Otros';
      categoryMap.set(category, (categoryMap.get(category) || 0) + row.total);
    });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        color: colors[colorIndex++ % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const zoneSales = useMemo<ZoneData[]>(() => {
    const zoneMap = new Map<string, number>();
    filteredTransactions.forEach((row) => {
      const zone = row.zona || row.ciudad || 'Sin Zona';
      zoneMap.set(zone, (zoneMap.get(zone) || 0) + row.total);
    });
    const total = Array.from(zoneMap.values()).reduce((sum, value) => sum + value, 0);

    return Array.from(zoneMap.entries()).map(([zone, totalSales]) => ({
      zone,
      totalSales,
      percentage: total > 0 ? (totalSales / total) * 100 : 0,
    }));
  }, [filteredTransactions]);

  const kpis = [
    { label: 'Ventas Totales', value: `$${totalSales.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`, trend: 4.5, icon: DollarSign, color: 'bg-blue-50 text-primary' },
    { label: 'Unidades Vendidas', value: `${totalUnits.toLocaleString()} uds`, trend: 2.1, icon: Package, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Ticket Promedio', value: `$${avgMargin.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`, trend: -0.5, icon: TrendingUp, color: 'bg-teal-50 text-teal-700' },
    { label: 'Clientes Activos', value: `${totalClients}`, trend: 4.1, icon: Users, color: 'bg-sky-50 text-sky-700' },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setShowToast('Reporte exportado con éxito (Simulado)');
      setTimeout(() => setShowToast(null), 3000);
    }, 1500);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex flex-col items-center justify-center h-[60vh] text-slate-400"
        >
          <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
          <h2 className="text-xl font-bold text-slate-600">Cargando datos...</h2>
          <p className="text-sm">Conectando con Supabase</p>
        </motion.div>
      );
    }

    if (error) {
      return (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex flex-col items-center justify-center h-[60vh] text-slate-400"
        >
          <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-red-600">Error al cargar datos</h2>
          <p className="text-sm">{error}</p>
        </motion.div>
      );
    }

    if (activeTab !== 'Dashboard') {
      return (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex flex-col items-center justify-center h-[60vh] text-slate-400"
        >
          <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
          <h2 className="text-xl font-bold">Vista de {activeTab} en construcción</h2>
          <p className="text-sm">Estamos trabajando en esta sección. Regresa al Dashboard.</p>
          <button 
            onClick={() => setActiveTab('Dashboard')}
            className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm"
          >
            Volver al Dashboard
          </button>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {kpis.map((kpi, idx) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <KPICard 
                label={kpi.label} 
                value={kpi.value} 
                trend={kpi.trend} 
                icon={kpi.icon} 
                colorClass={kpi.color}
              />
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div transition={{ delay: 0.4 }} className="xl:col-span-1">
            <ZoneSales data={zoneSales} />
          </motion.div>
          <motion.div transition={{ delay: 0.5 }} className="xl:col-span-2">
            <MonthlySalesChart data={monthlySales.length > 0 ? monthlySales : []} />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 pb-12">
          <motion.div transition={{ delay: 0.6 }} className="xl:col-span-1">
            <CategoryChart data={categoryDistribution.length > 0 ? categoryDistribution : []} />
          </motion.div>
          <motion.div transition={{ delay: 0.7 }} className="xl:col-span-3">
            <TransactionsTable data={filteredTransactions} />
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 right-10 z-[100] bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="text-teal-400 w-5 h-5" />
            <span className="text-sm font-bold">{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar 
        isOpen={mobileMenuOpen} 
        setMobileOpen={setMobileMenuOpen} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
        <Header 
          onMenuClick={() => setMobileMenuOpen(true)} 
          onSearch={setSearchQuery} 
        />

        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-4 rounded-xl shadow-soft border border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
              {[
                { 
                  id: 'periodo', 
                  label: 'Periodo', 
                  options: [
                    'Todo el Tiempo',
                    'Año 2024',
                    'Primer Semestre 2024',
                    'Último Semestre 2024',
                    'Año 2023',
                    'Año 2022',
                  ] 
                },
                { id: 'vendedor', label: 'Vendedor', options: ['Todos los Vendedores', ...vendorOptions] },
                { id: 'ciudad', label: 'Ciudad', options: ['Todas las Ciudades', ...cityOptions] },
                { id: 'categoria', label: 'Categoría', options: ['Todas las Categorías', ...categoryOptions] },
              ].map((filter) => (
                <div key={filter.id} className="flex flex-col min-w-0">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-0.5 tracking-wider">{filter.label}</label>
                  <select 
                    value={filters[filter.id as keyof typeof filters]}
                    onChange={(e) => setFilters(prev => ({ ...prev, [filter.id]: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold py-2 pl-3 pr-8 focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="w-full lg:w-auto flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-light transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? 'Procesando...' : 'Exportar Reporte'}
            </button>
          </div>

          {renderContent()}
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-white border border-slate-200 h-16 flex items-center justify-around z-50 px-4 rounded-2xl shadow-xl backdrop-blur-xl bg-white/90">
        {[
          { icon: LayoutDashboard, label: 'Dashboard' },
          { icon: TrendingUp, label: 'Ventas' },
          { icon: Package, label: 'Stock' },
          { icon: Users, label: 'Perfil' },
        ].map((item) => (
          <button 
            key={item.label} 
            onClick={() => setActiveTab(item.label === 'Dashboard' ? 'Dashboard' : item.label)}
            className={cn(
              "flex flex-col items-center transition-colors",
              activeTab === item.label ? "text-primary" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}