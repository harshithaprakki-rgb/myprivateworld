import React, { useState } from 'react';
import { SecretNote, api } from '../services/api.ts';
import { X, Lock, Unlock, Plus, Trash2, Key, Eye, EyeOff, Shield } from 'lucide-react';
import { audio } from '../utils/audio.ts';

interface SecretVaultModalProps {
  isOpen: boolean;
  secrets: SecretNote[];
  onClose: () => void;
  onRefreshSecrets: () => Promise<void>;
}

const SEAL_COLORS = [
  { id: 'crimson', name: 'Imperial Crimson', bg: '#8B1E1E', border: '#5C1212', text: '#FFD700' },
  { id: 'gold', name: 'Antique Gold', bg: '#B38B38', border: '#7A5A18', text: '#49372E' },
  { id: 'emerald', name: 'Sage Emerald', bg: '#2D5A3A', border: '#1B3824', text: '#EADCC8' },
  { id: 'navy', name: 'Midnight Navy', bg: '#1E294A', border: '#121A30', text: '#D8A7A7' },
];

export const SecretVaultModal: React.FC<SecretVaultModalProps> = ({
  isOpen,
  secrets,
  onClose,
  onRefreshSecrets,
}) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'new'>('vault');
  const [unfoldedSecretId, setUnfoldedSecretId] = useState<string | null>(null);

  // New Secret form state
  const [title, setTitle] = useState('');
  const [sealColor, setSealColor] = useState<SecretNote['sealColor']>('crimson');
  const [sealMonogram, setSealMonogram] = useState('S');
  const [content, setContent] = useState('');
  const [isLockedWithPin, setIsLockedWithPin] = useState(false);
  const [pin, setPin] = useState('');
  const [saving, setSaving] = useState(false);

  // Unlocking pin challenge
  const [pinChallengeId, setPinChallengeId] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOpenEnvelope = (secret: SecretNote) => {
    if (unfoldedSecretId === secret.id) {
      setUnfoldedSecretId(null);
      return;
    }

    if (secret.isLockedWithPin && secret.pinHash) {
      setPinChallengeId(secret.id);
      setEnteredPin('');
      setPinError(null);
      return;
    }

    audio.playPageTurn();
    setUnfoldedSecretId(secret.id);
  };

  const handleVerifyPin = (secret: SecretNote) => {
    if (enteredPin === secret.pinHash) {
      audio.playChime(783.99);
      setUnfoldedSecretId(secret.id);
      setPinChallengeId(null);
      setPinError(null);
    } else {
      setPinError('Incorrect seal PIN code.');
    }
  };

  const handleCreateSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      await api.createSecret({
        title: title.trim(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        sealColor,
        sealMonogram: sealMonogram.trim().slice(0, 1).toUpperCase() || 'S',
        content: content.trim(),
        pinHash: isLockedWithPin ? pin.trim() : undefined,
      });
      await onRefreshSecrets();
      audio.playChime(659.25);
      setActiveTab('vault');
      setTitle('');
      setContent('');
      setPin('');
      setIsLockedWithPin(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSecret = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Permanently destroy this wax-sealed secret letter?')) {
      await api.deleteSecret(id);
      await onRefreshSecrets();
      if (unfoldedSecretId === id) setUnfoldedSecretId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#FAF6F0] rounded-2xl border border-[#EADCC8] shadow-2xl p-6 sm:p-8 text-[#49372E] parchment-texture my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EADCC8] mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-serif-vintage uppercase tracking-widest text-[#8B6F5E]">
              <Lock className="w-3.5 h-3.5" />
              <span>Private Vault</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-vintage font-semibold text-[#49372E]">
              Wax-Sealed Secret Letters
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-[#EADCC8]/60 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('vault')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'vault' ? 'bg-[#49372E] text-white shadow-xs' : 'text-[#8B6F5E] hover:text-[#49372E]'
                }`}
              >
                Letters ({secrets.length})
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'new' ? 'bg-[#49372E] text-white shadow-xs' : 'text-[#8B6F5E] hover:text-[#49372E]'
                }`}
              >
                + Seal Secret
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8B6F5E] hover:text-[#49372E] hover:bg-[#EADCC8]/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 pr-2">
          {activeTab === 'vault' ? (
            secrets.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <p className="font-serif-vintage italic text-xl text-[#8B6F5E]">
                  Your secret vault is currently silent.
                </p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#49372E] rounded-lg shadow-sm hover:bg-[#382a23] transition-colors"
                >
                  Seal Your First Secret
                </button>
              </div>
            ) : (
              <div className="space-y-6 p-2">
                {secrets.map((secret) => {
                  const seal = SEAL_COLORS.find((c) => c.id === secret.sealColor) || SEAL_COLORS[0];
                  const isUnfolded = unfoldedSecretId === secret.id;

                  return (
                    <div
                      key={secret.id}
                      className="rounded-xl border border-[#EADCC8] bg-[#FAF7F0] shadow-md overflow-hidden transition-all duration-300"
                    >
                      {/* Envelope Bar / Flap */}
                      <div
                        onClick={() => handleOpenEnvelope(secret)}
                        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#f5ede0] transition-colors select-none"
                      >
                        <div className="flex items-center gap-4">
                          {/* Wax Seal Medallion */}
                          <div
                            style={{
                              backgroundColor: seal.bg,
                              borderColor: seal.border,
                              color: seal.text,
                            }}
                            className="w-12 h-12 rounded-full border-4 shadow-md flex items-center justify-center font-serif-vintage font-bold text-xl shrink-0 transform -rotate-3"
                          >
                            {secret.sealMonogram || 'S'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif-vintage text-xl font-semibold text-[#49372E]">
                                {secret.title}
                              </h3>
                              {secret.isLockedWithPin && (
                                <Lock className="w-3.5 h-3.5 text-[#8B6F5E]" />
                              )}
                            </div>
                            <span className="text-xs font-serif-vintage italic text-[#8B6F5E]">
                              Sealed on {secret.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-[#8B6F5E] hidden sm:inline">
                            {isUnfolded ? 'Fold Letter' : 'Break Seal & Read'}
                          </span>
                          <button
                            onClick={(e) => handleDeleteSecret(secret.id, e)}
                            title="Destroy secret"
                            className="p-1.5 text-[#8B6F5E]/60 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* PIN Challenge Popover */}
                      {pinChallengeId === secret.id && (
                        <div className="p-4 bg-[#EADCC8]/40 border-t border-[#8B6F5E]/20 flex flex-wrap items-center gap-3">
                          <span className="text-xs font-medium text-[#49372E]">
                            Enter Vault Passcode:
                          </span>
                          <input
                            type="password"
                            value={enteredPin}
                            onChange={(e) => setEnteredPin(e.target.value)}
                            placeholder="PIN code..."
                            className="px-3 py-1 text-xs bg-white border border-[#8B6F5E]/30 rounded text-[#49372E] w-32"
                          />
                          <button
                            onClick={() => handleVerifyPin(secret)}
                            className="px-3 py-1 text-xs bg-[#49372E] text-white rounded font-medium hover:bg-[#382a23]"
                          >
                            Unlock
                          </button>
                          {pinError && <span className="text-xs text-rose-600">{pinError}</span>}
                        </div>
                      )}

                      {/* Unfolded Letter Content */}
                      {isUnfolded && (
                        <div className="p-6 sm:p-8 bg-[#faf4e8] border-t border-[#EADCC8] vintage-ruled-paper animate-in fade-in duration-300">
                          <div className="max-w-xl mx-auto space-y-4">
                            <div className="w-8 h-px bg-[#8B6F5E]/40 mx-auto" />
                            <p className="font-handwriting text-2xl leading-relaxed text-[#49372E] whitespace-pre-line">
                              {secret.content}
                            </p>
                            <div className="pt-4 text-right font-handwriting text-sm text-[#8B6F5E]">
                              — Whispered in confidence
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Create Secret Form */
            <form onSubmit={handleCreateSecret} className="space-y-5 max-w-xl mx-auto py-2">
              <div>
                <label className="block text-xs font-medium text-[#49372E] mb-1">
                  Secret Letter Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. A Truth I Never Spoke Out Loud"
                  className="w-full px-3 py-2 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                />
              </div>

              {/* Seal Customization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#49372E] mb-1">
                    Wax Seal Color
                  </label>
                  <select
                    value={sealColor}
                    onChange={(e) => setSealColor(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                  >
                    {SEAL_COLORS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#49372E] mb-1">
                    Seal Monogram Letter
                  </label>
                  <input
                    type="text"
                    maxLength={1}
                    value={sealMonogram}
                    onChange={(e) => setSealMonogram(e.target.value)}
                    placeholder="S"
                    className="w-full px-3 py-2 text-sm uppercase text-center font-serif-vintage font-bold bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                  />
                </div>
              </div>

              {/* Secret Message textarea */}
              <div>
                <label className="block text-xs font-medium text-[#49372E] mb-1">
                  Your Private Secret / Unspoken Words
                </label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write freely. This will be sealed and completely private to your eyes..."
                  className="w-full px-4 py-3 font-handwriting text-xl bg-white/90 border border-[#8B6F5E]/30 rounded-lg text-[#49372E] leading-relaxed"
                />
              </div>

              {/* Optional PIN Protection */}
              <div className="p-4 rounded-xl bg-[#EADCC8]/40 border border-[#8B6F5E]/20 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    id="lockPin"
                    type="checkbox"
                    checked={isLockedWithPin}
                    onChange={(e) => setIsLockedWithPin(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-[#8B6F5E] text-[#49372E]"
                  />
                  <label htmlFor="lockPin" className="text-xs font-medium text-[#49372E]">
                    Require Passcode / PIN to Break This Seal
                  </label>
                </div>

                {isLockedWithPin && (
                  <div>
                    <input
                      type="password"
                      required={isLockedWithPin}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter 4-digit PIN..."
                      className="px-3 py-1.5 text-xs bg-white border border-[#8B6F5E]/30 rounded text-[#49372E] w-48"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#EADCC8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('vault')}
                  className="px-4 py-2 text-xs font-medium text-[#49372E] hover:bg-[#EADCC8]/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-medium text-white bg-[#49372E] hover:bg-[#382a23] rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? 'Wax Sealing...' : 'Affix Wax Seal'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
