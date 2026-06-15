import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

router.post('/sign-up', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // In a real app, hash the password
    const user = await prisma.user.create({
      data: { email, password, name },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.status(201).json({ message: 'User created successfully', user: { id: user.id, email: user.email, name: user.name } });
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/sign-in', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({ message: 'Signed in successfully', user: { id: user.id, email: user.email, name: user.name } });
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/sign-out', (_req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Signed out successfully' });
});

router.get('/me', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (_error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
