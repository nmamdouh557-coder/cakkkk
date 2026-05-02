import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Forbidden: Invalid token' });
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};

// --- AUTH ROUTES ---

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt for user: ${username}`);
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    // Don't send password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error: any) {
    console.error('CRITICAL Login error:', error.message || error);
    res.status(500).json({ 
      error: 'Login failed', 
      details: process.env.NODE_ENV === 'production' ? 'Database connection error' : error.message 
    });
  }
});

// Health check to verify DB
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', database: error.message });
  }
});

// Seed admin account
const seedAdmin = async () => {
  try {
    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          displayName: 'System Admin',
          email: 'admin@swish.local',
          role: 'admin'
        }
      });
      console.log('Admin account created: admin / admin123');
    }
  } catch (e) {
    console.error('Failed to seed admin:', e);
  }
};

// --- OFFER ROUTES ---

app.get('/api/offers', authenticateToken, async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { displayName: true } } }
    });
    res.json(offers);
  } catch (error) {
    console.error('Failed to fetch offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

app.post('/api/offers', authenticateToken, async (req, res) => {
  const { brand, title, description, productPrice, startDate, endDate, imageUrl, status } = req.body;
  const userId = (req as any).user?.id;
  
  console.log('Creating offer attempt:', { 
    brand, 
    title, 
    userId,
    hasStartDate: !!startDate,
    hasEndDate: !!endDate 
  });

  if (!userId) {
    return res.status(401).json({ error: 'User ID missing from token' });
  }

  try {
    // Verify user exists first to provide better error
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error(`User with ID ${userId} not found in database.`);
      return res.status(401).json({ error: 'Your session is invalid. Please log out and log in again.' });
    }

    const offer = await prisma.offer.create({
      data: {
        brand: brand || '',
        title: title || '',
        description: description || '',
        productPrice: productPrice ? String(productPrice) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        imageUrl: imageUrl || null,
        status: status || 'active',
        createdBy: userId
      }
    });
    
    console.log('Offer created successfully:', offer.id);
    // Background task
    createNotification('New Offer Added', `${brand}: ${title}`, 'new_offer').catch(err => {
      console.error('Deferred notification failed:', err);
    });
    
    res.status(201).json(offer);
  } catch (error: any) {
    console.error('Failed to create offer. Full error:', error);
    res.status(500).json({ 
      error: 'Failed to create offer', 
      details: error.message,
      prismaCode: error.code
    });
  }
});

app.put('/api/offers/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  console.log(`Updating offer ${id}:`, { brand: data.brand, title: data.title });
  
  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);

  try {
    const offer = await prisma.offer.update({
      where: { id },
      data: {
        ...data,
        productPrice: data.productPrice ? String(data.productPrice) : null,
      }
    });

    console.log(`Offer ${id} updated.`);
    await createNotification('Offer Updated', `${offer.brand}: ${offer.title}`, 'update_offer');

    res.json(offer);
  } catch (error: any) {
    console.error(`Failed to update offer ${id}:`, error);
    res.status(500).json({ error: 'Failed to update offer', details: error.message });
  }
});

app.delete('/api/offers/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.offer.delete({ where: { id } });
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Failed to delete offer:', error);
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});

// --- USER ROUTES ---

app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, displayName: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', authenticateToken, isAdmin, async (req, res) => {
  const { username, password, displayName, email, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, displayName, email, role }
    });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// --- NOTIFICATION ROUTES ---

app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        users: {
          where: { userId: (req as any).user.id },
          select: { read: true }
        }
      }
    });

    const formattedNotifications = notifications.map(n => ({
      ...n,
      read: n.users[0]?.read || false,
      users: undefined
    }));

    res.json(formattedNotifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.post('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  try {
    await prisma.notificationUser.upsert({
      where: { notificationId_userId: { notificationId: id, userId } },
      update: { read: true },
      create: { notificationId: id, userId, read: true }
    });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Helper to create notification for all users
const createNotification = async (title: string, message: string, type: 'new_offer' | 'update_offer') => {
  try {
    const notification = await prisma.notification.create({
      data: { title, message, type }
    });
    
    const users = await prisma.user.findMany({ select: { id: true } });
    await prisma.notificationUser.createMany({
      data: users.map(u => ({
        notificationId: notification.id,
        userId: u.id,
        read: false
      }))
    });
  } catch (e) {
    console.error('Failed to create notification:', e);
  }
};

// --- VITE SETUP ---

async function startServer() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }

  await seedAdmin();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
