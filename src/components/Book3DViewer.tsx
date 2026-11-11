import React, { useState } from 'react';
import { ScrapbookPage, PhotoMemory, User } from '../services/api.ts';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Bookmark,
  Edit3,
  Trash2,
  Plus,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Layers,
  Heart,
  Calendar,
  CloudSun,
} from 'lucide-react';
import { audio } from '../utils/audio.ts';

interface Book3DViewerProps {
  user: User;
  pages: ScrapbookPage[];
  memories: PhotoMemory[];
  onEditPage: (page: ScrapbookPage) => void;
  onNewPage: () => void;
  onDeletePage: (pageId: string) => void;
  onViewMemory: (memory: PhotoMemory) => void;
  onOpenVault: () => void;
  onOpenDreams: () => void;
}

export const Book3DViewer: React.FC<Book3DViewerProps> = ({
  user,
  pages,
  memories,
  onEditPage,
  onNewPage,
  onDeletePage,
  onViewMemory,
  onOpenVault,
  onOpenDreams,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0); // 0 corresponds to pages 1 & 2
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string>('all');

  // Ambient sound state
  const [ambientAudioActive, setAmbientAudioActive] = useState(false);

  // Filter pages by chapter if selected
  const filteredPages =
    selectedChapter === 'all'
      ? pages
      : pages.filter((p) => p.chapterTitle.toLowerCase().includes(selectedChapter.toLowerCase()));

  // In book mode, we show 2 pages per spread: left and right
  const leftPageIndex = currentSpreadIndex * 2;
  const rightPageIndex = currentSpreadIndex * 2 + 1;

  const leftPage = filteredPages[leftPageIndex];
  const rightPage = filteredPages[rightPageIndex];

  const totalSpreads = Math.max(1, Math.ceil(filteredPages.length / 2));

  const handleNextSpread = () => {
    if (currentSpreadIndex < totalSpreads - 1 && !isFlipping) {
      audio.playPageTurn();
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpreadIndex((prev) => prev + 1);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 350);
    }
  };

  const handlePrevSpread = () => {
    if (currentSpreadIndex > 0 && !isFlipping) {
      audio.playPageTurn();
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpreadIndex((prev) => prev - 1);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 350);
    }
  };

  const handleToggleOpenBook = () => {
    audio.playPageTurn();
    setIsOpen(!isOpen);
  };

  // Sticker icon renderer
  const renderSticker = (sticker: ScrapbookPage['stickers'][0]) => {
    let content = null;
    let bg = '';

    switch (sticker.type) {
      case 'dried_rose':
        content = (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#D8A7A7]/30 border border-[#D8A7A7]/50 text-[10px] text-[#49372E] font-handwriting">
            <span>🥀</span>
            <span>{sticker.label || 'Wild Rose'}</span>
          </div>
        );
        break;
      case 'pressed_flower':
        content = (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#A7B49A]/30 border border-[#A7B49A]/50 text-[10px] text-[#49372E] font-handwriting">
            <span>🌿</span>
            <span>{sticker.label || 'Pressed Bloom'}</span>
          </div>
        );
        break;
      case 'stamp':
        content = (
          <div className="p-1 rounded-sm bg-[#faf5ec] border border-dashed border-[#8B6F5E]/60 shadow-xs text-[9px] text-[#49372E] font-serif uppercase tracking-widest text-center">
            <div className="border border-[#8B6F5E]/30 p-1">
              <span>{sticker.label || 'Postage 1894'}</span>
            </div>
          </div>
        );
        break;
      case 'tape':
        content = <div className="w-14 h-4 washi-tape-floral rounded-[1px]" />;
        break;
      case 'paperclip':
        content = <div className="text-xl opacity-80">📎</div>;
        break;
      default:
        content = <div className="text-lg">✨</div>;
    }

    return (
      <div
        key={sticker.id}
        style={{
          left: `${sticker.x}%`,
          top: `${sticker.y}%`,
          transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
        }}
        className="absolute pointer-events-none z-10 drop-shadow-xs select-none"
      >
        {content}
      </div>
    );
  };

  // Find memory attached to page
  const getPageMemories = (pageId?: string) => {
    if (!pageId) return [];
    return memories.filter((m) => m.pageId === pageId);
  };

  return (
    <div className="relative py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
      {/* Book Control Ribbon */}
      <div className="w-full max-w-5xl mb-6 flex flex-wrap items-center justify-between gap-4 py-2.5 px-4 rounded-xl bg-[#EADCC8]/60 border border-[#8B6F5E]/20 text-xs text-[#49372E]">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleOpenBook}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#49372E] text-white hover:bg-[#382a23] transition-colors font-medium shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isOpen ? 'Close Cover' : 'Open Diary'}</span>
          </button>

          {isOpen && (
            <div className="hidden sm:flex items-center gap-2 text-[#8B6F5E]">
              <span>Spread:</span>
              <span className="font-semibold text-[#49372E]">
                {currentSpreadIndex + 1} of {totalSpreads}
              </span>
              <span>·</span>
              <span>
                Pages {leftPageIndex + 1} - {rightPage ? rightPageIndex + 1 : leftPageIndex + 1}
              </span>
            </div>
          )}
        </div>

        {isOpen && (
          <div className="flex items-center gap-2">
            <button
              onClick={onNewPage}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF6F0] hover:bg-white border border-[#8B6F5E]/30 text-[#49372E] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Page</span>
            </button>
            <button
              onClick={onOpenVault}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF6F0] hover:bg-white border border-[#8B6F5E]/30 text-[#49372E] transition-colors"
            >
              <span>Wax Vault</span>
            </button>
            <button
              onClick={onOpenDreams}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF6F0] hover:bg-white border border-[#8B6F5E]/30 text-[#49372E] transition-colors"
            >
              <span>Future Letters</span>
            </button>
          </div>
        )}
      </div>

      {/* 3D BOOK CONTAINER */}
      {!isOpen ? (
        /* CLOSED HARDCOVER JOURNAL VIEW */
        <div className="perspective-book my-8 flex justify-center">
          <div
            onClick={handleToggleOpenBook}
            className="group relative cursor-pointer transform hover:scale-[1.02] transition-all duration-300 w-80 sm:w-96 h-[540px] rounded-r-2xl rounded-l-md overflow-hidden border-r-8 border-b-8 border-[#2e1d16] shadow-2xl flex flex-col justify-between p-8 text-[#F7F0E5] bg-[#3a271f]"
          >
            {/* Background Texture */}
            <img
              src="/src/assets/images/vintage_leather_cover_1794426767794.jpg"
              alt="Leather journal cover"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-85"
            />

            {/* Left spine depth shadow */}
            <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-black/60 via-black/25 to-transparent z-10" />

            {/* Brass corner brackets */}
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#d4af37]/80 rounded-tr z-10" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#d4af37]/80 rounded-br z-10" />

            {/* Silk bookmark ribbon dangling */}
            <div className="absolute -top-1 left-20 w-5 h-36 bg-[#D8A7A7] shadow-lg transform -rotate-2 origin-top z-10" />

            {/* Gold Title Medallion */}
            <div className="relative z-10 pt-10 text-center">
              <span className="text-[11px] uppercase tracking-[0.3em] text-[#d4af37] font-medium">
                Personal Chronology
              </span>
            </div>

            <div className="relative z-10 my-auto text-center space-y-4 py-8 px-4 border border-[#d4af37]/40 rounded-xl backdrop-blur-[2px] bg-black/25 shadow-inner">
              <h2 className="text-3xl sm:text-4xl font-serif-vintage tracking-wider text-[#faecd5] font-bold">
                {user.profile.diaryTitle || `${user.name}'s World`}
              </h2>
              <div className="w-16 h-px bg-[#d4af37]/60 mx-auto" />
              <p className="text-sm font-serif-vintage italic text-[#EADCC8]">
                {user.profile.diarySubtitle || 'Every page holds a piece of me'}
              </p>
              <div className="pt-2 text-xs font-handwriting text-[#d4af37]/90">
                Inscribed by {user.profile.ownerName || user.name}
              </div>
            </div>

            {/* Open Action Footer */}
            <div className="relative z-10 flex items-center justify-between text-xs text-[#EADCC8]/80 pt-4 border-t border-[#d4af37]/20">
              <span className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{pages.length} Pages Written</span>
              </span>
              <span className="font-medium text-[#d4af37] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Click to Open</span>
                <span aria-hidden="true">→</span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* OPEN TWO-PAGE SPREAD VIEW */
        <div className="relative w-full max-w-5xl">
          {/* Main Book Physical Shell */}
          <div className="relative rounded-2xl p-2 sm:p-3 bg-[#443026] shadow-2xl border-4 border-[#32231b]">
            {/* The Paper Spread */}
            <div className="grid grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden min-h-[580px] sm:min-h-[640px] deckle-edge relative bg-[#f7f0e3]">
              {/* Center Spine Crease / Valley */}
              <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 book-spine-crease z-20 pointer-events-none" />

              {/* ================= LEFT PAGE ================= */}
              <div className="relative p-6 sm:p-8 flex flex-col justify-between parchment-texture book-gutter-left border-b md:border-b-0 md:border-r border-[#8B6F5E]/15">
                {leftPage ? (
                  <>
                    {/* Render page stickers / botanicals */}
                    {leftPage.stickers?.map(renderSticker)}

                    {/* Page Header */}
                    <div className="relative z-10 space-y-2 border-b border-[#8B6F5E]/20 pb-3">
                      <div className="flex items-center justify-between text-xs text-[#8B6F5E]">
                        <span className="font-serif-vintage tracking-wider uppercase">
                          {leftPage.chapterTitle || 'Chapter'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 font-serif-vintage italic text-[#49372E]">
                            <Calendar className="w-3 h-3 text-[#8B6F5E]" />
                            {leftPage.date}
                          </span>
                          {leftPage.weatherMood && (
                            <span className="px-2 py-0.5 rounded-sm bg-[#EADCC8]/50 text-[10px] font-handwriting text-[#49372E]">
                              {leftPage.weatherMood}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3
                        className="text-2xl sm:text-3xl font-serif-vintage font-semibold text-[#49372E] tracking-tight"
                        style={{ color: leftPage.inkColor || '#49372E' }}
                      >
                        {leftPage.title}
                      </h3>
                    </div>

                    {/* Page Body: Handwritten Narrative */}
                    <div className="relative z-10 py-4 my-auto space-y-4">
                      <div
                        className="font-handwriting text-xl sm:text-2xl leading-relaxed whitespace-pre-line text-[#49372E]"
                        style={{ color: leftPage.inkColor || '#49372E' }}
                      >
                        {leftPage.content}
                      </div>

                      {/* Margin Handwritten Note */}
                      {leftPage.handwrittenNote && (
                        <div className="p-3 my-2 rounded-sm bg-[#EADCC8]/40 border-l-2 border-[#8B6F5E]/40 font-handwriting text-lg text-[#8B6F5E] italic">
                          {leftPage.handwrittenNote}
                        </div>
                      )}

                      {/* Attached Memories on Left Page */}
                      {getPageMemories(leftPage.id).map((mem) => (
                        <div
                          key={mem.id}
                          onClick={() => onViewMemory(mem)}
                          style={{ transform: `rotate(${mem.rotation}deg)` }}
                          className="w-48 bg-[#faf5ec] p-2.5 shadow-md rounded-sm border border-[#EADCC8] cursor-pointer hover:scale-105 transition-transform my-3"
                        >
                          <div className="relative h-28 bg-[#EADCC8] overflow-hidden rounded-[1px]">
                            <img
                              src={mem.imageUrl}
                              alt={mem.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1 right-1 p-1 bg-black/40 text-white rounded-full">
                              <Maximize2 className="w-2.5 h-2.5" />
                            </div>
                          </div>
                          <div className="mt-1.5 text-center font-handwriting text-xs font-bold text-[#49372E] truncate">
                            {mem.title}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Left Page Footer & Actions */}
                    <div className="relative z-10 pt-3 border-t border-[#8B6F5E]/15 flex items-center justify-between text-xs text-[#8B6F5E]">
                      <span className="font-serif-vintage">Page {leftPage.pageNumber}</span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditPage(leftPage)}
                          title="Edit page entry"
                          className="p-1.5 rounded hover:bg-[#EADCC8]/60 text-[#8B6F5E] hover:text-[#49372E] transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePage(leftPage.id)}
                          title="Tear out page"
                          className="p-1.5 rounded hover:bg-rose-50 text-[#8B6F5E] hover:text-rose-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Empty Left Page Placeholder */
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 text-[#8B6F5E]">
                    <Sparkles className="w-8 h-8 opacity-40 text-[#8B6F5E]" />
                    <p className="font-serif-vintage italic text-lg text-[#8B6F5E]">
                      This page awaits your thoughts.
                    </p>
                    <button
                      onClick={onNewPage}
                      className="px-4 py-2 text-xs font-medium text-white bg-[#49372E] rounded-lg shadow-sm hover:bg-[#382a23] transition-colors"
                    >
                      Inscribe Page
                    </button>
                  </div>
                )}
              </div>

              {/* ================= RIGHT PAGE ================= */}
              <div className="relative p-6 sm:p-8 flex flex-col justify-between parchment-texture book-gutter-right">
                {rightPage ? (
                  <>
                    {/* Render stickers */}
                    {rightPage.stickers?.map(renderSticker)}

                    {/* Page Header */}
                    <div className="relative z-10 space-y-2 border-b border-[#8B6F5E]/20 pb-3">
                      <div className="flex items-center justify-between text-xs text-[#8B6F5E]">
                        <span className="font-serif-vintage tracking-wider uppercase">
                          {rightPage.chapterTitle || 'Chapter'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 font-serif-vintage italic text-[#49372E]">
                            <Calendar className="w-3 h-3 text-[#8B6F5E]" />
                            {rightPage.date}
                          </span>
                          {rightPage.weatherMood && (
                            <span className="px-2 py-0.5 rounded-sm bg-[#EADCC8]/50 text-[10px] font-handwriting text-[#49372E]">
                              {rightPage.weatherMood}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3
                        className="text-2xl sm:text-3xl font-serif-vintage font-semibold text-[#49372E] tracking-tight"
                        style={{ color: rightPage.inkColor || '#49372E' }}
                      >
                        {rightPage.title}
                      </h3>
                    </div>

                    {/* Page Body */}
                    <div className="relative z-10 py-4 my-auto space-y-4">
                      <div
                        className="font-handwriting text-xl sm:text-2xl leading-relaxed whitespace-pre-line text-[#49372E]"
                        style={{ color: rightPage.inkColor || '#49372E' }}
                      >
                        {rightPage.content}
                      </div>

                      {/* Optional Quote / Highlight */}
                      {rightPage.quote?.text && (
                        <div className="p-4 my-3 rounded-lg bg-[#FAF6F0] border border-[#EADCC8] text-center space-y-1">
                          <p className="font-serif-vintage italic text-base sm:text-lg text-[#49372E]">
                            “{rightPage.quote.text}”
                          </p>
                          {rightPage.quote.author && (
                            <p className="text-[11px] uppercase tracking-widest text-[#8B6F5E]">
                              — {rightPage.quote.author}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Attached Memories on Right Page */}
                      {getPageMemories(rightPage.id).map((mem) => (
                        <div
                          key={mem.id}
                          onClick={() => onViewMemory(mem)}
                          style={{ transform: `rotate(${mem.rotation}deg)` }}
                          className="w-48 bg-[#faf5ec] p-2.5 shadow-md rounded-sm border border-[#EADCC8] cursor-pointer hover:scale-105 transition-transform my-3 ml-auto"
                        >
                          <div className="relative h-28 bg-[#EADCC8] overflow-hidden rounded-[1px]">
                            <img
                              src={mem.imageUrl}
                              alt={mem.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1 right-1 p-1 bg-black/40 text-white rounded-full">
                              <Maximize2 className="w-2.5 h-2.5" />
                            </div>
                          </div>
                          <div className="mt-1.5 text-center font-handwriting text-xs font-bold text-[#49372E] truncate">
                            {mem.title}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Page Footer & Actions */}
                    <div className="relative z-10 pt-3 border-t border-[#8B6F5E]/15 flex items-center justify-between text-xs text-[#8B6F5E]">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditPage(rightPage)}
                          title="Edit page entry"
                          className="p-1.5 rounded hover:bg-[#EADCC8]/60 text-[#8B6F5E] hover:text-[#49372E] transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePage(rightPage.id)}
                          title="Tear out page"
                          className="p-1.5 rounded hover:bg-rose-50 text-[#8B6F5E] hover:text-rose-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-serif-vintage">Page {rightPage.pageNumber}</span>
                    </div>
                  </>
                ) : (
                  /* Add Page Prompt on Right Page */
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 text-[#8B6F5E]">
                    <Plus className="w-8 h-8 opacity-40 text-[#8B6F5E]" />
                    <p className="font-serif-vintage italic text-lg text-[#8B6F5E]">
                      The story continues here.
                    </p>
                    <button
                      onClick={onNewPage}
                      className="px-4 py-2 text-xs font-medium text-white bg-[#49372E] rounded-lg shadow-sm hover:bg-[#382a23] transition-colors"
                    >
                      Inscribe Next Page
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page Turn Navigation Arrows */}
          <button
            onClick={handlePrevSpread}
            disabled={currentSpreadIndex === 0}
            aria-label="Previous page"
            className="absolute -left-4 sm:-left-7 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#FAF6F0] border border-[#8B6F5E]/30 text-[#49372E] shadow-lg hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-all z-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNextSpread}
            disabled={currentSpreadIndex >= totalSpreads - 1}
            aria-label="Next page"
            className="absolute -right-4 sm:-right-7 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#FAF6F0] border border-[#8B6F5E]/30 text-[#49372E] shadow-lg hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-all z-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
