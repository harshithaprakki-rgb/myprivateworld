import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Settings, Download, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { audio } from '../utils/audio.ts';
import { getStoredToken } from '../services/api.ts';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COVER_TEXTURES = [
  {
    id: 'leather' as const,
    name: 'Antique Tooled Leather',
    desc: 'Deep brown weathered heirloom leather with gold filigree',
    thumb: '/src/assets/images/vintage_leather_cover_1794426767794.jpg',
  },
  {
    id: 'botanical' as const,
    name: 'Herbarium Botanicals',
    desc: 'Pressed dried roses and wildflowers on aged parchment',
    thumb: '/src/assets/images/pressed_botanical_flowers_1794426768859.jpg',
  },
  {
    id: 'parchment' as const,
    name: 'Vintage Deckle Parchment',
    desc: 'Cotton rag paper with tea-stained margins and postal marks',
    thumb: '/src/assets/images/vintage_ephemera_stamps_1794426768676.jpg',
  },
];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [diaryTitle, setDiaryTitle] = useState(user?.profile.diaryTitle || '');
  const [diarySubtitle, setDiarySubtitle] = useState(user?.profile.diarySubtitle || '');
  const [bio, setBio] = useState(user?.profile.bio || '');
  const [coverTexture, setCoverTexture] = useState(user?.profile.coverTexture || 'leather');
  const [ambientSound, setAmbientSound] = useState(user?.profile.ambientSound || 'none');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateProfile({
        name: name.trim(),
        profile: {
          diaryTitle: diaryTitle.trim() || `${name}'s Private World`,
          diarySubtitle: diarySubtitle.trim() || 'Every page holds a piece of me',
          bio: bio.trim(),
          coverTexture,
          ambientSound,
        },
      });
      audio.playChime(783.99);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } finally {
      setSaving(false);
    }
  };

  const handleExportArchive = () => {
    const token = getStoredToken();
    if (!token) return;
    const exportUrl = `/api/diary/export?token=${encodeURIComponent(token)}`;
    window.location.href = exportUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FAF6F0] rounded-2xl border border-[#EADCC8] shadow-2xl p-6 sm:p-8 text-[#49372E] parchment-texture my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EADCC8] mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-serif-vintage uppercase tracking-widest text-[#8B6F5E]">
              <Settings className="w-3.5 h-3.5" />
              <span>Personalization</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-vintage font-semibold text-[#49372E]">
              Diary Customization & Vault
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B6F5E] hover:text-[#49372E] hover:bg-[#EADCC8]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto flex-1 pr-2">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#49372E] mb-1">Owner Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#49372E] mb-1">Account Email</label>
                <input
                  type="text"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2 text-sm bg-[#EADCC8]/40 border border-[#8B6F5E]/20 rounded-lg text-[#8B6F5E] cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#49372E] mb-1">Diary Title</label>
                <input
                  type="text"
                  required
                  value={diaryTitle}
                  onChange={(e) => setDiaryTitle(e.target.value)}
                  placeholder="e.g. Eleanor's Secret Sanctuary"
                  className="w-full px-3.5 py-2 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#49372E] mb-1">
                  Diary Subtitle / Motto
                </label>
                <input
                  type="text"
                  value={diarySubtitle}
                  onChange={(e) => setDiarySubtitle(e.target.value)}
                  placeholder="e.g. Every page holds a piece of me"
                  className="w-full px-3.5 py-2 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#49372E] mb-1">
                Sanctuary Inscription / Bio
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A quiet description inscribed inside your front cover..."
                className="w-full px-3.5 py-2 text-sm font-serif-vintage italic bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
              />
            </div>

            {/* Cover Texture Selection */}
            <div>
              <label className="block text-xs font-medium text-[#49372E] mb-2">
                Hardcover Journal Aesthetic
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {COVER_TEXTURES.map((cov) => (
                  <div
                    key={cov.id}
                    onClick={() => setCoverTexture(cov.id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      coverTexture === cov.id
                        ? 'border-[#49372E] bg-white ring-2 ring-[#49372E]/20'
                        : 'border-[#8B6F5E]/20 bg-white/60 hover:bg-white'
                    }`}
                  >
                    <div className="h-24 rounded-lg overflow-hidden mb-2 bg-[#EADCC8]">
                      <img
                        src={cov.thumb}
                        alt={cov.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#49372E]">{cov.name}</div>
                      <div className="text-[10px] text-[#8B6F5E] leading-tight mt-0.5">{cov.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Data Backup / Export */}
            <div className="p-4 rounded-xl bg-[#EADCC8]/40 border border-[#8B6F5E]/20 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[#49372E]">Export Complete Keepsake Archive</div>
                <div className="text-[11px] text-[#8B6F5E]">
                  Download a JSON backup of all your pages, memories, secrets, and future letters.
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportArchive}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#49372E] bg-white hover:bg-[#FAF6F0] rounded-lg border border-[#8B6F5E]/30 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Account Isolation Notice */}
            <div className="flex items-center gap-2 text-[11px] text-[#8B6F5E] pt-2">
              <ShieldCheck className="w-4 h-4 text-[#8B6F5E] shrink-0" />
              <span>Strict Account Isolation: Your journal is encrypted and accessible only by you.</span>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#EADCC8] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#49372E] hover:bg-[#EADCC8]/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-[#49372E] hover:bg-[#382a23] rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : saving ? (
                  'Saving...'
                ) : (
                  'Save Preferences'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
