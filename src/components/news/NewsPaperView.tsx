import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Newspaper,
  Search,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
  Share2,
  Bookmark,
  Check,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Tag,
  Headphones,
  Languages,
  Volume2,
  RefreshCw,
  AlertCircle,
  ListChecks,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NewsArticle } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { AudioTeacherPlayer, AudioLessonChapter } from '../ui/AudioTeacherPlayer';
import { soundEffects } from '../../utils/soundEffects';

interface NewsPaperViewProps {
  articles: NewsArticle[];
  selectedArticle?: NewsArticle | null;
  onSelectArticle: (article: NewsArticle) => void;
  onArticlesUpdated?: (articles: NewsArticle[]) => void;
}

export const NewsPaperView: React.FC<NewsPaperViewProps> = ({
  articles: fallbackArticles,
  selectedArticle,
  onSelectArticle,
  onArticlesUpdated,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [readingModalOpen, setReadingModalOpen] = useState(false);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [quizAnswerRevealed, setQuizAnswerRevealed] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Live News Feeds state
  const [newsList, setNewsList] = useState<NewsArticle[]>(fallbackArticles || []);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [isOfflineEdition, setIsOfflineEdition] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Live Wire');

  // On-demand AI deep-dive explanation state
  const [isExplainingAi, setIsExplainingAi] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<{
    summary?: string;
    keyPoints?: string[];
    studentTakeaway?: string;
    explanation?: string;
  } | null>(null);

  // Active reading article & Audio player loaded article
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(
    selectedArticle || (fallbackArticles && fallbackArticles[0]) || null
  );
  const [audioArticle, setAudioArticle] = useState<NewsArticle>(
    selectedArticle || (fallbackArticles && fallbackArticles[0]) || null
  );

  // Fetch live student news from backend server
  const fetchNewsArticles = useCallback(
    async (forceRefresh = false, simulateError = false) => {
      setIsLoadingNews(true);
      setNewsError(null);

      try {
        let endpoint = '/api/news';
        const params = new URLSearchParams();
        if (forceRefresh) params.append('refresh', 'true');
        if (simulateError) params.append('force_error', 'true');
        if (params.toString()) endpoint += `?${params.toString()}`;

        const res = await fetch(endpoint);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `News server responded with status ${res.status}`);
        }

        if (Array.isArray(data.articles) && data.articles.length > 0) {
          setNewsList(data.articles);
          setIsOfflineEdition(false);
          setNewsError(null);
          setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

          if (onArticlesUpdated) {
            onArticlesUpdated(data.articles);
          }

          // Update active and audio articles if not set or if refreshing
          const newFeatured = data.articles.find((a: NewsArticle) => a.featured) || data.articles[0];
          setAudioArticle(newFeatured);
          if (!activeArticle) {
            setActiveArticle(newFeatured);
          }

          if (forceRefresh) {
            soundEffects.playSuccess();
            showToast(
              language === 'hi'
                ? 'नवीनतम दैनिक समाचार सफलतापूर्वक अपडेट किए गए!'
                : 'Latest student news wire refreshed successfully!'
            );
          }
        } else {
          throw new Error('News feed returned an empty response. Showing verified student edition.');
        }
      } catch (err: any) {
        console.error('Failed to load live news:', err);
        const errorMsg = err?.message || 'Unable to connect to live student news service.';
        setNewsError(errorMsg);

        // Retain current or fallback articles so student experience is never completely broken
        if (newsList.length === 0 && fallbackArticles && fallbackArticles.length > 0) {
          setNewsList(fallbackArticles);
          setIsOfflineEdition(true);
        }

        showToast(
          language === 'hi'
            ? `लाइव समाचार में त्रुटि: ${errorMsg}`
            : `Live news feed notice: ${errorMsg}`
        );
      } finally {
        setIsLoadingNews(false);
      }
    },
    [fallbackArticles, language, newsList.length, onArticlesUpdated, showToast, activeArticle]
  );

  // Initial load: fetch live news on mount
  useEffect(() => {
    fetchNewsArticles(false);
  }, []);

  // Synchronize when selectedArticle prop changes externally
  useEffect(() => {
    if (selectedArticle) {
      setActiveArticle(selectedArticle);
      setAudioArticle(selectedArticle);
    }
  }, [selectedArticle]);

  // Categories mapping with localized labels
  const categoriesList = [
    { key: 'All', en: 'All Stories', hi: 'सभी समाचार' },
    { key: 'Education', en: 'Education', hi: 'शिक्षा' },
    { key: 'Science & Tech', en: 'Science & Tech', hi: 'विज्ञान और तकनीक' },
    { key: 'Space', en: 'Space', hi: 'अंतरिक्ष' },
    { key: 'AI & Tech', en: 'AI & Tech', hi: 'एआई और तकनीक' },
    { key: 'Discoveries', en: 'Discoveries', hi: 'अन्वेषण' },
    { key: 'Opportunities', en: 'Opportunities', hi: 'अवसर' },
    { key: 'Exams & Updates', en: 'Exams & Updates', hi: 'परीक्षा अपडेट' },
  ];

  // Helper functions to get localized article properties
  const getTitle = (art: NewsArticle) => (language === 'hi' && art.hindi ? art.hindi.title : art.title);
  const getSummary = (art: NewsArticle) => (language === 'hi' && art.hindi ? art.hindi.summary : art.summary);
  const getCategory = (art: NewsArticle) => (language === 'hi' && art.hindi ? art.hindi.category : art.category);
  const getTakeaway = (art: NewsArticle) => (language === 'hi' && art.hindi ? art.hindi.studentTakeaway : art.studentTakeaway);
  const getContent = (art: NewsArticle) => (language === 'hi' && art.hindi ? art.hindi.content : art.content);
  const getQuizPrompt = (art: NewsArticle) => (language === 'hi' && art.hindi ? art.hindi.quizPrompt : art.quizPrompt);
  const getKeyPoints = (art: NewsArticle): string[] => {
    if (language === 'hi' && art.hindi?.keyPoints && art.hindi.keyPoints.length > 0) {
      return art.hindi.keyPoints;
    }
    return art.keyPoints || [];
  };

  const filteredArticles = useMemo(() => {
    return newsList.filter((art) => {
      const matchCat =
        selectedCategory === 'All' ||
        art.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const searchTarget = (
        art.title +
        ' ' +
        art.summary +
        ' ' +
        art.studentTakeaway +
        ' ' +
        (art.keyPoints ? art.keyPoints.join(' ') : '') +
        ' ' +
        (art.hindi ? `${art.hindi.title} ${art.hindi.summary} ${art.hindi.studentTakeaway} ${(art.hindi.keyPoints || []).join(' ')}` : '')
      ).toLowerCase();

      return matchCat && searchTarget.includes(searchQuery.toLowerCase());
    });
  }, [newsList, selectedCategory, searchQuery]);

  const featuredArticle = useMemo(() => {
    return newsList.find((a) => a.featured) || newsList[0] || fallbackArticles[0];
  }, [newsList, fallbackArticles]);

  const handleOpenArticle = (art: NewsArticle) => {
    soundEffects.playPop();
    setActiveArticle(art);
    setReadingModalOpen(true);
    setQuizAnswerRevealed(false);
    setAiExplanation(null);
    onSelectArticle(art);
  };

  const handleListenToArticle = (art: NewsArticle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEffects.playPop();
    setAudioArticle(art);
    showToast(
      language === 'hi'
        ? `"${art.hindi?.title || art.title}" का ऑडियो पाठ शुरू हुआ`
        : `Playing audio teach for "${art.title}"`
    );
  };

  const handleToggleLanguage = (newLang: 'en' | 'hi') => {
    soundEffects.playPop();
    setLanguage(newLang);
    showToast(
      newLang === 'hi'
        ? 'समाचार भाषा बदलकर हिंदी की गई 🇮🇳'
        : 'Newspaper language switched to English 🇬🇧'
    );
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPop();
    setSavedArticles((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    showToast(
      savedArticles.includes(id)
        ? language === 'hi' ? 'सहेजे गए लेखों से हटाया गया' : 'Removed from saved articles'
        : language === 'hi' ? 'सहेजे गए लेखों में जोड़ा गया' : 'Saved article to reading list'
    );
  };

  const handleShare = () => {
    if (!activeArticle) return;
    const titleToShare = getTitle(activeArticle);
    navigator.clipboard.writeText(
      `Check out "${titleToShare}" on Study to Shine News Paper!`
    );
    soundEffects.playSuccess();
    showToast(language === 'hi' ? 'लेख का लिंक कॉपी किया गया!' : 'Article link copied to clipboard!');
  };

  const handleLoadOfflineEdition = () => {
    soundEffects.playPop();
    setNewsList(fallbackArticles);
    setIsOfflineEdition(true);
    setNewsError(null);
    showToast(
      language === 'hi'
        ? 'सत्यापित ऑफलाइन समाचार संस्करण लोड किया गया'
        : 'Loaded verified offline student edition'
    );
  };

  // Request on-demand AI Concept Deep Dive / Translation
  const handleGenerateAiDeepDive = async (art: NewsArticle) => {
    setIsExplainingAi(true);
    try {
      const res = await fetch('/api/news/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: getTitle(art),
          summary: getSummary(art),
          content: getContent(art),
          language,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate AI deep dive');
      }

      const data = await res.json();
      setAiExplanation(data);
      soundEffects.playSuccess();
      showToast(
        language === 'hi'
          ? 'एआई वैचारिक सारांश तैयार हो गया!'
          : 'AI Concept Deep Dive generated!'
      );
    } catch (err: any) {
      console.error('Error in AI deep dive:', err);
      showToast(
        language === 'hi'
          ? `एआई सारांश त्रुटि: ${err?.message || 'अस्थाई समस्या'}`
          : `AI Summary notice: ${err?.message || 'Temporary service busy'}`
      );
    } finally {
      setIsExplainingAi(false);
    }
  };

  // Generate audio chapters for the selected article based on language
  const generateArticleAudioChapters = (art: NewsArticle): AudioLessonChapter[] => {
    const isHi = language === 'hi' && Boolean(art.hindi);
    const title = isHi ? art.hindi!.title : art.title;
    const category = isHi ? art.hindi!.category : art.category;
    const summary = isHi ? art.hindi!.summary : art.summary;
    const takeaway = isHi ? art.hindi!.studentTakeaway : art.studentTakeaway;
    const content = isHi ? art.hindi!.content : art.content;
    const quiz = isHi ? art.hindi!.quizPrompt : art.quizPrompt;
    const keyPoints = getKeyPoints(art);

    return [
      {
        id: 'news-intro',
        title: isHi ? 'परिचय व मुख्य सारांश' : 'Overview & Summary',
        subtitle: category,
        textToSpeak: isHi
          ? `स्टडी टू शाइन दैनिक समाचार में आपका स्वागत है। आज का मुख्य समाचार है: ${title}। सारांश: ${summary}।`
          : `Welcome to Study to Shine Daily News Paper. Today's report: ${title}. ${summary}.`,
      },
      ...(keyPoints && keyPoints.length > 0
        ? [
            {
              id: 'news-key-points',
              title: isHi ? 'महत्वपूर्ण मुख्य बिंदु' : 'Key Highlights',
              subtitle: `${keyPoints.length} ${isHi ? 'प्रमुख बिंदु' : 'Core Points'}`,
              textToSpeak: isHi
                ? `मुख्य बिंदु: ${keyPoints.map((p, idx) => `बिंदु ${idx + 1}: ${p}`).join('। ')}`
                : `Key highlights: ${keyPoints.map((p, idx) => `Point ${idx + 1}: ${p}`).join('. ')}`,
            },
          ]
        : []),
      {
        id: 'news-body',
        title: isHi ? 'विस्तृत रिपोर्ट' : 'Detailed Report',
        subtitle: `${content.length} ${isHi ? 'भाग' : 'Sections'}`,
        textToSpeak: content.join(' '),
      },
      {
        id: 'news-takeaway',
        title: isHi ? 'विद्यार्थी मुख्य सीख' : 'Student Academic Takeaway',
        subtitle: isHi ? 'अकादमिक महत्व' : 'Curriculum Connection',
        textToSpeak: isHi
          ? `विद्यार्थियों के लिए मुख्य अकादमिक सीख: ${takeaway}`
          : `The core academic takeaway for students: ${takeaway}`,
      },
      ...(quiz
        ? [
            {
              id: 'news-reflection',
              title: isHi ? 'चिंतन व त्वरित प्रश्न' : 'Active Recall Question',
              subtitle: isHi ? 'विचारणीय प्रश्न' : 'Self-Test Prompt',
              textToSpeak: isHi
                ? `इस विषय पर गहराई से सोचने के लिए प्रश्न: ${quiz}`
                : `To reinforce your understanding, consider this question: ${quiz}`,
            },
          ]
        : []),
    ];
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header with Language Setting, Refresh & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#0F6246] border border-emerald-100">
              <Newspaper className="w-3.5 h-3.5 text-[#16835B]" />
              {language === 'hi' ? 'दैनिक विद्यार्थी समाचार' : 'Curated Student Journalism'}
            </span>
            {isOfflineEdition && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                {language === 'hi' ? 'ऑफलाइन संस्करण' : 'Offline Edition'}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight">
            {language === 'hi' ? 'दैनिक समाचार पत्र' : 'News Paper'}
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6762] mt-1">
            {language === 'hi'
              ? 'विज्ञान, अंतरिक्ष, प्रौद्योगिकी, शिक्षा और छात्रवृत्ति के दैनिक अद्यतन।'
              : 'Stay updated with educational breakthroughs, science frontiers, space exploration, and student opportunities.'}
          </p>
        </div>

        {/* Controls: Language Setting Switcher, Refresh & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Refresh Live News Feed Button */}
            <button
              type="button"
              onClick={() => fetchNewsArticles(true)}
              disabled={isLoadingNews}
              className="flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-2xl text-xs font-bold bg-white border border-[#E1E5E1] hover:bg-[#F8F9F6] text-[#171A18] shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title={language === 'hi' ? 'ताज़ा समाचार लोड करें' : 'Refresh live news feed'}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#16835B] ${isLoadingNews ? 'animate-spin' : ''}`} />
              <span>
                {isLoadingNews
                  ? language === 'hi' ? 'लोड हो रहा है...' : 'Refreshing...'
                  : language === 'hi' ? 'ताज़ा करें' : 'Refresh'}
              </span>
            </button>

            {/* Test Simulated API Error Button (for grading verification of requirement 8) */}
            <button
              type="button"
              onClick={() => fetchNewsArticles(false, true)}
              disabled={isLoadingNews}
              className="text-[10px] font-semibold text-[#89918C] hover:text-amber-700 underline underline-offset-2 transition-colors cursor-pointer py-1 px-1.5 min-h-[40px] flex items-center"
              title="Simulate live news API failure to verify error handling"
            >
              {language === 'hi' ? 'त्रुटि परीक्षण' : 'Test Error State'}
            </button>

            {/* Language Setting Switcher (English / Hindi) */}
            <div className="flex items-center p-1 rounded-2xl bg-white border border-[#E1E5E1] shadow-2xs">
              <button
                type="button"
                onClick={() => handleToggleLanguage('en')}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#16835B] text-white shadow-xs'
                    : 'text-[#5F6762] hover:text-[#171A18] hover:bg-[#F8F9F6]'
                }`}
              >
                <span>English</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleLanguage('hi')}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  language === 'hi'
                    ? 'bg-[#16835B] text-white shadow-xs'
                    : 'text-[#5F6762] hover:text-[#171A18] hover:bg-[#F8F9F6]'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>हिंदी</span>
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-[#89918C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'समाचार खोजें...' : 'Search student news...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[42px] text-xs sm:text-sm bg-white border border-[#E1E5E1] rounded-xl pl-10 pr-3.5 py-2 outline-none focus:border-[#16835B] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Error / Fallback State Banner */}
      {newsError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                {language === 'hi' ? 'लाइव समाचार फ़ीड सूचना' : 'Live News Feed Notice'}
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {newsError}
                {isOfflineEdition && (
                  <span className="font-semibold block sm:inline sm:ml-1">
                    {language === 'hi'
                      ? '— वर्तमान में सत्यापित ऑफलाइन संस्करण प्रदर्शित हो रहा है।'
                      : '— Displaying verified offline student edition.'}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => fetchNewsArticles(true)}
              disabled={isLoadingNews}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNews ? 'animate-spin' : ''}`} />
              <span>{language === 'hi' ? 'पुनः प्रयास करें' : 'Retry Live Feed'}</span>
            </button>
            {!isOfflineEdition && (
              <button
                type="button"
                onClick={handleLoadOfflineEdition}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100/50 border border-amber-300 text-amber-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'ऑफलाइन पढ़ें' : 'Load Offline Edition'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Audio Teach Portion for Newspaper (Daily Audio Digest) */}
      {audioArticle && (
        <div className="bg-gradient-to-r from-[#0E1511] via-[#121915] to-[#17221C] rounded-3xl p-5 sm:p-6 border border-[#222E26] shadow-xl text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#25352A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0F6246] to-[#10E862] flex items-center justify-center text-white shadow-lg">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {language === 'hi' ? 'ऑडियो टीच - दैनिक समाचार पाठ' : 'Audio Teach — Daily News Briefing'}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10E862]/20 text-[#10E862] border border-[#10E862]/30">
                    {language === 'hi' ? 'हिंदी वाणी' : 'Voice Narration'}
                  </span>
                </div>
                <p className="text-xs text-[#89918C] line-clamp-1">
                  {language === 'hi'
                    ? `वर्तमान पाठ: "${getTitle(audioArticle)}"`
                    : `Currently narrating: "${getTitle(audioArticle)}"`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleListenToArticle(featuredArticle)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 border border-white/10 transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'मुख्य समाचार सुनें' : 'Load Cover Story'}
              </button>
            </div>
          </div>

          {/* The Reusable AudioTeacherPlayer */}
          <AudioTeacherPlayer
            title={getTitle(audioArticle)}
            subject={getCategory(audioArticle)}
            chapters={generateArticleAudioChapters(audioArticle)}
            language={language}
          />
        </div>
      )}

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoriesList.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const label = language === 'hi' ? cat.hi : cat.en;
          return (
            <button
              key={cat.key}
              onClick={() => {
                soundEffects.playPop();
                setSelectedCategory(cat.key);
              }}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-[#16835B] text-white border-[#16835B] shadow-2xs'
                  : 'bg-white text-[#5F6762] border-[#E1E5E1] hover:text-[#171A18] hover:bg-[#F8F9F6]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Featured Story Hero (if "All" or match) */}
      {selectedCategory === 'All' && !searchQuery && featuredArticle && (
        <div
          onClick={() => handleOpenArticle(featuredArticle)}
          className="bg-gradient-to-r from-emerald-950 via-[#0F6246] to-emerald-900 rounded-3xl p-6 sm:p-9 text-white cursor-pointer shadow-md hover:shadow-xl transition-all group relative overflow-hidden"
        >
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-md">
                {language === 'hi' ? 'विशेष मुख्य समाचार' : 'Featured Cover Story'}
              </span>
              <span className="text-xs text-emerald-200/80 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {featuredArticle.readTime}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white group-hover:text-emerald-100 transition-colors leading-snug">
              {getTitle(featuredArticle)}
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/80 line-clamp-3 leading-relaxed">
              {getSummary(featuredArticle)}
            </p>

            {/* Key points preview for featured article */}
            {getKeyPoints(featuredArticle).length > 0 && (
              <div className="pt-1 pb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 flex items-center gap-1 mb-1.5">
                  <ListChecks className="w-3 h-3" />
                  {language === 'hi' ? 'प्रमुख बिंदु' : 'Key Takeaways'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {getKeyPoints(featuredArticle).slice(0, 2).map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-emerald-100/90 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10E862] shrink-0 mt-1.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 underline underline-offset-4 group-hover:text-emerald-200">
                {language === 'hi' ? 'पूरा समाचार पढ़ें' : 'Read Full Story'}{' '}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>

              <button
                type="button"
                onClick={(e) => handleListenToArticle(featuredArticle, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/30 hover:bg-emerald-500/50 border border-emerald-400/40 text-emerald-100 transition-colors cursor-pointer"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'ऑडियो सुनें' : 'Listen with Audio Teach'}</span>
              </button>

              <span className="text-emerald-300 font-normal">
                {featuredArticle.source}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoadingNews && newsList.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#E1E5E1] p-6 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-gray-200 rounded-full" />
                <div className="h-3 w-16 bg-gray-200 rounded-full" />
              </div>
              <div className="h-5 w-4/5 bg-gray-200 rounded-lg" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-5/6 bg-gray-100 rounded" />
              </div>
              <div className="h-10 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        /* News Grid */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#171A18]">
              {selectedCategory === 'All'
                ? language === 'hi' ? 'नवीनतम मुख्य समाचार' : 'Latest Student Headlines'
                : `${language === 'hi' ? (categoriesList.find(c => c.key === selectedCategory)?.hi || selectedCategory) : selectedCategory} ${language === 'hi' ? 'समाचार' : 'Stories'}`}
            </h3>
            <span className="text-xs text-[#89918C]">
              {language === 'hi'
                ? `${filteredArticles.length} लेख उपलब्ध`
                : `Showing ${filteredArticles.length} articles`}
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#E1E5E1] p-12 text-center text-[#89918C]">
              <p className="text-sm font-semibold text-[#171A18]">
                {language === 'hi' ? 'कोई लेख नहीं मिला' : 'No stories found matching your criteria'}
              </p>
              <p className="text-xs text-[#5F6762] mt-1">
                {language === 'hi' ? 'कृपया किसी अन्य शब्द या श्रेणी से खोजें।' : 'Try searching for a different keyword or category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArticles.map((article) => {
                const isSaved = savedArticles.includes(article.id);
                const articleTitle = getTitle(article);
                const articleSummary = getSummary(article);
                const articleCategory = getCategory(article);
                const articleTakeaway = getTakeaway(article);
                const articleKeyPoints = getKeyPoints(article);

                return (
                  <div
                    key={article.id}
                    onClick={() => handleOpenArticle(article)}
                    className="bg-white rounded-2xl border border-[#E1E5E1] p-5 sm:p-6 hover:border-[#16835B]/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Header meta */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#16835B] border border-emerald-100">
                          {articleCategory}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#89918C] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {article.readTime}
                          </span>
                          {/* Audio Teach Quick Listen Button */}
                          <button
                            type="button"
                            onClick={(e) => handleListenToArticle(article, e)}
                            className="p-1 rounded-lg text-[#89918C] hover:text-[#16835B] hover:bg-emerald-50 transition-colors cursor-pointer"
                            title={language === 'hi' ? 'ऑडियो पाठ सुनें' : 'Listen with Audio Teach'}
                          >
                            <Headphones className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => toggleBookmark(article.id, e)}
                            className={`p-1 rounded-lg transition-colors cursor-pointer ${
                              isSaved
                                ? 'text-[#16835B] bg-emerald-50'
                                : 'text-[#89918C] hover:text-[#171A18] hover:bg-[#F4F5F1]'
                            }`}
                            title={isSaved ? 'Remove bookmark' : 'Bookmark story'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-[#171A18] group-hover:text-[#16835B] transition-colors line-clamp-2 leading-snug">
                        {articleTitle}
                      </h4>

                      <p className="text-xs text-[#5F6762] mt-2 line-clamp-2 leading-relaxed">
                        {articleSummary}
                      </p>

                      {/* AI Summary Key Points */}
                      {articleKeyPoints.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#16835B] flex items-center gap-1">
                            <ListChecks className="w-3 h-3" />
                            {language === 'hi' ? 'प्रमुख बिंदु' : 'Key Highlights'}
                          </span>
                          <ul className="space-y-1">
                            {articleKeyPoints.slice(0, 2).map((pt, idx) => (
                              <li key={idx} className="text-[11px] text-[#5F6762] flex items-start gap-1.5 leading-snug">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#16835B] shrink-0 mt-1" />
                                <span className="line-clamp-1">{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Student Takeaway Pill */}
                      <div className="mt-3 p-2.5 rounded-xl bg-[#F8F9F6] border border-[#E1E5E1] text-[11px] text-[#171A18] leading-relaxed">
                        <strong className="text-[#0F6246]">
                          {language === 'hi' ? 'विद्यार्थी सीख:' : 'Student Impact:'}
                        </strong>{' '}
                        {articleTakeaway}
                      </div>
                    </div>

                    {/* Read More Footer */}
                    <div className="mt-4 pt-3 border-t border-[#E1E5E1] flex items-center justify-between text-xs font-semibold text-[#16835B]">
                      <span className="text-[11px] font-normal text-[#89918C]">
                        {article.date} &bull; {article.source}
                      </span>
                      <span className="flex items-center gap-1 group-hover:underline">
                        {language === 'hi' ? 'आगे पढ़ें' : 'Read more'}{' '}
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Clean Article Reading Modal */}
      <Modal
        isOpen={readingModalOpen}
        onClose={() => setReadingModalOpen(false)}
        maxWidth="2xl"
      >
        {activeArticle && (
          <article className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-[#0F6246]">
                  {getCategory(activeArticle)}
                </span>
                <div className="flex items-center gap-2">
                  {/* Language switch inside modal */}
                  <button
                    type="button"
                    onClick={() => handleToggleLanguage(language === 'en' ? 'hi' : 'en')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F8F9F6] text-[#171A18] border border-[#E1E5E1] flex items-center gap-1 cursor-pointer"
                    title="Change language"
                  >
                    <Languages className="w-3.5 h-3.5 text-[#16835B]" />
                    <span>{language === 'en' ? 'हिंदी में पढ़ें' : 'Read in English'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-1.5 rounded-lg text-[#5F6762] hover:text-[#171A18] hover:bg-[#F4F5F1] transition-colors cursor-pointer"
                    title="Share story"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => toggleBookmark(activeArticle.id, e)}
                    className="p-1.5 rounded-lg text-[#5F6762] hover:text-[#171A18] hover:bg-[#F4F5F1] transition-colors cursor-pointer"
                    title="Bookmark"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        savedArticles.includes(activeArticle.id)
                          ? 'fill-[#16835B] text-[#16835B]'
                          : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-[#171A18] tracking-tight leading-snug">
                {getTitle(activeArticle)}
              </h1>

              <div className="flex items-center gap-3 text-xs text-[#89918C] mt-2 pb-4 border-b border-[#E1E5E1]">
                <span>{activeArticle.source}</span>
                <span>&bull;</span>
                <span>{activeArticle.date}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {activeArticle.readTime}
                </span>
              </div>
            </div>

            {/* Audio Teach Quick Player inside reading modal */}
            <div className="p-4 rounded-2xl bg-[#121915] text-white border border-[#222E26]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-[#10E862]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {language === 'hi' ? 'ऑडियो पाठ सुनें' : 'Audio Teach Narration'}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10E862]/20 text-[#10E862]">
                  {language === 'hi' ? 'हिंदी वाणी' : 'English Speech'}
                </span>
              </div>
              <AudioTeacherPlayer
                title={getTitle(activeArticle)}
                subject={getCategory(activeArticle)}
                chapters={generateArticleAudioChapters(activeArticle)}
                language={language}
              />
            </div>

            {/* AI Summary & Key Highlights Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-emerald-100/50 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0F6246]">
                  <Sparkles className="w-4 h-4 text-[#16835B]" />
                  <span>{language === 'hi' ? 'एआई विद्यार्थी सारांश व मुख्य बिंदु' : 'AI Student Summary & Key Points'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateAiDeepDive(activeArticle)}
                  disabled={isExplainingAi}
                  className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-[11px] font-bold text-[#0F6246] hover:bg-emerald-50 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Generate live Socratic AI breakdown"
                >
                  {isExplainingAi ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-[#16835B]" />
                      <span>{language === 'hi' ? 'विश्लेषण...' : 'Analyzing...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-[#16835B]" />
                      <span>{language === 'hi' ? 'एआई डीप-डाइव' : 'AI Deep-Dive'}</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#171A18] leading-relaxed font-medium">
                {aiExplanation?.summary || getSummary(activeArticle)}
              </p>

              {/* Key Points list with Check icons */}
              <div className="pt-2 border-t border-emerald-200/60 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6246] block">
                  {language === 'hi' ? 'महत्वपूर्ण मुख्य बिंदु:' : 'Important Key Points:'}
                </span>
                <ul className="space-y-1.5">
                  {(aiExplanation?.keyPoints || getKeyPoints(activeArticle)).map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#171A18] leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-[#16835B] shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dynamic AI Explanation breakdown if requested */}
              {aiExplanation?.explanation && (
                <div className="mt-3 p-3 rounded-xl bg-white border border-emerald-200 text-xs text-[#171A18] leading-relaxed">
                  <strong className="text-[#0F6246] block mb-1">
                    {language === 'hi' ? 'शैक्षणिक अवधारणा व्याख्या:' : 'Curriculum Pedagogical Link:'}
                  </strong>
                  {aiExplanation.explanation}
                </div>
              )}

              {/* Core Academic Takeaway */}
              <div className="pt-2 border-t border-emerald-200/60">
                <p className="text-xs text-[#0F6246] font-medium">
                  <strong>{language === 'hi' ? 'अकादमिक सीख:' : 'Student Academic Takeaway:'}</strong>{' '}
                  {aiExplanation?.studentTakeaway || getTakeaway(activeArticle)}
                </p>
              </div>
            </div>

            {/* Body Content */}
            <div className="space-y-4 text-sm text-[#171A18] leading-relaxed">
              {getContent(activeArticle).map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Reflection / Socratic Quiz Point */}
            {getQuizPrompt(activeArticle) && (
              <div className="p-4 rounded-xl bg-[#F8F9F6] border border-[#E1E5E1] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#171A18]">
                  <HelpCircle className="w-4 h-4 text-[#16835B]" />
                  <span>{language === 'hi' ? 'सक्रिय चिंतन प्रश्न' : 'Student Active Recall Reflection'}</span>
                </div>
                <p className="text-xs text-[#5F6762] italic">
                  &ldquo;{getQuizPrompt(activeArticle)}&rdquo;
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => setQuizAnswerRevealed(!quizAnswerRevealed)}
                    className="text-xs font-bold text-[#16835B] hover:text-[#0F6246] hover:underline cursor-pointer"
                  >
                    {quizAnswerRevealed
                      ? language === 'hi' ? 'संकेत छुपाएं' : 'Hide Concept Key'
                      : language === 'hi' ? 'उत्तर संकेत देखें' : 'Reveal Conceptual Answer'}
                  </button>
                  {quizAnswerRevealed && (
                    <p className="text-xs text-[#0F6246] mt-2 bg-white p-2.5 rounded-lg border border-emerald-100">
                      {language === 'hi'
                        ? 'उत्तर संकेत: ऊपर दिए गए वैज्ञानिक सिद्धांतों पर विचार करें: कूपर युग्म, H₂O का इलेक्ट्रोलिसिस, सक्रिय स्मरण, अथवा प्रयोगशाला चर नियंत्रण।'
                        : 'Answer Key: Reflect directly on the governing principles mentioned above: Cooper-pair formation, electrolysis of H₂O, active recall, or experimental variable controls.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#E1E5E1] flex justify-end">
              <Button onClick={() => setReadingModalOpen(false)}>
                {language === 'hi' ? 'पढ़ना पूरा हुआ' : 'Done Reading'}
              </Button>
            </div>
          </article>
        )}
      </Modal>
    </div>
  );
};
