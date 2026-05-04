import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Package, 
  Users, 
  HelpCircle, 
  LogOut, 
  Search, 
  Bell, 
  Settings,
  Download,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ZoneData } from '../services/types';

// --- Sidebar ---
export function Sidebar({ 
  className, 
  isOpen, 
  setMobileOpen,
  activeTab,
  onTabChange
}: { 
  className?: string; 
  isOpen?: boolean; 
  setMobileOpen?: (v: boolean) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: TrendingUp, label: 'Ventas' },
    { icon: BarChart3, label: 'Reportes' },
    { icon: Package, label: 'Inventario' },
    { icon: Users, label: 'Clientes' },
  ];

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      window.location.reload();
    }
  };

  return (
    <aside className={cn(
      "flex flex-col h-screen fixed left-0 top-0 z-50 w-[240px] bg-white border-r border-slate-200 transition-transform duration-300",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      className
    )}>
      <div className="px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <BarChart3 className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-primary leading-tight">Corporativo</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Análisis Global</p>
          </div>
        </div>
        <button className="lg:hidden" onClick={() => setMobileOpen?.(false)}>
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              onTabChange(item.label);
              setMobileOpen?.(false);
            }}
            className={cn(
              "w-full flex items-center px-4 py-3 rounded-lg transition-all text-sm font-medium",
              activeTab === item.label 
                ? "text-primary bg-slate-50 border-r-4 border-primary font-bold shadow-sm" 
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <item.icon className={cn("mr-3 w-5 h-5", activeTab === item.label ? "text-primary" : "text-slate-400")} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-1">
        <button onClick={() => alert('Centro de Ayuda pronto disponible.')} className="w-full flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-all text-sm">
          <HelpCircle className="mr-3 w-5 h-5 text-slate-400" />
          Ayuda
        </button>
        <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-all text-sm">
          <LogOut className="mr-3 w-5 h-5 text-red-400" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

// --- Header ---
export function Header({ 
  onMenuClick, 
  onSearch 
}: { 
  onMenuClick: () => void; 
  onSearch: (q: string) => void;
}) {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  const notifications = [
    { id: 1, title: 'Venta completada', desc: 'Factura #INV-8902 procesada', time: 'hace 5 min', type: 'success' },
    { id: 2, title: 'Bajo stock', desc: 'Kit de herramientas pro nivel crítico', time: 'hace 1h', type: 'warning' },
    { id: 3, title: 'Nuevo cliente', desc: 'Juan Pérez se ha registrado', time: 'hace 3h', type: 'info' },
  ];

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center w-full px-6 h-16 bg-white border-b border-slate-200 shadow-sm backdrop-blur-md bg-white/80">
      <div className="flex items-center flex-1 gap-4">
        <button className="lg:hidden p-2 -ml-2" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-slate-500" />
        </button>
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar transacciones, vendedores o productos..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative",
              showNotifications && "bg-slate-100 text-primary"
            )}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-medium border border-slate-100 z-20 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <span className="font-bold text-sm text-primary">Notificaciones</span>
                    <button className="text-[10px] text-blue-600 font-bold hover:underline">Marcar leídas</button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto scrollbar-hide">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer last:border-0">
                        <div className="flex gap-3">
                          <div className={cn(
                            "w-2 h-2 mt-1.5 rounded-full shrink-0",
                            n.type === 'success' ? 'bg-teal-500' : n.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                          )} />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                            <p className="text-[11px] text-slate-500 mb-1">{n.desc}</p>
                            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">{n.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-3 text-xs font-bold text-slate-500 hover:text-primary transition-colors hover:bg-slate-50 border-t border-slate-50">
                    Ver todas las notificaciones
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Settings Button */}
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>

        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none text-primary">Admin User</p>
            <p className="text-[10px] text-slate-500 font-medium capitalize">Director Comercial</p>
          </div>
          <div className="w-9 h-9 rounded-full border border-slate-200 overflow-hidden group-hover:border-primary transition-all group-hover:scale-105 shadow-sm">
             <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop" 
              alt="User" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Settings Sidebar Modal */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
              onClick={() => setShowSettings(false)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-screen w-80 bg-white z-[60] shadow-2xl p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-primary">Configuración</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-8 flex-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Apariencia</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 rounded-xl border-2 border-primary bg-slate-50 flex flex-col items-center gap-2">
                       <div className="w-full h-12 bg-white border border-slate-200 rounded-md" />
                       <span className="text-xs font-bold text-primary">Claro</span>
                    </button>
                    <button onClick={() => alert('Modo oscuro disponible próximamente')} className="p-4 rounded-xl border-2 border-slate-100 hover:border-slate-200 bg-slate-900 flex flex-col items-center gap-2">
                       <div className="w-full h-12 bg-slate-800 border border-slate-700 rounded-md" />
                       <span className="text-xs font-bold text-slate-400">Oscuro</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cuenta</label>
                  <button className="w-full flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">Perfil de Usuario</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">Notificaciones</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button 
                  onClick={() => {
                    alert('Preferencias guardadas');
                    setShowSettings(false);
                  }}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

// --- KPI Card ---
export function KPICard({ label, value, trend, icon: Icon, colorClass }: { label: string; value: string; trend: number; icon: any; colorClass?: string }) {
  const isPositive = trend > 0;
  return (
    <div className="bg-white p-5 rounded-xl shadow-soft border border-slate-100 hover:shadow-medium transition-shadow cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-lg", colorClass || "bg-blue-50 text-primary")}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={cn(
          "flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-full",
          isPositive ? "text-teal-600 bg-teal-50" : "text-red-500 bg-red-50"
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
          {Math.abs(trend)}%
        </span>
      </div>
      <p className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">{label}</p>
      <h2 className="text-2xl font-bold text-primary">{value}</h2>
    </div>
  );
}

// --- Zone Sales Component ---
export function ZoneSales({ data }: { data: ZoneData[] }) {
  const totalSales = data.reduce((sum, zone) => sum + zone.totalSales, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-soft border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-lg text-primary">Ventas por Zona</h3>
        <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
      </div>
      <div className="space-y-6">
        {data.length > 0 ? data.map((zone) => (
          <div key={zone.zone}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-600">{zone.zone}</span>
              <span className="font-bold text-primary">${zone.totalSales.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full bg-primary")}
                style={{ width: `${zone.percentage}%` }}
              />
            </div>
          </div>
        )) : (
          <div className="text-slate-500 text-sm">No hay datos de zona disponibles.</div>
        )}
      </div>
      {totalSales > 0 && (
        <div className="mt-6 text-xs text-slate-500">Total por zona: ${totalSales.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</div>
      )}
    </div>
  );
}
