import express from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../index';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all learning tracks (paginated)
router.get('/tracks', [
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  query('search').optional().isString()
], async (req: any, res: express.Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = req.query.search;

    let query = supabase
      .from('learning_tracks')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data: tracks, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: {
        data: tracks,
        total: count || 0
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get courses for a track
router.get('/tracks/:id/courses', [
  param('id').isUUID()
], async (req: any, res: express.Response) => {
  try {
    const trackId = req.params.id;
    const userId = req.user.id;

    // Get courses and join with user progress if available
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        progress:user_course_progress(
          id,
          status,
          progress_percentage,
          updated_at
        )
      `)
      .eq('track_id', trackId)
      .eq('progress.user_id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Format courses to match the expected structure
    const formattedCourses = courses.map(course => ({
      ...course,
      progress: course.progress?.[0] || null
    }));

    res.json({
      success: true,
      data: formattedCourses
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start a course
router.post('/courses/start', [
  body('courseId').isUUID()
], async (req: any, res: express.Response) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Check if already started
    const { data: existing } = await supabase
      .from('user_course_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Already started this course'
      });
    }

    // Create progress entry
    const { data, error } = await supabase
      .from('user_course_progress')
      .insert([{
        user_id: userId,
        course_id: courseId,
        status: 'Not Started',
        progress_percentage: 0
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update course progress
router.put('/courses/progress/:id', [
  param('id').isUUID(),
  body('progress').isInt({ min: 0, max: 100 })
], async (req: any, res: express.Response) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;
    const progress = req.body.progress;

    // Update progress
    const { data, error } = await supabase
      .from('user_course_progress')
      .update({
        progress_percentage: progress,
        status: progress === 100 ? 'Completed' : 'In Progress',
        updated_at: new Date().toISOString()
      })
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's course progress
router.get('/courses/progress', async (req: any, res: express.Response) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get course by ID
router.get('/courses/:id', [
  param('id').isUUID().withMessage('Invalid course ID')
], async (req, res) => {
  const courseId = req.params.id;

  try {
    // Fetch course details from the database
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error || !course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred while fetching the course'
    });
  }
});

// Get all concepts for a course (includes top-level concepts only)
router.get('/courses/:id/concepts', [
  param('id').isUUID().withMessage('Invalid course ID')
], async (req: any, res: express.Response) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    // Get top-level concepts (concepts where parent_id is null)
    const { data: concepts, error } = await supabase
      .from('concepts')
      .select(`
        *,
        progress:user_concept_progress(
          id,
          is_completed,
          completed_at
        )
      `)
      .eq('course_id', courseId)
      .is('parent_id', null)
      .eq('progress.user_id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Format concepts to match the expected structure
    const formattedConcepts = concepts.map(concept => ({
      ...concept,
      progress: concept.progress?.[0] || null
    }));

    res.json({
      success: true,
      data: formattedConcepts
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get child concepts for a specific concept
router.get('/concepts/:id/children', [
  param('id').isUUID().withMessage('Invalid concept ID')
], async (req: any, res: express.Response) => {
  try {
    const conceptId = req.params.id;
    const userId = req.user.id;

    // Get child concepts for the specified parent
    const { data: childConcepts, error } = await supabase
      .from('concepts')
      .select(`
        *,
        progress:user_concept_progress(
          id,
          is_completed,
          completed_at
        )
      `)
      .eq('parent_id', conceptId)
      .eq('progress.user_id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Format concepts to match the expected structure
    const formattedConcepts = childConcepts.map(concept => ({
      ...concept,
      progress: concept.progress?.[0] || null
    }));

    res.json({
      success: true,
      data: formattedConcepts
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get entire concept tree for a course (hierarchical structure)
router.get('/courses/:id/concept-tree', [
  param('id').isUUID().withMessage('Invalid course ID')
], async (req: any, res: express.Response) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    // Get all concepts for the course
    const { data: allConcepts, error } = await supabase
      .from('concepts')
      .select(`
        *,
        progress:user_concept_progress(
          id,
          is_completed,
          completed_at
        )
      `)
      .eq('course_id', courseId)
      .eq('progress.user_id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Format concepts to match the expected structure
    const formattedConcepts = allConcepts.map(concept => ({
      ...concept,
      progress: concept.progress?.[0] || null,
      children: []
    }));

    // Build the tree structure
    const conceptMap = new Map();
    formattedConcepts.forEach(concept => {
      conceptMap.set(concept.id, concept);
    });

    const rootConcepts = [];
    formattedConcepts.forEach(concept => {
      if (concept.parent_id) {
        const parent = conceptMap.get(concept.parent_id);
        if (parent) {
          parent.children.push(concept);
        }
      } else {
        rootConcepts.push(concept);
      }
    });

    res.json({
      success: true,
      data: rootConcepts
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark a concept as completed
router.post('/concepts/:id/complete', [
  param('id').isUUID().withMessage('Invalid concept ID')
], async (req: any, res: express.Response) => {
  try {
    const conceptId = req.params.id;
    const userId = req.user.id;

    // Check if progress entry already exists
    const { data: existingProgress } = await supabase
      .from('user_concept_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('concept_id', conceptId)
      .single();

    let result;
    
    if (existingProgress) {
      // Update existing progress
      result = await supabase
        .from('user_concept_progress')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id)
        .select()
        .single();
    } else {
      // Create new progress entry
      result = await supabase
        .from('user_concept_progress')
        .insert([{
          user_id: userId,
          concept_id: conceptId,
          is_completed: true,
          completed_at: new Date().toISOString()
        }])
        .select()
        .single();
    }

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: result.error.message
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create a new concept
router.post('/concepts', [
  body('courseId').isUUID().withMessage('Invalid course ID'),
  body('name').isString().notEmpty().withMessage('Concept name is required'),
  body('description').optional().isString(),
  body('parentId').optional().isUUID().withMessage('Invalid parent concept ID'),
  body('resourceLinks').optional().isArray()
], async (req: any, res: express.Response) => {
  try {
    const { courseId, name, description, parentId, resourceLinks } = req.body;

    // Create new concept
    const { data, error } = await supabase
      .from('concepts')
      .insert([{
        course_id: courseId,
        parent_id: parentId || null,
        name,
        description,
        resource_links: resourceLinks || []
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;