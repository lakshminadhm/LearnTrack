import React, { useState, useEffect } from 'react';
import { Concept, CourseDifficulty } from '../../../types';
import { Save, X, Plus, Trash } from 'lucide-react';
import { useAdmin } from '../../../hooks/useAdmin';
import { adminApi } from '../../../services/api';
import toast from 'react-hot-toast';

export interface ConceptFormProps {
  concept: Concept | null;
  courseId: string;
  parentId: string | null;
  onSave: () => void;
  onCancel: () => void;
  rootConcepts: Concept[];
  siblingConcepts: Concept[];
}

export const ConceptForm: React.FC<ConceptFormProps> = ({
  concept,
  courseId,
  parentId,
  onSave,
  onCancel,
  rootConcepts,
  siblingConcepts
}) => {
  const isEditMode = !!concept;
  const { isLoading } = useAdmin();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sequence_number: 1,
    resourceLinks: [''], // Changed to array
    position: 'end' // 'start', 'end', or concept ID
  });
  
  // Get relevant siblings based on whether this is a root or child concept
  const getSiblings = () => {
    if (isEditMode) {
      // When editing, siblings are other concepts at same level, excluding the current concept
      if (!concept?.parent_id) {
        // Root concept siblings (exclude self)
        return rootConcepts.filter(c => c.id !== concept?.id);
      } else {
        // Child concept siblings (exclude self)
        return siblingConcepts.filter(c => c.id !== concept?.id);
      }
    } else {
      // When adding, use all siblings
      return !parentId ? rootConcepts : siblingConcepts;
    }
  };
  
  useEffect(() => {
    if (concept) {
      // Handle resource_links as array
      console.log(concept)
    let resourceLinks: string[] = [];
      if (concept.resource_links && Array.isArray(concept.resource_links)) {
        console.log('concept.resource_links', concept.resource_links);
        resourceLinks = [...concept.resource_links];
      }
      else {
        resourceLinks = [''];
      }
      console.log(resourceLinks)
      setFormData({
        title: concept.title,
        description: concept.description || '',
        sequence_number: concept.sequence_number || 1,
        resourceLinks: resourceLinks,
        position: 'current' // Special value for editing existing concept
      });
    } else if (rootConcepts && rootConcepts.length > 0 && !parentId) {
      // Default to end position for new root
      setFormData(prev => ({ 
        ...prev, 
        sequence_number: Math.max(...rootConcepts.map(c => c.sequence_number || 0)) + 1,
        position: 'end'
      }));
    } else if (siblingConcepts && siblingConcepts.length > 0 && parentId) {
      // Default to end position for new child
      setFormData(prev => ({ 
        ...prev, 
        sequence_number: Math.max(...siblingConcepts.map(c => c.sequence_number || 0)) + 1,
        position: 'end'
      }));
    }
  }, [concept, rootConcepts, siblingConcepts, parentId]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue = name === 'sequence_number' ? parseInt(value) : value;
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };
  
  const handleResourceLinkChange = (index: number, value: string) => {
    const updatedLinks = [...formData.resourceLinks];
    updatedLinks[index] = value;
    setFormData(prev => ({ ...prev, resourceLinks: updatedLinks }));
  };
  
  const addResourceLink = () => {
    setFormData(prev => ({ 
      ...prev, 
      resourceLinks: [...prev.resourceLinks, ''] 
    }));
  };
  
  const removeResourceLink = (index: number) => {
    if (formData.resourceLinks.length <= 1) {
      return; // Keep at least one field
    }
    
    const updatedLinks = [...formData.resourceLinks];
    updatedLinks.splice(index, 1);
    setFormData(prev => ({ ...prev, resourceLinks: updatedLinks }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty resource links
    const filteredResourceLinks = formData.resourceLinks.filter(link => link.trim() !== '');
    
    try {
      // When editing a concept
      if (isEditMode && concept) {
        let sequenceNumber = formData.sequence_number;
        const originalOrder = concept.sequence_number || 1;
        const siblings = getSiblings();
        
        // Only update order if position was changed
        if (formData.position !== 'current' && siblings.length > 0) {
          if (formData.position === 'start') {
            // Moving to the start
            sequenceNumber = 1;
            // Update other concepts' order
            const affectedSiblings = siblings
              .filter(c => (c.sequence_number || 0) < originalOrder)
              .sort((a, b) => (a.sequence_number || 0) - (b.sequence_number || 0));
              
            // Update affected siblings
            for (const c of affectedSiblings) {
              try {
                await adminApi.updateConcept(c.id, {
                  course_id: c.course_id,
                  title: c.title,
                  description: c.description,
                  parent_id: c.parent_id,
                  resource_links: c.resource_links,
                  sequence_number: (c.sequence_number || 0) + 1
                });
              } catch (error) {
                console.error(`Failed to update order for concept ${c.id}`, error);
              }
            }
          } else if (formData.position === 'end') {
            // Moving to the end
            sequenceNumber = Math.max(...siblings.map(c => c.sequence_number || 0));
            
            // When moving to end, decrease sequence_number of all concepts after the current one by 1
            // to fill the gap left by the moved concept
            const conceptsToMoveUp = siblings
              .filter(c => (c.sequence_number || 0) > originalOrder)
              .sort((a, b) => (a.sequence_number || 0) - (b.sequence_number || 0));
            
            for (const c of conceptsToMoveUp) {
              try {
                await adminApi.updateConcept(c.id, {
                  course_id: c.course_id,
                  title: c.title,
                  description: c.description,
                  parent_id: c.parent_id,
                  resource_links: c.resource_links,
                  sequence_number: (c.sequence_number || 0) - 1
                });
              } catch (error) {
                console.error(`Failed to update order for concept ${c.id}`, error);
              }
            }
          } else {
            // Moving after a specific sibling
            const targetConcept = siblings.find(c => c.id === formData.position);
            if (targetConcept) {
              const targetOrder = targetConcept.sequence_number || 0;              
              
              // When moving down the list (e.g., from position 10 to 15)
              if (targetOrder > originalOrder) {
                sequenceNumber = targetOrder;
                // Move concepts in between the original position and new position up by 1
                // This fills the gap left by the moved concept (11 becomes 10, 12 becomes 11, etc.)
                const conceptsToMoveUp = siblings
                  .filter(c => (c.sequence_number || 0) > originalOrder && (c.sequence_number || 0) <= targetOrder)
                  .sort((a, b) => (a.sequence_number || 0) - (b.sequence_number || 0));
                
                for (const c of conceptsToMoveUp) {
                  try {
                    await adminApi.updateConcept(c.id, {
                      course_id: c.course_id,
                      title: c.title,
                      description: c.description,
                      parent_id: c.parent_id,
                      resource_links: c.resource_links,
                      sequence_number: (c.sequence_number || 0) - 1
                    });
                  } catch (error) {
                    console.error(`Failed to update order for concept ${c.id}`, error);
                  }
                }
              } 
              // When moving up the list (e.g., from position 15 to 10)
              else if (targetOrder < originalOrder - 1) {
                sequenceNumber = targetOrder+1;
                // Move concepts in between the target position and original position down by 1
                // (10 becomes 11, 11 becomes 12, etc.)
                const conceptsToMoveDown = siblings
                  .filter(c => (c.sequence_number || 0) > targetOrder && (c.sequence_number || 0) < originalOrder)
                  .sort((a, b) => (b.sequence_number || 0) - (a.sequence_number || 0)); // Sort descending to avoid conflicts
                
                for (const c of conceptsToMoveDown) {
                  try {
                    await adminApi.updateConcept(c.id, {
                      course_id: c.course_id,
                      title: c.title,
                      description: c.description,
                      parent_id: c.parent_id,
                      resource_links: c.resource_links,
                      sequence_number: (c.sequence_number || 0) + 1
                    });
                  } catch (error) {
                    console.error(`Failed to update order for concept ${c.id}`, error);
                  }
                }
              }
            }
          }
        }
        
        // Update the concept with possibly modified sequence_number
        await adminApi.updateConcept(concept.id, {
          course_id: courseId,
          title: formData.title,
          description: formData.description,
          resource_links: filteredResourceLinks, // Send array of links
          sequence_number: sequenceNumber
        });
        toast.success('Concept updated successfully');
      } 
      // When adding a new concept
      else {
        // Calculate the sequence_number based on the selected position
        let sequenceNumber = formData.sequence_number;
        const concepts = !parentId ? rootConcepts : siblingConcepts;
        
        if (concepts && concepts.length > 0) {
          if (formData.position === 'start') {
            sequenceNumber = 1;
            // Update other concepts' order
            const affectedConcepts = concepts
              .sort((a, b) => (a.sequence_number || 0) - (b.sequence_number || 0));
              
            for (const c of affectedConcepts) {
              try {
                await adminApi.updateConcept(c.id, {
                  course_id: c.course_id,
                  title: c.title,
                  description: c.description,
                  parent_id: c.parent_id,
                  resource_links: c.resource_links,
                  sequence_number: (c.sequence_number || 0) + 1
                });
              } catch (error) {
                console.error(`Failed to update order for concept ${c.id}`, error);
              }
            }
          } else if (formData.position === 'end') {
            sequenceNumber = Math.max(...concepts.map(c => c.sequence_number || 0)) + 1;
          } else {
            // After a specific sibling
            const targetConcept = concepts.find(c => c.id === formData.position);
            if (targetConcept) {
              const targetOrder = targetConcept.sequence_number || 0;
              sequenceNumber = targetOrder + 1;
              
              // Update order of affected siblings
              const affectedConcepts = concepts
                .filter(c => (c.sequence_number || 0) > targetOrder)
                .sort((a, b) => (a.sequence_number || 0) - (b.sequence_number || 0));
                
              for (const c of affectedConcepts) {
                try {
                  await adminApi.updateConcept(c.id, {
                    course_id: c.course_id,
                    title: c.title,
                    description: c.description,
                    parent_id: c.parent_id,
                    resource_links: c.resource_links,
                    sequence_number: (c.sequence_number || 0) + 1
                  });
                } catch (error) {
                  console.error(`Failed to update order for concept ${c.id}`, error);
                }
              }
            }
          }
        }
        
        // Create the new concept with the calculated sequence_number
        await adminApi.createConcept({
          course_id: courseId,
          parent_id: parentId,
          title: formData.title,
          description: formData.description,
          resource_links: filteredResourceLinks, // Send array of links
          sequence_number: sequenceNumber,
          difficulty: CourseDifficulty.BEGINNER
        });
        toast.success('Concept created successfully');
      }
      onSave();
    } catch (error) {
      console.error('Error saving concept:', error);
      toast.error('Failed to save concept');
    }
  };
  
  // Determine which concepts to show in the position dropdown
  const relevantSiblings = getSiblings();
  const hasRelevantSiblings = relevantSiblings.length > 0;
  
  return (
    <div className="bg-white p-4 border rounded-md shadow-sm mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {isEditMode ? 'Edit Concept' : 'Add New Concept'}
        </h3>
        <button 
          onClick={onCancel}
          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
        >
          <X size={18} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          {!isEditMode ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="start">At the beginning</option>
                {relevantSiblings.sort((a, b) => (a.sequence_number || 0) - (b.sequence_number || 0)).slice(0, relevantSiblings.length - 1).map(c => (
                  <option key={c.id} value={c.id}>After "{c.title}"</option>
                ))}
                <option value="end">At the end</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {formData.position === 'start' ? 'This concept will be first in the list.' : 
                 formData.position === 'end' ? 'This concept will be last in the list.' :
                 'This concept will be placed after the selected concept.'}
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="current">Keep current position</option>
                <option value="start">Move to beginning</option>
                {relevantSiblings.sort((a, b) => (a.sequence_number || 0) - (b.sequence_number || 0)).slice(0, relevantSiblings.length - 1).map(c => (
                  <option key={c.id} value={c.id}>After "{c.title}"</option>
                ))}
                <option value="end">Move to end</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {formData.position === 'current' ? 'Concept will remain at its current position.' :
                 formData.position === 'start' ? 'Concept will be moved to the first position.' : 
                 formData.position === 'end' ? 'Concept will be moved to the last position.' :
                 'Concept will be moved after the selected concept.'}
              </p>
            </div>
          )}
          
          {/* Empty column to balance the grid */}
          <div></div>
        </div>
        
        {/* Resource Links Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Resource Links
            </label>
            <button
              type="button"
              onClick={addResourceLink}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Add Link
            </button>
          </div>
          
          {formData.resourceLinks.map((link, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="url"
                value={link}
                onChange={(e) => handleResourceLinkChange(index, e.target.value)}
                className="flex-grow px-3 py-2 border rounded-md"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => removeResourceLink(index)}
                className="ml-2 text-red-500 hover:text-red-700 p-1"
                disabled={formData.resourceLinks.length <= 1}
                title="Remove link"
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
          <p className="mt-1 text-xs text-gray-500">
            Add links to helpful resources, tutorials, or documentation
          </p>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
          >
            <Save size={16} className="mr-1" />
            {isLoading ? 'Saving...' : 'Save Concept'}
          </button>
        </div>
      </form>
    </div>
  );
};