import React, { useState } from 'react';
import { DreamEntry, api } from '../services/api.ts';
import { X, Moon, Clock, Plus, Trash2, Calendar, Sparkles, Send } from 'lucide-react';
import { audio } from '../utils/audio.ts';

interface DreamsModalProps {
  isOpen: boolean;
  dreams: DreamEntry[];
  onClose: () => void;
  onRefreshDreams: () => Promise<void>;
}

const DREAM_MOODS = [
  'Surreal & Luminous',
  'Deep & Melancholic',
  'Lucid & Floating',
  'Nostalgic Childhood',
  'Golden Vision',
  'Celestial Night',
];

export const DreamsModal: React.FC<DreamsModalProps> = ({
  isOpen,
  dreams,
  onClose,
  onRefreshDreams,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [type, setType] = useState<DreamEntry['type']>('future_letter');

  // Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('Surreal & Luminous');
  const [unlockDate, setUnlockDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      await api.createDream({
        type,
        title: title.trim(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: content.trim(),
        mood,
        unlockDate: type === 'future_letter' ? unlockDate : undefined,
      });
      await onRefreshDreams();
      audio.playChime(659.25);
      setActiveTab('list');
      setTitle('');
      setContent('');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this letter / dream record?')) {
      await api.deleteDream(id);
      await onRefreshDreams();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#FAF6F0] rounded-2xl border border-[#EADCC8] shadow-2xl p-6 sm:p-8 text-[#49372E] parchment-texture my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EADCC8] mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-serif-vintage uppercase tracking-widest text-[#8B6F5E]">
              <Moon className="w-3.5 h-3.5" />
              <span>Time-Capsule & Night Vision</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-vintage font-semibold text-[#49372E]">
              Letters to Future Self & Dreams
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-[#EADCC8]/60 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'list' ? 'bg-[#49372E] text-white shadow-xs' : 'text-[#8B6F5E] hover:text-[#49372E]'
                }`}
              >
                Time Archive ({dreams.length})
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'new' ? 'bg-[#49372E] text-white shadow-xs' : 'text-[#8B6F5E] hover:text-[#49372E]'
                }`}
              >
                + Write Letter
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
          {activeTab === 'list' ? (
            dreams.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <p className="font-serif-vintage italic text-xl text-[#8B6F5E]">
                  No letters or dreams penned yet.
                </p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#49372E] rounded-lg shadow-sm hover:bg-[#382a23] transition-colors"
                >
                  Pen a Letter to Your Future Self
                </button>
              </div>
            ) : (
              <div className="space-y-6 p-2">
                {dreams.map((item) => {
                  const isFuture = item.type === 'future_letter';
                  const isStillLocked =
                    isFuture && item.unlockDate && new Date(item.unlockDate).getTime() > Date.now();

                  return (
                    <div
                      key={item.id}
                      className="p-6 rounded-xl border border-[#EADCC8] bg-[#FAF7F0] shadow-sm space-y-3 relative overflow-hidden"
                    >
                      {/* Ribbon banner for future letter */}
                      {isFuture && (
                        <div className="flex items-center gap-2 text-xs font-medium text-[#8B6F5E]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Letter to Future Self</span>
                          {item.unlockDate && (
                            <>
                              <span>·</span>
                              <span className="text-[#49372E]">
                                {isStillLocked ? `Locked until ${item.unlockDate}` : `Unlocked since ${item.unlockDate}`}
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {!isFuture && (
                        <div className="flex items-center gap-2 text-xs font-medium text-[#8B6F5E]">
                          <Moon className="w-3.5 h-3.5" />
                          <span>Night Dream</span>
                          <span>·</span>
                          <span>{item.mood}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <h3 className="font-serif-vintage text-2xl font-semibold text-[#49372E]">
                          {item.title}
                        </h3>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Remove entry"
                          className="p-1 text-[#8B6F5E]/60 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Content or Locked Message */}
                      {isStillLocked ? (
                        <div className="p-6 rounded-lg bg-[#EADCC8]/40 border border-[#8B6F5E]/20 text-center space-y-2">
                          <p className="font-serif-vintage italic text-base text-[#49372E]">
                            “This letter is resting in the vault of time until {item.unlockDate}.”
                          </p>
                          <p className="text-xs text-[#8B6F5E]">
                            Written on {item.date}. Patience is part of the magic.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-white/70 border border-[#8B6F5E]/15">
                          <p className="font-handwriting text-xl leading-relaxed text-[#49372E] whitespace-pre-line">
                            {item.content}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Create Form */
            <form onSubmit={handleCreate} className="space-y-5 max-w-xl mx-auto py-2">
              <div className="flex items-center gap-4 p-1.5 bg-[#EADCC8]/60 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('future_letter')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    type === 'future_letter' ? 'bg-[#49372E] text-white' : 'text-[#8B6F5E]'
                  }`}
                >
                  Letter to Future Self
                </button>
                <button
                  type="button"
                  onClick={() => setType('dream')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    type === 'dream' ? 'bg-[#49372E] text-white' : 'text-[#8B6F5E]'
                  }`}
                >
                  Record Night Dream
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#49372E] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    type === 'future_letter'
                      ? 'e.g. When You Turn Thirty...'
                      : 'e.g. The Silver Library in the Woods'
                  }
                  className="w-full px-3 py-2 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                />
              </div>

              {type === 'future_letter' ? (
                <div>
                  <label className="block text-xs font-medium text-[#49372E] mb-1">
                    Unlock Date (Time-Capsule Lock)
                  </label>
                  <input
                    type="date"
                    required
                    value={unlockDate}
                    onChange={(e) => setUnlockDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                  />
                  <span className="text-[11px] text-[#8B6F5E] mt-1 block">
                    This letter will remain sealed until this date arrives.
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-[#49372E] mb-1">Dream Mood</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                  >
                    {DREAM_MOODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#49372E] mb-1">
                  Letter / Dream Narrative
                </label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    type === 'future_letter'
                      ? 'Dear future me, right now I am sitting quietly thinking about...'
                      : 'Describe the dream in vivid sensory fragments...'
                  }
                  className="w-full px-4 py-3 font-handwriting text-xl bg-white/90 border border-[#8B6F5E]/30 rounded-lg text-[#49372E] leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-[#EADCC8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-xs font-medium text-[#49372E] hover:bg-[#EADCC8]/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-medium text-white bg-[#49372E] hover:bg-[#382a23] rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? 'Preserving...' : 'Entrust to Time'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
