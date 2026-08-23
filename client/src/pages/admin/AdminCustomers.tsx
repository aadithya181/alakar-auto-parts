import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res: any = await api.get('/admin/customers');
        if (res.success) {
          setCustomers(res.customers || []);
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
          Customer Database & Spends
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered customer accounts, saved garage vehicles, lifetime spends, and orders count.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">{c.name}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">ID: {c.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-900 font-medium">{c.email}</p>
                    <p className="text-[11px] text-slate-400">{c.phone || 'Phone verified'}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900">{c.total_orders || 0} orders</span>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-emerald-700 text-sm">
                      ₹{Number(c.total_spent || 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
