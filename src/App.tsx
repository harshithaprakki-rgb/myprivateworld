import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navigation } from './components/Navigation.tsx';
import { LandingHero } from './components/LandingHero.tsx';
import { Book3DViewer } from './components/Book3DViewer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { PageEditorModal } from './components/PageEditorModal.tsx';
import { PhotoMemoriesModal } from './components/PhotoMemoriesModal.tsx';
import { SecretVaultModal } from './components/SecretVaultModal.tsx';
import { DreamsModal } from './components/DreamsModal.tsx';
import { ProfileSettingsModal } from './components/ProfileSettingsModal.tsx';
import { DearUnknownSanctuary } from './components/DearUnknownSanctuary.tsx';
import { api, ScrapbookPage, PhotoMemory, SecretNote, DreamEntry } from './services/api.ts';
import { Feather, Heart, Lock, Sparkles, BookOpen } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<string>('diary');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [pageEditorOpen, setPageEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<ScrapbookPage | null>(null);
  const [memoriesModalOpen, setMemoriesModalOpen] = useState(false);
  const [secretsModalOpen, setSecretsModalOpen] = useState(false);
  const [dreamsModalOpen, setDreamsModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedMemoryForZoom, setSelectedMemoryForZoom] = useState<PhotoMemory | null>(null);

  // User Data State
  const [pages, setPages] = useState<ScrapbookPage[]>([]);
  const [memories, setMemories] = useState<PhotoMemory[]>([]);
  const [secrets, setSecrets] = useState<SecretNote[]>([]);
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Demo state for unauthenticated preview
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Sample demo user & pages if user tests demo before registering
  const demoUser = {
    id: 'demo_user',
    name: 'Eleanor Vance',
    email: 'eleanor@example.com',
    isEmailVerified: true,
    profile: {
      diaryTitle: "Eleanor's Secret Sanctuary",
      diarySubtitle: 'Every page holds a piece of me',
      ownerName: 'Eleanor Vance',
      bio: 'A quiet collector of autumn rain, pressed violets, and unspoken words.',
      coverTexture: 'leather' as const,
      accentColor: '#8B6F5E',
      fontStyle: 'cormorant' as const,
      ambientSound: 'none' as const,
    },
    createdAt: new Date().toISOString(),
  };

  const demoPages: ScrapbookPage[] = [
    {
      id: 'demo_pg_1',
      userId: 'demo_user',
      pageNumber: 1,
      chapterTitle: 'Prelude: The First Whisper',
      title: 'A Beginning in Ink and Paper',
      date: 'October 14th, 1996',
      weatherMood: 'Golden Dusk',
      inkColor: '#49372E',
      content:
        'I opened this journal when the afternoon light was turning everything amber. For a long time, I have wanted a place that belongs only to me—where thoughts do not need to perform, where sorrow can breathe softly, and where joy can be kept like dried rose petals inside heavy pages.\n\nHere, time slows down. Every photograph, every torn edge, and every written line will hold a fragment of my journey.',
      handwrittenNote: '“To write is to carve a quiet room out of the noise.”',
      quote: {
        text: 'We do not remember days, we remember moments.',
        author: 'Cesare Pavese',
      },
      stickers: [
        { id: 'stk_demo_1', type: 'dried_rose', x: 82, y: 16, rotation: 12, label: 'Wild Rose' },
        { id: 'stk_demo_2', type: 'tape', x: 22, y: 88, rotation: -4 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo_pg_2',
      userId: 'demo_user',
      pageNumber: 2,
      chapterTitle: 'Autumn Keepsakes',
      title: 'The Quiet Magic of Ordinary Days',
      date: 'October 16th, 1996',
      weatherMood: 'Gentle Rain',
      inkColor: '#3d2e27',
      content:
        'Rain pattered steadily against the glass today while hot steam rose from my cup. It felt as though the entire world had paused to catch its breath. I sat by the window watching the yellow leaves cling to wet branches before spiraling down.\n\nThere is a peculiar comfort in knowing that seasons change without our permission—that ending is just preparation for a gentle return.',
      handwrittenNote: 'Remember how the coffee smelled this morning.',
      stickers: [
        { id: 'stk_demo_3', type: 'pressed_flower', x: 18, y: 18, rotation: -8, label: 'Lavender' },
        { id: 'stk_demo_4', type: 'stamp', x: 82, y: 82, rotation: 6, label: 'Paris Airmail' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const demoMemories: PhotoMemory[] = [
    {
      id: 'demo_mem_1',
      userId: 'demo_user',
      title: 'Warm Windowsill & Coffee',
      date: 'October 14th',
      location: 'Old Attic Reading Nook',
      caption: 'Soft golden hour light touching the worn paperbacks. Nothing else mattered for an hour.',
      imageUrl: '/src/assets/images/polaroid_memory_sunset_1794426769115.jpg',
      tapeStyle: 'floral',
      rotation: -2,
      favorite: true,
      pageId: 'demo_pg_2',
      createdAt: new Date().toISOString(),
    },
  ];

  // Fetch all user records on authenticated login
  const fetchUserData = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [pagesRes, memoriesRes, secretsRes, dreamsRes] = await Promise.all([
        api.getPages(),
        api.getMemories(),
        api.getSecrets(),
        api.getDreams(),
      ]);
      setPages(pagesRes.pages);
      setMemories(memoriesRes.memories);
      setSecrets(secretsRes.secrets);
      setDreams(dreamsRes.dreams);
    } catch (err) {
      console.error('Failed to fetch user diary data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setIsDemoMode(false);
      fetchUserData();
    } else {
      setPages([]);
      setMemories([]);
      setSecrets([]);
      setDreams([]);
    }
  }, [user]);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenNewPage = () => {
    if (!user && !isDemoMode) {
      handleOpenAuth('register');
      return;
    }
    setEditingPage(null);
    setPageEditorOpen(true);
  };

  const handleEditPage = (page: ScrapbookPage) => {
    if (!user && !isDemoMode) {
      handleOpenAuth('login');
      return;
    }
    setEditingPage(page);
    setPageEditorOpen(true);
  };

  const handleSavePage = async (pageData: Partial<ScrapbookPage>) => {
    if (!user && isDemoMode) {
      // In demo mode, apply locally
      if (editingPage) {
        setPages(pages.map((p) => (p.id === editingPage.id ? { ...p, ...pageData } : p)));
      } else {
        const newDemoPage: ScrapbookPage = {
          id: `demo_${Date.now()}`,
          userId: 'demo_user',
          pageNumber: pages.length + 1,
          chapterTitle: pageData.chapterTitle || 'A Quiet Chapter',
          title: pageData.title || 'Untitled Page',
          date: pageData.date || 'Today',
          weatherMood: pageData.weatherMood || 'Peaceful',
          inkColor: pageData.inkColor || '#49372E',
          content: pageData.content || '',
          handwrittenNote: pageData.handwrittenNote,
          quote: pageData.quote,
          stickers: pageData.stickers || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setPages([...pages, newDemoPage]);
      }
      return;
    }

    if (editingPage) {
      await api.updatePage(editingPage.id, pageData);
    } else {
      await api.createPage(pageData);
    }
    await fetchUserData();
  };

  const handleDeletePage = async (pageId: string) => {
    if (confirm('Tear out this page from your diary forever?')) {
      if (!user && isDemoMode) {
        setPages(pages.filter((p) => p.id !== pageId));
        return;
      }
      await api.deletePage(pageId);
      await fetchUserData();
    }
  };

  const handleViewMemory = (memory: PhotoMemory) => {
    setSelectedMemoryForZoom(memory);
    setMemoriesModalOpen(true);
  };

  const handleStartDemo = () => {
    setIsDemoMode(true);
    setPages(demoPages);
    setMemories(demoMemories);
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F0E5] text-[#49372E]">
      {/* Top Bar adhering to the Constitution contract */}
      <Navigation
        onOpenAuth={handleOpenAuth}
        onOpenNewPage={handleOpenNewPage}
        onOpenMemories={() => setMemoriesModalOpen(true)}
        onOpenSecrets={() => setSecretsModalOpen(true)}
        onOpenDreams={() => setDreamsModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab as any)}
      />

      {/* Main Dynamic View */}
      <main className="flex-1">
        {activeTab === 'unknown' ? (
          <DearUnknownSanctuary user={user} onOpenAuth={handleOpenAuth} />
        ) : user ? (
          /* AUTHENTICATED USER PRIVATE WORLD */
          <div className="py-6 space-y-8 animate-in fade-in duration-300">
            {/* Private sanctuary header banner */}
            <div className="max-w-7xl mx-auto px-6 text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#8B6F5E] font-medium">
                Private Sanctuary of {user.name}
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif-vintage font-semibold text-[#49372E]">
                {user.profile.diaryTitle || `${user.name}'s World`}
              </h1>
              <p className="text-sm font-serif-vintage italic text-[#8B6F5E]">
                “{user.profile.diarySubtitle || 'Every page holds a piece of me'}”
              </p>
            </div>

            {/* 3D Realistic Scrapbook & Page Viewer */}
            <Book3DViewer
              user={user}
              pages={pages}
              memories={memories}
              onEditPage={handleEditPage}
              onNewPage={handleOpenNewPage}
              onDeletePage={handleDeletePage}
              onViewMemory={handleViewMemory}
              onOpenVault={() => setSecretsModalOpen(true)}
              onOpenDreams={() => setDreamsModalOpen(true)}
            />
          </div>
        ) : isDemoMode ? (
          /* DEMO PREVIEW WORLD FOR GUEST */
          <div className="py-6 space-y-8 animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto px-6 text-center space-y-3 bg-[#EADCC8]/50 p-4 rounded-xl border border-[#8B6F5E]/30">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#49372E]">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>Interactive Scrapbook Preview (Sample Sanctuary)</span>
              </div>
              <p className="text-xs text-[#8B6F5E]">
                You are currently exploring a sample journal. To preserve your own lifetime of memories, secrets, and photographs in an isolated private vault:
              </p>
              <button
                onClick={() => handleOpenAuth('register')}
                className="px-4 py-2 text-xs font-medium text-white bg-[#49372E] hover:bg-[#382a23] rounded-lg shadow-sm transition-all"
              >
                Create Your Account Now
              </button>
            </div>

            <Book3DViewer
              user={demoUser}
              pages={pages}
              memories={memories}
              onEditPage={handleEditPage}
              onNewPage={handleOpenNewPage}
              onDeletePage={handleDeletePage}
              onViewMemory={handleViewMemory}
              onOpenVault={() => setSecretsModalOpen(true)}
              onOpenDreams={() => setDreamsModalOpen(true)}
            />
          </div>
        ) : (
          /* PUBLIC LANDING PAGE */
          <LandingHero
            onOpenAuth={handleOpenAuth}
            onExploreDemo={handleStartDemo}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <footer
        className={`mt-auto border-t py-8 px-6 text-xs transition-colors duration-300 ${
          activeTab === 'unknown'
            ? 'bg-[#100d20] border-white/10 text-[#c9b3ce]'
            : 'bg-[#FAF6F0] border-[#EADCC8] text-[#8B6F5E]'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div
              className={`font-serif-vintage text-base font-semibold ${
                activeTab === 'unknown' ? 'text-[#ffc9e7]' : 'text-[#49372E]'
              }`}
            >
              {activeTab === 'unknown' ? 'Dear Unknown ♡' : 'My Private World'}
            </div>
            <p className="italic font-serif-vintage">
              {activeTab === 'unknown'
                ? '“Made with love for every unheard heart ♡”'
                : '“Every page holds a piece of me.”'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <span>Encrypted Multi-User Isolation</span>
            <span aria-hidden="true">·</span>
            <span>No Public Feeds</span>
            <span aria-hidden="true">·</span>
            <span>A Safe Place to Feel</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />

      <PageEditorModal
        isOpen={pageEditorOpen}
        page={editingPage}
        onClose={() => {
          setPageEditorOpen(false);
          setEditingPage(null);
        }}
        onSave={handleSavePage}
      />

      <PhotoMemoriesModal
        isOpen={memoriesModalOpen}
        memories={user ? memories : demoMemories}
        pages={pages}
        onClose={() => {
          setMemoriesModalOpen(false);
          setSelectedMemoryForZoom(null);
        }}
        onRefreshMemories={fetchUserData}
        selectedMemoryForZoom={selectedMemoryForZoom}
        onCloseZoom={() => setSelectedMemoryForZoom(null)}
      />

      <SecretVaultModal
        isOpen={secretsModalOpen}
        secrets={secrets}
        onClose={() => setSecretsModalOpen(false)}
        onRefreshSecrets={fetchUserData}
      />

      <DreamsModal
        isOpen={dreamsModalOpen}
        dreams={dreams}
        onClose={() => setDreamsModalOpen(false)}
        onRefreshDreams={fetchUserData}
      />

      <ProfileSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
