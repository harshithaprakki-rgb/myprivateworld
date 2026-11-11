import React, { useState, useEffect, useRef } from 'react';
import { DearUnknownLetter, api, User } from '../services/api.ts';
import { Heart, Sparkles, Send, Trash2, X, Feather, Star } from 'lucide-react';
import { audio } from '../utils/audio.ts';
import { motion, AnimatePresence } from 'motion/react';

interface DearUnknownSanctuaryProps {
  user: User | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

const EMOTIONS = [
  'Midnight Grief',
  'Tender Yearning',
  'Quiet Hope',
  'Healing Whisper',
  'Unspoken Love',
  'Silent Tears',
  'Gratitude in the Dark',
];

export const DearUnknownSanctuary: React.FC<DearUnknownSanctuaryProps> = ({ user, onOpenAuth }) => {
  const [letters, setLetters] = useState<DearUnknownLetter[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('Quiet Hope');
  const [releasing, setReleasing] = useState(false);
  const [releasedSuccess, setReleasedSuccess] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<DearUnknownLetter | null>(null);

  // Floating hearts container ref
  const heartsContainerRef = useRef<HTMLDivElement>(null);

  // Sample seed letters if empty
  const defaultLetters: DearUnknownLetter[] = [
    {
      id: 'sample_unk_1',
      userId: 'sample',
      title: 'To Whoever Is Reading Under the Stars',
      date: 'Tonight',
      content:
        "If you are feeling lonely tonight, please know that the universe is breathing with you. You don't have to carry the whole world on your shoulders. You are allowed to be tired. You are allowed to rest.",
      emotion: 'Healing Whisper',
      releasedToStars: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sample_unk_2',
      userId: 'sample',
      title: 'I Miss Who I Was In Autumn',
      date: 'Midnight',
      content:
        'Sometimes grief is not about losing someone else, but mourning the version of yourself that laughed without worrying. I hope I find that laughter again soon.',
      emotion: 'Tender Yearning',
      releasedToStars: true,
      createdAt: new Date().toISOString(),
    },
  ];

  // Fetch letters for user
  const fetchLetters = async () => {
    if (!user) {
      setLetters(defaultLetters);
      return;
    }
    try {
      const res = await api.getDearUnknownLetters();
      if (res.letters && res.letters.length > 0) {
        setLetters(res.letters);
      } else {
        setLetters(defaultLetters);
      }
    } catch {
      setLetters(defaultLetters);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, [user]);

  // Floating hearts generator
  useEffect(() => {
    const container = heartsContainerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      if (!container) return;
      const heart = document.createElement('div');
      heart.className = 'absolute pointer-events-none select-none text-pink-300/60 font-serif';
      heart.innerText = '♡';
      heart.style.left = `${Math.random() * 96}%`;
      heart.style.bottom = '-40px';
      heart.style.fontSize = `${16 + Math.random() * 20}px`;

      const duration = 7 + Math.random() * 6;
      heart.style.transition = `transform ${duration}s linear, opacity ${duration}s ease-in-out`;
      heart.style.opacity = '0';

      container.appendChild(heart);

      // Trigger animation
      requestAnimationFrame(() => {
        heart.style.opacity = '0.7';
        heart.style.transform = `translateY(-110vh) rotate(${Math.random() * 360}deg)`;
      });

      setTimeout(() => {
        heart.remove();
      }, duration * 1000);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const handleRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!user) {
      onOpenAuth('register');
      return;
    }

    setReleasing(true);
    try {
      const newLetter = await api.createDearUnknownLetter({
        title: title.trim() || 'Dear Unknown...',
        content: content.trim(),
        emotion,
        releasedToStars: true,
      });

      audio.playChime(783.99); // celestial chime
      setReleasedSuccess(true);
      setLetters([newLetter.letter, ...letters]);

      setTimeout(() => {
        setReleasing(false);
        setReleasedSuccess(false);
        setIsWriting(false);
        setTitle('');
        setContent('');
      }, 1200);
    } catch (err: any) {
      setReleasing(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Let this letter dissolve from the starlight?')) {
      if (user) {
        await api.deleteDearUnknownLetter(id);
      }
      setLetters(letters.filter((l) => l.id !== id));
      if (selectedLetter?.id === id) setSelectedLetter(null);
    }
  };

  return (
    <div className="relative min-h-[92vh] overflow-hidden text-white font-serif selection:bg-pink-500/30 selection:text-pink-100">
      {/* Deep Celestial Night Sky Background */}
      <div
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(190, 100, 170, 0.28), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(100, 80, 180, 0.28), transparent 45%),
            linear-gradient(135deg, #100d20 0%, #251631 35%, #40243e 70%, #17152e 100%)
          `,
        }}
      />

      {/* Twinkling Stars Layer */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-40 animate-pulse"
            style={{
              width: `${(i % 3) + 1.5}px`,
              height: `${(i % 3) + 1.5}px`,
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animationDuration: `${2.5 + (i % 4)}s`,
              animationDelay: `${(i % 5) * 0.7}s`,
            }}
          />
        ))}
      </div>

      {/* Floating Hearts Container */}
      <div ref={heartsContainerRef} className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" />

      {/* Hero Header Area */}
      <section className="min-h-[75vh] flex flex-col justify-center items-center text-center px-6 pt-12 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-[#ffc9e7] tracking-widest uppercase mb-6 shadow-sm">
          <Heart className="w-3.5 h-3.5 fill-[#ffc9e7]/40" />
          <span>A Safe Place to Feel</span>
        </div>

        <h1
          className="text-5xl sm:text-7xl lg:text-8xl font-normal text-[#ffe0f1] mb-6 leading-tight"
          style={{ textShadow: '0 0 35px rgba(255, 150, 210, 0.45)' }}
        >
          Dear Unknown...
        </h1>

        <p className="text-lg sm:text-xl max-w-2xl leading-relaxed text-[#e8d7e9] mb-10 font-sans font-light">
          A little corner of the internet where your feelings matter, your stories are heard, and your silence finally finds a voice.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => {
              setIsWriting(true);
              audio.playChime(659.25);
            }}
            className="px-8 py-3.5 rounded-full text-base font-medium text-white bg-white/10 hover:bg-[#d77eae] border border-[#ffc5e5] backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_25px_#d77eae] hover:-translate-y-1 active:scale-98 flex items-center gap-2.5"
          >
            <span>Share Your Feelings ♡</span>
          </button>
        </div>
      </section>

      {/* Comforting Glass Cards */}
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="p-8 rounded-3xl bg-white/[0.08] border border-white/15 backdrop-blur-lg shadow-2xl text-center space-y-4">
          <h2 className="text-2xl text-[#ffcce7] font-semibold">A Place Without Judgement</h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#eadbea] font-sans font-light">
            You don't have to pretend to be happy here. You don't have to hide your tears. Write what your heart has been holding. Sometimes, being heard is enough.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white/[0.08] border border-white/15 backdrop-blur-lg shadow-2xl text-center space-y-4">
          <h2 className="text-2xl text-[#ffcce7] font-semibold">Your Feelings Matter</h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#eadbea] font-sans font-light">
            Every heart has a story. Every silence has a reason. Every person deserves to be understood.
          </p>
        </div>
      </div>

      {/* Letters Released into the Stars Constellation */}
      <section className="max-w-5xl mx-auto px-6 pb-24 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#ffc9e7]/80">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Whispers in the Starlight</span>
          </div>
          <h3 className="text-3xl font-serif text-[#ffe0f1]">Released Letters</h3>
          <p className="text-xs text-[#eadbea]/70 font-sans">
            Gentle fragments left to float across the night sky.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {letters.map((letter) => (
            <div
              key={letter.id}
              onClick={() => setSelectedLetter(letter)}
              className="group relative p-6 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#ffc9e7]/80">
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[11px] font-sans">
                    {letter.emotion}
                  </span>
                  <span className="font-sans text-[11px] text-[#eadbea]/60">{letter.date}</span>
                </div>

                <h4 className="text-xl text-[#ffe0f1] font-semibold group-hover:text-pink-200 transition-colors">
                  {letter.title}
                </h4>

                <p className="text-sm text-[#eadbea]/80 font-sans font-light line-clamp-3 leading-relaxed">
                  “{letter.content}”
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-[#ffc9e7]/60 border-t border-white/10 mt-4">
                <span className="flex items-center gap-1 font-sans text-[11px]">
                  <span>Click to unfold</span>
                  <span>♡</span>
                </span>
                {user && (
                  <button
                    onClick={(e) => handleDelete(letter.id, e)}
                    title="Dissolve letter"
                    className="p-1 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer message */}
      <div className="text-center pb-12 text-xs text-[#c9b3ce] font-sans">
        Made with love for every unheard heart ♡
      </div>

      {/* Write Letter Modal */}
      {isWriting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-[#1e1528]/95 border border-[#ffc5e5]/30 shadow-2xl p-6 sm:p-8 text-white">
            <button
              onClick={() => setIsWriting(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 mb-6">
              <span className="text-xs uppercase tracking-widest text-[#ffc9e7] font-sans font-medium">
                Unburden Your Heart
              </span>
              <h3 className="text-3xl font-serif text-[#ffe0f1]">Dear Unknown...</h3>
              <p className="text-xs text-[#eadbea]/70 font-sans">
                No names required. Just honesty and the stars above.
              </p>
            </div>

            <form onSubmit={handleRelease} className="space-y-4">
              <div>
                <label className="block text-xs text-[#ffc9e7] font-sans mb-1">Title or First Line</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tonight my thoughts are heavy..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#ffc5e5] font-sans"
                />
              </div>

              <div>
                <label className="block text-xs text-[#ffc9e7] font-sans mb-1">Emotion Atmosphere</label>
                <select
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#281a35] border border-white/20 text-xs text-white focus:outline-none font-sans"
                >
                  {EMOTIONS.map((emo) => (
                    <option key={emo} value={emo}>
                      {emo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#ffc9e7] font-sans mb-1">
                  What your heart has been holding
                </label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Speak your silence here..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-base text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#ffc5e5] font-serif leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#eadbea]/60 font-sans">
                  {user ? 'Will be preserved in your starry vault' : 'Sign up to keep letters forever'}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsWriting(false)}
                    className="px-4 py-2 text-xs font-sans text-white/70 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={releasing}
                    className="px-6 py-2.5 rounded-full text-xs font-medium text-white bg-[#d77eae] hover:bg-[#c76d9e] shadow-[0_0_20px_#d77eae] transition-all flex items-center gap-1.5"
                  >
                    {releasedSuccess ? (
                      <span>Floating into the Stars...</span>
                    ) : (
                      <>
                        <span>Release into the Stars ♡</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Letter Reading Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#1e1528] border border-[#ffc5e5]/40 shadow-2xl p-7 text-white text-center space-y-4">
            <button
              onClick={() => setSelectedLetter(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex px-3 py-1 rounded-full bg-white/10 text-xs text-[#ffc9e7] font-sans">
              {selectedLetter.emotion} · {selectedLetter.date}
            </div>

            <h3 className="text-3xl font-serif text-[#ffe0f1]">{selectedLetter.title}</h3>

            <div className="w-12 h-px bg-white/20 mx-auto my-2" />

            <p className="text-base sm:text-lg leading-relaxed text-[#eadbea] font-serif whitespace-pre-line px-2 text-left">
              {selectedLetter.content}
            </p>

            <div className="pt-4 text-xs text-[#ffc9e7]/70 font-sans italic">
              “Every silence has a reason. You are heard.” ♡
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
