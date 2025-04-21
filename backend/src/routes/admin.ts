import express from 'express';
import { body, param } from 'express-validator';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../index';

const router = express.Router();

// Test endpoint for debugging
router.get('/test', (req, res) => {
  return res.json({
    success: true,
    message: 'Admin API is working'
  });
});

// Apply auth middleware first, then admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all tracks
router.get('/tracks', async (req: express.Request, res: express.Response) => {
  try {
    const { data, error } = await supabase
      .from('learning_tracks')
      .select('*')
      .order('created_at', { ascending: false });

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

// Create track
router.post(
  '/tracks',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required')
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const { title, description } = req.body;

      const { data, error } = await supabase
        .from('learning_tracks')
        .insert([{ title, description }])
        .select()
        .single();

      if (error) {
        console.error('Error creating track:', error);
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
      console.error('Unexpected error in create track endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Update track
router.put(
  '/tracks/:id',
  [
    param('id').isUUID().withMessage('Invalid track ID'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required')
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const { title, description } = req.body;

      const { data, error } = await supabase
        .from('learning_tracks')
        .update({ title, description })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating track:', error);
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
      console.error('Unexpected error in update track endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Delete track
router.delete(
  '/tracks/:id',
  [param('id').isUUID().withMessage('Invalid track ID')],
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('learning_tracks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting track:', error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      res.json({
        success: true,
        data: null
      });
    } catch (error: any) {
      console.error('Unexpected error in delete track endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Get all courses
router.get('/courses', async (req: express.Request, res: express.Response) => {
  try {
    console.log('Admin courses endpoint accessed');
    const { data, error } = await supabase
      .from('courses')
      .select('*, learning_tracks(title)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
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
    console.error('Unexpected error in courses endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create course
router.post(
  '/courses',
  [
    body('track_id').isUUID().withMessage('Valid track ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('duration_hours').isInt({ min: 1 }).withMessage('Duration must be at least 1 hour'),
    body('difficulty').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty level')
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const { track_id, title, description, duration_hours, difficulty } = req.body;

      const { data, error } = await supabase
        .from('courses')
        .insert([{ track_id, title, description, duration_hours, difficulty }])
        .select()
        .single();

      if (error) {
        console.error('Error creating course:', error);
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
      console.error('Unexpected error in create course endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Update course
router.put(
  '/courses/:id',
  [
    param('id').isUUID().withMessage('Invalid course ID'),
    body('track_id').isUUID().withMessage('Valid track ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('duration_hours').isInt({ min: 1 }).withMessage('Duration must be at least 1 hour'),
    body('difficulty').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty level')
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const { track_id, title, description, duration_hours, difficulty } = req.body;

      const { data, error } = await supabase
        .from('courses')
        .update({ track_id, title, description, duration_hours, difficulty })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating course:', error);
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
      console.error('Unexpected error in update course endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Delete course
router.delete(
  '/courses/:id',
  [param('id').isUUID().withMessage('Invalid course ID')],
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting course:', error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      res.json({
        success: true,
        data: null
      });
    } catch (error: any) {
      console.error('Unexpected error in delete course endpoint:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Get concepts for a course
router.get('/courses/:id/concepts', [
  param('id').isUUID().withMessage('Invalid course ID')
], async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    console.log('Fetching concepts for course:', id);

    // Check if the concepts table exists and has the expected structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('concepts')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('Error checking concepts table:', tableError);
      return res.status(500).json({
        success: false,
        error: tableError.message
      });
    }

    // Get all concepts for the course
    const { data, error } = await supabase
      .from('concepts')
      .select('id, parent_id, course_id, name, description, resource_links, created_at, updated_at')
      .eq('course_id', id);

    if (error) {
      console.error('Error fetching concepts:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Transform the data to match the expected format in frontend
    const transformedData = data.map(concept => ({
      id: concept.id,
      parent_id: concept.parent_id,
      course_id: concept.course_id,
      title: concept.name,  // Map name to title
      description: concept.description,
      resource_link: concept.resource_links?.[0] || '', // Take the first resource link if available
      order_number: 1, // Default order number
      created_at: concept.created_at,
      updated_at: concept.updated_at
    }));

    res.json({
      success: true,
      data: transformedData
    });
  } catch (error: any) {
    console.error('Unexpected error in concepts endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create concept
router.post('/concepts', [
  body('course_id').isUUID().withMessage('Valid course ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('parent_id').optional().isUUID().withMessage('Parent ID must be a valid UUID'),
  body('description').optional(),
  body('resource_link').optional().isURL().withMessage('Valid URL is required'),
  body('order_number').optional().isInt({ min: 1 }).withMessage('Valid order number is required')
], async (req: express.Request, res: express.Response) => {
  try {
    const { course_id, title, description, resource_link, order_number, parent_id } = req.body;
    console.log('Creating concept with data:', req.body);

    // Transform the data to match the database schema
    const conceptData = {
      course_id,
      name: title, // Map title to name
      description,
      parent_id: parent_id || null,
      resource_links: resource_link ? [resource_link] : [] // Convert single link to array
    };

    const { data, error } = await supabase
      .from('concepts')
      .insert([conceptData])
      .select()
      .single();

    if (error) {
      console.error('Error creating concept:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Transform the response to match frontend expectations
    const transformedData = {
      id: data.id,
      parent_id: data.parent_id,
      course_id: data.course_id,
      title: data.name,
      description: data.description,
      resource_link: data.resource_links?.[0] || '',
      order_number: order_number || 1,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    res.status(201).json({
      success: true,
      data: transformedData
    });
  } catch (error: any) {
    console.error('Unexpected error in create concept endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update concept
router.put('/concepts/:id', [
  param('id').isUUID().withMessage('Invalid concept ID'),
  body('course_id').isUUID().withMessage('Valid course ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('resource_link').optional().isURL().withMessage('Valid URL is required'),
  body('order_number').optional().isInt({ min: 1 }).withMessage('Valid order number is required')
], async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { course_id, title, description, resource_link, order_number } = req.body;
    console.log('Updating concept with data:', req.body);

    // Transform the data to match the database schema
    const conceptData = {
      course_id,
      name: title, // Map title to name
      description,
      resource_links: resource_link ? [resource_link] : [] // Convert single link to array
    };

    const { data, error } = await supabase
      .from('concepts')
      .update(conceptData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating concept:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Transform the response to match frontend expectations
    const transformedData = {
      id: data.id,
      parent_id: data.parent_id,
      course_id: data.course_id,
      title: data.name,
      description: data.description,
      resource_link: data.resource_links?.[0] || '',
      order_number: order_number || 1,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    res.json({
      success: true,
      data: transformedData
    });
  } catch (error: any) {
    console.error('Unexpected error in update concept endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete concept
router.delete('/concepts/:id', [
  param('id').isUUID().withMessage('Invalid concept ID')
], async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('concepts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting concept:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: null
    });
  } catch (error: any) {
    console.error('Unexpected error in delete concept endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;