import React, { useState } from 'react';
import {
  HelpCircle,
  Send,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  BookmarkPlus,
  BookOpen,
  Layers,
  ListOrdered,
  FileCheck2,
  Clock,
  History,
  Image as ImageIcon
} from 'lucide-react';
import { DoubtRecord, DoubtSolution, StepSolution } from '../../types';
import { Button } from '../ui/Button';
import { FileUploader } from '../ui/FileUploader';
import { useToast } from '../ui/Toast';

interface DoubtSolverViewProps {
  doubts: DoubtRecord[];
  onSaveDoubt: (doubt: DoubtRecord) => void;
  onSaveToNotebook?: (title: string, content: string, subject: string) => void;
  initialDoubt?: DoubtRecord | null;
}

export const DoubtSolverView: React.FC<DoubtSolverViewProps> = ({
  doubts,
  onSaveDoubt,
  onSaveToNotebook,
  initialDoubt,
}) => {
  const { showToast } = useToast();

  const [question, setQuestion] = useState(initialDoubt?.question || '');
  const [subject, setSubject] = useState(initialDoubt?.subject || 'Mathematics');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    type: string;
    base64: string;
    text?: string;
    size: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [currentSolution, setCurrentSolution] = useState<DoubtSolution | null>(
    initialDoubt?.solution || null
  );
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Economics',
    'History',
    'Literature',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() && !selectedFile) {
      showToast('Please enter your question or upload an image/document.', 'error');
      return;
    }

    setIsLoading(true);
    setCurrentSolution(null);

    try {
      const response = await fetch('/api/doubt/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          subject,
          imageBase64: selectedFile?.type?.startsWith('image/') ? selectedFile.base64 : undefined,
          imageMimeType: selectedFile?.type?.startsWith('image/') ? selectedFile.type : undefined,
          documentText: selectedFile?.text || (!selectedFile?.type?.startsWith('image/') ? selectedFile?.base64 : undefined),
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned error solving doubt');
      }

      const data: DoubtSolution = await response.json();
      setCurrentSolution(data);

      // Save to doubts list
      const newDoubt: DoubtRecord = {
        id: 'doubt-' + Date.now(),
        question: question.trim() || `[Attached: ${selectedFile?.name}]`,
        subject,
        timestamp: 'Just now',
        hasAttachment: !!selectedFile,
        attachmentName: selectedFile?.name,
        solution: data,
      };
      onSaveDoubt(newDoubt);
      showToast('Doubt solved successfully with step-by-step guidance!');
    } catch (err: any) {
      console.error('Error solving doubt:', err);
      showToast('Unable to connect to AI server. Please check your network or try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAnswer = () => {
    if (!currentSolution) return;
    const text = `Doubt: ${question} (${subject})

1. MAIN CONTEXT:
${currentSolution.mainContext}

2. MAIN POINTS:
${currentSolution.mainPoints.map((p) => `• ${p}`).join('\n')}

3. STEP-BY-STEP SOLUTION:
${currentSolution.stepByStepSolution
  .map((s) => `Step ${s.stepNumber}: ${s.title}\n${s.explanation}${s.mathOrCode ? `\nFormula/Code: ${s.mathOrCode}` : ''}`)
  .join('\n\n')}

4. FINAL ANSWER:
${currentSolution.finalAnswer}

5. QUICK SUMMARY:
${currentSolution.quickSummary}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Complete solution copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setQuestion('');
    setSelectedFile(null);
    setCurrentSolution(null);
  };

  const handleNewQuestion = () => {
    setQuestion('');
    setSelectedFile(null);
    setCurrentSolution(null);
  };

  const handleSaveNote = () => {
    if (!currentSolution) return;
    if (onSaveToNotebook) {
      const title = question.slice(0, 50) || 'Doubt Solution';
      const content = `# ${title}
Subject: ${subject}

## Main Context
${currentSolution.mainContext}

## Key Takeaways
${currentSolution.mainPoints.map((p) => `- ${p}`).join('\n')}

## Step-by-Step Solution
${currentSolution.stepByStepSolution.map((s) => `### Step ${s.stepNumber}: ${s.title}\n${s.explanation}\n\`\`\`\n${s.mathOrCode || ''}\n\`\`\``).join('\n\n')}

## Final Answer
> **${currentSolution.finalAnswer}**

## Quick Summary
${currentSolution.quickSummary}`;

      onSaveToNotebook(title, content, subject);
      showToast('Saved directly to your Notebook in My Notes!');
    }
  };

  const loadPastDoubt = (d: DoubtRecord) => {
    setQuestion(d.question);
    setSubject(d.subject);
    setCurrentSolution(d.solution || null);
    setShowHistory(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#0F6246] border border-emerald-100 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#16835B]" /> Socratic AI Mentorship
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight">
            AI Doubt Solver
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6762] mt-1">
            Type your question or upload textbook snapshots for structured step-by-step guidance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            leftIcon={<History className="w-4 h-4 text-[#16835B]" />}
          >
            History ({doubts.length})
          </Button>
          {currentSolution && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNewQuestion}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              New Question
            </Button>
          )}
        </div>
      </div>

      {/* History Drawer if toggled */}
      {showHistory && (
        <div className="bg-white rounded-2xl border border-[#E1E5E1] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171A18] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#16835B]" /> Previously Solved Doubts
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-[#89918C] hover:text-[#171A18]"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {doubts.map((d) => (
              <div
                key={d.id}
                onClick={() => loadPastDoubt(d)}
                className="p-3 rounded-xl border border-[#E1E5E1] hover:border-[#16835B]/40 hover:bg-[#F8F9F6] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#16835B]">
                    {d.subject}
                  </span>
                  <span className="text-[#89918C]">{d.timestamp}</span>
                </div>
                <p className="text-xs font-semibold text-[#171A18] line-clamp-2">{d.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E1E5E1] p-5 sm:p-6 shadow-2xs space-y-4">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-bold text-[#5F6762] uppercase tracking-wider mb-2">
                Subject
              </label>
              <div className="flex flex-wrap gap-1.5">
                {subjects.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubject(s)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
                      subject === s
                        ? 'bg-[#16835B] text-white shadow-2xs'
                        : 'bg-[#F4F5F1] text-[#5F6762] hover:text-[#171A18] hover:bg-[#EAECE6]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Textarea */}
            <div>
              <label htmlFor="doubt-question-input" className="block text-xs font-bold text-[#5F6762] uppercase tracking-wider mb-1.5">
                Your Question / Doubt
              </label>
              <textarea
                id="doubt-question-input"
                rows={4}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Find the roots of 2x² - 5x + 3 = 0 using the quadratic formula, or explain why mitochondria produce ATP..."
                className="w-full text-sm text-[#171A18] placeholder-[#89918C] bg-white border border-[#E1E5E1] focus:border-[#16835B] focus:ring-2 focus:ring-[#16835B]/15 rounded-xl p-3.5 outline-none transition-all resize-y min-h-[100px]"
              />
            </div>

            {/* File & Image Upload Area */}
            <div>
              <label className="block text-xs font-bold text-[#5F6762] uppercase tracking-wider mb-1.5">
                Upload Image or Document (Optional)
              </label>
              <FileUploader
                label="Snap or drop textbook problem / notes"
                sublabel="PNG, JPG, or PDF file"
                accept="image/*,.pdf,.txt"
                selectedFile={selectedFile}
                onFileSelected={(file) => setSelectedFile(file)}
                onClear={() => setSelectedFile(null)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={isLoading || (!question && !selectedFile)}
              >
                Clear
              </Button>

              <Button
                type="submit"
                size="md"
                isLoading={isLoading}
                rightIcon={<Send className="w-4 h-4" />}
                className="flex-1 sm:flex-initial"
              >
                Solve with AI
              </Button>
            </div>
          </form>

          {/* Quick Guidance Card */}
          <div className="bg-[#F8F9F6] rounded-2xl border border-[#E1E5E1] p-4 text-xs space-y-2">
            <h4 className="font-bold text-[#171A18] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#16835B]" /> 5-Phase Response Structure
            </h4>
            <p className="text-[#5F6762] leading-relaxed">
              Every doubt is answered with: <strong>1. Main Context</strong>, <strong>2. Main Points</strong>, <strong>3. Step-by-Step Solution</strong>, <strong>4. Final Answer</strong>, and <strong>5. Quick Summary</strong> to ensure thorough exam preparation.
            </p>
          </div>
        </div>

        {/* Right Column: AI Response Card (7 Cols) */}
        <div className="lg:col-span-7">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-[#E1E5E1] p-8 text-center space-y-5 shadow-2xs flex flex-col items-center justify-center min-h-[420px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#16835B] animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-base font-bold text-[#171A18]">Deconstructing Doubt...</h3>
                <p className="text-xs text-[#5F6762] leading-relaxed">
                  Synthesizing primary academic context, mapping theorem foundations, and computing the step-by-step solution for {subject}.
                </p>
              </div>

              {/* Shimmer skeleton bars */}
              <div className="w-full max-w-md space-y-2.5 pt-4">
                <div className="h-3 bg-[#F4F5F1] rounded-full w-full animate-pulse" />
                <div className="h-3 bg-[#F4F5F1] rounded-full w-5/6 animate-pulse" />
                <div className="h-3 bg-[#F4F5F1] rounded-full w-4/6 animate-pulse" />
              </div>
            </div>
          ) : currentSolution ? (
            <div className="bg-white rounded-2xl border border-[#E1E5E1] p-6 sm:p-7 shadow-2xs space-y-6">
              {/* Response Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E1E5E1]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F6246]">
                      {subject} Solution
                    </span>
                    <span className="text-xs text-[#89918C]">Verified Step-by-Step</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#171A18] mt-1 line-clamp-1">
                    {question || 'Analyzed Question'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAnswer}
                    leftIcon={copied ? <Check className="w-3.5 h-3.5 text-[#16835B]" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  {onSaveToNotebook && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveNote}
                      leftIcon={<BookmarkPlus className="w-3.5 h-3.5 text-[#16835B]" />}
                    >
                      Save to Notes
                    </Button>
                  )}
                </div>
              </div>

              {/* 1. Main Context */}
              <div className="p-4 rounded-xl bg-[#F8F9F6] border border-[#E1E5E1]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#16835B] uppercase tracking-wider mb-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>1. Main Context</span>
                </div>
                <p className="text-xs sm:text-sm text-[#171A18] leading-relaxed">
                  {currentSolution.mainContext}
                </p>
              </div>

              {/* 2. Main Points */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#16835B] uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>2. Main Points</span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {currentSolution.mainPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#171A18] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16835B] mt-2 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Step-by-Step Solution */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#16835B] uppercase tracking-wider">
                  <ListOrdered className="w-4 h-4" />
                  <span>3. Step-by-Step Solution</span>
                </div>

                <div className="space-y-3">
                  {currentSolution.stepByStepSolution.map((step: StepSolution) => (
                    <div
                      key={step.stepNumber}
                      className="p-4 rounded-xl border border-[#E1E5E1] bg-white hover:border-[#16835B]/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#0F6246] text-xs font-bold flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#171A18]">
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-[#5F6762] leading-relaxed pl-7">
                        {step.explanation}
                      </p>
                      {step.mathOrCode && (
                        <div className="mt-2.5 ml-7 p-2.5 rounded-lg bg-[#F4F5F1] font-mono text-xs text-[#171A18] border border-[#E1E5E1]/80 overflow-x-auto">
                          {step.mathOrCode}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Final Answer */}
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0F6246] uppercase tracking-wider mb-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#16835B]" />
                  <span>4. Final Answer</span>
                </div>
                <p className="text-sm font-bold text-[#0F6246] leading-relaxed">
                  {currentSolution.finalAnswer}
                </p>
              </div>

              {/* 5. Quick Summary */}
              <div className="p-4 rounded-xl bg-[#F8F9F6] border border-[#E1E5E1]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5F6762] uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#16835B]" />
                  <span>5. Quick Revision Summary</span>
                </div>
                <p className="text-xs text-[#5F6762] leading-relaxed">
                  {currentSolution.quickSummary}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-[#E1E5E1] p-8 text-center flex flex-col items-center justify-center min-h-[420px] text-[#89918C]">
              <div className="w-14 h-14 rounded-2xl bg-[#F8F9F6] border border-[#E1E5E1] flex items-center justify-center text-[#89918C] mb-3">
                <HelpCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#171A18]">No Doubt Active</h3>
              <p className="text-xs text-[#5F6762] max-w-sm mt-1">
                Type your doubt or question on the left or select a previous question from history to inspect the complete 5-stage explanation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
