import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  BookOpen, 
  ChevronLeft, 
  Moon, 
  Sun, 
  Settings, 
  Heart,
  Share2,
  Bookmark,
  Info,
  Type,
  Library,
  Target
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
  edition: {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: string;
    type: string;
  };
}

interface TranslationAyah {
  number: number;
  text: string;
}

// --- Components ---

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4">
    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    <p className="text-slate-400 font-medium animate-pulse">Loading Revelation...</p>
  </div>
);

const SurahCard = React.forwardRef<HTMLButtonElement, { surah: Surah; onClick: () => void }>(
  ({ surah, onClick }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left"
    >
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
        {surah.number}
      </div>
      <div className="ml-4 flex-grow">
        <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">
          {surah.englishName}
        </h3>
        <p className="text-xs text-slate-400 font-medium">
          {surah.numberOfAyahs} Verses • {surah.revelationType}
        </p>
      </div>
      <div className="text-right">
        <p className="arabic-text text-xl font-bold text-emerald-950">
          {surah.name}
        </p>
        <p className="text-[10px] text-slate-300 font-medium">
          {surah.englishNameTranslation}
        </p>
      </div>
    </motion.button>
  )
);

export default function App() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [translations, setTranslations] = useState<TranslationAyah[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(28);
  const [viewMode, setViewMode] = useState<'translation' | 'arabic'>('translation');

  // Fetch Surah List
  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(res => res.json())
      .then(data => {
        setSurahs(data.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch Selected Surah Detail
  useEffect(() => {
    if (selectedSurah === null) return;

    setDetailLoading(true);
    // Fetch Arabic and Urdu translation in parallel
    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/quran-uthmani`).then(res => res.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/ur.jalandhry`).then(res => res.json())
    ]).then(([arabicData, transData]) => {
      setSurahDetail(arabicData.data);
      setTranslations(transData.data.ayahs);
      setDetailLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }).catch(err => {
      console.error(err);
      setDetailLoading(false);
    });
  }, [selectedSurah]);

  const filteredSurahs = useMemo(() => {
    return surahs.filter(s => 
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString().includes(searchQuery)
    );
  }, [surahs, searchQuery]);

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-50 glass-header px-4 py-4 md:px-8",
        darkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-100"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedSurah ? (
              <button 
                onClick={() => { setSelectedSurah(null); setSurahDetail(null); }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            ) : (
              <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/20">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-extrabold text-xl tracking-tight">
                {selectedSurah ? surahDetail?.englishName : "NUR AL QURAN"}
              </h1>
              <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-600 uppercase">
                {selectedSurah ? "The Eternal Revelation" : "Islamic Digital Library"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors hidden md:flex">
              <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {!selectedSurah ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Search Bar */}
            <div className="relative group max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              <input 
                type="text"
                placeholder="Search Surah by name or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-12 pr-4 py-4 rounded-2xl border transition-all text-sm font-medium focus:ring-4 outline-none",
                  darkMode 
                    ? "bg-slate-900 border-slate-800 focus:border-emerald-600 focus:ring-emerald-600/10" 
                    : "bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                )}
              />
            </div>

            {/* Quick Stats/Filter */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-900">
                <Library size={14} /> ALL SURAHS
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 text-xs font-bold transition-all">
                <Target size={14} /> JUZU (PARA)
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 text-xs font-bold transition-all">
                <Heart size={14} /> FAVORITES
              </button>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredSurahs.map((surah) => (
                    <SurahCard 
                      key={surah.number} 
                      surah={surah} 
                      onClick={() => setSelectedSurah(surah.number)} 
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto space-y-12 pb-24"
          >
            {/* Surah Header Card */}
            {surahDetail && (
              <div className={cn(
                "p-8 rounded-[2.5rem] border text-center space-y-6 relative overflow-hidden",
                darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
              )}>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full -ml-16 -mb-16 pointer-events-none" />

                <div className="space-y-2">
                  <p className="text-xs font-black tracking-[0.3em] text-emerald-600 uppercase">Surah {surahDetail.number}</p>
                  <h2 className="text-4xl font-black tracking-tight">{surahDetail.englishName}</h2>
                  <p className="text-slate-400 font-medium">{surahDetail.revelationType} • {surahDetail.numberOfAyahs} Verses</p>
                </div>

                <div className="arabic-text text-5xl font-bold text-emerald-950 dark:text-emerald-100 py-4">
                  {surahDetail.name}
                </div>

                {surahDetail.number !== 1 && (
                  <div className="arabic-text text-3xl font-medium text-emerald-700/80 dark:text-emerald-500/80 border-t border-slate-100 dark:border-slate-800 pt-8">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                )}

                <div className="flex items-center justify-center gap-4 pt-4">
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <button 
                      onClick={() => setViewMode('translation')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        viewMode === 'translation' 
                          ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" 
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      URDU TRANSLATION
                    </button>
                    <button 
                      onClick={() => setViewMode('arabic')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        viewMode === 'arabic' 
                          ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" 
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      ARABIC ONLY
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <button className="p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl transition-colors group">
                    <Share2 className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                  </button>
                  <button className="p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl transition-colors group">
                    <Bookmark className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                  </button>
                  <button className="p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl transition-colors group">
                    <Info className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                  </button>
                </div>
              </div>
            )}

            {detailLoading ? (
              <LoadingSpinner />
            ) : viewMode === 'translation' ? (
              <div className="space-y-12">
                {surahDetail?.ayahs.map((ayah, index) => (
                  <motion.div 
                    key={ayah.number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 1) }}
                    className="group"
                  >
                    <div className="flex flex-col space-y-6">
                      {/* Verse Meta */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-black flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                            {ayah.numberInSurah}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Juz {ayah.juz} • Page {ayah.page}
                          </span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:text-emerald-600 transition-colors"><Bookmark size={16} /></button>
                          <button className="p-2 hover:text-emerald-600 transition-colors"><Share2 size={16} /></button>
                        </div>
                      </div>

                      {/* Arabic Text */}
                      <div 
                        className="arabic-text text-right text-emerald-950 dark:text-emerald-50 leading-loose"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {ayah.text}
                      </div>

                      {/* Urdu Translation Text */}
                      <div className="space-y-4">
                        {ayah.sajda && (
                          <div className="flex justify-end">
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                              <Target className="w-3 h-3" />
                              سجدہ تلاوة
                            </span>
                          </div>
                        )}
                        <div className="urdu-text text-right text-slate-600 dark:text-slate-400 text-xl leading-[1.8] font-medium">
                          {translations[index]?.text}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="relative group/mushaf">
                {/* Book Page Effect */}
                <div className={cn(
                  "p-8 md:p-12 md:pt-24 rounded-[1.5rem] border relative z-10 transition-all duration-500 overflow-hidden",
                  darkMode 
                    ? "bg-slate-900 border-slate-800 shadow-2xl" 
                    : "bg-[#fffdf9] border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
                )}>
                  {/* Decorative Elements */}
                  <div className="mushaf-corner top-left text-emerald-800/10">
                    <svg viewBox="0 0 100 100" fill="currentColor"><path d="M0 0c50 0 100 50 100 100 0-50-50-100-100-100zM20 20c30 0 60 30 60 60 0-30-30-60-60-60z"/></svg>
                  </div>
                  <div className="mushaf-corner top-right text-emerald-800/10">
                    <svg viewBox="0 0 100 100" fill="currentColor"><path d="M0 0c50 0 100 50 100 100 0-50-50-100-100-100zM20 20c30 0 60 30 60 60 0-30-30-60-60-60z"/></svg>
                  </div>
                  <div className="mushaf-corner bottom-left text-emerald-800/10">
                    <svg viewBox="0 0 100 100" fill="currentColor"><path d="M0 0c50 0 100 50 100 100 0-50-50-100-100-100zM20 20c30 0 60 30 60 60 0-30-30-60-60-60z"/></svg>
                  </div>
                  <div className="mushaf-corner bottom-right text-emerald-800/10">
                    <svg viewBox="0 0 100 100" fill="currentColor"><path d="M0 0c50 0 100 50 100 100 0-50-50-100-100-100zM20 20c30 0 60 30 60 60 0-30-30-60-60-60z"/></svg>
                  </div>

                  {/* Page Top Header Bar (Traditional Layout) */}
                  <div className="absolute top-8 left-10 right-10 flex justify-between items-center text-[10px] font-bold text-emerald-900/50 dark:text-emerald-500/30">
                    <span className="arabic-text text-xs opacity-70">سورة {surahDetail?.name}</span>
                    <span className="font-sans text-[12px] opacity-70">{surahDetail?.ayahs[0]?.page || ''}</span>
                    <span className="arabic-text text-xs opacity-70">الجزء {surahDetail?.ayahs[0]?.juz || 1}</span>
                  </div>
                  
                  <div className="text-center space-y-10 mt-8">
                    {/* Surah Name Title */}
                    <div className="inline-block px-12 py-3 border-2 border-emerald-600/10 rounded-full bg-emerald-500/5">
                      <h2 className="arabic-text text-3xl font-bold text-emerald-900 dark:text-emerald-100">سورة {surahDetail?.name}</h2>
                    </div>

                    {/* Centered Bismillah */}
                    {surahDetail?.number !== 1 && surahDetail?.number !== 9 && (
                      <div className="arabic-text text-4xl font-medium text-emerald-800/90 dark:text-emerald-400 py-4">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </div>
                    )}
                    
                    <div 
                      className="arabic-text text-center text-emerald-950 dark:text-emerald-50 leading-[3.6] tracking-wide relative z-20"
                      style={{ 
                        fontSize: `${fontSize + 8}px`, 
                      }}
                    >
                      {surahDetail?.ayahs.map((ayah) => {
                        let displayTxt = ayah.text;
                        if (surahDetail?.number !== 1 && surahDetail?.number !== 9 && ayah.numberInSurah === 1) {
                          displayTxt = displayTxt.replace(/^(بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ|بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ)/, '').trim();
                        }

                        return (
                          <span key={ayah.number} className="inline transition-colors hover:text-emerald-600 relative group/ayah">
                            {displayTxt}
                            {ayah.sajda && (
                              <span className="relative inline-block mx-2 animate-pulse">
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover/ayah:opacity-100 transition-opacity whitespace-nowrap z-30">
                                  سجدةتلاوة
                                </span>
                                <span className="text-emerald-600 text-3xl align-middle font-bold">۩</span>
                              </span>
                            )}
                            <span className="inline-flex items-center justify-center mx-3 align-middle">
                              <span className="relative flex items-center justify-center">
                                {/* Decorative circle for verse number */}
                                <svg className="w-12 h-12 text-slate-300 dark:text-slate-700" viewBox="0 0 100 100">
                                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                                  <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[12px] font-sans font-black text-emerald-700 dark:text-emerald-400">
                                  {ayah.numberInSurah}
                                </span>
                              </span>
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Page Stack Effect */}
                <div className={cn(
                  "absolute inset-0 translate-x-2 translate-y-2 -z-10 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50",
                  darkMode ? "bg-slate-900/50" : "bg-slate-100"
                )} />
                <div className={cn(
                  "absolute inset-0 translate-x-4 translate-y-4 -z-20 rounded-[2rem] border border-slate-200/20 dark:border-slate-800/20",
                  darkMode ? "bg-slate-900/30" : "bg-slate-200/40"
                )} />
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Font Size Controls (Floating) */}
      {selectedSurah && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-header rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-2xl flex items-center gap-4 z-50">
          <button 
            onClick={() => setFontSize(Math.max(16, fontSize - 2))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Type className="w-4 h-4 scale-75" />
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] font-black text-emerald-600">{fontSize}</span>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <button 
            onClick={() => setFontSize(Math.min(48, fontSize + 2))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Type className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Footer Decoration */}
      {!selectedSurah && (
        <footer className="py-12 text-center space-y-4">
          <div className="flex justify-center items-center gap-4 opacity-20">
            <div className="h-px w-24 bg-slate-400" />
            <BookOpen className="w-4 h-4" />
            <div className="h-px w-24 bg-slate-400" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.4em] uppercase">The Light of Wisdom</p>
        </footer>
      )}
    </div>
  );
}
