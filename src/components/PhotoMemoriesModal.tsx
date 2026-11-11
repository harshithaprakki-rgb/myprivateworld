import React, { useState, useRef } from 'react';
import { PhotoMemory, ScrapbookPage, api } from '../services/api.ts';
import { X, Plus, Upload, Trash2, Heart, Calendar, MapPin, Maximize2, RotateCw } from 'lucide-react';
import { audio } from '../utils/audio.ts';

interface PhotoMemoriesModalProps {
  isOpen: boolean;
  memories: PhotoMemory[];
  pages: ScrapbookPage[];
  onClose: () => void;
  onRefreshMemories: () => Promise<void>;
  selectedMemoryForZoom?: PhotoMemory | null;
  onCloseZoom?: () => void;
}

const PRESET_PHOTOS = [
  {
    name: 'Cozy Reading Nook & Coffee',
    url: '/src/assets/images/polaroid_memory_sunset_1794426769115.jpg',
  },
  {
    name: 'Pressed Wildflowers & Botanicals',
    url: '/src/assets/images/pressed_botanical_flowers_1794426768859.jpg',
  },
  {
    name: 'Antique Letters & Postal Marks',
    url: '/src/assets/images/vintage_ephemera_stamps_1794426768676.jpg',
  },
];

const TAPE_STYLES: Array<{ id: PhotoMemory['tapeStyle']; name: string; class: string }> = [
  { id: 'floral', name: 'Floral Rose Tape', class: 'washi-tape-floral' },
  { id: 'kraft', name: 'Kraft Paper', class: 'washi-tape-kraft' },
  { id: 'sage', name: 'Sage Green', class: 'washi-tape-sage' },
  { id: 'gold', name: 'Gold Leaf Foil', class: 'washi-tape-gold' },
];

export const PhotoMemoriesModal: React.FC<PhotoMemoriesModalProps> = ({
  isOpen,
  memories,
  pages,
  onClose,
  onRefreshMemories,
  selectedMemoryForZoom,
  onCloseZoom,
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'new'>('gallery');
  const [activeZoomMemory, setActiveZoomMemory] = useState<PhotoMemory | null>(
    selectedMemoryForZoom || null
  );

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(
    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  );
  const [location, setLocation] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS[0].url);
  const [tapeStyle, setTapeStyle] = useState<PhotoMemory['tapeStyle']>('floral');
  const [rotation, setRotation] = useState(-2);
  const [pageId, setPageId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await api.uploadPhoto(base64Data, file.name);
          setImageUrl(res.url);
          audio.playChime(659.25);
        } catch {
          // If upload fails, fallback to using base64 directly
          setImageUrl(base64Data);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl) return;

    setSaving(true);
    try {
      await api.createMemory({
        title: title.trim(),
        date,
        location: location.trim() || undefined,
        caption: caption.trim(),
        imageUrl,
        tapeStyle,
        rotation,
        pageId: pageId || undefined,
      });
      await onRefreshMemories();
      audio.playPageTurn();
      setActiveTab('gallery');
      // Reset form
      setTitle('');
      setLocation('');
      setCaption('');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMemory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you wish to remove this Polaroid memory from your scrapbook?')) {
      await api.deleteMemory(id);
      await onRefreshMemories();
      if (activeZoomMemory?.id === id) {
        setActiveZoomMemory(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FAF6F0] rounded-2xl border border-[#EADCC8] shadow-2xl p-6 sm:p-8 text-[#49372E] parchment-texture my-8 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EADCC8] mb-6">
          <div>
            <span className="text-xs font-serif-vintage uppercase tracking-widest text-[#8B6F5E]">
              Visual Scrapbook Keepsakes
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-vintage font-semibold text-[#49372E]">
              Polaroid Memories Album
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab switch */}
            <div className="flex items-center gap-1 p-1 bg-[#EADCC8]/60 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'gallery' ? 'bg-[#49372E] text-white shadow-xs' : 'text-[#8B6F5E] hover:text-[#49372E]'
                }`}
              >
                Gallery ({memories.length})
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'new' ? 'bg-[#49372E] text-white shadow-xs' : 'text-[#8B6F5E] hover:text-[#49372E]'
                }`}
              >
                + New Polaroid
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

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 pr-2">
          {activeTab === 'gallery' ? (
            memories.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <p className="font-serif-vintage italic text-xl text-[#8B6F5E]">
                  No Polaroid memories pinned yet.
                </p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#49372E] rounded-lg shadow-sm hover:bg-[#382a23] transition-colors"
                >
                  Pin Your First Memory
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-4">
                {memories.map((mem) => {
                  const tapeConfig = TAPE_STYLES.find((t) => t.id === mem.tapeStyle) || TAPE_STYLES[0];
                  return (
                    <div
                      key={mem.id}
                      onClick={() => setActiveZoomMemory(mem)}
                      style={{ transform: `rotate(${mem.rotation}deg)` }}
                      className="group relative bg-[#FAF7F0] p-3.5 pb-5 rounded-sm shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 border border-[#EADCC8] cursor-pointer flex flex-col justify-between"
                    >
                      {/* Decorative washi tape on top of Polaroid */}
                      <div
                        className={`absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 ${tapeConfig.class} rounded-[1px] z-10 pointer-events-none`}
                      />

                      {/* Photo Image Frame */}
                      <div className="relative aspect-square w-full bg-[#EADCC8] overflow-hidden rounded-[1px] border border-[#8B6F5E]/10">
                        <img
                          src={mem.imageUrl}
                          alt={mem.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-3 h-3" />
                        </div>
                      </div>

                      {/* Polaroid Bottom Caption Area */}
                      <div className="pt-3 text-center space-y-1">
                        <h4 className="font-handwriting text-lg font-bold text-[#49372E] leading-tight">
                          {mem.title}
                        </h4>
                        <div className="flex items-center justify-center gap-2 text-[10px] font-serif-vintage italic text-[#8B6F5E]">
                          <span>{mem.date}</span>
                          {mem.location && (
                            <>
                              <span>·</span>
                              <span>{mem.location}</span>
                            </>
                          )}
                        </div>
                        {mem.caption && (
                          <p className="font-handwriting text-xs text-[#8B6F5E] line-clamp-2 px-1">
                            “{mem.caption}”
                          </p>
                        )}
                      </div>

                      {/* Delete Action button */}
                      <button
                        onClick={(e) => handleDeleteMemory(mem.id, e)}
                        title="Remove memory"
                        className="absolute bottom-2 right-2 p-1 text-[#8B6F5E]/40 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Create New Memory Form */
            <form onSubmit={handleSaveMemory} className="space-y-6 max-w-xl mx-auto py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#49372E] mb-1">Memory Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. October Afternoon"
                    className="w-full px-3 py-2 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#49372E] mb-1">Date</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#49372E] mb-1">
                  Location or Setting (Optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Grandma's attic, Paris balcony"
                  className="w-full px-3 py-2 text-sm bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                />
              </div>

              {/* Photo Choice */}
              <div>
                <label className="block text-xs font-medium text-[#49372E] mb-2">
                  Photograph Source
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-[#EADCC8] hover:bg-[#d8c3a8] rounded-lg transition-colors text-[#49372E]"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Processing Image...' : 'Upload Personal Photo'}</span>
                  </button>
                  <span className="text-xs text-[#8B6F5E]">or select vintage archive photo below</span>
                </div>

                {/* Preset thumbnails */}
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_PHOTOS.map((p) => (
                    <div
                      key={p.name}
                      onClick={() => setImageUrl(p.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        imageUrl === p.url ? 'border-[#49372E] ring-2 ring-[#49372E]/30' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1.5 text-[10px] text-white">
                        {p.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-medium text-[#49372E] mb-1">
                  Handwritten Caption on Polaroid
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="A quiet reflection written on the photo border..."
                  className="w-full px-3 py-2 font-handwriting text-base bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                />
              </div>

              {/* Tape style and page binding */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#49372E] mb-1">Washi Tape Style</label>
                  <select
                    value={tapeStyle}
                    onChange={(e) => setTapeStyle(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                  >
                    {TAPE_STYLES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#49372E] mb-1">
                    Pin onto Scrapbook Page (Optional)
                  </label>
                  <select
                    value={pageId}
                    onChange={(e) => setPageId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white/80 border border-[#8B6F5E]/30 rounded-lg text-[#49372E]"
                  >
                    <option value="">Keep in Memories Album Only</option>
                    {pages.map((p) => (
                      <option key={p.id} value={p.id}>
                        Page {p.pageNumber}: {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EADCC8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('gallery')}
                  className="px-4 py-2 text-xs font-medium text-[#49372E] hover:bg-[#EADCC8]/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-medium text-white bg-[#49372E] hover:bg-[#382a23] rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? 'Pinning...' : 'Tape Into Album'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Polaroid Full Zoom View Modal */}
        {activeZoomMemory && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative max-w-lg w-full bg-[#FAF7F0] p-6 pb-8 rounded-sm shadow-2xl border-4 border-[#EADCC8]">
              <button
                onClick={() => {
                  setActiveZoomMemory(null);
                  if (onCloseZoom) onCloseZoom();
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-[#49372E] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-square w-full bg-[#EADCC8] overflow-hidden rounded-[2px] shadow-inner mb-4">
                <img
                  src={activeZoomMemory.imageUrl}
                  alt={activeZoomMemory.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-handwriting text-3xl font-bold text-[#49372E]">
                  {activeZoomMemory.title}
                </h3>
                <div className="flex items-center justify-center gap-2 text-xs font-serif-vintage italic text-[#8B6F5E]">
                  <span>{activeZoomMemory.date}</span>
                  {activeZoomMemory.location && (
                    <>
                      <span>·</span>
                      <span>{activeZoomMemory.location}</span>
                    </>
                  )}
                </div>
                {activeZoomMemory.caption && (
                  <p className="font-handwriting text-lg text-[#49372E]/90 pt-2 px-4 leading-relaxed">
                    “{activeZoomMemory.caption}”
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
