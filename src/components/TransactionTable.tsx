import React from 'react';
import { Filter, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Transaction } from '../services/types';

const transactions: Transaction[] = [
  { id: '1', invoice: '#INV-8902', date: '24 Oct 2023', salesperson: 'Carlos Ruiz', product: 'Kit Herramientas Pro', quantity: 12, total: 1450, initials: 'CR' },
  { id: '2', invoice: '#INV-8903', date: '24 Oct 2023', salesperson: 'Ana Martinez', product: 'Cable Cobre 100m', quantity: 5, total: 890, initials: 'AM' },
  { id: '3', invoice: '#INV-8904', date: '23 Oct 2023', salesperson: 'Juan Delgado', product: 'Taladro Percutor 20V', quantity: 2, total: 540, initials: 'JD' },
  { id: '4', invoice: '#INV-8905', date: '23 Oct 2023', salesperson: 'Sonia Mora', product: 'Pintura Vinilo Galón', quantity: 20, total: 1120, initials: 'SM' },
];

export function TransactionsTable({ data }: { data: Transaction[] }) {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-100 overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-slate-50">
        <h3 className="font-bold text-lg text-primary">Últimas Transacciones</h3>
        <div className="flex gap-2">
          <button onClick={() => alert('Filtros avanzados pronto disponibles!')} className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Factura</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendedor</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Cantidad</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">V. Total</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length > 0 ? data.map((t, idx) => (
              <tr key={t.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-slate-50/80 transition-colors group`}>
                <td className="px-6 py-4 font-bold text-primary text-sm">{t.invoice}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">{t.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-600">
                      {t.initials}
                    </div>
                    <span className="text-slate-700 text-sm font-medium">{t.salesperson}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700 text-sm font-medium">{t.product}</td>
                <td className="px-6 py-4 text-center text-slate-700 text-sm">{t.quantity}</td>
                <td className="px-6 py-4 text-right font-bold text-primary text-sm">${t.total.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => alert(`Detalles de la factura ${t.invoice}`)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-primary transition-all rounded-md"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">No se encontraron resultados para los filtros aplicados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Mostrando 4 de 128 registros</span>
        <div className="flex gap-1.5">
          <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-400">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="px-3.5 py-1.5 bg-primary text-white rounded-lg text-xs font-bold shadow-sm">1</button>
          <button className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">2</button>
          <button className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">3</button>
          <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-400">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
