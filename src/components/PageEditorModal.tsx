import React, { useState } from 'react';
import { ScrapbookPage } from '../services/api.ts';
import { X, Sparkles, Plus, Trash2, Calendar, CloudSun, Feather, Bookmark } from 'lucide-react';
import { audio } from '../utils/audio.ts';

interface PageEditorModalProps {
  isOpen: boolean;
  page?: ScrapbookPage | null;
  onClose: () => void;
  onSave: (pageData: Partial<ScrapbookPage>) => Promise<void>;
}

const WEATHER_MOODS = [
  'Golden Dusk',
  'Gentle Rain',
  'Amber Breeze',
  'Starlight Whispers',
  'Nostalgic Coffee',
  'Secret Garden',
  'Quiet Twilight',
  'Solitary Autumn',
];

const INK_COLORS = [
  { name: 'Walnut Brown', value: '#49372E' },
  { name: 'Antique Sepia', value: '#78350F' },
  { name: 'Midnight Indigo', value: '#1E293B' },
  { name: 'Deep Forest', value: '#14532D' },
];

export const PageEditorModal: React.FC<PageEditorModalProps> = ({ isOpen, page, onClose, onSave }) => {
  const [chapterTitle, setChapterTitle] = useState(page?.chapterTitle || 'A Quiet Chapter');
  const [title, setTitle] = useState(page?.title || '');
  const [date, setDate] = useState(
    page?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );
  const [weatherMood, setWeatherMood] = useState(page?.weatherMood || 'Golden Dusk');
  const [inkColor, setInkColor] = useState(page?.inkColor || '#49372E');
  const [content, setContent] = useState(page?.content || '');
  const [handwrittenNote, setHandwrittenNote] = useState(page?.handwrittenNote || '');
  const [quoteText, setQuoteText] = useState(page?.quote?.text || '');
  const [quoteAuthor, setQuoteAuthor] = useState(page?.quote?.author || '');
  const [stickers, setStickers] = useState<ScrapbookPage['stickers']>(page?.stickers || []);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddSticker = (type: ScrapbookPage['stickers'][0]['type']) => {
    const newSticker: ScrapbookPage['stickers'][0] = {
      id: `stk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      x: Math.floor(Math.random() * 60) + 20,
      y: Math.floor(Math.random() * 60) + 20,
      rotation: Math.floor(Math.random() * 24) - 12,
      label: type === 'dried_rose' ? 'Wild Rose' : type === 'pressed_flower' ? 'Wild Violet' : 'Airmail 1894',
    };
    setStickers([...stickers, newSticker]);
    audio.playChime(523.25);
  };

  const handleRemoveSticker = (id: string) => {
    setStickers(stickers.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        chapterTitle: chapterTitle.trim() || 'A Quiet Chapter',
        title: title.trim(),
        date,
        weatherMood,
        inkColor,
        content,
        handwrittenNote: handwrittenNote.trim() || undefined,
        quote: quoteText.trim() ? { text: quoteText.trim(), author: quoteAuthor.trim() } : undefined,
        stickers,
      });
      audio.playPageTurn();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FAF6F0] rounded-2xl border border-[#EADCC8] shadow-2xl p-6 sm:p-8 text-[#49372E] parchment-texture my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#8B6F5E] hover:text-[#49372E] hover:bg-[#EADCC8]/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8B6F5E] mb-2 font-medium">
          <Feather className="w-3.5 h-3.5" />
          <span>{page ? 'Edit Scrapbook Page' : 'Inscribe New Page'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif-vintage font-semibold text-[#49372E] mb-6">
          {page ? 'Refine Your Reflection' : 'Pour Your Heart onto Paper'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#49372E] mb-1">Chapter Name</label>
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="e.g. Autumn Keepsakes"
                className="w-full px-3.5 py-2 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B6F5E] text-[#49372E]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#49372E] mb-1">Page Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Scent of Old Rain"
                className="w-full px-3.5 py-2 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B6F5E] text-[#49372E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#49372E] mb-1">Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B6F5E] text-[#49372E]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#49372E] mb-1">Mood / Weather Stamp</label>
              <select
                value={weatherMood}
                onChange={(e) => setWeatherMood(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B6F5E] text-[#49372E]"
              >
                {WEATHER_MOODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#49372E] mb-1">Ink Color</label>
              <div className="flex items-center gap-2 py-1.5">
                {INK_COLORS.map((ink) => (
                  <button
                    key={ink.name}
                    type="button"
                    title={ink.name}
                    onClick={() => setInkColor(ink.value)}
                    style={{ backgroundColor: ink.value }}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      inkColor === ink.value ? 'scale-115 border-amber-400 ring-2 ring-amber-300/50' : 'border-white'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Diary Narrative textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#49372E]">
                Handwritten Diary Narrative
              </label>
              <span className="text-[11px] text-[#8B6F5E]">Handwriting style rendered dynamically</span>
            </div>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your raw feelings, stories, secrets, or memories here..."
              style={{ color: inkColor }}
              className="w-full px-4 py-3 text-lg font-handwriting bg-white/90 border border-[#8B6F5E]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B6F5E] leading-relaxed resize-y placeholder-[#8B6F5E]/40"
            />
          </div>

          {/* Margin Annotation */}
          <div>
            <label className="block text-xs font-medium text-[#49372E] mb-1">
              Margin Handwritten Annotation (Optional)
            </label>
            <input
              type="text"
              value={handwrittenNote}
              onChange={(e) => setHandwrittenNote(e.target.value)}
              placeholder="e.g. “A memory to carry softly into tomorrow.”"
              className="w-full px-3.5 py-2 text-sm font-handwriting bg-white/80 border border-[#8B6F5E]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B6F5E] text-[#8B6F5E]"
            />
          </div>

          {/* Quote */}
          <div className="p-4 rounded-xl bg-[#EADCC8]/40 border border-[#8B6F5E]/20 space-y-3">
            <span className="text-xs font-medium text-[#49372E]">Inspiring Quote or Lyric (Optional)</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  placeholder="Quote text..."
                  className="w-full px-3 py-1.5 text-xs bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={quoteAuthor}
                  onChange={(e) => setQuoteAuthor(e.target.value)}
                  placeholder="Author / source..."
                  className="w-full px-3 py-1.5 text-xs bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                />
              </div>
            </div>
          </div>

          {/* Ephemera & Stickers Drawer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-[#49372E]">
                Scrapbook Ephemera & Botanicals ({stickers.length})
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddSticker('pressed_flower')}
                  className="px-2 py-1 text-[11px] rounded bg-[#FAF6F0] hover:bg-white border border-[#8B6F5E]/30 text-[#49372E]"
                >
                  + Pressed Bloom
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSticker('dried_rose')}
                  className="px-2 py-1 text-[11px] rounded bg-[#FAF6F0] hover:bg-white border border-[#8B6F5E]/30 text-[#49372E]"
                >
                  + Wild Rose
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSticker('stamp')}
                  className="px-2 py-1 text-[11px] rounded bg-[#FAF6F0] hover:bg-white border border-[#8B6F5E]/30 text-[#49372E]"
                >
                  + Antique Stamp
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSticker('tape')}
                  className="px-2 py-1 text-[11px] rounded bg-[#FAF6F0] hover:bg-white border border-[#8B6F5E]/30 text-[#49372E]"
                >
                  + Washi Tape
                </button>
              </div>
            </div>

            {stickers.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-white/60 border border-[#8B6F5E]/20">
                {stickers.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EADCC8]/60 text-xs text-[#49372E]"
                  >
                    <span>
                      {s.type === 'dried_rose' ? '🥀' : s.type === 'pressed_flower' ? '🌿' : s.type === 'stamp' ? '🏷️' : '🎗️'}
                    </span>
                    <span>{s.label || s.type}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSticker(s.id)}
                      className="text-[#8B6F5E] hover:text-rose-700 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

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
              disabled={loading}
              className="px-5 py-2 text-xs font-medium text-white bg-[#49372E] hover:bg-[#382a23] rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Preserving...' : 'Inscribe in Scrapbook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
