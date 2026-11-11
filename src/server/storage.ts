import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const MEDIA_DIR = path.join(DATA_DIR, 'media');

// Ensure storage directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  profile: {
    diaryTitle: string;
    diarySubtitle: string;
    ownerName: string;
    bio: string;
    coverTexture: 'leather' | 'parchment' | 'botanical' | 'velvet';
    accentColor: string;
    fontStyle: 'cormorant' | 'caveat' | 'sans';
    ambientSound: 'none' | 'music_box' | 'rain' | 'fireplace';
  };
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: number;
}

export interface ScrapbookPage {
  id: string;
  userId: string;
  pageNumber: number;
  chapterTitle: string;
  title: string;
  date: string;
  weatherMood: string;
  inkColor: string;
  content: string; // handwritten diary narrative
  handwrittenNote?: string;
  quote?: {
    text: string;
    author: string;
  };
  stickers: Array<{
    id: string;
    type: 'pressed_flower' | 'stamp' | 'wax_seal' | 'tape' | 'paperclip' | 'dried_rose';
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    rotation: number; // degrees
    label?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoMemory {
  id: string;
  userId: string;
  title: string;
  date: string;
  location?: string;
  caption: string;
  imageUrl: string;
  tapeStyle: 'floral' | 'kraft' | 'rose' | 'sage' | 'gold';
  rotation: number;
  favorite: boolean;
  pageId?: string;
  createdAt: string;
}

export interface SecretNote {
  id: string;
  userId: string;
  title: string;
  date: string;
  sealColor: 'crimson' | 'gold' | 'emerald' | 'navy';
  sealMonogram: string;
  isLockedWithPin: boolean;
  pinHash?: string;
  content: string;
  isRevealed: boolean;
  createdAt: string;
}

export interface DreamEntry {
  id: string;
  userId: string;
  type: 'dream' | 'future_letter';
  title: string;
  date: string;
  content: string;
  mood: string;
  unlockDate?: string; // For letters to future self
  isLocked: boolean;
  createdAt: string;
}

export interface DearUnknownLetter {
  id: string;
  userId: string;
  title: string;
  date: string;
  content: string;
  emotion: string;
  releasedToStars: boolean;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  sessions: Session[];
  pages: ScrapbookPage[];
  memories: PhotoMemory[];
  secrets: SecretNote[];
  dreams: DreamEntry[];
  unknownLetters?: DearUnknownLetter[];
}

function loadDB(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB: DatabaseSchema = {
      users: [],
      sessions: [],
      pages: [],
      memories: [],
      secrets: [],
      dreams: [],
      unknownLetters: [],
    };
    saveDB(initialDB);
    return initialDB;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.unknownLetters) parsed.unknownLetters = [];
    return parsed;
  } catch (err) {
    console.error('Error loading db.json, reinitializing:', err);
    return {
      users: [],
      sessions: [],
      pages: [],
      memories: [],
      secrets: [],
      dreams: [],
      unknownLetters: [],
    };
  }
}

function saveDB(db: DatabaseSchema) {
  const tempPath = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}

// Password cryptography
export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// User operations
export function findUserByEmail(email: string): User | undefined {
  const db = loadDB();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  const db = loadDB();
  return db.users.find((u) => u.id === id);
}

export function createUser(userData: {
  name: string;
  email: string;
  password: string;
}): { user: User; token: string } {
  const db = loadDB();
  const existing = findUserByEmail(userData.email);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(userData.password, salt);
  const userId = `usr_${crypto.randomUUID()}`;
  const verificationToken = generateToken();

  const newUser: User = {
    id: userId,
    name: userData.name,
    email: userData.email.toLowerCase().trim(),
    passwordHash,
    salt,
    isEmailVerified: true, // Auto-verified for instant seamless experience
    emailVerificationToken: verificationToken,
    profile: {
      diaryTitle: `${userData.name}'s Secret World`,
      diarySubtitle: 'Every page holds a piece of me',
      ownerName: userData.name,
      bio: 'A quiet sanctuary for memories, feelings, and timeless fragments of life.',
      coverTexture: 'leather',
      accentColor: '#8B6F5E',
      fontStyle: 'cormorant',
      ambientSound: 'none',
    },
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Initialize initial sample pages so the user has an immediate, gorgeous vintage starting book
  const samplePages: ScrapbookPage[] = [
    {
      id: `pg_${crypto.randomUUID()}`,
      userId: userId,
      pageNumber: 1,
      chapterTitle: 'Prelude: The First Whisper',
      title: 'A Beginning in Ink and Paper',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      weatherMood: 'Golden Dusk',
      inkColor: '#49372E',
      content: `I opened this journal when the afternoon light was turning everything amber. For a long time, I have wanted a place that belongs only to me—where thoughts do not need to perform, where sorrow can breathe softly, and where joy can be kept like dried rose petals inside heavy pages.\n\nHere, time slows down. Every photograph, every torn edge, and every written line will hold a fragment of my journey.`,
      handwrittenNote: '“To write is to carve a quiet room out of the noise.”',
      quote: {
        text: 'We do not remember days, we remember moments.',
        author: 'Cesare Pavese',
      },
      stickers: [
        { id: 'stk_1', type: 'dried_rose', x: 80, y: 15, rotation: 12, label: 'Wild Rose' },
        { id: 'stk_2', type: 'tape', x: 20, y: 88, rotation: -4 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `pg_${crypto.randomUUID()}`,
      userId: userId,
      pageNumber: 2,
      chapterTitle: 'Autumn Keepsakes',
      title: 'The Quiet Magic of Ordinary Days',
      date: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      weatherMood: 'Gentle Rain',
      inkColor: '#3d2e27',
      content: `Rain pattered steadily against the glass today while hot steam rose from my cup. It felt as though the entire world had paused to catch its breath. I sat by the window watching the yellow leaves cling to wet branches before spiraling down.\n\nThere is a peculiar comfort in knowing that seasons change without our permission—that ending is just preparation for a gentle return.`,
      handwrittenNote: 'Remember how the coffee smelled this morning.',
      stickers: [
        { id: 'stk_3', type: 'pressed_flower', x: 15, y: 18, rotation: -8, label: 'Lavender' },
        { id: 'stk_4', type: 'stamp', x: 82, y: 80, rotation: 6, label: 'Paris Airmail' },
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  db.pages.push(...samplePages);

  // Sample photo memory
  db.memories.push({
    id: `mem_${crypto.randomUUID()}`,
    userId: userId,
    title: 'Warm Windowsill & Coffee',
    date: 'October 14th',
    location: 'Old Attic Reading Nook',
    caption: 'Soft golden hour light touching the worn paperbacks. Nothing else mattered for an hour.',
    imageUrl: '/src/assets/images/polaroid_memory_sunset_1794426769115.jpg',
    tapeStyle: 'floral',
    rotation: -2,
    favorite: true,
    pageId: samplePages[1].id,
    createdAt: new Date().toISOString(),
  });

  // Sample secret note
  db.secrets.push({
    id: `sec_${crypto.randomUUID()}`,
    userId: userId,
    title: 'A Secret I Tell Only To The Night',
    date: 'Midnight Reflection',
    sealColor: 'crimson',
    sealMonogram: 'M',
    isLockedWithPin: false,
    content: 'Sometimes I pretend I have everything figured out, but in truth, I am just wandering toward beauty with an open heart. That is enough.',
    isRevealed: false,
    createdAt: new Date().toISOString(),
  });

  // Sample dream entry
  db.dreams.push({
    id: `drm_${crypto.randomUUID()}`,
    userId: userId,
    type: 'future_letter',
    title: 'To Myself One Year From Now',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    content: 'Dear future me, I hope you are softer with yourself. I hope you still stop to press flowers into heavy books, and I hope whatever worried you on this day has gently melted into wisdom.',
    mood: 'Hopeful & Tender',
    unlockDate: new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0],
    isLocked: true,
    createdAt: new Date().toISOString(),
  });

  // Create session
  const token = generateToken();
  const session: Session = {
    token,
    userId: newUser.id,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  db.sessions.push(session);

  saveDB(db);
  return { user: newUser, token };
}

export function loginUser(email: string, password: string): { user: User; token: string } {
  const user = findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const hash = hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    throw new Error('Invalid email or password.');
  }

  const db = loadDB();
  const token = generateToken();
  const session: Session = {
    token,
    userId: user.id,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  db.sessions.push(session);
  saveDB(db);

  return { user, token };
}

export function logoutSession(token: string) {
  const db = loadDB();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  saveDB(db);
}

export function verifySession(token: string): User | null {
  if (!token) return null;
  const db = loadDB();
  const session = db.sessions.find((s) => s.token === token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    // expired
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveDB(db);
    return null;
  }
  return db.users.find((u) => u.id === session.userId) || null;
}

export function updateUserProfile(userId: string, updates: Partial<User['profile']>, newName?: string): User {
  const db = loadDB();
  const userIndex = db.users.findIndex((u) => u.id === userId);
  if (userIndex === -1) throw new Error('User not found');

  if (newName) {
    db.users[userIndex].name = newName;
  }
  db.users[userIndex].profile = {
    ...db.users[userIndex].profile,
    ...updates,
  };

  saveDB(db);
  return db.users[userIndex];
}

// SCRAPBOOK PAGES (Strictly Isolated by userId)
export function getUserPages(userId: string): ScrapbookPage[] {
  const db = loadDB();
  return db.pages
    .filter((p) => p.userId === userId)
    .sort((a, b) => a.pageNumber - b.pageNumber);
}

export function createPage(userId: string, pageData: Partial<ScrapbookPage>): ScrapbookPage {
  const db = loadDB();
  const existingPages = db.pages.filter((p) => p.userId === userId);
  const nextNumber = existingPages.length > 0 ? Math.max(...existingPages.map((p) => p.pageNumber)) + 1 : 1;

  const newPage: ScrapbookPage = {
    id: `pg_${crypto.randomUUID()}`,
    userId,
    pageNumber: pageData.pageNumber || nextNumber,
    chapterTitle: pageData.chapterTitle || 'A Quiet Chapter',
    title: pageData.title || 'Untitled Page',
    date: pageData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    weatherMood: pageData.weatherMood || 'Pensive',
    inkColor: pageData.inkColor || '#49372E',
    content: pageData.content || '',
    handwrittenNote: pageData.handwrittenNote,
    quote: pageData.quote,
    stickers: pageData.stickers || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.pages.push(newPage);
  saveDB(db);
  return newPage;
}

export function updatePage(userId: string, pageId: string, updates: Partial<ScrapbookPage>): ScrapbookPage {
  const db = loadDB();
  const index = db.pages.findIndex((p) => p.id === pageId && p.userId === userId);
  if (index === -1) {
    throw new Error('Page not found or you do not have permission to access it.');
  }

  db.pages[index] = {
    ...db.pages[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveDB(db);
  return db.pages[index];
}

export function deletePage(userId: string, pageId: string): boolean {
  const db = loadDB();
  const initialLen = db.pages.length;
  db.pages = db.pages.filter((p) => !(p.id === pageId && p.userId === userId));
  if (db.pages.length !== initialLen) {
    // Re-number remaining pages for this user
    const userPages = db.pages.filter((p) => p.userId === userId).sort((a, b) => a.pageNumber - b.pageNumber);
    userPages.forEach((p, idx) => {
      p.pageNumber = idx + 1;
    });
    saveDB(db);
    return true;
  }
  return false;
}

// PHOTO MEMORIES (Strictly Isolated by userId)
export function getUserMemories(userId: string): PhotoMemory[] {
  const db = loadDB();
  return db.memories
    .filter((m) => m.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createMemory(userId: string, data: Partial<PhotoMemory>): PhotoMemory {
  const db = loadDB();
  const memory: PhotoMemory = {
    id: `mem_${crypto.randomUUID()}`,
    userId,
    title: data.title || 'Untitled Memory',
    date: data.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    location: data.location || '',
    caption: data.caption || '',
    imageUrl: data.imageUrl || '/src/assets/images/polaroid_memory_sunset_1794426769115.jpg',
    tapeStyle: data.tapeStyle || 'floral',
    rotation: data.rotation ?? Math.floor(Math.random() * 8) - 4,
    favorite: data.favorite ?? false,
    pageId: data.pageId,
    createdAt: new Date().toISOString(),
  };

  db.memories.push(memory);
  saveDB(db);
  return memory;
}

export function deleteMemory(userId: string, memoryId: string): boolean {
  const db = loadDB();
  const initial = db.memories.length;
  db.memories = db.memories.filter((m) => !(m.id === memoryId && m.userId === userId));
  saveDB(db);
  return db.memories.length !== initial;
}

// SECRET NOTES (Strictly Isolated by userId)
export function getUserSecrets(userId: string): SecretNote[] {
  const db = loadDB();
  return db.secrets
    .filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createSecret(userId: string, data: Partial<SecretNote>): SecretNote {
  const db = loadDB();
  const secret: SecretNote = {
    id: `sec_${crypto.randomUUID()}`,
    userId,
    title: data.title || 'A Whispered Thought',
    date: data.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    sealColor: data.sealColor || 'crimson',
    sealMonogram: (data.sealMonogram || 'S').slice(0, 1).toUpperCase(),
    isLockedWithPin: Boolean(data.pinHash),
    pinHash: data.pinHash,
    content: data.content || '',
    isRevealed: false,
    createdAt: new Date().toISOString(),
  };

  db.secrets.push(secret);
  saveDB(db);
  return secret;
}

export function deleteSecret(userId: string, secretId: string): boolean {
  const db = loadDB();
  const initial = db.secrets.length;
  db.secrets = db.secrets.filter((s) => !(s.id === secretId && s.userId === userId));
  saveDB(db);
  return db.secrets.length !== initial;
}

// DREAMS & FUTURE LETTERS (Strictly Isolated by userId)
export function getUserDreams(userId: string): DreamEntry[] {
  const db = loadDB();
  return db.dreams
    .filter((d) => d.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createDream(userId: string, data: Partial<DreamEntry>): DreamEntry {
  const db = loadDB();
  const isFutureLetter = data.type === 'future_letter';
  let isLocked = false;
  if (isFutureLetter && data.unlockDate) {
    const unlockTime = new Date(data.unlockDate).getTime();
    isLocked = unlockTime > Date.now();
  }

  const dream: DreamEntry = {
    id: `drm_${crypto.randomUUID()}`,
    userId,
    type: data.type || 'dream',
    title: data.title || (isFutureLetter ? 'Letter to Future Me' : 'A Midnight Dream'),
    date: data.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    content: data.content || '',
    mood: data.mood || 'Introspective',
    unlockDate: data.unlockDate,
    isLocked,
    createdAt: new Date().toISOString(),
  };

  db.dreams.push(dream);
  saveDB(db);
  return dream;
}

export function deleteDream(userId: string, dreamId: string): boolean {
  const db = loadDB();
  const initial = db.dreams.length;
  db.dreams = db.dreams.filter((d) => !(d.id === dreamId && d.userId === userId));
  saveDB(db);
  return db.dreams.length !== initial;
}

// DEAR UNKNOWN LETTERS (Strictly isolated by userId)
export function getUserUnknownLetters(userId: string): DearUnknownLetter[] {
  const db = loadDB();
  const list = db.unknownLetters || [];
  return list
    .filter((l) => l.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createUnknownLetter(userId: string, data: Partial<DearUnknownLetter>): DearUnknownLetter {
  const db = loadDB();
  if (!db.unknownLetters) db.unknownLetters = [];

  const letter: DearUnknownLetter = {
    id: `unk_${crypto.randomUUID()}`,
    userId,
    title: data.title || 'Dear Unknown...',
    date: data.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    content: data.content || '',
    emotion: data.emotion || 'Heart Whisper',
    releasedToStars: data.releasedToStars ?? true,
    createdAt: new Date().toISOString(),
  };

  db.unknownLetters.push(letter);
  saveDB(db);
  return letter;
}

export function deleteUnknownLetter(userId: string, letterId: string): boolean {
  const db = loadDB();
  if (!db.unknownLetters) return false;
  const initial = db.unknownLetters.length;
  db.unknownLetters = db.unknownLetters.filter((l) => !(l.id === letterId && l.userId === userId));
  saveDB(db);
  return db.unknownLetters.length !== initial;
}

// Save private user image
export function saveUserMedia(userId: string, filename: string, buffer: Buffer): string {
  const userMediaDir = path.join(MEDIA_DIR, userId);
  if (!fs.existsSync(userMediaDir)) {
    fs.mkdirSync(userMediaDir, { recursive: true });
  }

  const ext = path.extname(filename) || '.jpg';
  const safeName = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(userMediaDir, safeName);
  fs.writeFileSync(filePath, buffer);

  return `/api/diary/media/${userId}/${safeName}`;
}

export function getUserMediaPath(userId: string, filename: string): string | null {
  const userMediaDir = path.join(MEDIA_DIR, userId);
  const filePath = path.join(userMediaDir, filename);

  // Security guard against directory traversal
  if (!filePath.startsWith(userMediaDir)) {
    return null;
  }
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return filePath;
}
