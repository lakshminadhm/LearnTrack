import express from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../index';
import { Post, PostCreate } from '../../../shared/src/types';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// In-memory cache with expiration
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Create a post
router.post(
  '/posts',
  [
    body('content').notEmpty().withMessage('Content is required'),
    body('parent_id').optional()
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
      const postData: PostCreate = req.body;
      const userId = req.user.id;

      // Get username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', userId)
        .single();

      if (userError) {
        return res.status(500).json({
          success: false,
          error: userError.message
        });
      }

      // Insert post into database
      const { data, error } = await supabase
        .from('community_posts')
        .insert([
          {
            user_id: userId,
            content: postData.content,
            parent_id: postData.parent_id || null
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

      // Add username to response
      const fullPost = {
        ...data,
        username: userData.username
      };

      // Clear posts cache
      cache.delete(`posts:${userId}`);

      res.status(201).json({
        success: true,
        data: fullPost
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Create a reply to a post
router.post(
  '/posts/:id/reply',
  [
    body('content').notEmpty().withMessage('Content is required')
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
      const parentId = req.params.id;
      const { content } = req.body;
      const userId = req.user.id;

      // Verify parent post exists
      const { data: parentPost, error: fetchError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('id', parentId)
        .single();

      if (fetchError || !parentPost) {
        return res.status(404).json({
          success: false,
          error: 'Parent post not found'
        });
      }

      // Get username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', userId)
        .single();

      if (userError) {
        return res.status(500).json({
          success: false,
          error: userError.message
        });
      }

      // Insert reply into database
      const { data, error } = await supabase
        .from('community_posts')
        .insert([
          {
            user_id: userId,
            content,
            parent_id: parentId
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

      // Add username to response
      const fullPost = {
        ...data,
        username: userData.username
      };

      // Clear posts cache
      cache.delete(`posts:${userId}`);

      res.status(201).json({
        success: true,
        data: fullPost
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Get all posts (top level and replies)
router.get('/posts', async (req: any, res: express.Response) => {
  try {
    const userId = req.user.id;
    const cacheKey = `posts:${userId}`;
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return res.json({
        success: true,
        data: cachedData.data
      });
    }

    // Get all posts (limit to 50 for free tier constraints)
    const { data: posts, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Get usernames for all posts
    const userIds = [...new Set(posts.map(post => post.user_id))];
    
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .in('id', userIds);

    if (userError) {
      return res.status(500).json({
        success: false,
        error: userError.message
      });
    }

    // Create a map of userIds to usernames
    const usernameMap = new Map(users.map(user => [user.id, user.username]));

    // Add username to each post
    const postsWithUsernames = posts.map(post => ({
      ...post,
      username: usernameMap.get(post.user_id) || 'Anonymous User'
    }));
    
    // Update cache
    cache.set(cacheKey, {
      data: postsWithUsernames,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      data: postsWithUsernames
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;