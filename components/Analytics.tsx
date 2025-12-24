
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import type { Expense } from '../types';
import { YEARS, MONTHS } from '../constants';

interface AnalyticsProps {
  expenses: Expense[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const Analytics: React.FC<AnalyticsProps> = ({ expenses }) => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(YEARS.includes(now.getFullYear()) ? now.getFullYear() : YEARS[0]);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const yearlyData = useMemo(() => {
    const data = MONTHS.map(month => ({
      name: month.name.substring(0, 3),
      total: 0,
    }));

    expenses
      .filter(e => new Date(e.date).getFullYear() === selectedYear)
      .forEach(e => {
        const monthIndex = new Date(e.date).getMonth();
        data[monthIndex].total += e.amount;
      });
    
    return data;
  }, [expenses, selectedYear]);

  const monthlyData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const data = Array.from({ length: daysInMonth }, (_, i) => ({
      name: `Day ${i + 1}`,
      total: 0,
    }));

    expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getFullYear() === selectedYear && expenseDate.getMonth() + 1 === selectedMonth;
      })
      .forEach(e => {
        const dayIndex = new Date(e.date).getDate() - 1;
        data[dayIndex].total += e.amount;
      });
      
    return data;
  }, [expenses, selectedYear, selectedMonth]);

  const categoryData = useMemo(() => {
      const monthlyExpenses = expenses.filter(e => {
          const expenseDate = new Date(e.date);
          return expenseDate.getFullYear() === selectedYear && expenseDate.getMonth() + 1 === selectedMonth;
      });

      const categoryMap = new Map<string, number>();
      monthlyExpenses.forEach(e => {
          const category = e.description.trim().toLowerCase();
          categoryMap.set(category, (categoryMap.get(category) || 0) + e.amount);
      });

      const sortedCategories = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      if (sortedCategories.length <= 5) return sortedCategories;

      const top5 = sortedCategories.slice(0, 5);
      const otherValue = sortedCategories.slice(5).reduce((acc, curr) => acc + curr.value, 0);
      return [...top5, { name: 'Other', value: otherValue }];
  }, [expenses, selectedYear, selectedMonth]);


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-slate-700 border border-slate-600 rounded shadow-lg">
          <p className="label text-slate-300">{`${label}`}</p>
          <p className="intro text-indigo-400">{`Total : ₹${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="analytics-year" className="block text-sm font-medium text-slate-400">Year</label>
            <select id="analytics-year" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))} className="mt-1 block w-full pl-3 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="analytics-month" className="block text-sm font-medium text-slate-400">Month</label>
            <select id="analytics-month" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))} className="mt-1 block w-full pl-3 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">Yearly Summary ({selectedYear})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.3)' }} />
              <Bar dataKey="total" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">Top Monthly Expenses ({MONTHS.find(m => m.value === selectedMonth)?.name})</h3>
           {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-slate-300">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
           ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">No data for this month.</div>
           )}
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-white">Daily Breakdown for {MONTHS.find(m => m.value === selectedMonth)?.name}, {selectedYear}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} interval={4} />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.3)' }} />
            <Bar dataKey="total" fill="#a78bfa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
