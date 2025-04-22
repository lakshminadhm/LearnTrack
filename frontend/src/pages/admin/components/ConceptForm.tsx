import React, { useState, useEffect } from 'react';
import { Concept, CourseDifficulty } from '../../../../../shared/src/types';
import { Save, X } from 'lucide-react';
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
    order_number: 1,
    resource_link: '',
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
      setFormData({
        title: concept.title,
        description: concept.description || '',
        order_number: concept.order_number || 1,
        resource_link: concept.resource_link || '',
        position: 'current' // Special value for editing existing concept
      });
    } else if (rootConcepts && rootConcepts.length > 0 && !parentId) {
      // Default to end position for new root
      setFormData(prev => ({ 
        ...prev, 
        order_number: Math.max(...rootConcepts.map(c => c.order_number || 0)) + 1,
        position: 'end'
      }));
    } else if (siblingConcepts && siblingConcepts.length > 0 && parentId) {
      // Default to end position for new child
      setFormData(prev => ({ 
        ...prev, 
        order_number: Math.max(...siblingConcepts.map(c => c.order_number || 0)) + 1,
        position: 'end'
      }));
    }
  }, [concept, rootConcepts, siblingConcepts, parentId]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue = name === 'order_number' ? parseInt(value) : value;
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // When editing a concept
      if (isEditMode && concept) {
        let orderNumber = formData.order_number;
        const originalOrder = concept.order_number || 1;
        const siblings = getSiblings();
        
        // Only update order if position was changed
        if (formData.position !== 'current' && siblings.length > 0) {
          if (formData.position === 'start') {
            // Move to start
            orderNumber = 1;
            
            // Update siblings that would be affected
            const affectedSiblings = siblings.filter(c => 
              (c.order_number || 0) >= orderNumber && (c.order_number || 0) < originalOrder
            );
            
            for (const c of affectedSiblings) {
              try {
                await adminApi.updateConcept(c.id, {
                  ...c,
                  order_number: (c.order_number || 0) + 1
                });
              } catch (error) {
                console.error(`Failed to update order for concept ${c.id}`, error);
              }
            }
          } else if (formData.position === 'end') {
            // Move to end
            orderNumber = Math.max(...siblings.map(c => c.order_number || 0)) + 1;
            
            // No need to update other concepts when moving to the end
          } else {
            // Move after a specific concept
            const afterConcept = siblings.find(c => c.id === formData.position);
            if (afterConcept) {
              const afterOrder = afterConcept.order_number || 0;
              
              // If moving forward (to a higher order number)
              if (afterOrder > originalOrder) {
                orderNumber = afterOrder;
                
                // Update siblings between original position and new position
                const affectedSiblings = siblings.filter(c => 
                  (c.order_number || 0) > originalOrder && (c.order_number || 0) <= afterOrder
                );
                
                for (const c of affectedSiblings) {
                  try {
                    await adminApi.updateConcept(c.id, {
                      ...c,
                      order_number: (c.order_number || 0) - 1
                    });
                  } catch (error) {
                    console.error(`Failed to update order for concept ${c.id}`, error);
                  }
                }
              } 
              // If moving backward (to a lower order number)
              else if (afterOrder < originalOrder - 1) {
                orderNumber = afterOrder + 1;
                
                // Update siblings between new position and original position
                const affectedSiblings = siblings.filter(c => 
                  (c.order_number || 0) > afterOrder && (c.order_number || 0) < originalOrder
                );
                
                for (const c of affectedSiblings) {
                  try {
                    await adminApi.updateConcept(c.id, {
                      ...c,
                      order_number: (c.order_number || 0) + 1
                    });
                  } catch (error) {
                    console.error(`Failed to update order for concept ${c.id}`, error);
                  }
                }
              } else {
                // No change needed if position is the same
                orderNumber = originalOrder;
              }
            }
          }
        }
        
        // Update the concept with possibly modified order_number
        await adminApi.updateConcept(concept.id, {
          course_id: courseId,
          title: formData.title,
          description: formData.description,
          resource_link: formData.resource_link,
          order_number: orderNumber
        });
        toast.success('Concept updated successfully');
      } 
      // When adding a new concept
      else {
        // Calculate the order_number based on the selected position
        let orderNumber = formData.order_number;
        const concepts = !parentId ? rootConcepts : siblingConcepts;
        
        if (concepts && concepts.length > 0) {
          if (formData.position === 'start') {
            // Place at beginning
            orderNumber = 1;
            
            // Need to update existing concepts with order_number >= 1
            const conceptsToUpdate = concepts.filter(c => (c.order_number || 0) >= 1);
            for (const c of conceptsToUpdate) {
              try {
                await adminApi.updateConcept(c.id, {
                  ...c,
                  order_number: (c.order_number || 0) + 1
                });
              } catch (error) {
                console.error(`Failed to update order for concept ${c.id}`, error);
              }
            }
          } else if (formData.position === 'end') {
            // Place at end
            orderNumber = Math.max(...concepts.map(c => c.order_number || 0)) + 1;
          } else {
            // Place after the selected concept
            const afterConcept = concepts.find(c => c.id === formData.position);
            if (afterConcept) {
              orderNumber = (afterConcept.order_number || 0) + 1;
              
              // Need to update existing concepts with order_number > afterConcept.order_number
              const conceptsToUpdate = concepts.filter(c => 
                (c.order_number || 0) > (afterConcept.order_number || 0)
              );
              
              for (const c of conceptsToUpdate) {
                try {
                  await adminApi.updateConcept(c.id, {
                    ...c,
                    order_number: (c.order_number || 0) + 1
                  });
                } catch (error) {
                  console.error(`Failed to update order for concept ${c.id}`, error);
                }
              }
            }
          }
        }
        
        // Create the new concept with the calculated order_number
        await adminApi.createConcept({
          course_id: courseId,
          parent_id: parentId || undefined,
          title: formData.title,
          description: formData.description,
          resource_link: formData.resource_link,
          order_number: orderNumber,
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
          {!isEditMode && hasRelevantSiblings ? (
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
                {relevantSiblings.sort((a, b) => (a.order_number || 0) - (b.order_number || 0)).map(c => (
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
          ) : isEditMode && hasRelevantSiblings ? (
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
                {relevantSiblings.sort((a, b) => (a.order_number || 0) - (b.order_number || 0)).map(c => (
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
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Number
              </label>
              <input
                type="number"
                name="order_number"
                value={formData.order_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                min="1"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource Link
            </label>
            <input
              type="url"
              name="resource_link"
              value={formData.resource_link}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="https://..."
            />
          </div>
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