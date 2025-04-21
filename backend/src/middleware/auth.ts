import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../index';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No token provided'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { id: string; email: string };
    
    // Check if user exists in Supabase
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', decoded.id)
      .single();
    
    if (error || !data) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid token'
      });
    }
    
    // Attach user to request
    req.user = {
      id: data.id,
      email: data.email
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid token'
    });
  }
};