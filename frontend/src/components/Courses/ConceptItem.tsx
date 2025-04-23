import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Concept } from '../../../../shared/src/types';
import { ChevronDown, ChevronRight, ExternalLink, CheckCircle, Circle, Loader2, BookOpen, Link2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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
  const buttonRef = useRef<HTMLButtonElement>(null);
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
    <motion.div 
      className={`concept-item ${isCompleted ? 'completed' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-all duration-200 relative ${
          isCompleted ? 'bg-green-50 hover:bg-green-100' : ''} border-l-4 ${isCompleted ? 'border-green-500' : 'border-transparent hover:border-indigo-200'}`}
        style={{ paddingLeft }}
        // whileHover={{ scale: 1.01 }}
      >
        <motion.button 
          className="flex items-center mr-2 p-1 rounded-full hover:bg-white/50"
          onClick={handleToggleExpand}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {hasChildren ? (
            isLoading ? (
              <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
            ) : (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className='p-1'
              >
                <ChevronRight className="w-5 h-5 text-indigo-600" />
              </motion.div>
            )
          ) : (
            <div className="w-6" />
          )}
        </motion.button>
        
        <div 
          className="flex-1 py-1"
          onClick={handleToggleExpand}
        >
          <div className="flex items-center">
            {conceptIndex && (
              <span className="text-base font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded mr-2 font-semibold">
                {conceptIndex}
              </span>
            )}
            <span className={`font-medium transition-colors text-base ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
              {concept.title}
            </span>         

            {hasChildren && (
              <div className="flex items-center ml-2 space-x-2">
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {progressPercentage}%
                </span>
              </div>
            )}
          </div>
          
          {concept.description && (
            <p className="text-base text-gray-600 mt-1.5 leading-relaxed">
              {concept.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {hasResources && (
            <motion.button
              ref={buttonRef}
              onClick={toggleResourcesPopup}
              className="px-2 py-1 rounded-md hover:bg-indigo-100 text-indigo-600 transition-colors focus:outline-none flex items-center space-x-1 text-sm font-medium border border-indigo-200"
              title={`${showResourcesPopup ? 'Hide' : 'Show'} resources`}
              data-concept-id={concept.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              whileFocus={{ scale: 1.1 }}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              <span>Resources</span>
            </motion.button>
          )}
          <motion.button 
            onClick={handleMarkComplete}
            className={`p-1.5 rounded-full transition-all duration-200 ${
              isCompleted 
                ? 'text-green-600 hover:bg-green-100' 
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            }`}
            title={isCompleted ? "Completed" : "Mark as completed"}
            whileTap={{ scale: 0.95 }}
            disabled={isCompleting || isCompleted}
          >
            {isCompleting ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : isCompleted ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </motion.button>
        </div>
        
        <AnimatePresence>
          {showResourcesPopup && hasResources && (
          <motion.div 
            className="absolute right-0 z-50 w-96 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            style={{ top: '100%', right: '10px' }}
              ref={popupRef}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-indigo-700">
                    Learning Resources
                  </h3>
                  <motion.button 
                    onClick={toggleResourcesPopup}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                  {(concept.resource_links ?? []).map((link, index) => (
                    <li key={index} className="group border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-start p-2 rounded-md hover:bg-indigo-50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link2 className="h-5 w-5 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-base text-indigo-600 hover:text-indigo-800 group-hover:underline break-all">
                          {link}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && childConcepts.length > 0 && (
          <motion.div 
            // className={'ml-[10px] mt-2'}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ConceptItem;