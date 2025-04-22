import React, { useState } from 'react';
import { Concept } from '../../../../shared/src/types';
import { ChevronDown, ChevronRight, ExternalLink, CheckCircle, Circle, Loader2, BookOpen, Link2 } from 'lucide-react';

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
  const [isCompleting, setIsCompleting] = useState(false);
  const [showResources, setShowResources] = useState(false);
  
  const hasChildren = childConcepts.length > 0 || concept.children?.length > 0;
  const isCompleted = concept.progress?.is_completed || concept.is_completed;
  const hasResources = concept.resource_links && concept.resource_links.length > 0;
  
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
    if (isCompleting) return;
    
    setIsCompleting(true);
    try {
      const success = await onComplete(concept.id);
      if (success) {
        // Update local state to show completion immediately
        concept.is_completed = true;
        if (concept.progress) {
          concept.progress.is_completed = true;
        }
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const toggleResources = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowResources(!showResources);
  };
  
  const paddingLeft = `${depth * 1.5}rem`;
  
  return (
    <div className={`concept-item ${isCompleted ? 'completed' : ''}`}>
      <div 
        className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
          isCompleted ? 'bg-green-50 hover:bg-green-100' : ''
        }`}
        style={{ paddingLeft }}
      >
        <div 
          className="flex items-center mr-2 group"
          onClick={handleToggleExpand}
        >
          {hasChildren ? (
            isLoading ? (
              <div className="p-1">
                <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
              </div>
            ) : (
              <div className="p-1 rounded-full group-hover:bg-indigo-100">
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4 text-indigo-600" /> : 
                  <ChevronRight className="h-4 w-4 text-indigo-600" />
                }
              </div>
            )
          ) : (
            <div className="w-6" />
          )}
        </div>
        
        <div 
          className="flex-1 py-1"
          onClick={handleToggleExpand}
        >
          <div className="flex items-center">
            <span className={`font-medium transition-colors ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
              {concept.name}
            </span>
            
            {hasResources && (
              <button
                onClick={toggleResources}
                className="ml-2 p-1 rounded-full hover:bg-indigo-100 text-indigo-500 transition-colors focus:outline-none"
                title={`${showResources ? 'Hide' : 'Show'} resources`}
              >
                <BookOpen className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          
          {concept.description && (
            <p className="text-sm text-gray-500 mt-1">{concept.description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleMarkComplete}
            className={`p-1.5 rounded-full focus:outline-none transition-all duration-200 ${
              isCompleted 
                ? 'text-green-600 hover:bg-green-100' 
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            }`}
            title={isCompleted ? "Completed" : "Mark as completed"}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : isCompleted ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {showResources && hasResources && (
        <div 
          className="pl-10 pr-4 pb-2 pt-0 bg-indigo-50 border-l-2 border-indigo-300 ml-6"
          style={{ marginLeft: `${depth * 1.5 + 1.5}rem` }}
        >
          <div className="text-xs font-medium text-indigo-700 uppercase tracking-wide py-1">
            Learning Resources
          </div>
          <ul className="space-y-1">
            {concept.resource_links.map((link, index) => (
              <li key={index} className="flex items-center">
                <Link2 className="h-3 w-3 text-indigo-400 mr-2" />
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {link.length > 50 ? `${link.substring(0, 50)}...` : link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
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