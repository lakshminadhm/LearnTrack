import React from 'react';
import { Concept } from '../../../../../shared/src/types';
import { ChevronDown, ChevronRight, Plus, Edit, Trash } from 'lucide-react';
import { ConceptForm } from './ConceptForm';

interface ConceptItemProps {
  concept: Concept;
  level: number;
  onEdit: (concept: Concept) => void;
  onDelete: (concept: Concept) => void;
  onAddChild: (parentId: string) => void;
  expanded: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  addChildForId: string | null;
  editingConceptId: string | null;
  onShowAddChild: (conceptId: string | null) => void;
  onShowEditForm: (conceptId: string | null) => void;
  showFormProps: {
    courseId: string;
    onSave: () => void;
    onCancel: () => void;
    rootConcepts: Concept[];
    siblingConcepts: Concept[];
  };
}

export const AdminConceptItem: React.FC<ConceptItemProps> = ({ 
  concept, 
  level, 
  onEdit, 
  onDelete,
  onAddChild,
  expanded,
  toggleExpand,
  addChildForId,
  editingConceptId,
  onShowAddChild,
  onShowEditForm,
  showFormProps
}) => {
  const hasChildren = concept.children && concept.children.length > 0;
  const siblings = concept.parent_id ? 
    showFormProps.siblingConcepts : 
    showFormProps.rootConcepts;
  
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
            onClick={() => {
              onEdit(concept);
              onShowEditForm(concept.id);
            }}
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

      {/* Show the edit form below this concept */}
      {editingConceptId === concept.id && (
        <div className="ml-8">
          <ConceptForm
            concept={concept}
            courseId={showFormProps.courseId}
            parentId={concept.parent_id || null}
            onSave={showFormProps.onSave}
            onCancel={() => onShowEditForm(null)}
            rootConcepts={showFormProps.rootConcepts}
            siblingConcepts={siblings}
          />
        </div>
      )}

      {/* Show the add-child form below this concept */}
      {addChildForId === concept.id && (
        <div className="ml-8">
          <ConceptForm
            concept={null}
            courseId={showFormProps.courseId}
            parentId={concept.id}
            onSave={showFormProps.onSave}
            onCancel={() => onShowAddChild(null)}
            rootConcepts={[]}
            siblingConcepts={concept.children || []}
          />
        </div>
      )}

      {hasChildren && expanded[concept.id] && (
        <div className="ml-4">
          {concept.children!.map(child => (
            <AdminConceptItem 
              key={child.id} 
              concept={child} 
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              expanded={expanded}
              toggleExpand={toggleExpand}
              addChildForId={addChildForId}
              editingConceptId={editingConceptId}
              onShowAddChild={onShowAddChild}
              onShowEditForm={onShowEditForm}
              showFormProps={showFormProps}
            />
          ))}
        </div>
      )}
    </div>
  );
};