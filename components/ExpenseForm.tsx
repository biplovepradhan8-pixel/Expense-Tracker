
import React, { useState, useEffect } from 'react';
import type { Expense } from '../types';
import { PlusCircleIcon, PencilAltIcon } from './icons';

interface ExpenseFormProps {
  selectedDate: string;
  onSave: (expense: Omit<Expense, 'id'> & { id?: string }) => void;
  editingExpense: Expense | null;
  clearEditing: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ selectedDate, onSave, editingExpense, clearEditing }) => {
  const [hour, setHour] = useState(new Date().getHours());
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setHour(editingExpense.hour);
      setAmount(String(editingExpense.amount));
      setDescription(editingExpense.description);
      setNotes(editingExpense.notes);
    } else {
      resetForm();
    }
  }, [editingExpense]);

  const resetForm = () => {
    setHour(new Date().getHours());
    setAmount('');
    setDescription('');
    setNotes('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please provide a valid description and a positive amount.');
      return;
    }
    setError('');

    onSave({
      id: editingExpense?.id,
      date: selectedDate,
      hour,
      amount: parsedAmount,
      description,
      notes,
    });
    
    if (!editingExpense) {
      resetForm();
    } else {
      clearEditing();
    }
  };
  
  const handleCancelEdit = () => {
      clearEditing();
      resetForm();
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        {editingExpense ? <><PencilAltIcon /> Edit Expense</> : <><PlusCircleIcon /> Add Expense</>}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-400 text-sm bg-red-900/50 p-2 rounded">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hour" className="block text-sm font-medium text-slate-400">Hour (0-23)</label>
              <input type="number" id="hour" value={hour} onChange={(e) => setHour(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-400">Amount (₹)</label>
              <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-400">Description</label>
          <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Coffee, Lunch" className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-400">Notes</label>
          <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional details..." className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
        </div>
        <div className="flex items-center gap-4">
            <button type="submit" className="flex-1 justify-center w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-800 transition-colors">
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </button>
            {editingExpense && (
              <button type="button" onClick={handleCancelEdit} className="flex-1 justify-center w-full px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-800 transition-colors">
                Cancel
              </button>
            )}
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
