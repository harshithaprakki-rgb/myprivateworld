import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  createUser,
  loginUser,
  logoutSession,
  verifySession,
  updateUserProfile,
  getUserPages,
  createPage,
  updatePage,
  deletePage,
  getUserMemories,
  createMemory,
  deleteMemory,
  getUserSecrets,
  createSecret,
  deleteSecret,
  getUserDreams,
  createDream,
  deleteDream,
  getUserUnknownLetters,
  createUnknownLetter,
  deleteUnknownLetter,
  saveUserMedia,
  getUserMediaPath,
  User,
} from './src/server/storage.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

export interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
}

// Authentication Middleware with strict authorization
const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.headers['x-auth-token'] as string) || (req.query.token as string);

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in to view your private world.' });
    return;
  }

  const user = verifySession(token);
  if (!user) {
    res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    return;
  }

  req.user = user;
  req.token = token;
  next();
};

// ======================= AUTH ROUTES =======================

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, acceptTerms } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Please enter your full name (minimum 2 characters).' });
      return;
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    if (!acceptTerms) {
      res.status(400).json({ error: 'You must accept the terms of service and privacy agreement.' });
      return;
    }

    const { user, token } = createUser({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      profile: user.profile,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      message: 'Account created successfully! Welcome to your private world.',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed.' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const { user, token } = loginUser(email.trim(), password);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      profile: user.profile,
      createdAt: user.createdAt,
    };

    res.json({
      message: 'Welcome back.',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Invalid email or password.' });
  }
});

// Current User
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      profile: user.profile,
      createdAt: user.createdAt,
    },
  });
});

// Logout
app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res) => {
  if (req.token) {
    logoutSession(req.token);
  }
  res.json({ message: 'Logged out successfully.' });
});

// Forgot Password Request
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Please enter your account email.' });
    return;
  }
  // In a simulated or production setting, confirm dispatch without leaking email existence
  res.json({
    message: 'If an account exists with this email, password reset instructions have been dispatched to your inbox.',
  });
});

// ======================= USER PROFILE ROUTES =======================

// Update Profile & Scrapbook Aesthetic
app.put('/api/user/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { name, profile } = req.body;

    const updatedUser = updateUserProfile(userId, profile || {}, name);

    res.json({
      message: 'Profile and diary preferences saved.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isEmailVerified: updatedUser.isEmailVerified,
        profile: updatedUser.profile,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update profile.' });
  }
});

// ======================= SCRAPBOOK PAGES ROUTES =======================

// List User's Pages (Strictly isolated to req.user.id)
app.get('/api/diary/pages', requireAuth, (req: AuthenticatedRequest, res) => {
  const pages = getUserPages(req.user!.id);
  res.json({ pages });
});

// Create Page
app.post('/api/diary/pages', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const page = createPage(req.user!.id, req.body);
    res.status(201).json({ page });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create scrapbook page.' });
  }
});

// Update Page
app.put('/api/diary/pages/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const page = updatePage(req.user!.id, req.params.id, req.body);
    res.json({ page });
  } catch (error: any) {
    res.status(404).json({ error: error.message || 'Page not found.' });
  }
});

// Delete Page
app.delete('/api/diary/pages/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const success = deletePage(req.user!.id, req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Page not found or already deleted.' });
    return;
  }
  res.json({ message: 'Page removed from scrapbook.' });
});

// ======================= PHOTO MEMORIES ROUTES =======================

// Get Photo Memories
app.get('/api/diary/memories', requireAuth, (req: AuthenticatedRequest, res) => {
  const memories = getUserMemories(req.user!.id);
  res.json({ memories });
});

// Create Photo Memory
app.post('/api/diary/memories', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const memory = createMemory(req.user!.id, req.body);
    res.status(201).json({ memory });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to preserve memory.' });
  }
});

// Delete Photo Memory
app.delete('/api/diary/memories/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const success = deleteMemory(req.user!.id, req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Memory not found.' });
    return;
  }
  res.json({ message: 'Memory removed.' });
});

// ======================= SECRET NOTES ROUTES =======================

// Get Secret Notes
app.get('/api/diary/secrets', requireAuth, (req: AuthenticatedRequest, res) => {
  const secrets = getUserSecrets(req.user!.id);
  res.json({ secrets });
});

// Create Secret Note
app.post('/api/diary/secrets', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const secret = createSecret(req.user!.id, req.body);
    res.status(201).json({ secret });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to seal secret.' });
  }
});

// Delete Secret Note
app.delete('/api/diary/secrets/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const success = deleteSecret(req.user!.id, req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Secret not found.' });
    return;
  }
  res.json({ message: 'Secret destroyed.' });
});

// ======================= DREAMS & FUTURE LETTERS ROUTES =======================

// Get Dreams
app.get('/api/diary/dreams', requireAuth, (req: AuthenticatedRequest, res) => {
  const dreams = getUserDreams(req.user!.id);
  res.json({ dreams });
});

// Create Dream
app.post('/api/diary/dreams', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const dream = createDream(req.user!.id, req.body);
    res.status(201).json({ dream });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to record dream.' });
  }
});

// Delete Dream
app.delete('/api/diary/dreams/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const success = deleteDream(req.user!.id, req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Entry not found.' });
    return;
  }
  res.json({ message: 'Dream entry removed.' });
});

// ======================= DEAR UNKNOWN LETTERS ROUTES =======================

// Get Dear Unknown Letters
app.get('/api/diary/dear-unknown', requireAuth, (req: AuthenticatedRequest, res) => {
  const letters = getUserUnknownLetters(req.user!.id);
  res.json({ letters });
});

// Create Dear Unknown Letter
app.post('/api/diary/dear-unknown', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const letter = createUnknownLetter(req.user!.id, req.body);
    res.status(201).json({ letter });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to release letter to stars.' });
  }
});

// Delete Dear Unknown Letter
app.delete('/api/diary/dear-unknown/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const success = deleteUnknownLetter(req.user!.id, req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Letter not found.' });
    return;
  }
  res.json({ message: 'Letter dissolved from starlight.' });
});

// ======================= PRIVATE FILE UPLOAD & STORAGE =======================

// Upload Private Photo / Attachment
app.post('/api/diary/upload', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      res.status(400).json({ error: 'Image data URL is required.' });
      return;
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ error: 'Invalid base64 image format.' });
      return;
    }

    const buffer = Buffer.from(matches[2], 'base64');
    const mediaUrl = saveUserMedia(req.user!.id, filename || 'photo.jpg', buffer);

    res.status(201).json({ url: mediaUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'File upload failed.' });
  }
});

// Serve Private User Media (Strictly guarded by requireAuth & user ID isolation)
app.get('/api/diary/media/:userId/:filename', requireAuth, (req: AuthenticatedRequest, res) => {
  // Strict Row-Level Security: Only the owner can view their media
  if (req.user!.id !== req.params.userId) {
    res.status(403).json({ error: 'Forbidden: You cannot access another person’s private photos.' });
    return;
  }

  const filePath = getUserMediaPath(req.params.userId, req.params.filename);
  if (!filePath) {
    res.status(404).json({ error: 'File not found.' });
    return;
  }

  res.sendFile(filePath);
});

// Export Private Scrapbook (Complete Archive)
app.get('/api/diary/export', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const user = req.user!;
  const pages = getUserPages(userId);
  const memories = getUserMemories(userId);
  const secrets = getUserSecrets(userId);
  const dreams = getUserDreams(userId);

  const exportData = {
    exportDate: new Date().toISOString(),
    owner: {
      name: user.name,
      email: user.email,
      diaryTitle: user.profile.diaryTitle,
    },
    pages,
    memories,
    secrets,
    dreams,
  };

  res.setHeader('Content-Disposition', `attachment; filename="${user.name.replace(/\s+/g, '_')}_private_world_archive.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(exportData, null, 2));
});

// ======================= FRONTEND SPA INTEGRATION =======================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
