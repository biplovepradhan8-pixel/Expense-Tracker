
import React from 'react';
import type { Expense } from '../types';
import { PencilIcon, TrashIcon, ClockIcon } from './icons';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No expenses logged for this day.</p>
        <p className="text-slate-500 text-sm">Use the form to add your first expense!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[calc(100vh-25rem)] overflow-y-auto pr-2">
      {expenses.map(expense => (
        <div key={expense.id} className="bg-slate-700/50 p-4 rounded-lg flex items-start justify-between gap-4 transition-all hover:bg-slate-700">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg text-white">{expense.description}</p>
              <p className="font-bold text-lg text-indigo-300">₹{expense.amount.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                <ClockIcon />
                <span>{String(expense.hour).padStart(2, '0')}:00</span>
            </div>
            {expense.notes && <p className="text-slate-300 mt-2 text-sm whitespace-pre-wrap">{expense.notes}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => onEdit(expense)} className="p-2 text-slate-400 hover:text-yellow-400 rounded-full hover:bg-slate-600 transition-colors">
              <PencilIcon />
            </button>
            <button onClick={() => onDelete(expense.id)} className="p-2 text-slate-400 hover:text-red-400 rounded-full hover:bg-slate-600 transition-colors">
              <TrashIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
