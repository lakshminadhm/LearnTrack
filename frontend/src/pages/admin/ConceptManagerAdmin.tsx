import React, { useState, useEffect } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useAdmin } from '../../hooks/useAdmin';
import { Concept, CourseDifficulty } from '../../../../shared/src/types';
import { ChevronDown, ChevronRight, Plus, Edit, Trash, Save, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';

interface ConceptItemProps {
  concept: Concept;
  level: number;
  onEdit: (concept: Concept) => void;
  onDelete: (concept: Concept) => void;
  onAddChild: (parentId: string) => void;
  expanded: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  addChildForId: string | null;
  onShowAddChild: (conceptId: string) => void;
  showFormProps: {
    courseId: string;
    onSave: () => void;
    onCancel: () => void;
  };
}

const ConceptItem: React.FC<ConceptItemProps> = ({ 
  concept, 
  level, 
  onEdit, 
  onDelete,
  onAddChild,
  expanded,
  toggleExpand,
  addChildForId,
  onShowAddChild,
  showFormProps
}) => {
  const hasChildren = concept.children && concept.children.length > 0;
  return (
    <div className="mb-2">
      <div 
        className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer"
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      >
        <div 
          className="mr-2 w-6 h-6 flex items-center justify-center"
          onClick={() => hasChildren && toggleExpand(concept.id)}
        >
          {hasChildren ? (
            expanded[concept.id] ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )
          ) : (
            <div className="w-4 h-4"></div>
          )}
        </div>
        <div className="flex-grow font-medium" onClick={() => hasChildren && toggleExpand(concept.id)}>
          {concept.title}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onShowAddChild(concept.id)}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="Add child concept"
          >
            <Plus size={16} />
          </button>
          <button 
            onClick={() => onEdit(concept)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Edit concept"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(concept)}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="Delete concept"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
      {addChildForId === concept.id && (
        <div className="ml-8">
          <ConceptForm
            concept={null}
            courseId={showFormProps.courseId}
            parentId={concept.id}
            onSave={showFormProps.onSave}
            onCancel={() => onShowAddChild(null)}
          />
        </div>
      )}
      {hasChildren && expanded[concept.id] && (
        <div className="ml-4">
          {concept.children!.map(child => (
            <ConceptItem 
              key={child.id} 
              concept={child} 
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              expanded={expanded}
              toggleExpand={toggleExpand}
              addChildForId={addChildForId}
              onShowAddChild={onShowAddChild}
              showFormProps={showFormProps}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ConceptFormProps {
  concept: Concept | null;
  courseId: string;
  parentId: string | null;
  onSave: () => void;
  onCancel: () => void;
}

const ConceptForm: React.FC<ConceptFormProps> = ({
  concept,
  courseId,
  parentId,
  onSave,
  onCancel
}) => {
  const isEditMode = !!concept;
  const { isLoading } = useAdmin();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order_number: 1,
    resource_link: ''
  });
  
  useEffect(() => {
    if (concept) {
      setFormData({
        title: concept.title,
        description: concept.description || '',
        order_number: concept.order_number || 1,
        resource_link: concept.resource_link || ''
      });
    }
  }, [concept]);
  
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
      if (isEditMode && concept) {
        await adminApi.updateConcept(concept.id, {
          course_id: courseId,
          title: formData.title,
          description: formData.description,
          resource_link: formData.resource_link,
          order_number: formData.order_number as number
        });
        toast.success('Concept updated successfully');
      } else {
        await adminApi.createConcept({
          course_id: courseId,
          parent_id: parentId || undefined,
          title: formData.title,
          description: formData.description,
          resource_link: formData.resource_link,
          order_number: formData.order_number as number,
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

const ConceptManagerAdmin: React.FC = () => {
  const { tracks, isLoading: isLoadingTracks } = useCourses();
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [conceptsMap, setConceptsMap] = useState<Record<string, Concept>>({});
  const [rootConcepts, setRootConcepts] = useState<Concept[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [addChildForId, setAddChildForId] = useState<string | null>(null);
  
  const [editingConcept, setEditingConcept] = useState<Concept | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  useEffect(() => {
    if (selectedTrackId) {
      const loadCourses = async () => {
        setIsLoading(true);
        try {
          const response = await adminApi.getTracks();
          if (response.success && response.data) {
            const track = response.data.find(t => t.id === selectedTrackId);
            if (track) {
              const coursesResponse = await adminApi.getCourses();
              if (coursesResponse.success && coursesResponse.data) {
                const filteredCourses = coursesResponse.data.filter(
                  c => c.track_id === selectedTrackId
                );
                setCourses(filteredCourses);
              }
            }
          }
        } catch (error) {
          console.error('Error loading courses:', error);
          toast.error('Failed to load courses');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadCourses();
      setSelectedCourseId('');
      setConcepts([]);
    }
  }, [selectedTrackId]);
  
  useEffect(() => {
    if (selectedCourseId) {
      loadConcepts();
    } else {
      setConcepts([]);
    }
  }, [selectedCourseId]);
  
  useEffect(() => {
    if (concepts.length > 0) {
      const conceptMap: Record<string, Concept> = {};
      const rootConceptList: Concept[] = [];
      
      concepts.forEach(concept => {
        conceptMap[concept.id] = { ...concept, children: [] };
      });
      
      concepts.forEach(concept => {
        if (concept.parent_id && conceptMap[concept.parent_id]) {
          if (!conceptMap[concept.parent_id].children) {
            conceptMap[concept.parent_id].children = [];
          }
          conceptMap[concept.parent_id].children!.push(conceptMap[concept.id]);
        } else {
          rootConceptList.push(conceptMap[concept.id]);
        }
      });
      
      rootConceptList.sort((a, b) => (a.order_number || 0) - (b.order_number || 0));
      rootConceptList.forEach(concept => {
        if (concept.children) {
          concept.children.sort((a, b) => (a.order_number || 0) - (b.order_number || 0));
        }
      });
      
      setConceptsMap(conceptMap);
      setRootConcepts(rootConceptList);
      
      const allExpanded: Record<string, boolean> = {};
      concepts.forEach(concept => {
        allExpanded[concept.id] = true;
      });
      setExpanded(allExpanded);
    }
  }, [concepts]);
  
  const loadConcepts = async () => {
    if (!selectedCourseId) return;
    
    setIsLoading(true);
    try {
      const response = await adminApi.getConceptsForCourse(selectedCourseId);
      if (response.success && response.data) {
        setConcepts(response.data);
      } else {
        setConcepts([]);
        toast.error('No concepts found for this course');
      }
    } catch (error) {
      console.error('Error loading concepts:', error);
      toast.error('Failed to load concepts');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTrackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTrackId(e.target.value);
  };
  
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseId(e.target.value);
  };
  
  const handleAddRootConcept = () => {
    setEditingConcept(null);
    setParentId(null);
    setShowForm(true);
    setAddChildForId(null);
  };
  
  const handleAddChildConcept = (parentConceptId: string) => {
    setEditingConcept(null);
    setParentId(parentConceptId);
    setShowForm(false);
    setAddChildForId(parentConceptId);
  };
  
  const handleEditConcept = (concept: Concept) => {
    setEditingConcept(concept);
    setParentId(concept.parent_id || null);
    setShowForm(true);
    setAddChildForId(null);
  };
  
  const handleDeleteConcept = async (concept: Concept) => {
    if (window.confirm(`Are you sure you want to delete "${concept.title}"? This will also delete all child concepts.`)) {
      setIsLoading(true);
      try {
        const response = await adminApi.deleteConcept(concept.id);
        if (response.success) {
          toast.success('Concept deleted successfully');
          loadConcepts();
        } else {
          toast.error('Failed to delete concept');
        }
      } catch (error) {
        console.error('Error deleting concept:', error);
        toast.error('Failed to delete concept');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const handleFormSave = () => {
    loadConcepts();
    setShowForm(false);
    setEditingConcept(null);
    setParentId(null);
    setAddChildForId(null);
  };
  
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingConcept(null);
    setParentId(null);
    setAddChildForId(null);
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Concept Manager</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Learning Track
          </label>
          <select
            value={selectedTrackId}
            onChange={handleTrackChange}
            className="w-full px-4 py-2 border rounded-md"
            disabled={isLoadingTracks || isLoading}
          >
            <option value="">Select a track</option>
            {tracks.map(track => (
              <option key={track.id} value={track.id}>
                {track.title}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Course
          </label>
          <select
            value={selectedCourseId}
            onChange={handleCourseChange}
            className="w-full px-4 py-2 border rounded-md"
            disabled={!selectedTrackId || isLoading}
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {selectedCourseId && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Course Concepts</h2>
            <button
              onClick={handleAddRootConcept}
              className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center"
              disabled={isLoading}
            >
              <Plus size={18} className="mr-1" />
              Add Root Concept
            </button>
          </div>
          
          {showForm && (
            <ConceptForm
              concept={editingConcept}
              courseId={selectedCourseId}
              parentId={parentId}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
            />
          )}
          
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading concepts...</p>
            </div>
          ) : rootConcepts.length === 0 ? (
            <div className="py-8 text-center bg-gray-50 rounded-md">
              <p className="text-gray-500">No concepts found for this course.</p>
              <p className="text-gray-500 mt-1">Click "Add Root Concept" to create your first concept.</p>
            </div>
          ) : (
            <div className="border rounded-md">
              {rootConcepts.map(concept => (
                <ConceptItem
                  key={concept.id}
                  concept={concept}
                  level={0}
                  onEdit={handleEditConcept}
                  onDelete={handleDeleteConcept}
                  onAddChild={handleAddChildConcept}
                  expanded={expanded}
                  toggleExpand={toggleExpand}
                  addChildForId={addChildForId}
                  onShowAddChild={setAddChildForId}
                  showFormProps={{
                    courseId: selectedCourseId,
                    onSave: handleFormSave,
                    onCancel: handleFormCancel
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {!selectedTrackId && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">Select a learning track and course to manage concepts.</p>
        </div>
      )}
      
      {selectedTrackId && !selectedCourseId && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">Select a course to manage its concepts.</p>
        </div>
      )}
    </div>
  );
};

export default ConceptManagerAdmin;