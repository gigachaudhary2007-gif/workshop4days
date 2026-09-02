import React, { useState, useMemo } from 'react';
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
  Volume2
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
}

export const NewsPaperView: React.FC<NewsPaperViewProps> = ({
  articles,
  selectedArticle,
  onSelectArticle,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [readingModalOpen, setReadingModalOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(selectedArticle || null);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [quizAnswerRevealed, setQuizAnswerRevealed] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [showAudioDigest, setShowAudioDigest] = useState(true);

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

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
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
        (art.hindi ? `${art.hindi.title} ${art.hindi.summary} ${art.hindi.studentTakeaway}` : '')
      ).toLowerCase();

      return matchCat && searchTarget.includes(searchQuery.toLowerCase());
    });
  }, [articles, selectedCategory, searchQuery]);

  const featuredArticle = useMemo(() => {
    return articles.find((a) => a.featured) || articles[0];
  }, [articles]);

  // Article currently loaded into the Audio Teacher Player
  const [audioArticle, setAudioArticle] = useState<NewsArticle>(featuredArticle);

  const handleOpenArticle = (art: NewsArticle) => {
    soundEffects.playPop();
    setActiveArticle(art);
    setReadingModalOpen(true);
    setQuizAnswerRevealed(false);
    onSelectArticle(art);
  };

  const handleListenToArticle = (art: NewsArticle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEffects.playPop();
    setAudioArticle(art);
    setShowAudioDigest(true);
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

  // Generate audio chapters for the selected article based on language
  const generateArticleAudioChapters = (art: NewsArticle): AudioLessonChapter[] => {
    const isHi = language === 'hi' && Boolean(art.hindi);
    const title = isHi ? art.hindi!.title : art.title;
    const category = isHi ? art.hindi!.category : art.category;
    const summary = isHi ? art.hindi!.summary : art.summary;
    const takeaway = isHi ? art.hindi!.studentTakeaway : art.studentTakeaway;
    const content = isHi ? art.hindi!.content : art.content;
    const quiz = isHi ? art.hindi!.quizPrompt : art.quizPrompt;

    return [
      {
        id: 'news-intro',
        title: isHi ? 'परिचय व मुख्य सारांश' : 'Overview & Summary',
        subtitle: category,
        textToSpeak: isHi
          ? `स्टडी टू शाइन दैनिक समाचार में आपका स्वागत है। आज का मुख्य समाचार है: ${title}। सारांश: ${summary}।`
          : `Welcome to Study to Shine Daily News Paper. Today's report: ${title}. ${summary}.`,
      },
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
      {/* Top Header with Language Setting & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#0F6246] border border-emerald-100 mb-2">
            <Newspaper className="w-3.5 h-3.5 text-[#16835B]" />
            {language === 'hi' ? 'दैनिक विद्यार्थी समाचार' : 'Curated Student Journalism'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight">
            {language === 'hi' ? 'दैनिक समाचार पत्र' : 'News Paper'}
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6762] mt-1">
            {language === 'hi'
              ? 'विज्ञान, अंतरिक्ष, प्रौद्योगिकी, शिक्षा और छात्रवृत्ति के दैनिक अद्यतन।'
              : 'Stay updated with educational breakthroughs, science frontiers, space exploration, and student opportunities.'}
          </p>
        </div>

        {/* Controls: Language Setting Switcher & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Language Setting Switcher (English / Hindi) */}
          <div className="flex items-center p-1 rounded-2xl bg-white border border-[#E1E5E1] shadow-2xs">
            <button
              type="button"
              onClick={() => handleToggleLanguage('en')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'hi'
                  ? 'bg-[#16835B] text-white shadow-xs'
                  : 'text-[#5F6762] hover:text-[#171A18] hover:bg-[#F8F9F6]'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>हिंदी (Hindi)</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#89918C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'समाचार खोजें...' : 'Search student news...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white border border-[#E1E5E1] rounded-xl pl-10 pr-3.5 py-2 outline-none focus:border-[#16835B] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Audio Teach Portion for Newspaper (Daily Audio Digest) */}
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
                  {language === 'hi' ? 'हिंदी व्याख्या' : 'Voice Narration'}
                </span>
              </div>
              <p className="text-xs text-[#89918C]">
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

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 underline underline-offset-4 group-hover:text-emerald-200">
                {language === 'hi' ? 'पूरा समाचार पढ़ें' : 'Read Full Story'}{' '}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>

              <button
                type="button"
                onClick={(e) => handleListenToArticle(featuredArticle, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/30 hover:bg-emerald-500/50 border border-emerald-400/40 text-emerald-100 transition-colors"
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

      {/* News Grid */}
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
                          className="p-1 rounded-lg text-[#89918C] hover:text-[#16835B] hover:bg-emerald-50 transition-colors"
                          title={language === 'hi' ? 'ऑडियो पाठ सुनें' : 'Listen with Audio Teach'}
                        >
                          <Headphones className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(article.id, e)}
                          className={`p-1 rounded-lg transition-colors ${
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

                    <p className="text-xs text-[#5F6762] mt-2 line-clamp-3 leading-relaxed">
                      {articleSummary}
                    </p>

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
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F8F9F6] text-[#171A18] border border-[#E1E5E1] flex items-center gap-1"
                    title="Change language"
                  >
                    <Languages className="w-3.5 h-3.5 text-[#16835B]" />
                    <span>{language === 'en' ? 'हिंदी में पढ़ें' : 'Read in English'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-1.5 rounded-lg text-[#5F6762] hover:text-[#171A18] hover:bg-[#F4F5F1] transition-colors"
                    title="Share story"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => toggleBookmark(activeArticle.id, e)}
                    className="p-1.5 rounded-lg text-[#5F6762] hover:text-[#171A18] hover:bg-[#F4F5F1] transition-colors"
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

            {/* Student Takeaway Banner */}
            <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F6246] mb-1">
                <Sparkles className="w-4 h-4 text-[#16835B]" />
                <span>{language === 'hi' ? 'विद्यार्थी अकादमिक सीख' : 'Core Academic Takeaway for Students'}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#171A18] leading-relaxed">
                {getTakeaway(activeArticle)}
              </p>
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
