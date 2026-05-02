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
import { INITIAL_TRANSACTIONS, MONTHLY_SALES, CATEGORY_DISTRIBUTION } from './services/mockData';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('Dashboard cargado');
  }, []);

  useEffect(() => {
    console.log('Búsqueda actualizada:', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    console.log('Filtros actualizados:', filters);
  }, [filters]);

  useEffect(() => {
    console.log('Pestaña activa:', activeTab);
  }, [activeTab]);

  // States for filters
  const [filters, setFilters] = useState({
    periodo: 'Este Mes',
    vendedor: 'Todos los Vendedores',
    ciudad: 'Todas las Ciudades',
    categoria: 'Todas las Categorías',
  });

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return INITIAL_TRANSACTIONS.filter(t => {
      const matchSearch = t.product.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.salesperson.toLowerCase().includes(searchQuery.toLowerCase());
      const matchVendedor = filters.vendedor === 'Todos los Vendedores' || t.salesperson === filters.vendedor;
      // Note: city and category filtering would normally be in the data model, simulating here:
      return matchSearch && matchVendedor;
    });
  }, [searchQuery, filters]);

  // Derived KPIs
  const totalSales = useMemo(() => filteredTransactions.reduce((acc, curr) => acc + curr.total, 0), [filteredTransactions]);
  const totalUnits = useMemo(() => filteredTransactions.reduce((acc, curr) => acc + curr.quantity, 0), [filteredTransactions]);

  const kpis = [
    { label: 'Ventas (Filtro)', value: `$${totalSales.toLocaleString()}.00`, trend: 4.5, icon: DollarSign, color: 'bg-blue-50 text-primary' },
    { label: 'Cant. Filtrada', value: `${totalUnits.toLocaleString()} uds`, trend: 2.1, icon: Package, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Margen Promedio', value: '15.4%', trend: -0.5, icon: TrendingUp, color: 'bg-teal-50 text-teal-700' },
    { label: 'Total Clientes', value: '1,248', trend: 4.1, icon: Users, color: 'bg-sky-50 text-sky-700' },
  ];

  useEffect(() => {
    console.log(`Transacciones filtradas: ${filteredTransactions.length}`);
  }, [filteredTransactions.length]);

  const handleExport = () => {
    console.log('Inicio de exportación de reporte');
    setIsExporting(true);
    console.log('Procesando exportación...');
    setTimeout(() => {
      console.log('Exportación completada');
      setIsExporting(false);
      setShowToast('Reporte exportado con éxito (Simulado)');
      setTimeout(() => setShowToast(null), 3000);
    }, 1500);
  };

  const renderContent = () => {
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
        {/* KPI Cards Grid */}
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

        {/* Main Visualizations */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div transition={{ delay: 0.4 }} className="xl:col-span-1">
            <ZoneSales />
          </motion.div>
          <motion.div transition={{ delay: 0.5 }} className="xl:col-span-2">
            <MonthlySalesChart data={MONTHLY_SALES} />
          </motion.div>
        </div>

        {/* Table & Side Component */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 pb-12">
          <motion.div transition={{ delay: 0.6 }} className="xl:col-span-1">
            <CategoryChart data={CATEGORY_DISTRIBUTION} />
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
      {/* Toast Notification */}
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
          {/* Dashboard Header & Filters */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-4 rounded-xl shadow-soft border border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
              {[
                { id: 'periodo', label: 'Periodo', options: ['Este Mes', 'Último Trimestre', 'Año 2023'] },
                { id: 'vendedor', label: 'Vendedor', options: ['Todos los Vendedores', 'Carlos Ruiz', 'Ana Martinez', 'Juan Delgado', 'Sonia Mora'] },
                { id: 'ciudad', label: 'Ciudad', options: ['Todas las Ciudades', 'Bogotá', 'Medellín', 'Cali'] },
                { id: 'categoria', label: 'Categoría', options: ['Todas las Categorías', 'Electricidad', 'Ferretería', 'Construcción'] },
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

      {/* Mobile Bottom Navigation */}
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

