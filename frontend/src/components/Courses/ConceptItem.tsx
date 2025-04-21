import React, { useState } from 'react';
import { Concept } from '../../../../shared/src/types';
import { ChevronDown, ChevronRight, ExternalLink, CheckCircle, Circle } from 'lucide-react';

interface ConceptItemProps {
  concept: Concept;
  onComplete: (conceptId: string) => Promise<boolean>;
  onLoadChildren?: (conceptId: string) => Promise<Concept[]>;
  depth?: number;
  expanded?: boolean;
}

const ConceptItem: React.FC<ConceptItemProps> = ({ 
  concept, 
  onComplete, 
  onLoadChildren,
  depth = 0, 
  expanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [childConcepts, setChildConcepts] = useState<Concept[]>(concept.children || []);
  const [isLoading, setIsLoading] = useState(false);
  
  const hasChildren = childConcepts.length > 0 || concept.children?.length > 0;
  const isCompleted = concept.progress?.is_completed || concept.is_completed;
  
  const handleToggleExpand = async () => {
    if (!isExpanded && childConcepts.length === 0 && onLoadChildren) {
      setIsLoading(true);
      try {
        const children = await onLoadChildren(concept.id);
        setChildConcepts(children);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };
  
  const handleMarkComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await onComplete(concept.id);
    if (success) {
      // Update local state to show completion immediately
      concept.is_completed = true;
      if (concept.progress) {
        concept.progress.is_completed = true;
      }
    }
  };
  
  const paddingLeft = `${depth * 1.5}rem`;
  
  return (
    <div>
      <div 
        className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b transition-colors ${
          isCompleted ? 'bg-green-50' : ''
        }`}
        style={{ paddingLeft }}
        onClick={handleToggleExpand}
      >
        <div className="mr-2">
          {hasChildren ? (
            isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent" />
            ) : (
              isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />
            )
          ) : (
            <div className="w-4" />
          )}
        </div>
        
        <div className="flex-1">
          <span className="font-medium">{concept.name}</span>
          {concept.description && (
            <p className="text-sm text-gray-500 mt-1">{concept.description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {concept.resource_links && concept.resource_links.length > 0 && (
            <a 
              href={concept.resource_links[0]} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-indigo-600 hover:text-indigo-800"
              title="Open resource"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          
          <button 
            onClick={handleMarkComplete}
            className={`focus:outline-none ${isCompleted ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
            title={isCompleted ? "Completed" : "Mark as completed"}
          >
            {isCompleted ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {isExpanded && childConcepts.length > 0 && (
        <div className="concept-children">
          {childConcepts.map(child => (
            <ConceptItem
              key={child.id}
              concept={child}
              onComplete={onComplete}
              onLoadChildren={onLoadChildren}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConceptItem;