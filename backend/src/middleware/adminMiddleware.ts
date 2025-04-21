import { Request, Response, NextFunction } from 'express';
import { supabase } from '../index';

interface AdminRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export const adminMiddleware = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No user found'
      });
    }

    // Get user role from Supabase
    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !userData) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Could not verify role'
      });
    }

    if (userData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - Admin access required'
      });
    }

    // Add role to user object
    req.user.role = userData.role;
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error while checking admin role'
    });
  }
};