import express from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../index';
import { Log, LogCreate } from '../../../shared/src/types';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a log
router.post(
  '/',
  [
    body('date').isDate().withMessage('Valid date is required'),
    body('technology').notEmpty().withMessage('Technology is required'),
    body('hours_spent').isFloat({ min: 0.1 }).withMessage('Hours spent must be a positive number'),
    body('notes').optional()
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
      const logData: LogCreate = req.body;
      const userId = req.user.id;

      // Insert log into database
      const { data, error } = await supabase
        .from('daily_logs')
        .insert([
          {
            user_id: userId,
            date: logData.date,
            technology: logData.technology,
            hours_spent: logData.hours_spent,
            notes: logData.notes || ''
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

// Get all logs for the authenticated user
router.get('/', async (req: any, res: express.Response) => {
  try {
    const userId = req.user.id;

    // Get logs from database (limit to 50 for free tier constraints)
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
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

// Update a log
router.put(
  '/:id',
  [
    body('date').isDate().withMessage('Valid date is required'),
    body('technology').notEmpty().withMessage('Technology is required'),
    body('hours_spent').isFloat({ min: 0.1 }).withMessage('Hours spent must be a positive number'),
    body('notes').optional()
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
      const logId = req.params.id;
      const userId = req.user.id;
      const logData: LogCreate = req.body;

      // Verify the log belongs to the user
      const { data: existingLog, error: fetchError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('id', logId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !existingLog) {
        return res.status(404).json({
          success: false,
          error: 'Log not found'
        });
      }

      // Update the log
      const { data, error } = await supabase
        .from('daily_logs')
        .update({
          date: logData.date,
          technology: logData.technology,
          hours_spent: logData.hours_spent,
          notes: logData.notes || ''
        })
        .eq('id', logId)
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

// Delete a log
router.delete('/:id', async (req: any, res: express.Response) => {
  try {
    const logId = req.params.id;
    const userId = req.user.id;

    // Verify the log belongs to the user
    const { data: existingLog, error: fetchError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('id', logId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingLog) {
      return res.status(404).json({
        success: false,
        error: 'Log not found'
      });
    }

    // Delete the log
    const { error } = await supabase
      .from('daily_logs')
      .delete()
      .eq('id', logId)
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