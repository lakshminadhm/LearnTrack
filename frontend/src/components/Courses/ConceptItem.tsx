import React, { useState, useEffect, useCallback } from 'react';
import { Concept } from '../../../../shared/src/types';
import { ChevronDown, ChevronRight, ExternalLink, CheckCircle, Circle, Loader2, BookOpen, Link2 } from 'lucide-react';

interface ConceptItemProps {
  concept: Concept;
  onComplete: (conceptId: string) => Promise<boolean>;
  onLoadChildren?: (conceptId: string) => Promise<Concept[]>;
  depth?: number;
  expanded?: boolean;
  onChildComplete?: (childId: string) => void; // New prop to notify parent of child completion
}

const ConceptItem: React.FC<ConceptItemProps> = ({ 
  concept, 
  onComplete, 
  onLoadChildren,
  depth = 0, 
  expanded = false,
  onChildComplete
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [childConcepts, setChildConcepts] = useState<Concept[]>(concept.children || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [localIsCompleted, setLocalIsCompleted] = useState(concept.progress?.is_completed || concept.is_completed || false);
  
  const hasChildren = childConcepts.length > 0 || (concept.children?.length ?? 0) > 0;
  const isCompleted = localIsCompleted;
  const hasResources = concept.resource_links && concept.resource_links.length > 0;
  
  // Handle child completion notification
  const handleChildComplete = useCallback((childId: string) => {
    // Update the child's completed status in our local state
    setChildConcepts(prevChildren => 
      prevChildren.map(child => 
        child.id === childId 
          ? { ...child, is_completed: true, progress: child.progress ? { ...child.progress, is_completed: true } : undefined }
          : child
      )
    );
    
    // Propagate the notification upward if we have a parent
    if (onChildComplete) {
      onChildComplete(childId);
    }
  }, [onChildComplete]);
  
  // Calculate progress percentage for this concept based on children completion
  useEffect(() => {
    if (hasChildren && childConcepts.length > 0) {
      // Count completed concepts (including nested children)
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
      
      // Auto-complete parent when all children are completed (100%)
      if (percentage === 100 && !isCompleted && !isCompleting) {
        // Automatically mark the parent concept as completed
        handleAutoComplete();
      }
    } else {
      setProgressPercentage(isCompleted ? 100 : 0);
    }
  }, [childConcepts, hasChildren, isCompleted, isCompleting]);
  
  // Function to automatically mark parent as complete when all children are completed
  const handleAutoComplete = async () => {
    // Don't auto-complete if already completed or in progress
    if (isCompleted || isCompleting) return;
    
    setIsCompleting(true);
    try {
      const success = await onComplete(concept.id);
      if (success) {
        // Update local state to show completion immediately
        setLocalIsCompleted(true);
        console.log(`Auto-completed parent concept: ${concept.title}`);
        
        // Notify parent component that this concept has been completed
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
        // Update local state to show completion immediately
        setLocalIsCompleted(true);
        
        // Notify parent component that this concept has been completed
        if (onChildComplete) {
          onChildComplete(concept.id);
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
              {concept.title}
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
            
            {/* Progress indicator for parent concepts */}
            {hasChildren && (
              <div className="ml-3 flex items-center">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  {progressPercentage}%
                </span>
              </div>
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
            disabled={isCompleting || isCompleted}
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
            {(concept.resource_links ?? []).map((link, index) => (
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
              onChildComplete={handleChildComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConceptItem;