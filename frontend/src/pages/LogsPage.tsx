import React, { useState } from 'react';
import LogForm from '../components/Logs/LogForm';
import LogList from '../components/Logs/LogList';
import { Log } from '../../../shared/src/types';
import { useLogs } from '../hooks/useLogs';

const LogsPage: React.FC = () => {
  const { logs, isLoading, createLog, updateLog, deleteLog } = useLogs();
  const [editingLog, setEditingLog] = useState<Log | null>(null);
  const [showForm, setShowForm] = useState(true);

  const handleEdit = (log: Log) => {
    setEditingLog(log);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (formData: any) => {
    if (editingLog) {
      const success = await updateLog(editingLog.id, formData);
      if (success) {
        setEditingLog(null);
      }
      return success;
    } else {
      return await createLog(formData);
    }
  };

  const handleCancel = () => {
    setEditingLog(null);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    setEditingLog(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Learning Logs</h1>
        <button
          onClick={toggleForm}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'Hide Form' : 'Add New Log'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <LogForm
            onSubmit={handleSubmit}
            initialData={editingLog || undefined}
            isLoading={isLoading}
            onCancel={editingLog ? handleCancel : undefined}
          />
        </div>
      )}

      <LogList
        logs={logs}
        onEdit={handleEdit}
        onDelete={deleteLog}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LogsPage;