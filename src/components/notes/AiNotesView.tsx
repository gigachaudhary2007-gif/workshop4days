import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Printer,
  BookmarkPlus,
  HelpCircle,
  Code2,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lightbulb,
  Zap,
  ListCheck,
  Headphones,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { AnalyzedNoteRecord, AnalyzedNoteContent, User } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FileUploader } from '../ui/FileUploader';
import { useToast } from '../ui/Toast';
import { AudioTeacherPlayer, AudioLessonChapter } from '../ui/AudioTeacherPlayer';
import { uploadNoteFile } from '../../services/storageService';

interface AiNotesViewProps {
  savedNotes: AnalyzedNoteRecord[];
  onSaveNote: (note: AnalyzedNoteRecord) => void;
  onExportToNotebook?: (title: string, content: string, subject: string) => void;
  initialNote?: AnalyzedNoteRecord | null;
  currentUser?: User | null;
  onDeleteNote?: (id: string) => void;
}

export const AiNotesView: React.FC<AiNotesViewProps> = ({
  savedNotes,
  onSaveNote,
  onExportToNotebook,
  initialNote,
  currentUser,
  onDeleteNote,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');
  const [noteTitle, setNoteTitle] = useState(initialNote?.title || '');
  const [subject, setSubject] = useState(initialNote?.subject || 'Biology');
  const [rawText, setRawText] = useState(initialNote?.rawText || '');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    type: string;
    base64: string;
    text?: string;
    size: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [currentNote, setCurrentNote] = useState<AnalyzedNoteRecord | null>(initialNote || null);
  const [revealedAnswers, setRevealedAnswers] = useState<{ [index: number]: boolean }>({});
  const [copied, setCopied] = useState(false);

  // Pre-set sample notes for instant student exploration
  const samplePrompts = [
    {
      label: 'Cellular Respiration & Krebs Cycle',
      subject: 'Biology',
      text: 'Glycolysis occurs in cytoplasm, yields 2 pyruvate + 2 ATP + 2 NADH. Pyruvate enters mitochondria, converted to Acetyl-CoA by pyruvate dehydrogenase. Krebs cycle in matrix produces NADH, FADH2, GTP. Electron transport chain across inner membrane pumps H+ ions into intermembrane space. ATP synthase produces ~30 ATP via oxidative phosphorylation using oxygen as terminal electron acceptor.'
    },
    {
      label: 'Electromagnetism: Faraday & Lenz Law',
      subject: 'Physics',
      text: 'Magnetic flux Φ = B * A * cos(θ). Faraday\'s Law states induced electromotive force (EMF) ε = -N * (dΦ/dt). Lenz\'s Law specifies the negative sign: the induced current flows in a direction such that its magnetic field opposes the change in magnetic flux that produced it. Applications include AC generators, induction cooktops, and transformers.'
    },
    {
      label: 'Equilibrium & Le Chatelier\'s Principle',
      subject: 'Chemistry',
      text: 'Chemical equilibrium occurs when forward and reverse reaction rates are equal, concentrations constant. Equilibrium constant Kc = [C]^c[D]^d / [A]^a[B]^b. Le Chatelier\'s Principle: if a dynamic equilibrium is disturbed by changing conditions, the position of equilibrium moves to counteract the change. Increasing pressure shifts to side with fewer moles of gas. Increasing temperature favors endothermic reaction (ΔH > 0).'
    }
  ];

  const handleApplySample = (s: typeof samplePrompts[0]) => {
    setNoteTitle(s.label);
    setSubject(s.subject);
    setRawText(s.text);
    setSelectedFile(null);
  };

  const generateAudioChapters = (note: AnalyzedNoteRecord): AudioLessonChapter[] => {
    const chapters: AudioLessonChapter[] = [
      {
        id: 'intro',
        title: 'Overview & Introduction',
        subtitle: note.subject,
        textToSpeak: `Welcome to your AI Audio Lesson on ${note.data.topic} in ${note.subject}. Here is the core summary: ${note.summary}. Listen closely as we cover the major concepts, definitions, and high-yield exam takeaways.`,
      },
      {
        id: 'concepts',
        title: 'Core Concepts Breakdown',
        subtitle: `${note.data.importantConcepts.length} Concepts`,
        textToSpeak: `Now let's examine the key concepts. ${note.data.importantConcepts.map(c => `${c.concept}: ${c.description}`).join('. ')}`,
      },
      {
        id: 'definitions',
        title: 'Essential Definitions',
        subtitle: `${note.data.definitions.length} Terms`,
        textToSpeak: `Next, here are the essential definitions to remember: ${note.data.definitions.map(d => `${d.term} is defined as ${d.definition}`).join('. ')}`,
      },
    ];

    if (note.data.formulas && note.data.formulas.length > 0) {
      chapters.push({
        id: 'formulas',
        title: 'Formulas & Applications',
        subtitle: `${note.data.formulas.length} Formulas`,
        textToSpeak: `Let us review the mathematical formulas: ${note.data.formulas.map(f => `${f.name}: ${f.formula}. Note that ${f.explanation}`).join('. ')}`,
      });
    }

    if (note.data.quickRevision && note.data.quickRevision.length > 0) {
      chapters.push({
        id: 'revision',
        title: 'Rapid Revision Review',
        subtitle: 'Final Takeaways',
        textToSpeak: `To consolidate your understanding, review these key points: ${note.data.quickRevision.join('. ')}. Excellent job completing this audio lesson!`,
      });
    }

    return chapters;
  };

  const sampleDemoChapters: AudioLessonChapter[] = [
    {
      id: 'demo-intro',
      title: 'Cellular Respiration Overview',
      subtitle: 'Biology Core Lesson',
      textToSpeak: 'Welcome to this sample audio lesson on Cellular Respiration. Cellular respiration is the biochemical pathway by which cells break down glucose to generate ATP energy. It consists of Glycolysis, the Citric Acid or Krebs Cycle, and Oxidative Phosphorylation.',
    },
    {
      id: 'demo-stages',
      title: 'Glycolysis & Krebs Cycle',
      subtitle: 'Key Pathways',
      textToSpeak: 'Glycolysis takes place in the cytoplasm and yields two net ATP, two pyruvate molecules, and two NADH. Pyruvate then enters the mitochondrial matrix to undergo the Krebs Cycle, producing electron carriers for the respiratory chain.',
    },
    {
      id: 'demo-atp',
      title: 'Electron Transport & ATP Yield',
      subtitle: 'Oxidative Phosphorylation',
      textToSpeak: 'High-energy electrons flow across the inner mitochondrial membrane, pumping protons into the intermembrane space. ATP synthase uses this electrochemical gradient to produce approximately 30 to 32 ATP molecules per glucose molecule.',
    },
  ];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() && !selectedFile) {
      showToast('Please enter your study notes or upload an image/document.', 'error');
      return;
    }

    // Validate uploaded file if present
    if (selectedFile) {
      if (selectedFile.size && selectedFile.size > 10 * 1024 * 1024) {
        showToast('Uploaded file exceeds 10MB limit. Please upload a smaller image or document.', 'error');
        return;
      }

      const isImage = selectedFile.type?.startsWith('image/');
      const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name?.toLowerCase().endsWith('.pdf');
      const isText = selectedFile.type?.startsWith('text/') || selectedFile.name?.toLowerCase().endsWith('.txt');

      if (!isImage && !isPdf && !isText) {
        showToast('Unsupported file format. Please upload an image, PDF, or text file.', 'error');
        return;
      }
    }

    setIsLoading(true);
    setCurrentNote(null);
    setRevealedAnswers({});

    try {
      // 1. Securely upload original note to Firebase Storage under users/{userId}/notes/
      let originalFileUrl: string | undefined = undefined;
      let storagePath: string | undefined = undefined;

      if (selectedFile && currentUser?.id) {
        try {
          const blob = await fetch(selectedFile.base64).then((r) => r.blob());
          const uploadRes = await uploadNoteFile(currentUser.id, blob, selectedFile.name);
          originalFileUrl = uploadRes.downloadUrl;
          storagePath = uploadRes.storagePath;
        } catch (storageErr) {
          console.warn('Firebase Storage upload warning (continuing with analysis):', storageErr);
        }
      }

      // 2. Request Gemini analysis from server-side endpoint
      const response = await fetch('/api/notes/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle.trim() || 'Structured Study Guide',
          subject,
          rawNotes: rawText.trim() || selectedFile?.text,
          imageBase64: selectedFile?.type?.startsWith('image/') ? selectedFile.base64 : undefined,
          imageMimeType: selectedFile?.type?.startsWith('image/') ? selectedFile.type : undefined,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Server returned error analyzing notes');
      }

      const analyzedData: AnalyzedNoteContent = await response.json();

      const newRecord: AnalyzedNoteRecord = {
        id: 'note-' + Date.now(),
        title: noteTitle.trim() || analyzedData.topic,
        subject,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        summary: analyzedData.explanation || analyzedData.quickRevision?.[0] || 'Structured revision guide with concepts and formulas.',
        rawText,
        originalFileUrl,
        storagePath,
        data: analyzedData,
      };

      setCurrentNote(newRecord);
      onSaveNote(newRecord);
      showToast('Study notes synthesized into structured revision document!');
    } catch (err: any) {
      console.error('Error analyzing notes:', err);
      showToast(err?.message || 'Failed to analyze notes. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyDocument = () => {
    if (!currentNote) return;
    const d = currentNote.data;
    const markdown = `# ${d.topic}
Subject: ${currentNote.subject}

## 1. Important Concepts
${d.importantConcepts.map((c) => `- **${c.concept}**: ${c.description}`).join('\n')}

## 2. Definitions
${d.definitions.map((def) => `- **${def.term}**: ${def.definition}`).join('\n')}

## 3. Key Formulas
${d.formulas.map((f) => `- **${f.name}**: \`${f.formula}\` (${f.explanation})`).join('\n')}

## 4. Key Takeaway Points
${d.keyPoints.map((kp) => `- ${kp}`).join('\n')}

## 5. Examples & Applications
${d.examples.map((ex, i) => `### Example ${i + 1}: ${ex.problem}\n**Solution**: ${ex.solution}`).join('\n\n')}

## 6. Important Practice Questions
${d.importantQuestions.map((q, i) => `### Q${i + 1}: ${q.question}\n*Hint: ${q.hint}*\n**Answer**: ${q.answer}`).join('\n\n')}

## 7. Quick Revision
${d.quickRevision.map((qr) => `* ${qr}`).join('\n')}
`;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    showToast('Document copied in clean Markdown format!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotebook = () => {
    if (!currentNote || !onExportToNotebook) return;
    const d = currentNote.data;
    const content = `# ${d.topic}
Subject: ${currentNote.subject}

## Important Concepts
${d.importantConcepts.map((c) => `* **${c.concept}**: ${c.description}`).join('\n')}

## Formulas
${d.formulas.map((f) => `* **${f.name}**: \`${f.formula}\` - ${f.explanation}`).join('\n')}

## Quick Revision
${d.quickRevision.map((r) => `- ${r}`).join('\n')}
`;
    onExportToNotebook(currentNote.title, content, currentNote.subject);
    showToast('Exported to personal notebook in My Notes!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#0F6246] border border-emerald-100 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#16835B]" /> Document Structuring Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight">
            AI Notes Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6762] mt-1">
            Turn handwritten notes, lecture transcripts, and PDFs into high-yield study documents.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-[#F4F5F1] p-1 rounded-xl border border-[#E1E5E1]">
          <button
            onClick={() => setActiveTab('create')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'create'
                ? 'bg-white text-[#171A18] shadow-2xs'
                : 'text-[#5F6762] hover:text-[#171A18]'
            }`}
          >
            Create / Analyze
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'library'
                ? 'bg-white text-[#171A18] shadow-2xs'
                : 'text-[#5F6762] hover:text-[#171A18]'
            }`}
          >
            Saved Guides ({savedNotes.length})
          </button>
        </div>
      </div>

      {activeTab === 'library' ? (
        /* Library of Saved Study Documents */
        <div className="space-y-4">
          {savedNotes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#E1E5E1] p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#16835B] flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#171A18]">No Saved Study Guides Yet</h3>
              <p className="text-xs text-[#5F6762] mt-1 max-w-sm">
                Upload handwritten notes or enter lecture text to synthesize and save your first structured revision guide.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('create')}
                className="mt-4"
              >
                Create Study Guide
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setCurrentNote(note);
                    setActiveTab('create');
                  }}
                  className="bg-white rounded-2xl border border-[#E1E5E1] p-5 hover:border-[#16835B]/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#16835B] border border-emerald-100">
                          {note.subject}
                        </span>
                        {note.originalFileUrl && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                            Source Attached
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#89918C]">{note.createdAt}</span>
                        {onDeleteNote && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete saved note "${note.title}"?`)) {
                                onDeleteNote(note.id);
                                if (currentNote?.id === note.id) {
                                  setCurrentNote(null);
                                }
                                showToast('Note deleted');
                              }
                            }}
                            className="p-1 text-[#89918C] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-[#171A18] group-hover:text-[#16835B] transition-colors line-clamp-1">
                      {note.title}
                    </h3>
                    <p className="text-xs text-[#5F6762] mt-1.5 line-clamp-2 leading-relaxed">
                      {note.summary}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E1E5E1] flex items-center justify-between text-xs font-semibold text-[#16835B]">
                    <span>Open Study Guide</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Create & Analysis Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <form onSubmit={handleAnalyze} className="bg-white rounded-2xl border border-[#E1E5E1] p-5 sm:p-6 shadow-2xs space-y-4">
              <Input
                label="Study Topic / Title"
                placeholder="e.g. Photosynthesis & Calvin Cycle"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ai-notes-subject-select" className="block text-xs font-bold text-[#5F6762] uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <select
                    id="ai-notes-subject-select"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs font-medium text-[#171A18] bg-white border border-[#E1E5E1] rounded-xl px-3 py-2.5 outline-none focus:border-[#16835B]"
                  >
                    <option value="Biology">Biology</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="History">History</option>
                    <option value="Economics">Economics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5F6762] uppercase tracking-wider mb-1.5">
                    Sample Materials
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => handleApplySample(samplePrompts[0])}
                      className="w-full text-xs text-left truncate px-3 py-2.5 rounded-xl border border-[#E1E5E1] bg-[#F8F9F6] hover:bg-[#F4F5F1] text-[#16835B] font-semibold"
                    >
                      Load Sample Note
                    </button>
                  </div>
                </div>
              </div>

              {/* Text Notes Input */}
              <div>
                <label htmlFor="ai-notes-textarea" className="block text-xs font-bold text-[#5F6762] uppercase tracking-wider mb-1.5">
                  Raw Notes or Lecture Transcript
                </label>
                <textarea
                  id="ai-notes-textarea"
                  rows={5}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste rough notes, messy textbook excerpts, or lecture transcripts here..."
                  className="w-full text-sm text-[#171A18] placeholder-[#89918C] bg-white border border-[#E1E5E1] focus:border-[#16835B] focus:ring-2 focus:ring-[#16835B]/15 rounded-xl p-3.5 outline-none transition-all resize-y min-h-[120px]"
                />
              </div>

              {/* Upload Handwritten / PDF / Image */}
              <div>
                <label className="block text-xs font-bold text-[#5F6762] uppercase tracking-wider mb-1.5">
                  Or Upload Handwritten Notes / PDF
                </label>
                <FileUploader
                  label="Upload notes photo or PDF file"
                  sublabel="Handwritten images, PDF slides, or documents"
                  selectedFile={selectedFile}
                  onFileSelected={(file) => setSelectedFile(file)}
                  onClear={() => setSelectedFile(null)}
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="md"
                  isLoading={isLoading}
                  className="w-full"
                  rightIcon={<Sparkles className="w-4 h-4" />}
                >
                  Generate Structured Study Guide
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Structured Study Document (7 Cols) */}
          <div className="lg:col-span-7">
            {isLoading ? (
              <div className="bg-white rounded-2xl border border-[#E1E5E1] p-8 text-center space-y-4 shadow-2xs flex flex-col items-center justify-center min-h-[500px]">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#16835B] animate-pulse">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#171A18]">Structuring Study Guide...</h3>
                <p className="text-xs text-[#5F6762] max-w-sm">
                  Extracting formulas, organizing definitions, formulating exam practice questions, and designing quick revision cards.
                </p>
              </div>
            ) : currentNote ? (
              /* Beautiful Study Document Layout */
              <div className="bg-white rounded-2xl border border-[#E1E5E1] shadow-2xs overflow-hidden">
                {/* Document Header Toolbar */}
                <div className="p-5 sm:p-6 bg-gradient-to-b from-[#F8F9F6] to-white border-b border-[#E1E5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F6246]">
                        {currentNote.subject} Study Guide
                      </span>
                      <span className="text-xs text-[#89918C]">{currentNote.createdAt}</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#171A18] tracking-tight">
                      {currentNote.data.topic}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {currentNote.originalFileUrl && (
                      <a
                        href={currentNote.originalFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#16835B] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors font-semibold"
                        title="Open uploaded note from Firebase Storage"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Source File</span>
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyDocument}
                      leftIcon={copied ? <Check className="w-3.5 h-3.5 text-[#16835B]" /> : <Copy className="w-3.5 h-3.5" />}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    {onExportToNotebook && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSaveToNotebook}
                        leftIcon={<BookmarkPlus className="w-3.5 h-3.5 text-[#16835B]" />}
                      >
                        Notebook
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                      className="hidden sm:inline-flex"
                    >
                      Print
                    </Button>
                  </div>
                </div>

                {/* AI Audio Teach Player Portion */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-[#17221C] to-[#121915] border-b border-[#25352A]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Headphones className="w-4 h-4 text-[#10E862]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Audio Teach & Guided Lecture
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10E862]/20 text-[#10E862] border border-[#10E862]/40">
                      Voice Narration
                    </span>
                  </div>
                  <AudioTeacherPlayer
                    title={currentNote.data.topic}
                    subject={currentNote.subject}
                    chapters={generateAudioChapters(currentNote)}
                    language="en"
                  />
                </div>

                {/* Document Content Sections */}
                <div className="p-6 sm:p-7 space-y-6 max-h-[750px] overflow-y-auto">
                  {/* Simple Explanation */}
                  {currentNote.data.explanation && (
                    <section className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#16835B] uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        <span>Simple Explanation</span>
                      </div>
                      <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 text-xs text-[#171A18] leading-relaxed">
                        {currentNote.data.explanation}
                      </div>
                    </section>
                  )}

                  {/* Important Concepts */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#16835B] uppercase tracking-wider">
                      <Lightbulb className="w-4 h-4" />
                      <span>Important Concepts</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentNote.data.importantConcepts.map((item, i) => (
                        <div key={i} className="p-3.5 rounded-xl border border-[#E1E5E1] bg-[#F8F9F6]/60">
                          <h4 className="text-xs font-bold text-[#171A18]">{item.concept}</h4>
                          <p className="text-xs text-[#5F6762] mt-1 leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Definitions */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#16835B] uppercase tracking-wider">
                      <BookOpen className="w-4 h-4" />
                      <span>Core Definitions</span>
                    </div>
                    <div className="space-y-2">
                      {currentNote.data.definitions.map((item, i) => (
                        <div key={i} className="p-3 rounded-xl border border-[#E1E5E1] flex flex-col sm:flex-row sm:items-start gap-2">
                          <span className="text-xs font-bold text-[#0F6246] min-w-[140px] shrink-0">
                            {item.term}
                          </span>
                          <p className="text-xs text-[#5F6762] leading-relaxed">
                            {item.definition}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Formulas */}
                  {currentNote.data.formulas && currentNote.data.formulas.length > 0 && (
                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#16835B] uppercase tracking-wider">
                        <Code2 className="w-4 h-4" />
                        <span>Governing Formulas</span>
                      </div>
                      <div className="space-y-2.5">
                        {currentNote.data.formulas.map((item, i) => (
                          <div key={i} className="p-3.5 rounded-xl border border-[#E1E5E1] bg-[#F8F9F6]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-xs font-bold text-[#171A18]">{item.name}</span>
                              <div className="px-3 py-1 rounded-lg bg-white font-mono text-xs font-semibold text-[#0F6246] border border-[#E1E5E1]">
                                {item.formula}
                              </div>
                            </div>
                            <p className="text-xs text-[#5F6762] mt-2 leading-relaxed">{item.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Key Points */}
                  <section className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#16835B] uppercase tracking-wider">
                      <ListCheck className="w-4 h-4" />
                      <span>Key Takeaways</span>
                    </div>
                    <ul className="space-y-1.5 pl-1">
                      {currentNote.data.keyPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-[#171A18] leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16835B] mt-1.5 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Examples */}
                  {currentNote.data.examples && currentNote.data.examples.length > 0 && (
                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#16835B] uppercase tracking-wider">
                        <Zap className="w-4 h-4" />
                        <span>Worked Examples</span>
                      </div>
                      <div className="space-y-3">
                        {currentNote.data.examples.map((item, i) => (
                          <div key={i} className="p-4 rounded-xl border border-[#E1E5E1] bg-white">
                            <h4 className="text-xs font-bold text-[#171A18]">
                              Problem: {item.problem}
                            </h4>
                            <div className="mt-2 p-3 rounded-lg bg-[#F4F5F1] text-xs text-[#171A18] leading-relaxed">
                              <strong>Solution:</strong> {item.solution}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Important Questions (with active recall answer toggle) */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#16835B] uppercase tracking-wider">
                        <HelpCircle className="w-4 h-4" />
                        <span>Exam Practice Questions</span>
                      </div>
                      <span className="text-[11px] text-[#89918C]">Click question to reveal solution</span>
                    </div>

                    <div className="space-y-2.5">
                      {currentNote.data.importantQuestions.map((item, i) => {
                        const isRevealed = revealedAnswers[i];
                        return (
                          <div
                            key={i}
                            className="p-3.5 rounded-xl border border-[#E1E5E1] bg-white transition-all"
                          >
                            <div
                              onClick={() => toggleAnswer(i)}
                              className="flex items-start justify-between gap-3 cursor-pointer select-none"
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-bold text-[#16835B]">Q{i + 1}:</span>
                                <span className="text-xs font-bold text-[#171A18]">{item.question}</span>
                              </div>
                              <button
                                type="button"
                                className="text-[#89918C] hover:text-[#171A18] p-1 shrink-0"
                              >
                                {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>

                            <p className="text-[11px] text-[#89918C] mt-1.5 pl-6">
                              <em>Hint: {item.hint}</em>
                            </p>

                            {isRevealed && (
                              <div className="mt-2.5 pl-6 pt-2 border-t border-[#E1E5E1] text-xs text-[#0F6246] bg-emerald-50/60 p-2.5 rounded-lg">
                                <strong>Answer:</strong> {item.answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Quick Revision Section */}
                  <section className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0F6246] uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-[#16835B]" />
                      <span>5-Minute Quick Revision Checklist</span>
                    </div>
                    <ul className="space-y-1 pl-1">
                      {currentNote.data.quickRevision.map((rev, i) => (
                        <li key={i} className="text-xs text-[#171A18] flex items-start gap-2 leading-relaxed">
                          <Check className="w-3.5 h-3.5 text-[#16835B] mt-0.5 shrink-0" />
                          <span>{rev}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Audio Teach Quick Demo Section */}
                <div className="bg-white rounded-2xl border border-[#E1E5E1] p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#16835B] flex items-center justify-center">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#171A18]">AI Audio Teach Interactive Preview</h3>
                        <p className="text-xs text-[#5F6762]">Listen to an instant sample lecture while drafting your notes</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-[#0F6246]">
                      Ready to Play
                    </span>
                  </div>

                  <AudioTeacherPlayer
                    title="Cellular Respiration & Krebs Cycle"
                    subject="Biology Demo"
                    chapters={sampleDemoChapters}
                    language="en"
                  />
                </div>

                <div className="bg-white rounded-2xl border border-dashed border-[#E1E5E1] p-8 text-center flex flex-col items-center justify-center min-h-[300px] text-[#89918C]">
                  <div className="w-14 h-14 rounded-2xl bg-[#F8F9F6] border border-[#E1E5E1] flex items-center justify-center text-[#89918C] mb-3">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-[#171A18]">Generate Your Custom Study Guide</h3>
                  <p className="text-xs text-[#5F6762] max-w-sm mt-1">
                    Input study material on the left or choose a pre-loaded sample above to generate notes and an instant audio lecture.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
