// User API Routes - User-facing functionality
import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get current user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated.'
      });
      return;
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, authUser.id));
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.'
      });
      return;
    }
    
    const { password, ...safeUser } = user;
    
    res.json({
      success: true,
      data: { user: safeUser }
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated.'
      });
      return;
    }
    
    const { firstName, lastName } = req.body;
    
    const [updatedUser] = await db.update(users)
      .set({
        firstName,
        lastName,
        updatedAt: new Date()
      })
      .where(eq(users.id, authUser.id))
      .returning();
    
    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found.'
      });
      return;
    }
    
    const { password, ...safeUser } = updatedUser;
    
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: safeUser }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
