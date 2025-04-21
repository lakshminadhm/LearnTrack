import express from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../index';
import { Goal, GoalCreate, GoalStatus } from '../../../shared/src/types';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a goal
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('target_date').isDate().withMessage('Valid target date is required'),
    body('technology').notEmpty().withMessage('Technology is required'),
    body('status').isIn(Object.values(GoalStatus)).withMessage('Valid status is required'),
    body('description').optional()
  ],
  async (req: any, res: express.Response) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    try {
      const goalData: GoalCreate = req.body;
      const userId = req.user.id;

      // Insert goal into database
      const { data, error } = await supabase
        .from('goals')
        .insert([
          {
            user_id: userId,
            title: goalData.title,
            description: goalData.description || '',
            target_date: goalData.target_date,
            technology: goalData.technology,
            status: goalData.status
          }
        ])
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

// Get all goals for the authenticated user
router.get('/', async (req: any, res: express.Response) => {
  try {
    const userId = req.user.id;

    // Get goals from database (limit to 50 for free tier constraints)
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('target_date', { ascending: true })
      .limit(50);

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

// Update a goal
router.put(
  '/:id',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('target_date').isDate().withMessage('Valid target date is required'),
    body('technology').notEmpty().withMessage('Technology is required'),
    body('status').isIn(Object.values(GoalStatus)).withMessage('Valid status is required'),
    body('description').optional()
  ],
  async (req: any, res: express.Response) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    try {
      const goalId = req.params.id;
      const userId = req.user.id;
      const goalData: GoalCreate = req.body;

      // Verify the goal belongs to the user
      const { data: existingGoal, error: fetchError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !existingGoal) {
        return res.status(404).json({
          success: false,
          error: 'Goal not found'
        });
      }

      // Update the goal
      const { data, error } = await supabase
        .from('goals')
        .update({
          title: goalData.title,
          description: goalData.description || '',
          target_date: goalData.target_date,
          technology: goalData.technology,
          status: goalData.status
        })
        .eq('id', goalId)
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
  }
);

// Delete a goal
router.delete('/:id', async (req: any, res: express.Response) => {
  try {
    const goalId = req.params.id;
    const userId = req.user.id;

    // Verify the goal belongs to the user
    const { data: existingGoal, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingGoal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    // Delete the goal
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

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