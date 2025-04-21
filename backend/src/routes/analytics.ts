import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../index';
import { calculateStreaks, calculateProgress, calculateTechBreakdown } from '../services/analytics';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// In-memory cache with expiration
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get streak data
router.get('/streaks', async (req: any, res: express.Response) => {
  try {
    const userId = req.user.id;
    const cacheKey = `streaks:${userId}`;
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return res.json({
        success: true,
        data: cachedData.data
      });
    }
    
    // Get logs from database
    const { data: logs, error } = await supabase
      .from('daily_logs')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Calculate streaks
    const streakData = calculateStreaks(logs.map(log => log.date));
    
    // Update cache
    cache.set(cacheKey, {
      data: streakData,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      data: streakData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get progress data
router.get('/progress', async (req: any, res: express.Response) => {
  try {
    const userId = req.user.id;
    const cacheKey = `progress:${userId}`;
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return res.json({
        success: true,
        data: cachedData.data
      });
    }
    
    // Get logs from database
    const { data: logs, error } = await supabase
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

    // Calculate progress
    const progressData = calculateProgress(logs);
    
    // Update cache
    cache.set(cacheKey, {
      data: progressData,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      data: progressData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get technology breakdown
router.get('/tech-breakdown', async (req: any, res: express.Response) => {
  try {
    const userId = req.user.id;
    const cacheKey = `tech-breakdown:${userId}`;
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return res.json({
        success: true,
        data: cachedData.data
      });
    }
    
    // Get logs from database
    const { data: logs, error } = await supabase
      .from('daily_logs')
      .select('technology, hours_spent')
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Calculate technology breakdown
    const techBreakdownData = calculateTechBreakdown(logs);
    
    // Update cache
    cache.set(cacheKey, {
      data: techBreakdownData,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      data: techBreakdownData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;