import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Concept } from '../../../../shared/src/types';
import { ChevronDown, ChevronRight, ExternalLink, CheckCircle, Circle, Loader2, BookOpen, Link2, X } from 'lucide-react';

interface ConceptItemProps {
  concept: Concept;
  onComplete: (conceptId: string) => Promise<boolean>;
  onLoadChildren?: (conceptId: string) => Promise<Concept[]>;
  depth?: number;
  expanded?: boolean;
  onChildComplete?: (childId: string) => void;
  conceptIndex?: string; // New prop for hierarchical numbering
}

const ConceptItem: React.FC<ConceptItemProps> = ({ 
  concept, 
  onComplete, 
  onLoadChildren,
  depth = 0, 
  expanded = false,
  onChildComplete,
  conceptIndex
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [childConcepts, setChildConcepts] = useState<Concept[]>(concept.children || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showResourcesPopup, setShowResourcesPopup] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [localIsCompleted, setLocalIsCompleted] = useState(concept.progress?.is_completed || concept.is_completed || false);
  const popupRef = useRef<HTMLDivElement>(null);
  
  const hasChildren = childConcepts.length > 0 || (concept.children?.length ?? 0) > 0;
  const isCompleted = localIsCompleted;
  const hasResources = concept.resource_links && concept.resource_links.length > 0;
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if click is outside the popup AND not on the toggle button
      const toggleButton = document.querySelector(`[data-concept-id="${concept.id}"]`);
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        toggleButton && 
        !toggleButton.contains(event.target as Node)
      ) {
        setShowResourcesPopup(false);
      }
    };

    if (showResourcesPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResourcesPopup, concept.id]);
  
  const handleChildComplete = useCallback((childId: string) => {
    setChildConcepts(prevChildren => 
      prevChildren.map(child => 
        child.id === childId 
          ? { ...child, is_completed: true, progress: child.progress ? { ...child.progress, is_completed: true } : undefined }
          : child
      )
    );
    
    if (onChildComplete) {
      onChildComplete(childId);
    }
  }, [onChildComplete]);
  
  useEffect(() => {
    if (hasChildren && childConcepts.length > 0) {
      const countCompletedConcepts = (concepts: Concept[]): { completed: number, total: number } => {
        let completed = 0;
        let total = concepts.length;
        
        for (const child of concepts) {
          if (child.progress?.is_completed || child.is_completed) {
            completed++;
          }
          
          if (child.children && child.children.length > 0) {
            const childCounts = countCompletedConcepts(child.children);
            completed += childCounts.completed;
            total += childCounts.total;
          }
        }
        
        return { completed, total };
      };
      
      const counts = countCompletedConcepts(childConcepts);
      const percentage = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;
      setProgressPercentage(percentage);
      
      if (percentage === 100 && !isCompleted && !isCompleting) {
        handleAutoComplete();
      }
    } else {
      setProgressPercentage(isCompleted ? 100 : 0);
    }
  }, [childConcepts, hasChildren, isCompleted, isCompleting]);
  
  const handleAutoComplete = async () => {
    if (isCompleted || isCompleting) return;
    
    setIsCompleting(true);
    try {
      const success = await onComplete(concept.id);
      if (success) {
        setLocalIsCompleted(true);
        console.log(`Auto-completed parent concept: ${concept.title}`);
        
        if (onChildComplete) {
          onChildComplete(concept.id);
        }
      }
    } catch (error) {
      console.error("Error auto-completing parent concept:", error);
    } finally {
      setIsCompleting(false);
    }
  };
  
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
    if (isCompleting || isCompleted) return;
    
    setIsCompleting(true);
    try {
      const success = await onComplete(concept.id);
      if (success) {
        setLocalIsCompleted(true);
        
        if (onChildComplete) {
          onChildComplete(concept.id);
        }
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const toggleResourcesPopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowResourcesPopup(!showResourcesPopup);
  };
  
  const paddingLeft = `${depth * 1.5}rem`;
  
  return (
    <div className={`concept-item ${isCompleted ? 'completed' : ''} animate-fade-in`}> 
      <div 
        className={`flex items-center p-4 hover:bg-indigo-50 dark:hover:bg-gray-800/70 cursor-pointer transition-colors duration-200 relative rounded-xl border border-transparent ${isCompleted ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700' : 'bg-white/90 dark:bg-gray-900/90'} shadow group focus-within:ring-2 focus-within:ring-indigo-400`}
        style={{ paddingLeft }}
        tabIndex={0}
        aria-label={`Concept: ${concept.title}`}
      >
        <div 
          className="flex items-center mr-2 group"
          onClick={handleToggleExpand}
          tabIndex={0}
          role="button"
          aria-label={isExpanded ? 'Collapse concept' : 'Expand concept'}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleToggleExpand(); }}
          data-tooltip-id="expand-tooltip"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {hasChildren ? (
            isLoading ? (
              <div className="p-1">
                <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
              </div>
            ) : (
              <div className="p-1 rounded-full group-hover:bg-indigo-100 dark:group-hover:bg-gray-800/70">
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4 text-indigo-600 dark:text-indigo-300" /> : 
                  <ChevronRight className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                }
              </div>
            )
          ) : (
            <div className="w-6" />
          )}
        </div>
        <div className="flex-1 py-1" onClick={handleToggleExpand}>
          <div className="flex items-center">
            {conceptIndex && (
              <span className="text-base font-mono bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded mr-2 font-semibold">
                {conceptIndex}
              </span>
            )}
            <span className={`font-medium transition-colors text-base ${isCompleted ? 'text-green-800 dark:text-green-300' : 'text-gray-800 dark:text-gray-100'}`}>{concept.title}</span>
            {hasChildren && (
              <div className="ml-3 flex items-center">
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{progressPercentage}%</span>
              </div>
            )}
          </div>
          {concept.description && (
            <p className="text-base text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed">{concept.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasResources && (
            <button
              onClick={toggleResourcesPopup}
              className="px-2 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-gray-800/70 text-indigo-600 dark:text-indigo-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 flex items-center space-x-1 text-sm font-medium border border-indigo-200 dark:border-indigo-700"
              title={`${showResourcesPopup ? 'Hide' : 'Show'} resources`}
              data-concept-id={concept.id}
              aria-label={showResourcesPopup ? 'Hide resources' : 'Show resources'}
              data-tooltip-id="resources-tooltip"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{showResourcesPopup ? 'Hide' : 'Show'} Resources</span>
            </button>
          )}
          <button 
            onClick={handleMarkComplete}
            className={`p-1.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 transition-all duration-200 ${isCompleted ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40' : 'text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
            title={isCompleted ? "Completed" : "Mark as completed"}
            disabled={isCompleting || isCompleted}
            aria-label={isCompleted ? 'Completed' : 'Mark as completed'}
            data-tooltip-id="complete-tooltip"
          >
            {isCompleting ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-500" />
            ) : isCompleted ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>
        </div>
        {showResourcesPopup && hasResources && (
          <div 
            className="absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-xl bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-gray-800"
            style={{ top: '100%', right: '10px' }}
            ref={popupRef}
            tabIndex={-1}
            aria-label="Learning Resources"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-indigo-700 dark:text-indigo-300">Learning Resources</h3>
                <button 
                  onClick={toggleResourcesPopup}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                  aria-label="Close resources popup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="space-y-3 max-h-60 overflow-y-auto">
                {(concept.resource_links ?? []).map((link, index) => (
                  <li key={index} className="group border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0 last:pb-0">
                    <a 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-start p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-gray-800/70 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link2 className="h-5 w-5 text-indigo-500 dark:text-indigo-300 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-base text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 group-hover:underline break-all">{link}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      {isExpanded && childConcepts.length > 0 && (
        <div className="concept-children border-l-2 border-indigo-100 dark:border-indigo-900 ml-4 pl-2">
          {childConcepts.map((child, index) => (
            <ConceptItem
              key={child.id}
              concept={child}
              onComplete={onComplete}
              onLoadChildren={onLoadChildren}
              depth={depth + 1}
              onChildComplete={handleChildComplete}
              conceptIndex={`${conceptIndex ? conceptIndex + '.' : ''}${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConceptItem;