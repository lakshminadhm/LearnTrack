import React, { useState } from 'react';
import GoalForm from '../components/Goals/GoalForm';
import GoalList from '../components/Goals/GoalList';
import { Goal } from '../../../shared/src/types';
import { useGoals } from '../hooks/useGoals';

const GoalsPage: React.FC = () => {
  const { goals, isLoading, createGoal, updateGoal, deleteGoal } = useGoals();
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showForm, setShowForm] = useState(true);

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (formData: any) => {
    if (editingGoal) {
      const success = await updateGoal(editingGoal.id, formData);
      if (success) {
        setEditingGoal(null);
      }
      return success;
    } else {
      return await createGoal(formData);
    }
  };

  const handleCancel = () => {
    setEditingGoal(null);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    setEditingGoal(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Learning Goals</h1>
        <button
          onClick={toggleForm}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'Hide Form' : 'Add New Goal'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <GoalForm
            onSubmit={handleSubmit}
            initialData={editingGoal || undefined}
            isLoading={isLoading}
            onCancel={editingGoal ? handleCancel : undefined}
          />
        </div>
      )}

      <GoalList
        goals={goals}
        onEdit={handleEdit}
        onDelete={deleteGoal}
        isLoading={isLoading}
      />
    </div>
  );
};

export default GoalsPage;