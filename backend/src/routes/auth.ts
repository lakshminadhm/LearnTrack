import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../index';
import { body, validationResult } from 'express-validator';
import { AuthResponse, UserCredentials, UserRegistration } from '../../../shared/src/types';

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('username').notEmpty().withMessage('Username is required')
  ],
  async (req: express.Request, res: express.Response) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    try {
      const { email, password, username }: UserRegistration = req.body;

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user in Supabase
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password: hashedPassword,
            username
          }
        ])
        .select()
        .single();

      if (error || !newUser) {
        return res.status(500).json({
          success: false,
          error: error?.message || 'Error creating user'
        });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '7d' }
      );

      // Return user and token
      const response: AuthResponse = {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          created_at: newUser.created_at,
          updated_at: newUser.updated_at
        },
        token
      };

      res.status(201).json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error during registration'
      });
    }
  }
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req: express.Request, res: express.Response) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    try {
      const { email, password }: UserCredentials = req.body;

      // Find user by email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '7d' }
      );

      // Return user and token
      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        token
      };

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error during login'
      });
    }
  }
);

// Logout (client-side only)
router.post('/logout', (req: express.Request, res: express.Response) => {
  // JWT tokens are stateless, so we just return success
  // The client should remove the token from storage
  res.json({
    success: true,
    data: null
  });
});

export default router;