import React, { useState, useEffect, useCallback } from 'react';
import { Concept } from '../../../../shared/src/types';
import ConceptItem from './ConceptItem';
import { PlusCircle, Loader2, RefreshCw, AlertCircle, Link2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

interface ConceptTreeProps {
  courseId: string;
  concepts?: Concept[];
  fetchConceptTree: (courseId: string) => Promise<Concept[]>;
  completeConcept: (conceptId: string) => Promise<boolean>;
  fetchConceptChildren: (conceptId: string) => Promise<Concept[]>;
  createConcept?: (data: {
    courseId: string;
    title: string;
    description?: string;
    parentId?: string;
    resourceLinks?: string[];
  }) => Promise<Concept | null>;
  onProgressUpdate?: (progress: number) => void; // New prop to notify parent about progress changes
}

interface ConceptFormData {
  title: string;
  description: string;
  parentId: string;
  resourceLinks: string;
}

const ConceptTree: React.FC<ConceptTreeProps> = ({
  courseId,
  concepts: initialConcepts,
  fetchConceptTree,
  completeConcept,
  fetchConceptChildren,
  createConcept,
  onProgressUpdate
}) => {
  const [concepts, setConcepts] = useState<Concept[]>(initialConcepts || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialConcepts);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ConceptFormData>({
    defaultValues: {
      title: '',
      description: '',
      parentId: '',
      resourceLinks: ''
    }
  });

  const loadConcepts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedConcepts = await fetchConceptTree(courseId);
      
      // Recursively sort concepts by sequence_number
      const sortConceptsRecursively = (conceptsList: Concept[]): Concept[] => {
        // Sort current level by sequence_number
        const sortedConcepts = [...conceptsList].sort((a, b) => (a.sequence_number || 0) - (b.sequence_number || 0));
        
        // Recursively sort children
        return sortedConcepts.map(concept => ({
          ...concept,
          children: concept.children ? sortConceptsRecursively(concept.children) : []
        }));
      };
      
      // Apply the recursive sorting and update state
      const sortedConcepts = sortConceptsRecursively(loadedConcepts);
      setConcepts(sortedConcepts);
    } catch (err) {
      setError('Failed to load course concepts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, fetchConceptTree]);

  useEffect(() => {
    if (!initialConcepts) {
      loadConcepts();
    }
  }, [courseId, initialConcepts, loadConcepts]);

  // Calculate and update total course progress
  useEffect(() => {
    if (concepts.length > 0 && onProgressUpdate) {
      // Function to count all concepts and completed concepts
      const countAllConcepts = (conceptsList: Concept[]): { total: number, completed: number } => {
        let total = 0;
        let completed = 0;
        
        const processConcept = (concept: Concept) => {
          total++;
          if (concept.progress?.is_completed || concept.is_completed) {
            completed++;
          }
          
          // Process children recursively
          if (concept.children && concept.children.length > 0) {
            concept.children.forEach(processConcept);
          }
        };
        
        // Process all top-level concepts
        conceptsList.forEach(processConcept);
        
        return { total, completed };
      };
      
      const counts = countAllConcepts(concepts);
      const progressPercentage = counts.total > 0 
        ? Math.round((counts.completed / counts.total) * 100) 
        : 0;
      
      // Notify parent component about the updated progress
      onProgressUpdate(progressPercentage);
    }
  }, [concepts, onProgressUpdate]);

  const handleComplete = async (conceptId: string) => {
    try {
      const success = await completeConcept(conceptId);
      
      // If completion was successful, update the tree to reflect changes in parent progress
      if (success) {
        // Find the concept and mark it as completed
        const updateConceptTreeCompletionStatus = (
          concepts: Concept[],
          targetId: string
        ): Concept[] => {
          return concepts.map(concept => {
            if (concept.id === targetId) {
              // Mark this concept as completed
              return {
                ...concept,
                is_completed: true,
                progress: concept.progress 
                  ? { ...concept.progress, is_completed: true }
                  : { id: '', user_id: '', concept_id: concept.id, is_completed: true, completed_at: new Date(), created_at: new Date(), updated_at: new Date() }
              };
            } else if (concept.children && concept.children.length > 0) {
              // Check children recursively
              return {
                ...concept,
                children: updateConceptTreeCompletionStatus(concept.children, targetId)
              };
            }
            return concept;
          });
        };
        
        setConcepts(prevConcepts => updateConceptTreeCompletionStatus(prevConcepts, conceptId));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error completing concept:", error);
      return false;
    }
  };

  const onSubmit = async (data: ConceptFormData) => {
    if (!createConcept) return;
    
    setIsSubmitting(true);
    try {
      const resourceLinks = data.resourceLinks
        ? data.resourceLinks.split(',').map(url => url.trim())
        : [];

      const result = await createConcept({
        courseId,
        title: data.title,
        description: data.description || undefined,
        parentId: data.parentId || undefined,
        resourceLinks: resourceLinks.length > 0 ? resourceLinks : undefined
      });

      if (result) {
        // Optimistic UI update - add the new concept to the local state
        if (!data.parentId) {
          // If top-level concept, add to root
          setConcepts(prev => [...prev, result]);
        } else {
          // Otherwise, add to parent's children
          setConcepts(prevConcepts => 
            updateConceptTreeWithNewConcept(prevConcepts, data.parentId, result)
          );
        }
        
        reset();
        setShowAddForm(false);
        // Refresh to ensure server state is synced
        await loadConcepts();
      }
    } catch (err) {
      console.error("Error creating concept:", err);
      setError('Failed to create concept. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to update the concept tree with a new concept
  const updateConceptTreeWithNewConcept = (
    concepts: Concept[], 
    parentId: string, 
    newConcept: Concept
  ): Concept[] => {
    return concepts.map(concept => {
      if (concept.id === parentId) {
        // Add to this concept's children
        return {
          ...concept,
          children: [...(concept.children || []), newConcept]
        };
      } else if (concept.children && concept.children.length > 0) {
        // Recursively check children
        return {
          ...concept,
          children: updateConceptTreeWithNewConcept(concept.children, parentId, newConcept)
        };
      }
      return concept;
    });
  };

  const renderConceptOptions = (conceptsList: Concept[], depth = 0) => {
    return conceptsList.map(concept => (
      <React.Fragment key={concept.id}>
        <option value={concept.id}>
          {Array(depth).fill('\u00A0\u00A0').join('')}
          {depth > 0 && '└─ '}
          {concept.title}
        </option>
        {concept.children && concept.children.length > 0 && 
          renderConceptOptions(concept.children, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white/70">
      <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-indigo-500/30 to-blue-400/30 flex flex-wrap justify-between items-center">
        <h3 className="text-xl sm:text-2xl font-bold text-indigo-800 tracking-tight">Learning Concepts</h3>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            className="rounded-full bg-white hover:bg-indigo-100 text-indigo-600 shadow-sm transition px-2 py-2 flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={loadConcepts}
            disabled={isLoading}
            aria-label="Refresh concepts"
            title="Refresh concepts"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {isAdmin && (
            <Link
              to="/admin/concepts"
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition px-3 py-1.5 sm:px-4 sm:py-2 flex items-center text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
              Manage Concepts
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {/* Hide add form for non-admins */}
      {isAdmin && showAddForm && createConcept && (
        <div className="p-6 border-b bg-indigo-50/50">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-800">Add New Concept</h4>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Controller
                name="title"
                control={control}
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full px-4 py-2.5 border ${errors.title ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200`}
                    placeholder="Enter concept title"
                  />
                )}
              />
              {errors.title && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    rows={3}
                    placeholder="Describe what learners will understand after mastering this concept"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Concept
              </label>
              <Controller
                name="parentId"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <option value="">None (Top Level Concept)</option>
                    {renderConceptOptions(concepts)}
                  </select>
                )}
              />
              <p className="mt-1 text-xs text-gray-500">
                Choose a parent to create a hierarchical relationship
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Links
              </label>
              <Controller
                name="resourceLinks"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <input
                      {...field}
                      type="text"
                      placeholder="https://example.com, https://another-site.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link2 className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                )}
              />
              <p className="mt-1 text-xs text-gray-500">
                Comma-separated list of URLs to learning resources for this concept
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  reset();
                }}
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Concept'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="min-h-[200px] px-2 sm:px-6 py-4">
        {isLoading ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 mb-4">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-400" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-white rounded-full"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 animate-pulse bg-indigo-600 rounded-full"></div>
              </div>
            </div>
            <p className="text-gray-600 font-medium">Loading your learning path...</p>
            <p className="text-gray-400 text-sm mt-1">This may take a moment</p>
          </div>
        ) : concepts.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No concepts yet</h3>
            <p className="text-gray-500 mb-4 max-w-sm">Start building your knowledge tree by adding your first concept to this course.</p>
            {/* Only show add button for admin */}
            {isAdmin && createConcept && !showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add your first concept
              </button>
            )}
            {/* For non-admins, suggest contacting admin or show nothing */}
            {!isAdmin && (
              <p className="text-xs text-gray-400 mt-2">Concepts are managed by course administrators.</p>
            )}
          </div>
        ) : (
          <div className="concept-tree divide-y divide-indigo-100" role="tree" aria-label="Course concepts">
            {concepts.map(concept => (
              <ConceptItem
                key={concept.id}
                concept={concept}
                onComplete={handleComplete}
                onLoadChildren={fetchConceptChildren}
                onChildComplete={(childId) => {
                  // This handles a child completion notification in the root concepts
                  // We need to update our concepts state to reflect this change
                  setConcepts(prevConcepts => {
                    // Create a recursive function to update the completion status in the tree
                    const updateChildCompletion = (concepts: Concept[], childId: string): Concept[] => {
                      return concepts.map(concept => {
                        if (concept.id === childId) {
                          // Found the child, mark it as completed
                          return {
                            ...concept,
                            is_completed: true,
                            progress: concept.progress 
                              ? { ...concept.progress, is_completed: true }
                              : { id: '', user_id: '', concept_id: concept.id, is_completed: true, completed_at: new Date(), created_at: new Date(), updated_at: new Date() }
                          };
                        } else if (concept.children && concept.children.length > 0) {
                          // Otherwise check in children recursively
                          return {
                            ...concept,
                            children: updateChildCompletion(concept.children, childId)
                          };
                        }
                        return concept;
                      });
                    };
                    
                    return updateChildCompletion(prevConcepts, childId);
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConceptTree;