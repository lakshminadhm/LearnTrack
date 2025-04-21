import React from 'react';
import { Concept } from '../../../../shared/src/types';
import ConceptTree from './ConceptTree';
import { useCourses } from '../../hooks/useCourses';
import { ExternalLink, CheckCircle, Circle } from 'lucide-react';

interface ConceptListProps {
  concepts: Concept[];
  onToggleComplete: (conceptId: string) => Promise<void>;
  isLoading: boolean;
  courseId?: string;
}

const ConceptList: React.FC<ConceptListProps> = ({
  concepts,
  onToggleComplete,
  isLoading,
  courseId
}) => {
  const { 
    fetchConceptTree, 
    fetchConceptChildren, 
    completeConcept, 
    createConcept 
  } = useCourses();

  // If courseId is provided, use the hierarchical concept tree view
  if (courseId) {
    return (
      <ConceptTree
        courseId={courseId}
        concepts={concepts}
        fetchConceptTree={fetchConceptTree}
        fetchConceptChildren={fetchConceptChildren}
        completeConcept={async (id) => {
          await onToggleComplete(id);
          return true;
        }}
        createConcept={createConcept}
      />
    );
  }

  // Fallback to the original flat list view
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 p-4 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!concepts.length) {
    return (
      <div className="text-center py-8 bg-gray-100 rounded-lg">
        <p className="text-gray-600">No concepts available for this course yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 px-4 py-3 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
        <p className="text-sm">
          This view is deprecated. Please use the hierarchical concept tree view by providing a courseId prop.
        </p>
      </div>
      {concepts.map((concept) => (
        <div
          key={concept.id}
          className={`bg-white p-4 rounded-lg shadow-sm border ${
            concept.is_completed ? 'border-green-200' : 'border-gray-200'
          } hover:shadow-md transition-shadow duration-300`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{concept.name || concept.title}</h4>
                {(concept.resource_links && concept.resource_links.length > 0) ? (
                  <a
                    href={concept.resource_links[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : concept.resource_link && (
                  <a
                    href={concept.resource_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              {concept.description && (
                <p className="text-gray-600 text-sm mt-1">{concept.description}</p>
              )}
            </div>
            <button
              onClick={() => onToggleComplete(concept.id)}
              className={`ml-4 p-1 rounded-full transition-colors ${
                concept.is_completed
                  ? 'text-green-600 hover:text-green-700'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              {concept.is_completed ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConceptList;