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

export default router;