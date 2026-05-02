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

import { MonthlyData, CategoryData } from '../services/types';

// --- Monthly Sales Chart ---
export function MonthlySalesChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-soft border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-lg text-primary">Evolución de Ventas Mensual</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-3 h-3 rounded-full bg-primary"></span> Ventas
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-3 h-3 rounded-full bg-orange-400"></span> Objetivo
          </div>
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="sales" fill="#000666" radius={[4, 4, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Category Distribution ---
export function CategoryChart({ data }: { data: CategoryData[] }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-soft border border-slate-100 flex flex-col items-center">
      <h3 className="font-bold text-lg text-primary mb-8 self-start">Distribución Categoría</h3>
      <div className="h-48 w-full relative mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-primary leading-none">100%</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Total</span>
        </div>
      </div>
      <div className="w-full space-y-3">
        {data.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
              <span className="text-slate-600 font-medium">{cat.name}</span>
            </div>
            <span className="font-bold text-primary">{cat.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
