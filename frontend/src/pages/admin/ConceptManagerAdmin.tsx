import React, { useState, useEffect } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { Concept } from '../../../../shared/src/types';
import { Plus } from 'lucide-react';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import { AdminConceptItem } from './components/AdminConceptItem';
import { ConceptForm } from './components/ConceptForm';
import { CourseSelector } from './components/CourseSelector';

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
  const [editingConceptId, setEditingConceptId] = useState<string | null>(null);
  
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
    setEditingConceptId(null);
  };
  
  const handleAddChildConcept = (parentConceptId: string) => {
    setEditingConcept(null);
    setParentId(parentConceptId);
    setShowForm(false);
    setAddChildForId(parentConceptId);
    setEditingConceptId(null);
  };
  
  const handleEditConcept = (concept: Concept) => {
    setEditingConcept(concept);
    setParentId(concept.parent_id || null);
    setShowForm(false); // No longer show form at the top for editing
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
    setEditingConceptId(null); // Make sure this line is here to clear the editing state
  };
  
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingConcept(null);
    setParentId(null);
    setAddChildForId(null);
  };
  
  // Shared form props for both root and child concept forms
  const formSharedProps = {
    courseId: selectedCourseId,
    onSave: handleFormSave,
    onCancel: handleFormCancel,
    rootConcepts,
    siblingConcepts: []
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Concept Manager</h1>
      
      <CourseSelector 
        tracks={tracks}
        courses={courses}
        selectedTrackId={selectedTrackId}
        selectedCourseId={selectedCourseId}
        onTrackChange={handleTrackChange}
        onCourseChange={handleCourseChange}
        isLoadingTracks={isLoadingTracks}
        isLoading={isLoading}
      />
      
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
          
          {/* Only show form at the top for adding a new root concept */}
          {showForm && (
            <ConceptForm
              concept={null}
              courseId={selectedCourseId}
              parentId={null}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
              rootConcepts={rootConcepts}
              siblingConcepts={[]}
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
                <AdminConceptItem
                  key={concept.id}
                  concept={concept}
                  level={0}
                  onEdit={handleEditConcept}
                  onDelete={handleDeleteConcept}
                  onAddChild={handleAddChildConcept}
                  expanded={expanded}
                  toggleExpand={toggleExpand}
                  addChildForId={addChildForId}
                  editingConceptId={editingConceptId}
                  onShowAddChild={setAddChildForId}
                  onShowEditForm={setEditingConceptId}
                  showFormProps={{
                    courseId: selectedCourseId,
                    onSave: handleFormSave,
                    onCancel: handleFormCancel,
                    rootConcepts: rootConcepts,
                    siblingConcepts: []
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