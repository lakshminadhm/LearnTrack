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
    const { data, error } = await supabase
      .from('courses')
      .select('*, learning_tracks(title)')
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

    const { data, error } = await supabase
      .from('concepts')
      .select('*')
      .eq('course_id', id)
      .order('order_number', { ascending: true });

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

// Create concept
router.post('/concepts', [
  body('course_id').isUUID().withMessage('Valid course ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('order_number').isInt({ min: 1 }).withMessage('Valid order number is required'),
  body('description').optional(),
  body('resource_link').optional().isURL().withMessage('Valid URL is required')
], async (req: express.Request, res: express.Response) => {
  try {
    const { course_id, title, description, resource_link, order_number } = req.body;

    const { data, error } = await supabase
      .from('concepts')
      .insert([{
        course_id,
        title,
        description,
        resource_link,
        order_number
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

// Update concept
router.put('/concepts/:id', [
  param('id').isUUID().withMessage('Invalid concept ID'),
  body('course_id').isUUID().withMessage('Valid course ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('order_number').isInt({ min: 1 }).withMessage('Valid order number is required'),
  body('description').optional(),
  body('resource_link').optional().isURL().withMessage('Valid URL is required')
], async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { course_id, title, description, resource_link, order_number } = req.body;

    const { data, error } = await supabase
      .from('concepts')
      .update({
        course_id,
        title,
        description,
        resource_link,
        order_number
      })
      .eq('id', id)
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
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;