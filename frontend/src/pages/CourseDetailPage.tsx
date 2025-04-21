import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses'; // Assuming hook provides getCourseById and toggleConceptCompletion
import { Course, CourseSection, CourseSubSection, ConceptDetail } from '../../../shared/src/types';
import { ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

// Component to render a single concept
interface ConceptItemProps {
  concept: ConceptDetail;
  courseId: string;
  onToggleConcept: (courseId: string, conceptId: string, isCompleted: boolean) => Promise<void>;
}

const ConceptItem: React.FC<ConceptItemProps> = ({ concept, courseId, onToggleConcept }) => {
  const handleCheckboxChange = () => {
    onToggleConcept(courseId, concept.id, !concept.is_completed);
  };

  return (
    <li className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-b-0">
      <input 
        type="checkbox" 
        id={`concept-${concept.id}`}
        checked={!!concept.is_completed}
        onChange={handleCheckboxChange}
        className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
      />
      <label htmlFor={`concept-${concept.id}`} className="flex-1">
        <span className="font-medium text-gray-900">{concept.name}</span>
        <p className="text-sm text-gray-500 mt-0.5">{concept.description}</p>
        {concept.resource_links && concept.resource_links.length > 0 && (
          <div className="mt-1 space-x-2">
            {concept.resource_links.map((link, index) => (
              <a 
                key={index} 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} // Prevent link click from affecting potential parent handlers
                className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                <ExternalLink size={12} className="mr-1" />
                Resource {index + 1}
              </a>
            ))}
          </div>
        )}
      </label>
    </li>
  );
};

// Main Page Component
const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { 
    getCourseById, // Need this function in useCourses
    toggleConceptCompletion, // Need this function in useCourses
    isLoading, 
    error 
  } = useCourses();
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (courseId) {
      // Fetch the specific course details including sections/concepts
      getCourseById(courseId).then(fetchedCourse => {
        if (fetchedCourse) {
          setCourse(fetchedCourse);
          // Optionally pre-expand the first section
          if (fetchedCourse.sections && fetchedCourse.sections.length > 0) {
            setExpandedSections(new Set([fetchedCourse.sections[0].id]));
          }
        } else {
          // Handle course not found
          setCourse(null); 
        }
      });
    }
  }, [courseId, getCourseById]);

  const handleToggleConcept = async (cId: string, conceptId: string, isCompleted: boolean) => {
    if (!course) return;
    // Call the hook function (needs implementation in useCourses/api.ts)
    const success = await toggleConceptCompletion(cId, conceptId, isCompleted);
    if (success) {
      // Optimistically update UI or refetch
      setCourse(prevCourse => {
        if (!prevCourse || !prevCourse.sections) return prevCourse;
        return {
          ...prevCourse,
          sections: prevCourse.sections.map(section => ({
            ...section,
            sub_sections: section.sub_sections.map(sub => ({
              ...sub,
              concepts: sub.concepts.map(concept => 
                concept.id === conceptId ? { ...concept, is_completed: isCompleted } : concept
              )
            }))
          }))
        };
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  if (isLoading && !course) return <p>Loading course details...</p>;
  if (error) return <p className="text-red-500">Error loading course: {error}</p>;
  if (!course) return <p>Course not found.</p>; // Handle case where course fetch fails or ID is invalid

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <Link 
        to={`/tracks/${course.track_id}`} // Link back to the track detail page
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to CourseList
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
      <p className="text-gray-600 mt-1">{course.description}</p>
      
      <div className="mt-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700">Concepts to Cover</h2>
        {course.sections && course.sections.length > 0 ? (
          course.sections.map((section: CourseSection) => (
            <div key={section.id} className="border rounded-md overflow-hidden">
              <button 
                onClick={() => toggleSection(section.id)}
                className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                aria-expanded={expandedSections.has(section.id)}
              >
                <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                {expandedSections.has(section.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
              {expandedSections.has(section.id) && (
                <div className="p-4 space-y-3 border-t">
                  {section.sub_sections.map((subSection: CourseSubSection) => (
                    <div key={subSection.id}>
                      <h4 className="text-md font-medium text-gray-700 mb-2">{subSection.title}</h4>
                      <ul className="space-y-1 pl-4">
                        {subSection.concepts.map((concept: ConceptDetail) => (
                          <ConceptItem 
                            key={concept.id} 
                            concept={concept} 
                            courseId={course.id} 
                            onToggleConcept={handleToggleConcept} 
                          />
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No specific concepts listed for this course yet.</p>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;
