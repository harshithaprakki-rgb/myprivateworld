import React from 'react';
import { Lock, Feather, BookOpen, Heart, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';
import { audio } from '../utils/audio.ts';

interface LandingHeroProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onExploreDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onOpenAuth, onExploreDemo }) => {
  return (
    <div className="relative overflow-hidden bg-[#F7F0E5]">
      {/* Decorative ambient paper background */}
      <div className="absolute inset-0 parchment-texture opacity-60 pointer-events-none" />

      {/* Main Hero Container */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Introduction */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8B6F5E] font-medium">
              <span>Personal Digital Sanctuary</span>
              <span aria-hidden="true">·</span>
              <span>Completely Private</span>
              <span aria-hidden="true">·</span>
              <span>Vintage Scrapbook</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif-vintage font-normal tracking-tight text-[#49372E] text-balance leading-[1.08]">
              My Private World
            </h1>

            <p className="text-xl sm:text-2xl font-serif-vintage italic text-[#8B6F5E] max-w-xl">
              “Every page holds a piece of me.”
            </p>

            <p className="text-base text-[#49372E]/80 leading-relaxed max-w-xl">
              Step away from the noisy feed into an intimate, tactile digital journal. A realistic vintage scrapbook
              crafted with 3D page turns, handwritten reflections, taped Polaroid memories, pressed botanicals, and
              wax-sealed secret letters.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpenAuth('register')}
                className="px-6 py-3.5 text-sm font-medium text-white bg-[#49372E] hover:bg-[#382a23] rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-98 flex items-center gap-2"
              >
                <Feather className="w-4 h-4" />
                <span>Begin Your Private Journal</span>
              </button>

              <button
                onClick={onExploreDemo}
                className="px-5 py-3.5 text-sm font-medium text-[#49372E] bg-[#EADCC8]/80 hover:bg-[#EADCC8] rounded-lg transition-colors border border-[#8B6F5E]/30 whitespace-nowrap flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Experience Scrapbook Demo</span>
              </button>
            </div>

            {/* Privacy Assurance Row */}
            <div className="pt-6 border-t border-[#EADCC8] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#8B6F5E]">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8B6F5E] shrink-0 mt-0.5" />
                <span>Strict Account Isolation: Your memories are visible to you alone.</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-[#8B6F5E] shrink-0 mt-0.5" />
                <span>Encrypted Secret Vault with PIN protection & wax seal.</span>
              </div>
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-[#8B6F5E] shrink-0 mt-0.5" />
                <span>No ads, no public feeds, no algorithms. Just your soul.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic 3D Scrapbook Cover Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              onClick={onExploreDemo}
              className="group relative cursor-pointer transform hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Soft physical drop shadow */}
              <div className="absolute -inset-4 bg-[#49372E]/15 rounded-2xl blur-xl group-hover:bg-[#49372E]/25 transition-all" />

              {/* Book presentation */}
              <div className="relative w-72 sm:w-80 h-[430px] rounded-r-xl rounded-l-md overflow-hidden border-r-4 border-b-4 border-[#35251d] shadow-2xl flex flex-col justify-between p-7 text-[#F7F0E5] bg-[#3a271f]">
                {/* Vintage leather cover background */}
                <img
                  src="/src/assets/images/vintage_leather_cover_1794426767794.jpg"
                  alt="Vintage leather diary cover"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
                />

                {/* Aged spine indent */}
                <div className="absolute top-0 bottom-0 left-0 w-5 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

                {/* Brass corner ornaments */}
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#d4af37]/70 rounded-tr" />
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#d4af37]/70 rounded-br" />

                {/* Silk Ribbon Bookmark */}
                <div className="absolute -top-1 left-16 w-4 h-24 bg-[#D8A7A7] shadow-md transform -rotate-1 origin-top" />

                {/* Cover Header */}
                <div className="relative z-10 pt-6">
                  <div className="text-[11px] tracking-[0.3em] uppercase text-[#d4af37]/80 font-medium">
                    Sanctuary of Reflections
                  </div>
                </div>

                {/* Central Embossed Title */}
                <div className="relative z-10 my-auto text-center space-y-3 py-6 px-3 border border-[#d4af37]/30 rounded-lg backdrop-blur-[2px] bg-black/20">
                  <h3 className="text-3xl font-serif-vintage tracking-wider text-[#f5ebd7] font-semibold">
                    My Private World
                  </h3>
                  <div className="w-12 h-px bg-[#d4af37]/60 mx-auto" />
                  <p className="text-xs font-serif-vintage italic text-[#EADCC8]/90">
                    A timeless collection of days, feelings, and quiet memories
                  </p>
                </div>

                {/* Bottom Cover Label */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-[#EADCC8]/70 pt-4 border-t border-[#d4af37]/20">
                  <span>Volume I</span>
                  <span className="flex items-center gap-1 text-[#d4af37]">
                    <span>Click to open</span>
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </div>

              {/* Tilted Polaroid peeking from behind the book */}
              <div className="absolute -bottom-6 -left-8 w-36 h-40 bg-[#faf5ec] p-2.5 shadow-xl rounded-sm transform -rotate-12 border border-[#EADCC8] pointer-events-none hidden sm:block">
                <div className="w-full h-24 bg-[#EADCC8] overflow-hidden">
                  <img
                    src="/src/assets/images/polaroid_memory_sunset_1794426769115.jpg"
                    alt="Sample memory"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2 text-[10px] font-handwriting text-[#49372E] text-center font-bold">
                  October memory
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase: Authentic Scrapbook Craft */}
      <section id="scrapbook" className="relative border-t border-[#EADCC8] bg-[#f2e7d7]/60 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-serif-vintage text-[#49372E]">
              Crafted Like a Physical Keepsake
            </h2>
            <p className="text-sm text-[#8B6F5E] leading-relaxed">
              Every detail is designed to evoke the tactile comfort of turning pages in a vintage heirloom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#FAF6F0] p-6 rounded-xl border border-[#EADCC8] shadow-sm space-y-4">
              <div className="w-full h-44 rounded-lg overflow-hidden border border-[#EADCC8] bg-[#EADCC8]">
                <img
                  src="/src/assets/images/vintage_ephemera_stamps_1794426768676.jpg"
                  alt="Vintage stamps and letters"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl font-serif-vintage text-[#49372E] font-medium">
                Botanicals & Vintage Ephemera
              </h3>
              <p className="text-xs text-[#8B6F5E] leading-relaxed">
                Adorn your pages with pressed wildflowers, antique postal stamps, washi tape, and hand-drawn annotations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FAF6F0] p-6 rounded-xl border border-[#EADCC8] shadow-sm space-y-4">
              <div className="w-full h-44 rounded-lg overflow-hidden border border-[#EADCC8] bg-[#EADCC8]">
                <img
                  src="/src/assets/images/polaroid_memory_sunset_1794426769115.jpg"
                  alt="Polaroid memories"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl font-serif-vintage text-[#49372E] font-medium">
                Taped Polaroid Memories
              </h3>
              <p className="text-xs text-[#8B6F5E] leading-relaxed">
                Pin your cherished moments onto the scrapbook spreads with realistic tape, tilt angles, and handwritten captions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FAF6F0] p-6 rounded-xl border border-[#EADCC8] shadow-sm space-y-4">
              <div className="w-full h-44 rounded-lg overflow-hidden border border-[#EADCC8] bg-[#EADCC8]">
                <img
                  src="/src/assets/images/pressed_botanical_flowers_1794426768859.jpg"
                  alt="Wax sealed secret notes"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl font-serif-vintage text-[#49372E] font-medium">
                Wax-Sealed Secret Vault
              </h3>
              <p className="text-xs text-[#8B6F5E] leading-relaxed">
                Lock your deepest confessions in virtual wax-sealed envelopes with optional PIN codes and letters to your future self.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-User Privacy & Isolation Guarantee */}
      <section id="privacy" className="py-20 border-t border-[#EADCC8] bg-[#F7F0E5]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex p-3 rounded-full bg-[#EADCC8]/60 text-[#49372E]">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif-vintage text-[#49372E]">
            Strict Account Isolation: Your Sanctuary Alone
          </h2>
          <p className="text-sm sm:text-base text-[#8B6F5E] leading-relaxed">
            Every user who registers receives their own completely isolated digital scrapbook. Database records are strictly bound to authenticated account IDs, ensuring User A can never peek into User B’s reflections. No public feeds, no trackers, and no sharing options.
          </p>
          <div className="pt-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-6 py-3 text-xs uppercase tracking-wider font-semibold text-white bg-[#49372E] hover:bg-[#382a23] rounded-lg shadow-sm transition-all"
            >
              Create Your Private Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
