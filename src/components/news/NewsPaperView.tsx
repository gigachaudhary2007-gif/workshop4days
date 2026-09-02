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
  Tag
} from 'lucide-react';
import { NewsArticle } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

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

  const categories = [
    'All',
    'Education',
    'Science & Tech',
    'Space',
    'AI & Tech',
    'Discoveries',
    'Opportunities',
    'Exams & Updates',
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat =
        selectedCategory === 'All' ||
        art.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.studentTakeaway.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  const featuredArticle = useMemo(() => {
    return articles.find((a) => a.featured) || articles[0];
  }, [articles]);

  const handleOpenArticle = (art: NewsArticle) => {
    setActiveArticle(art);
    setReadingModalOpen(true);
    setQuizAnswerRevealed(false);
    onSelectArticle(art);
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedArticles((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    showToast(
      savedArticles.includes(id)
        ? 'Removed from saved articles'
        : 'Saved article to reading list'
    );
  };

  const handleShare = () => {
    if (!activeArticle) return;
    navigator.clipboard.writeText(
      `Check out "${activeArticle.title}" on Study to Shine News Paper!`
    );
    showToast('Article link copied to clipboard!');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#0F6246] border border-emerald-100 mb-2">
            <Newspaper className="w-3.5 h-3.5 text-[#16835B]" /> Curated Student Journalism
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight">
            News Paper
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6762] mt-1">
            Stay updated with educational breakthroughs, science frontiers, space exploration, and student opportunities.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#89918C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student news, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm bg-white border border-[#E1E5E1] rounded-xl pl-10 pr-3.5 py-2.5 outline-none focus:border-[#16835B] transition-colors"
          />
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-[#16835B] text-white border-[#16835B] shadow-2xs'
                  : 'bg-white text-[#5F6762] border-[#E1E5E1] hover:text-[#171A18] hover:bg-[#F8F9F6]'
              }`}
            >
              {cat}
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
                Featured Cover Story
              </span>
              <span className="text-xs text-emerald-200/80 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {featuredArticle.readTime}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white group-hover:text-emerald-100 transition-colors leading-snug">
              {featuredArticle.title}
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/80 line-clamp-3 leading-relaxed">
              {featuredArticle.summary}
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 underline underline-offset-4 group-hover:text-emerald-200">
                Read Full Story <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
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
            {selectedCategory === 'All' ? 'Latest Student Headlines' : `${selectedCategory} Stories`}
          </h3>
          <span className="text-xs text-[#89918C]">
            Showing {filteredArticles.length} articles
          </span>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#E1E5E1] p-12 text-center text-[#89918C]">
            <p className="text-sm font-semibold text-[#171A18]">No stories found matching your criteria</p>
            <p className="text-xs text-[#5F6762] mt-1">Try searching for a different keyword or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArticles.map((article) => {
              const isSaved = savedArticles.includes(article.id);
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
                        {article.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#89918C] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {article.readTime}
                        </span>
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
                      {article.title}
                    </h4>

                    <p className="text-xs text-[#5F6762] mt-2 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>

                    {/* Student Takeaway Pill */}
                    <div className="mt-3 p-2.5 rounded-xl bg-[#F8F9F6] border border-[#E1E5E1] text-[11px] text-[#171A18] leading-relaxed">
                      <strong className="text-[#0F6246]">Student Impact:</strong> {article.studentTakeaway}
                    </div>
                  </div>

                  {/* Read More Footer */}
                  <div className="mt-4 pt-3 border-t border-[#E1E5E1] flex items-center justify-between text-xs font-semibold text-[#16835B]">
                    <span className="text-[11px] font-normal text-[#89918C]">
                      {article.date} &bull; {article.source}
                    </span>
                    <span className="flex items-center gap-1 group-hover:underline">
                      Read more <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clean Article Reading Modal / Distraction-free View */}
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
                  {activeArticle.category}
                </span>
                <div className="flex items-center gap-2">
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
                {activeArticle.title}
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

            {/* Student Takeaway Banner */}
            <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F6246] mb-1">
                <Sparkles className="w-4 h-4 text-[#16835B]" />
                <span>Core Academic Takeaway for Students</span>
              </div>
              <p className="text-xs sm:text-sm text-[#171A18] leading-relaxed">
                {activeArticle.studentTakeaway}
              </p>
            </div>

            {/* Body Content */}
            <div className="space-y-4 text-sm text-[#171A18] leading-relaxed">
              {activeArticle.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Reflection / Socratic Quiz Point */}
            {activeArticle.quizPrompt && (
              <div className="p-4 rounded-xl bg-[#F8F9F6] border border-[#E1E5E1] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#171A18]">
                  <HelpCircle className="w-4 h-4 text-[#16835B]" />
                  <span>Student Active Recall Reflection</span>
                </div>
                <p className="text-xs text-[#5F6762] italic">
                  &ldquo;{activeArticle.quizPrompt}&rdquo;
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => setQuizAnswerRevealed(!quizAnswerRevealed)}
                    className="text-xs font-bold text-[#16835B] hover:text-[#0F6246] hover:underline"
                  >
                    {quizAnswerRevealed ? 'Hide Concept Key' : 'Reveal Conceptual Answer'}
                  </button>
                  {quizAnswerRevealed && (
                    <p className="text-xs text-[#0F6246] mt-2 bg-white p-2.5 rounded-lg border border-emerald-100">
                      Answer Key: Reflect directly on the governing principles mentioned above: Cooper-pair formation, electrolysis of H₂O, active recall, or experimental variable controls.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#E1E5E1] flex justify-end">
              <Button onClick={() => setReadingModalOpen(false)}>
                Done Reading
              </Button>
            </div>
          </article>
        )}
      </Modal>
    </div>
  );
};
