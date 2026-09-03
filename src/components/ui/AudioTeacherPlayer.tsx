import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Headphones,
  Sliders,
  ChevronDown,
  BookOpen,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '../../utils/soundEffects';

export interface AudioLessonChapter {
  id: string;
  title: string;
  subtitle?: string;
  textToSpeak: string;
  durationEstimateSeconds?: number;
}

interface AudioTeacherPlayerProps {
  title: string;
  subject?: string;
  chapters: AudioLessonChapter[];
  language?: 'en' | 'hi';
  className?: string;
  compact?: boolean;
  onChapterChange?: (chapterIndex: number) => void;
}

export const AudioTeacherPlayer: React.FC<AudioTeacherPlayerProps> = ({
  title,
  subject = 'Academic',
  chapters,
  language = 'en',
  className = '',
  compact = false,
  onChapterChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<number | null>(null);

  const currentChapter = chapters[currentChapterIndex] || chapters[0];

  // Estimated total time for current chapter
  const estimatedSeconds = Math.max(
    8,
    currentChapter ? Math.ceil(currentChapter.textToSpeak.split(' ').length / (2.5 * playbackSpeed)) : 20
  );

  // Stop speech when component unmounts or language/chapters change
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    // When chapter or language changes while playing, restart audio for new chapter
    if (isPlaying) {
      startSpeechForCurrentChapter();
    }
  }, [currentChapterIndex, language, playbackSpeed]);

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgressPercent(0);
    setElapsedSeconds(0);
  };

  const startSpeechForCurrentChapter = () => {
    if (!currentChapter) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const text = currentChapter.textToSpeak;
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Select voice based on language
      const voices = window.speechSynthesis.getVoices();
      if (language === 'hi') {
        utterance.lang = 'hi-IN';
        const hindiVoice = voices.find(
          (v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi') || v.lang.includes('IN')
        );
        if (hindiVoice) utterance.voice = hindiVoice;
      } else {
        utterance.lang = 'en-US';
        const englishVoice = voices.find(
          (v) =>
            v.lang.includes('en') &&
            (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira'))
        ) || voices.find((v) => v.lang.includes('en'));
        if (englishVoice) utterance.voice = englishVoice;
      }

      utterance.rate = playbackSpeed;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        // Advance to next chapter automatically if available
        if (currentChapterIndex < chapters.length - 1) {
          handleNextChapter();
        } else {
          stopSpeech();
        }
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    }

    // Progress timer
    if (timerRef.current) window.clearInterval(timerRef.current);
    setElapsedSeconds(0);
    setProgressPercent(0);

    const interval = 250;
    const totalMs = estimatedSeconds * 1000;
    let currentMs = 0;

    timerRef.current = window.setInterval(() => {
      currentMs += interval;
      const pct = Math.min(100, (currentMs / totalMs) * 100);
      setProgressPercent(pct);
      setElapsedSeconds(Math.floor(currentMs / 1000));

      if (pct >= 100) {
        if (timerRef.current) window.clearInterval(timerRef.current);
      }
    }, interval);
  };

  const handleTogglePlay = () => {
    soundEffects.playPop();

    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      if (timerRef.current) window.clearInterval(timerRef.current);
      setIsPlaying(false);
      setIsPaused(true);
    } else if (isPaused) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      startSpeechForCurrentChapter();
    }
  };

  const handleNextChapter = () => {
    soundEffects.playWhoosh();
    if (currentChapterIndex < chapters.length - 1) {
      const nextIdx = currentChapterIndex + 1;
      setCurrentChapterIndex(nextIdx);
      if (onChapterChange) onChapterChange(nextIdx);
    } else {
      stopSpeech();
    }
  };

  const handlePrevChapter = () => {
    soundEffects.playWhoosh();
    if (currentChapterIndex > 0) {
      const prevIdx = currentChapterIndex - 1;
      setCurrentChapterIndex(prevIdx);
      if (onChapterChange) onChapterChange(prevIdx);
    } else {
      setElapsedSeconds(0);
      setProgressPercent(0);
      if (isPlaying) startSpeechForCurrentChapter();
    }
  };

  const handleSelectChapter = (index: number) => {
    soundEffects.playTabSwitch();
    setCurrentChapterIndex(index);
    if (onChapterChange) onChapterChange(index);
    if (isPlaying) {
      startSpeechForCurrentChapter();
    }
  };

  const handleRestart = () => {
    soundEffects.playPop();
    setElapsedSeconds(0);
    setProgressPercent(0);
    startSpeechForCurrentChapter();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      className={`rounded-2xl border border-[#222E26] bg-[#121915] text-white p-4 sm:p-5 shadow-lg relative overflow-hidden ${className}`}
    >
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#10E862]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Bar: Title & AI Teacher Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 pb-3 border-b border-[#243329]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B2920] border border-[#2B4233] flex items-center justify-center text-[#10E862] shadow-inner shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10E862]/15 text-[#10E862] border border-[#10E862]/30 uppercase tracking-wider flex items-center gap-1">
                <Radio className={`w-2.5 h-2.5 ${isPlaying ? 'animate-pulse text-[#10E862]' : 'text-zinc-400'}`} />
                {language === 'hi' ? 'एआई ऑडियो शिक्षक' : 'AI Audio Teacher'}
              </span>
              <span className="text-xs text-[#89918C] font-medium hidden sm:inline">
                {subject}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight mt-0.5 line-clamp-1">
              {title}
            </h3>
          </div>
        </div>

        {/* Playback Speed Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1B2920] hover:bg-[#24372B] border border-[#2B4233] text-xs font-semibold text-[#10E862] transition-colors cursor-pointer"
            >
              <span>{playbackSpeed}x</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {showSpeedMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 top-full mt-1.5 w-24 bg-[#17221C] border border-[#2B4233] rounded-xl shadow-xl py-1 z-30 flex flex-col"
                >
                  {[0.8, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => {
                        setPlaybackSpeed(spd);
                        setShowSpeedMenu(false);
                      }}
                      className={`text-left px-3 py-1.5 text-xs font-medium hover:bg-[#24372B] transition-colors ${
                        playbackSpeed === spd ? 'text-[#10E862] font-bold bg-[#1B2920]' : 'text-zinc-300'
                      }`}
                    >
                      {spd}x speed
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={handleRestart}
            title="Restart lesson"
            className="p-1.5 rounded-lg bg-[#1B2920] hover:bg-[#24372B] border border-[#2B4233] text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Live Waveform Equalizer & Current Chapter Title */}
      <div className="py-4 relative z-10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-[#10E862] uppercase tracking-wider">
              {language === 'hi' ? `अध्याय ${currentChapterIndex + 1} / ${chapters.length}` : `Chapter ${currentChapterIndex + 1} of ${chapters.length}`}
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {currentChapter?.title}
            </h4>
          </div>

          {/* Animated Waveform Equalizer Bars (12 bars) */}
          <div className="flex items-center gap-1 h-8 px-3 py-1 rounded-xl bg-[#17221C] border border-[#24372B]">
            {[14, 24, 10, 28, 18, 22, 12, 26, 16, 20, 14, 8].map((baseHeight, i) => (
              <motion.span
                key={i}
                animate={
                  isPlaying
                    ? {
                        height: [
                          `${Math.max(4, baseHeight * 0.3)}px`,
                          `${Math.min(28, baseHeight * 1.1)}px`,
                          `${Math.max(6, baseHeight * 0.5)}px`,
                          `${Math.min(26, baseHeight * 0.9)}px`,
                        ],
                      }
                    : { height: '4px' }
                }
                transition={{
                  repeat: Infinity,
                  duration: 0.6 + (i % 4) * 0.15,
                  ease: 'easeInOut',
                }}
                className={`w-1 rounded-full ${isPlaying ? 'bg-[#10E862]' : 'bg-zinc-600'}`}
                style={{ height: isPlaying ? `${baseHeight}px` : '4px' }}
              />
            ))}
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="space-y-1.5">
          <div className="w-full bg-[#1F2C23] h-2 rounded-full overflow-hidden relative cursor-pointer">
            <motion.div
              className="bg-gradient-to-r from-[#16835B] to-[#10E862] h-full rounded-full relative"
              style={{ width: `${progressPercent}%` }}
              transition={{ ease: 'linear' }}
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md border border-[#10E862]" />
            </motion.div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#89918C] font-medium">
            <span>{formatTime(elapsedSeconds)}</span>
            <span>~{formatTime(estimatedSeconds)}</span>
          </div>
        </div>

        {/* Spoken Narration Transcript Box (Read along with the AI Teacher) */}
        <div className="bg-[#17221C] border border-[#25352A] rounded-xl p-3 text-xs text-zinc-300 leading-relaxed max-h-24 overflow-y-auto">
          <p className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#10E862] shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">
                {language === 'hi' ? 'शिक्षक व्याख्यान: ' : 'Teacher Narration: '}
              </strong>
              {currentChapter?.textToSpeak}
            </span>
          </p>
        </div>
      </div>

      {/* Chapter Selection Pills */}
      {chapters.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none relative z-10">
          {chapters.map((ch, idx) => (
            <button
              key={ch.id || idx}
              type="button"
              onClick={() => handleSelectChapter(idx)}
              className={`text-xs px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                currentChapterIndex === idx
                  ? 'bg-[#10E862] text-[#0A120D] border-[#10E862] font-bold shadow-[0_0_12px_rgba(16,232,98,0.25)]'
                  : 'bg-[#17221C] text-zinc-400 border-[#25352A] hover:text-white hover:border-[#384F40]'
              }`}
            >
              {currentChapterIndex === idx ? (
                <Radio className="w-3 h-3 text-[#0A120D] animate-pulse" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full bg-[#25352A] text-[10px] flex items-center justify-center text-zinc-300">
                  {idx + 1}
                </span>
              )}
              <span>{ch.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Playback Bar Controls */}
      <div className="pt-3 border-t border-[#243329] flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePrevChapter}
            disabled={currentChapterIndex === 0 && elapsedSeconds === 0}
            className="px-3 py-2 min-h-[44px] rounded-xl bg-[#1B2920] hover:bg-[#25382B] disabled:opacity-40 disabled:cursor-not-allowed border border-[#2B4233] text-xs font-semibold text-zinc-300 transition-all cursor-pointer flex-1 sm:flex-initial flex items-center justify-center"
          >
            {language === 'hi' ? 'पिछला' : 'Previous'}
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            className="flex items-center justify-center gap-2 px-5 py-2 min-h-[44px] rounded-xl bg-[#10E862] hover:bg-[#0fd258] active:scale-95 text-[#0A120D] font-extrabold text-xs sm:text-sm shadow-[0_0_16px_rgba(16,232,98,0.35)] transition-all cursor-pointer flex-2 sm:flex-initial"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-[#0A120D]" />
                <span>{language === 'hi' ? 'रोकें' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-[#0A120D]" />
                <span className="truncate">
                  {isPaused
                    ? language === 'hi'
                      ? 'पुनः शुरू करें'
                      : 'Resume'
                    : language === 'hi'
                    ? 'ऑडियो शुरू करें'
                    : 'Start Audio Lesson'}
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNextChapter}
            disabled={currentChapterIndex >= chapters.length - 1}
            className="px-3 py-2 min-h-[44px] rounded-xl bg-[#1B2920] hover:bg-[#25382B] disabled:opacity-40 disabled:cursor-not-allowed border border-[#2B4233] text-xs font-semibold text-zinc-300 transition-all cursor-pointer flex-1 sm:flex-initial flex items-center justify-center"
          >
            {language === 'hi' ? 'अगला' : 'Next'}
          </button>
        </div>

        <div className="text-[11px] text-[#89918C] font-semibold flex items-center justify-between sm:justify-start gap-1.5 self-center sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10E862] animate-ping" />
            <span>{isPlaying ? (language === 'hi' ? 'बोल रहा है...' : 'Narrating...') : (language === 'hi' ? 'तैयार' : 'Ready')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
