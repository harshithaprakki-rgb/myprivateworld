import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Volume2, VolumeX, LogOut, Settings, Plus } from 'lucide-react';
import { audio } from '../utils/audio.ts';
import {
  HaloTabs,
  HaloTabsList,
  HaloTabsTrigger,
  HaloTabsIndicator,
} from './ui/halo-tabs.tsx';

interface NavigationProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenNewPage?: () => void;
  onOpenMemories?: () => void;
  onOpenSecrets?: () => void;
  onOpenDreams?: () => void;
  onOpenSettings?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  onOpenAuth,
  onOpenNewPage,
  onOpenMemories,
  onOpenSecrets,
  onOpenDreams,
  onOpenSettings,
  activeTab = 'diary',
  setActiveTab,
}) => {
  const { user, logout } = useAuth();
  const [muted, setMuted] = useState(audio.getIsMuted());
  const [landingSection, setLandingSection] = useState('scrapbook');

  const handleToggleSound = () => {
    const isNowMuted = audio.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      audio.playChime(783.99); // G5 gentle chime
    }
  };

  const isUnknownNight = activeTab === 'unknown' || (!user && landingSection === 'unknown');

  const handleAuthTabChange = (val: string) => {
    setActiveTab?.(val);
    audio.playChime(659.25);
    if (val === 'memories') onOpenMemories?.();
    else if (val === 'secrets') onOpenSecrets?.();
    else if (val === 'dreams') onOpenDreams?.();
  };

  const handlePublicTabChange = (val: string) => {
    setLandingSection(val);
    setActiveTab?.(val);
    audio.playChime(587.33);
    if (val !== 'unknown') {
      const targetElement = document.getElementById(val);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md px-6 lg:px-12 py-3 transition-colors duration-300 ${
        isUnknownNight
          ? 'bg-[#100d20]/90 border-b border-white/10 text-white'
          : 'bg-[#F7F0E5]/90 border-b border-[#EADCC8] text-[#49372E]'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark (Single text element in display serif) */}
        <button
          onClick={() => {
            setActiveTab?.('diary');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`text-2xl font-serif-vintage tracking-normal font-semibold hover:opacity-85 transition-opacity whitespace-nowrap shrink-0 text-left ${
            isUnknownNight ? 'text-[#ffc9e7]' : 'text-[#49372E]'
          }`}
        >
          {isUnknownNight ? 'Dear Unknown ♡' : 'My Private World'}
        </button>

        {/* Zone 2: HaloTabs Navigation with animated sliding indicator */}
        <nav className="hidden md:flex items-center justify-center">
          {user ? (
            <HaloTabs
              value={activeTab}
              onValueChange={handleAuthTabChange}
              variant="pill"
            >
              <HaloTabsList
                variant="pill"
                className={`px-1 py-1 border transition-colors ${
                  isUnknownNight
                    ? 'bg-white/10 border-white/15'
                    : 'bg-[#EADCC8]/50 border-[#8B6F5E]/20'
                }`}
              >
                <HaloTabsTrigger
                  value="diary"
                  className={`font-medium text-xs lg:text-sm ${
                    isUnknownNight ? 'text-white/70 hover:text-white' : ''
                  }`}
                >
                  My Diary
                </HaloTabsTrigger>
                <HaloTabsTrigger
                  value="memories"
                  className={`font-medium text-xs lg:text-sm ${
                    isUnknownNight ? 'text-white/70 hover:text-white' : ''
                  }`}
                >
                  Photo Memories
                </HaloTabsTrigger>
                <HaloTabsTrigger
                  value="secrets"
                  className={`font-medium text-xs lg:text-sm ${
                    isUnknownNight ? 'text-white/70 hover:text-white' : ''
                  }`}
                >
                  Secret Vault
                </HaloTabsTrigger>
                <HaloTabsTrigger
                  value="dreams"
                  className={`font-medium text-xs lg:text-sm ${
                    isUnknownNight ? 'text-white/70 hover:text-white' : ''
                  }`}
                >
                  Dreams & Letters
                </HaloTabsTrigger>
                <HaloTabsTrigger
                  value="unknown"
                  className={`font-medium text-xs lg:text-sm ${
                    isUnknownNight ? 'text-[#ffc9e7] font-semibold' : ''
                  }`}
                >
                  Dear Unknown ♡
                </HaloTabsTrigger>
                <HaloTabsIndicator
                  variant="pill"
                  className={
                    isUnknownNight
                      ? 'bg-white/20 text-white shadow-sm border border-white/20'
                      : 'bg-[#FAF6F0] text-[#49372E] shadow-sm border border-[#8B6F5E]/15'
                  }
                />
              </HaloTabsList>
            </HaloTabs>
          ) : (
            <HaloTabs
              value={landingSection}
              onValueChange={handlePublicTabChange}
              variant="pill"
            >
              <HaloTabsList
                variant="pill"
                className={`px-1 py-1 border transition-colors ${
                  isUnknownNight
                    ? 'bg-white/10 border-white/15'
                    : 'bg-[#EADCC8]/40 border-[#8B6F5E]/20'
                }`}
              >
                <HaloTabsTrigger
                  value="scrapbook"
                  className={`font-medium text-xs lg:text-sm ${
                    isUnknownNight ? 'text-white/70 hover:text-white' : ''
                  }`}
                >
                  Scrapbook
                </HaloTabsTrigger>
                <HaloTabsTrigger
                  value="unknown"
                  className={`font-medium text-xs lg:text-sm ${
                    isUnknownNight ? 'text-[#ffc9e7] font-semibold' : ''
                  }`}
                >
                  Dear Unknown ♡
                </HaloTabsTrigger>
                <HaloTabsTrigger
                  value="memories"
                  className={`font-medium text-xs lg:text-sm ${
                    isUnknownNight ? 'text-white/70 hover:text-white' : ''
                  }`}
                >
                  Memories
                </HaloTabsTrigger>
                <HaloTabsTrigger
                  value="vault"
                  className={`font-medium text-xs lg:text-sm ${
                    isUnknownNight ? 'text-white/70 hover:text-white' : ''
                  }`}
                >
                  Private Vault
                </HaloTabsTrigger>
                <HaloTabsTrigger
                  value="privacy"
                  className={`font-medium text-xs lg:text-sm ${
                    isUnknownNight ? 'text-white/70 hover:text-white' : ''
                  }`}
                >
                  Account Isolation
                </HaloTabsTrigger>
                <HaloTabsIndicator
                  variant="pill"
                  className={
                    isUnknownNight
                      ? 'bg-white/20 text-white shadow-sm border border-white/20'
                      : 'bg-[#FAF6F0] text-[#49372E] shadow-sm border border-[#8B6F5E]/15'
                  }
                />
              </HaloTabsList>
            </HaloTabs>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action Point (+ quiet utilities) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggleSound}
            title={muted ? 'Unmute paper sounds' : 'Mute paper sounds'}
            aria-label="Toggle paper sound effects"
            className={`p-2 rounded-lg transition-colors ${
              isUnknownNight
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-[#8B6F5E] hover:text-[#49372E] hover:bg-[#EADCC8]/50'
            }`}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSettings}
                title="Personalize Diary & Cover"
                aria-label="Personalize Diary"
                className={`p-2 rounded-lg transition-colors ${
                  isUnknownNight
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : 'text-[#8B6F5E] hover:text-[#49372E] hover:bg-[#EADCC8]/50'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenNewPage}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#d77eae] hover:bg-[#c76d9e] rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Page</span>
              </button>

              <button
                onClick={logout}
                title="Sign out of private diary"
                className="p-2 rounded-lg text-rose-300 hover:text-rose-100 hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className={`px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isUnknownNight ? 'text-white hover:text-pink-200' : 'text-[#49372E] hover:text-black'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className={`px-4 py-2 text-xs font-medium text-white rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 active:scale-98 ${
                  isUnknownNight
                    ? 'bg-[#d77eae] hover:bg-[#c76d9e] shadow-[0_0_15px_#d77eae]/50'
                    : 'bg-[#49372E] hover:bg-[#382a23]'
                }`}
              >
                Share Feelings ♡
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
