
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { User, Expense } from '../types';
import { YEARS, MONTHS } from '../constants';
import { storageService } from '../services/storageService';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import Analytics from './Analytics';
import { LogoutIcon, CalendarIcon, ChartBarIcon, DocumentTextIcon, PencilIcon, CheckIcon, XIcon } from './icons';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [view, setView] = useState<'tracker' | 'analytics'>('tracker');

  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(String(user.balance.toFixed(2)));

  const now = new Date();
  const [year, setYear] = useState(YEARS.includes(now.getFullYear()) ? now.getFullYear() : YEARS[0]);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());

  useEffect(() => {
    if (!isEditingBalance) {
        setBalanceInput(String(currentUser.balance.toFixed(2)));
    }
  }, [currentUser.balance, isEditingBalance]);

  const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);

  const handleDateChange = <T extends number,>(setter: React.Dispatch<React.SetStateAction<T>>, value: string) => {
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue)) {
      setter(numericValue as T);
      if (setter === setMonth || setter === setYear) {
        const newDaysInMonth = new Date(setter === setYear ? numericValue : year, setter === setMonth ? numericValue : month, 0).getDate();
        if (day > newDaysInMonth) {
          setDay(newDaysInMonth);
        }
      }
    }
  };

  const selectedDate = useMemo(() => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, [year, month, day]);

  const expensesForSelectedDay = useMemo(() => {
    return currentUser.expenses
      .filter(e => e.date === selectedDate)
      .sort((a, b) => a.hour - b.hour);
  }, [currentUser.expenses, selectedDate]);
  
  const totalForDay = useMemo(() => 
    expensesForSelectedDay.reduce((sum, exp) => sum + exp.amount, 0),
  [expensesForSelectedDay]);

  const updateUser = useCallback((updatedUserData: Partial<User>) => {
    const updatedUser = { ...currentUser, ...updatedUserData };
    setCurrentUser(updatedUser);
    storageService.saveUser(updatedUser);
  }, [currentUser]);

  const handleSaveExpense = useCallback((expense: Omit<Expense, 'id'> & { id?: string; amount: number; }) => {
    let updatedExpenses;
    let newBalance = currentUser.balance;

    if (expense.id) { // Editing existing expense
      const originalExpense = currentUser.expenses.find(e => e.id === expense.id);
      if (originalExpense) {
          const amountDifference = expense.amount - originalExpense.amount;
          newBalance -= amountDifference;
      }
      updatedExpenses = currentUser.expenses.map(e => e.id === expense.id ? { ...e, ...expense } as Expense : e);
    } else { // Adding new expense
      const newExpense: Expense = { ...expense, id: new Date().toISOString() };
      newBalance -= newExpense.amount;
      updatedExpenses = [...currentUser.expenses, newExpense];
    }
    
    updateUser({ expenses: updatedExpenses, balance: newBalance });
    setEditingExpense(null);
  }, [currentUser, updateUser]);

  const handleDeleteExpense = useCallback((expenseId: string) => {
    const expenseToDelete = currentUser.expenses.find(e => e.id === expenseId);
    if (!expenseToDelete) return;

    const updatedExpenses = currentUser.expenses.filter(e => e.id !== expenseId);
    const newBalance = currentUser.balance + expenseToDelete.amount;
    
    updateUser({ expenses: updatedExpenses, balance: newBalance });
  }, [currentUser, updateUser]);

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setView('tracker');
  };

  const handleSaveBalance = () => {
    const newBalance = parseFloat(balanceInput);
    if (!isNaN(newBalance)) {
        updateUser({ balance: newBalance });
        setIsEditingBalance(false);
    }
  };

  const handleCancelEditBalance = () => {
    setBalanceInput(String(currentUser.balance.toFixed(2)));
    setIsEditingBalance(false);
  };

  const viewButtonClasses = (buttonView: 'tracker' | 'analytics') => 
    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${
      view === buttonView
        ? 'bg-indigo-600 text-white'
        : 'text-slate-300 hover:bg-slate-700/50'
    }`;


  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b border-slate-700">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Welcome, {currentUser.username}</h1>
          <p className="text-slate-400">Your hourly expense dashboard.</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg flex items-center gap-4">
            <div>
                <h2 className="text-sm font-medium text-slate-400">Total Balance</h2>
                {!isEditingBalance ? (
                    <p className="text-2xl font-bold text-green-400">₹{currentUser.balance.toFixed(2)}</p>
                ) : (
                    <input type="number" value={balanceInput} onChange={e => setBalanceInput(e.target.value)} className="w-32 bg-slate-700 border border-slate-600 rounded-md shadow-sm py-1 px-2 text-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                )}
            </div>
            {!isEditingBalance ? (
                <button onClick={() => setIsEditingBalance(true)} className="p-2 text-slate-400 hover:text-yellow-400 rounded-full hover:bg-slate-600 transition-colors"><PencilIcon /></button>
            ) : (
                <div className="flex items-center gap-2">
                    <button onClick={handleSaveBalance} className="p-2 text-green-400 hover:text-green-300 rounded-full hover:bg-slate-600 transition-colors"><CheckIcon /></button>
                    <button onClick={handleCancelEditBalance} className="p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-slate-600 transition-colors"><XIcon /></button>
                </div>
            )}
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-900 transition-colors">
          <LogoutIcon /> Logout
        </button>
      </header>
      
      <div className="mb-6">
        <div className="inline-flex items-center bg-slate-800 p-1 rounded-lg space-x-1">
            <button onClick={() => setView('tracker')} className={viewButtonClasses('tracker')}>
                <DocumentTextIcon /> Tracker
            </button>
            <button onClick={() => setView('analytics')} className={viewButtonClasses('analytics')}>
                <ChartBarIcon /> Analytics
            </button>
        </div>
      </div>

      {view === 'tracker' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><CalendarIcon /> Select Date</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-slate-400">Year</label>
                  <select id="year" value={year} onChange={(e) => handleDateChange(setYear, e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="month" className="block text-sm font-medium text-slate-400">Month</label>
                  <select id="month" value={month} onChange={(e) => handleDateChange(setMonth, e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="day" className="block text-sm font-medium text-slate-400">Day</label>
                  <select id="day" value={day} onChange={(e) => handleDateChange(setDay, e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <ExpenseForm
              selectedDate={selectedDate}
              onSave={handleSaveExpense}
              editingExpense={editingExpense}
              clearEditing={() => setEditingExpense(null)}
            />
          </div>

          <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-baseline mb-4">
              <h2 className="text-xl font-semibold">Expenses for {selectedDate}</h2>
              <p className="text-lg font-bold text-indigo-400">Total: ₹{totalForDay.toFixed(2)}</p>
            </div>
            <ExpenseList
              expenses={expensesForSelectedDay}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
            />
          </div>
        </div>
      ) : (
        <Analytics expenses={currentUser.expenses} />
      )}
    </div>
  );
};

export default Dashboard;
