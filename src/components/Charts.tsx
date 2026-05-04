import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { cn } from '../lib/utils';
import { MonthlyData, CategoryData, PaymentData, ProductData } from '../services/types';

// --- Chart Container Wrapper ---
function ChartWrapper({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col h-[400px]", className)}>
      <h3 className="font-bold text-lg text-primary mb-6">{title}</h3>
      <div className="flex-1 min-h-0 w-full relative">
        {children}
      </div>
    </div>
  );
}

// --- Monthly Sales Chart ---
export function MonthlySalesChart({ data }: { data: MonthlyData[] }) {
  return (
    <ChartWrapper title="Evolución de Ventas Mensual" className="h-[400px]">
      <div className="absolute top-[-45px] right-0 flex gap-4">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Ventas
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span> Objetivo
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          barGap={2}
          barCategoryGap={15}
        >
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#000666" stopOpacity={1}/>
              <stop offset="95%" stopColor="#000666" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
            dy={10}
            interval="preserveStartEnd"
            minTickGap={30}
            angle={-25}
            textAnchor="end"
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              padding: '12px'
            }}
            formatter={(value: number) => [`$${value.toLocaleString('es-CO')}`, 'Monto']}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
          />
          <Bar name="Ventas Reales" dataKey="sales" fill="url(#colorSales)" radius={[4, 4, 0, 0]} barSize={16} />
          <Bar name="Objetivo (Meta)" dataKey="objective" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// --- Category Distribution ---
export function CategoryChart({ data }: { data: CategoryData[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartWrapper title="Distribución Categoría">
      <div className="flex flex-col h-full">
        <div className="h-44 w-full relative mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-CO')}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-primary leading-none">
              ${total > 999999 ? (total / 1000000).toFixed(1) + 'M' : total.toLocaleString('es-CO')}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-2">
          {data.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between text-[11px] group">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: cat.color }}></div>
                <span className="text-slate-600 font-bold capitalize group-hover:text-primary transition-colors">{cat.name}</span>
              </div>
              <span className="font-black text-primary">${cat.value.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartWrapper>
  );
}

// --- Payment Method Distribution ---
export function PaymentMethodChart({ data }: { data: PaymentData[] }) {
  const methodCount = data.length;

  return (
    <ChartWrapper title="Métodos de Pago">
      <div className="flex flex-col h-full">
        <div className="h-44 w-full relative mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `$${value.toLocaleString('es-CO')}`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-primary leading-none">{methodCount}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Opciones</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-[11px] group">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                <span className="text-slate-600 font-bold capitalize group-hover:text-primary transition-colors">{item.name}</span>
              </div>
              <span className="font-black text-primary">${item.value.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartWrapper>
  );
}

// --- Top Products Chart ---
export function TopProductsChart({ data }: { data: ProductData[] }) {
  const colors = ['#000666', '#0061a4', '#3b82f6', '#60a5fa', '#93c5fd'];

  return (
    <ChartWrapper title="Top 5 Productos Estrella">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={(props) => {
              const { x, y, payload } = props;
              return (
                <g transform={`translate(${x},${y})`}>
                  <text 
                    x={-10} 
                    y={0} 
                    dy={4} 
                    textAnchor="end" 
                    fill="#64748b" 
                    fontSize={10} 
                    fontWeight={700}
                    className="capitalize"
                  >
                    {payload.value}
                  </text>
                </g>
              );
            }}
            width={120}
          />
          <Tooltip 
            formatter={(value: number) => `$${value.toLocaleString('es-CO')}`}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
