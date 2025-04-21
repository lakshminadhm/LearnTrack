import React, { useState, useEffect } from 'react';
import { Concept } from '../../../../shared/src/types';
import ConceptItem from './ConceptItem';
import { PlusCircle } from 'lucide-react';

interface ConceptTreeProps {
  courseId: string;
  concepts?: Concept[];
  fetchConceptTree: (courseId: string) => Promise<Concept[]>;
  completeConcept: (conceptId: string) => Promise<boolean>;
  fetchConceptChildren: (conceptId: string) => Promise<Concept[]>;
  createConcept?: (data: {
    courseId: string;
    name: string;
    description?: string;
    parentId?: string;
    resourceLinks?: string[];
  }) => Promise<Concept | null>;
}

const ConceptTree: React.FC<ConceptTreeProps> = ({
  courseId,
  concepts: initialConcepts,
  fetchConceptTree,
  completeConcept,
  fetchConceptChildren,
  createConcept
}) => {
  const [concepts, setConcepts] = useState<Concept[]>(initialConcepts || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialConcepts);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConcept, setNewConcept] = useState({
    name: '',
    description: '',
    parentId: '',
    resourceLinks: ''
  });

  useEffect(() => {
    if (!initialConcepts) {
      loadConcepts();
    }
  }, [courseId, initialConcepts]);

  const loadConcepts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedConcepts = await fetchConceptTree(courseId);
      setConcepts(loadedConcepts);
    } catch (err) {
      setError('Failed to load course concepts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (conceptId: string) => {
    const success = await completeConcept(conceptId);
    if (success) {
      // Optional: You can refresh all concepts here if needed
      // await loadConcepts();
      return true;
    }
    return false;
  };

  const handleSubmitNewConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createConcept) return;

    try {
      const resourceLinks = newConcept.resourceLinks
        ? newConcept.resourceLinks.split(',').map(url => url.trim())
        : [];

      const result = await createConcept({
        courseId,
        name: newConcept.name,
        description: newConcept.description || undefined,
        parentId: newConcept.parentId || undefined,
        resourceLinks: resourceLinks.length > 0 ? resourceLinks : undefined
      });

      if (result) {
        setNewConcept({
          name: '',
          description: '',
          parentId: '',
          resourceLinks: ''
        });
        setShowAddForm(false);
        await loadConcepts(); // Refresh the concept tree
      }
    } catch (err) {
      console.error("Error creating concept:", err);
    }
  };

  if (isLoading) {
    return <div className="py-10 text-center">Loading concepts...</div>;
  }

  if (error) {
    return <div className="py-10 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">Course Concepts</h3>
        {createConcept && (
          <button
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <PlusCircle className="w-5 h-5 mr-1" />
            {showAddForm ? 'Cancel' : 'Add Concept'}
          </button>
        )}
      </div>

      {showAddForm && createConcept && (
        <div className="p-4 border-b bg-gray-50">
          <h4 className="text-md font-medium mb-2">Add New Concept</h4>
          <form onSubmit={handleSubmitNewConcept}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name*
              </label>
              <input
                type="text"
                value={newConcept.name}
                onChange={(e) => setNewConcept({ ...newConcept, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newConcept.description}
                onChange={(e) => setNewConcept({ ...newConcept, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Concept
              </label>
              <select
                value={newConcept.parentId}
                onChange={(e) => setNewConcept({ ...newConcept, parentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">None (Top Level)</option>
                {concepts.map(concept => (
                  <option key={concept.id} value={concept.id}>
                    {concept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Links (comma separated)
              </label>
              <input
                type="text"
                value={newConcept.resourceLinks}
                onChange={(e) => setNewConcept({ ...newConcept, resourceLinks: e.target.value })}
                placeholder="https://example.com, https://another-site.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                disabled={!newConcept.name}
              >
                Add Concept
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="concept-tree divide-y">
        {concepts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No concepts found for this course. Add concepts to get started.
          </div>
        ) : (
          concepts.map(concept => (
            <ConceptItem
              key={concept.id}
              concept={concept}
              onComplete={handleComplete}
              onLoadChildren={fetchConceptChildren}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConceptTree;