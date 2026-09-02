import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit3,
  Download,
  Share2,
  Sparkles,
  PenTool,
  Network,
  Check,
  Tag,
  Clock,
  RotateCcw,
  Maximize2,
  Eraser,
  Undo,
  Palette,
  Folder,
  Eye,
  FileDown
} from 'lucide-react';
import { StudentNotebookNote, VisualGraphData } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface MyNotesViewProps {
  notes: StudentNotebookNote[];
  onSaveNote: (note: StudentNotebookNote) => void;
  onDeleteNote: (id: string) => void;
}

export const MyNotesView: React.FC<MyNotesViewProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
}) => {
  const { showToast } = useToast();

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [isEditing, setIsEditing] = useState(false);

  // Editor states for active note
  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const [editTitle, setEditTitle] = useState(activeNote?.title || '');
  const [editSubject, setEditSubject] = useState(activeNote?.subject || 'General');
  const [editContent, setEditContent] = useState(activeNote?.content || activeNote?.textContent || '');
  const [editTags, setEditTags] = useState<string>(activeNote?.tags?.join(', ') || '');
  const [isPinned, setIsPinned] = useState(activeNote?.isPinned || false);

  // Drawing Canvas Modal State
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#16835B');
  const [brushSize, setBrushSize] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Concept Graph state
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [graphData, setGraphData] = useState<VisualGraphData | null>(activeNote?.visualGraph || null);
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);

  // Update editor fields when activeNote changes
  useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditSubject(activeNote.subject);
      setEditContent(activeNote.content || activeNote.textContent || '');
      setEditTags(activeNote.tags ? activeNote.tags.join(', ') : '');
      setIsPinned(activeNote.isPinned || false);
      setGraphData(activeNote.visualGraph || null);
    }
  }, [activeNoteId]);

  const subjects = ['All', 'Mathematics', 'Physics', 'Biology', 'Chemistry', 'Computer Science', 'General'];

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const noteText = (n.content || n.textContent || '');
    const matchSubject = selectedSubjectFilter === 'All' || n.subject === selectedSubjectFilter;
    const matchQuery =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      noteText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSubject && matchQuery;
  });

  // Sort pinned first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleCreateNewNote = () => {
    const newNote: StudentNotebookNote = {
      id: 'note-' + Date.now(),
      title: 'Untitled Note',
      subject: selectedSubjectFilter !== 'All' ? selectedSubjectFilter : 'Mathematics',
      content: '# New Study Session\n\n- Key concepts:\n- Formulas:\n- Questions for teacher:\n',
      tags: ['Study'],
      isPinned: false,
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    onSaveNote(newNote);
    setActiveNoteId(newNote.id);
    setIsEditing(true);
    showToast('New note created in your notebook!');
  };

  const handleSaveActiveNote = () => {
    if (!activeNote) return;
    const updated: StudentNotebookNote = {
      ...activeNote,
      title: editTitle.trim() || 'Untitled Note',
      subject: editSubject,
      content: editContent,
      tags: editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isPinned,
      visualGraph: graphData || undefined,
      updatedAt: 'Just now',
    };
    onSaveNote(updated);
    setIsEditing(false);
    showToast('Note changes saved!');
  };

  const handleTogglePin = (note: StudentNotebookNote, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: StudentNotebookNote = {
      ...note,
      isPinned: !note.isPinned,
    };
    onSaveNote(updated);
    if (note.id === activeNoteId) {
      setIsPinned(!note.isPinned);
    }
    showToast(note.isPinned ? 'Note unpinned' : 'Note pinned to top');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this study note?')) {
      onDeleteNote(id);
      showToast('Note deleted');
      if (activeNoteId === id) {
        const remaining = notes.filter((n) => n.id !== id);
        if (remaining.length > 0) {
          setActiveNoteId(remaining[0].id);
        }
      }
    }
  };

  const handleExport = (format: 'markdown' | 'text') => {
    if (!activeNote) return;
    const text = activeNote.content;
    const filename = `${activeNote.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${format === 'markdown' ? 'md' : 'txt'}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filename}`);
  };

  // Canvas Drawing Handlers
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // save current state for undo
    setHistory((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleUndoCanvas = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = history[history.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory((prev) => prev.slice(0, prev.length - 1));
  };

  const handleSaveDrawingToNote = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeNote) return;
    const dataUrl = canvas.toDataURL('image/png');
    const updated: StudentNotebookNote = {
      ...activeNote,
      drawingDataUrl: dataUrl,
      updatedAt: 'Just now',
    };
    onSaveNote(updated);
    setIsDrawingModalOpen(false);
    showToast('Visual diagram attached to note!');
  };

  // AI Concept Graph Generator
  const handleGenerateConceptGraph = async () => {
    if (!activeNote) return;
    setIsGeneratingGraph(true);
    setIsGraphModalOpen(true);

    try {
      const response = await fetch('/api/notes/generate-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteTitle: activeNote.title,
          content: activeNote.content || activeNote.textContent || '',
          visualType: 'concept_map',
        }),
      });

      if (!response.ok) {
        throw new Error('Graph generation failed');
      }

      const generated: VisualGraphData = await response.json();
      setGraphData(generated);

      // Persist to note
      const updatedNote: StudentNotebookNote = {
        ...activeNote,
        visualGraph: generated,
      };
      onSaveNote(updatedNote);
      showToast('Visual Concept Graph generated!');
    } catch (err) {
      console.error(err);
      showToast('Could not generate concept graph at this moment.', 'error');
    } finally {
      setIsGeneratingGraph(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#0F6246] border border-emerald-100 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-[#16835B]" /> Personal Digital Notebook
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight">
            My Notes
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6762] mt-1">
            Write, revise, sketch diagrams, and explore AI visual concept graphs for every subject.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleCreateNewNote}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Note
          </Button>
        </div>
      </div>

      {/* Main Split Layout: Left Notes List (4 Cols) + Right Editor / Viewer (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Notes Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E1E5E1] p-4 shadow-2xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#89918C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search notes, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-[#F8F9F6] border border-[#E1E5E1] rounded-xl pl-9 pr-3 py-2 outline-none focus:border-[#16835B] transition-colors"
              />
            </div>

            {/* Subject Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubjectFilter(s)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                    selectedSubjectFilter === s
                      ? 'bg-[#16835B] text-white shadow-2xs'
                      : 'bg-[#F4F5F1] text-[#5F6762] hover:text-[#171A18]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Notes List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {sortedNotes.length === 0 ? (
                <div className="text-center py-8 text-[#89918C] text-xs">
                  No notes found. Click &quot;New Note&quot; to write one.
                </div>
              ) : (
                sortedNotes.map((note) => {
                  const isActive = note.id === activeNoteId;
                  return (
                    <div
                      key={note.id}
                      onClick={() => {
                        setActiveNoteId(note.id);
                        setIsEditing(false);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer group text-left relative ${
                        isActive
                          ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                          : 'bg-white border-[#E1E5E1] hover:border-[#16835B]/30 hover:bg-[#F8F9F6]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F4F5F1] text-[#171A18] border border-[#E1E5E1]">
                              {note.subject}
                            </span>
                            <span className="text-[10px] text-[#89918C]">{note.updatedAt}</span>
                          </div>
                          <h4 className="text-xs font-bold text-[#171A18] group-hover:text-[#16835B] truncate">
                            {note.title}
                          </h4>
                          <p className="text-[11px] text-[#5F6762] line-clamp-1 mt-0.5">
                            {(note.content || note.textContent || '').replace(/[#*`_]/g, '')}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleTogglePin(note, e)}
                            className={`p-1 rounded hover:bg-[#E1E5E1]/60 transition-colors ${
                              note.isPinned ? 'text-[#16835B]' : 'text-[#89918C]'
                            }`}
                            title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                          >
                            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(note.id, e)}
                            className="p-1 rounded text-[#89918C] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {note.tags && note.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {note.tags.map((t, idx) => (
                            <span key={idx} className="text-[9px] font-medium text-[#5F6762] bg-[#F4F5F1] px-1.5 py-0.5 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Area: Active Note View / Editor (8 Cols) */}
        <div className="lg:col-span-8">
          {activeNote ? (
            <div className="bg-white rounded-2xl border border-[#E1E5E1] shadow-2xs p-6 sm:p-7 space-y-6">
              {/* Note Header & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E5E1]">
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Note Title..."
                      className="w-full text-lg sm:text-xl font-bold text-[#171A18] border-b border-[#16835B] outline-none pb-1"
                    />
                  ) : (
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#171A18] tracking-tight">
                      {activeNote.title}
                    </h2>
                  )}

                  <div className="flex items-center gap-3 mt-1 text-xs text-[#89918C]">
                    <span>Subject: <strong className="text-[#171A18]">{activeNote.subject}</strong></span>
                    <span>&bull;</span>
                    <span>Updated {activeNote.updatedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Visual Diagram Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsDrawingModalOpen(true);
                      setTimeout(initCanvas, 50);
                    }}
                    leftIcon={<PenTool className="w-3.5 h-3.5 text-[#16835B]" />}
                  >
                    Draw Diagram
                  </Button>

                  {/* AI Visual Concept Graph */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleGenerateConceptGraph}
                    leftIcon={<Network className="w-3.5 h-3.5 text-[#16835B]" />}
                  >
                    Concept Graph
                  </Button>

                  {/* Toggle Edit Mode */}
                  {isEditing ? (
                    <Button size="sm" onClick={handleSaveActiveNote} leftIcon={<Check className="w-3.5 h-3.5" />}>
                      Save
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                  )}

                  {/* Export Options */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport('markdown')}
                    title="Export as Markdown"
                  >
                    <FileDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Editing Controls when in edit mode */}
              {isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F8F9F6] rounded-xl border border-[#E1E5E1]">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#5F6762] mb-1">
                      Subject
                    </label>
                    <select
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full text-xs bg-white border border-[#E1E5E1] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#16835B]"
                    >
                      {subjects.filter((s) => s !== 'All').map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#5F6762] mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Exam, formulas, review"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="w-full text-xs bg-white border border-[#E1E5E1] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#16835B]"
                    />
                  </div>
                </div>
              )}

              {/* Note Content (Textarea if editing, formatted preview if viewing) */}
              {isEditing ? (
                <textarea
                  rows={14}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full text-sm text-[#171A18] font-mono bg-white border border-[#E1E5E1] rounded-xl p-4 outline-none focus:border-[#16835B] focus:ring-2 focus:ring-[#16835B]/15 leading-relaxed resize-y"
                  placeholder="Type your notes in Markdown or plain text..."
                />
              ) : (
                <div className="prose prose-emerald max-w-none text-sm text-[#171A18] leading-relaxed whitespace-pre-line">
                  {activeNote.content || activeNote.textContent}
                </div>
              )}

              {/* Attached Visual Diagram if exists */}
              {activeNote.drawingDataUrl && (
                <div className="mt-4 p-4 rounded-xl border border-[#E1E5E1] bg-[#F8F9F6]/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#16835B] flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5" /> Hand-Drawn Visual Diagram
                    </span>
                    <button
                      onClick={() => {
                        const updated = { ...activeNote, drawingDataUrl: undefined };
                        onSaveNote(updated);
                        showToast('Attached diagram removed');
                      }}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Remove Diagram
                    </button>
                  </div>
                  <div className="bg-white rounded-lg border border-[#E1E5E1] p-2 flex justify-center">
                    <img
                      src={activeNote.drawingDataUrl}
                      alt="Student visual diagram"
                      className="max-h-72 object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-[#E1E5E1] p-12 text-center text-[#89918C]">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-[#89918C]" />
              <h3 className="text-base font-bold text-[#171A18]">No Note Selected</h3>
              <p className="text-xs text-[#5F6762] mt-1">
                Select a note from the left sidebar or create a new note.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Visual Drawing / Diagram Modal */}
      <Modal
        isOpen={isDrawingModalOpen}
        onClose={() => setIsDrawingModalOpen(false)}
        title="Visual Diagram Canvas"
        subtitle="Sketch mind maps, chemical bonds, geometry graphs, or physics diagrams"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Canvas Toolbar */}
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#F8F9F6] border border-[#E1E5E1] flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#5F6762]">Brush:</span>
              <div className="flex items-center gap-1.5">
                {['#16835B', '#0F6246', '#171A18', '#E11D48', '#2563EB', '#D97706'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setDrawingColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full border transition-transform ${
                      drawingColor === color ? 'scale-115 ring-2 ring-emerald-500' : 'border-neutral-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#5F6762]">
                <span>Size:</span>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-20 accent-[#16835B]"
                />
              </div>

              <button
                onClick={() => setDrawingColor('#FFFFFF')}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                  drawingColor === '#FFFFFF' ? 'bg-emerald-100 text-[#0F6246] border-emerald-300' : 'border-[#E1E5E1] text-[#5F6762]'
                }`}
                title="Eraser"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Eraser</span>
              </button>

              <button
                onClick={handleUndoCanvas}
                className="p-1.5 rounded-lg border border-[#E1E5E1] text-[#5F6762] hover:text-[#171A18] text-xs flex items-center gap-1"
                title="Undo last stroke"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={initCanvas}
                className="p-1.5 rounded-lg border border-[#E1E5E1] text-[#5F6762] hover:text-rose-600 text-xs flex items-center gap-1"
                title="Clear canvas"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Interactive Drawing Canvas */}
          <div className="border border-[#E1E5E1] rounded-2xl overflow-hidden shadow-inner bg-white flex justify-center cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={700}
              height={380}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="touch-none w-full max-w-[700px] h-auto"
            />
          </div>

          {/* Canvas Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsDrawingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveDrawingToNote}>
              Attach to Note
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI Concept Graph Modal */}
      <Modal
        isOpen={isGraphModalOpen}
        onClose={() => setIsGraphModalOpen(false)}
        title="AI Visual Concept Graph"
        subtitle={`Interactive relational network for: ${activeNote?.title || 'Study Material'}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {isGeneratingGraph ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#16835B] flex items-center justify-center mx-auto animate-spin">
                <Network className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#171A18]">Mapping Concepts & Relationships...</p>
              <p className="text-xs text-[#5F6762]">
                Extracting entities, node hierarchies, and conceptual links for visual learning.
              </p>
            </div>
          ) : graphData ? (
            <div className="space-y-4">
              {/* Concept Graph Visualizer */}
              <div className="p-4 bg-[#F8F9F6] rounded-2xl border border-[#E1E5E1] relative min-h-[320px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[#5F6762] mb-3">
                  <span className="font-semibold text-[#16835B]">
                    Concept Nodes ({graphData.nodes.length}) & Links ({graphData.links.length})
                  </span>
                  <span>Interactive relational map</span>
                </div>

                {/* Visual Node Grid Representation */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-auto">
                  {graphData.nodes.map((node) => (
                    <div
                      key={node.id}
                      className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs text-center space-y-1.5 hover:border-[#16835B] hover:shadow-sm transition-all"
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#0F6246] border border-emerald-200">
                        {node.category}
                      </span>
                      <h4 className="text-xs font-bold text-[#171A18] line-clamp-2">{node.label}</h4>
                    </div>
                  ))}
                </div>

                {/* Explicit Relations / Links List */}
                <div className="mt-4 pt-3 border-t border-[#E1E5E1] space-y-2">
                  <p className="text-[11px] font-bold uppercase text-[#5F6762] tracking-wider">
                    Governing Relationships
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {graphData.links.map((link, idx) => {
                      const fromNode = graphData.nodes.find((n) => n.id === link.from);
                      const toNode = graphData.nodes.find((n) => n.id === link.to);
                      return (
                        <div
                          key={idx}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-[#E1E5E1] text-[#171A18]"
                        >
                          <strong className="text-[#0F6246]">{fromNode?.label || link.from}</strong>
                          <span className="text-[#89918C] mx-1">→ {link.label} →</span>
                          <strong className="text-[#0F6246]">{toNode?.label || link.to}</strong>
                        </div>
                      );
                    })}
                  </div>

                  {graphData.keyTakeaway && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-[#0F6246]">
                      <strong>Key Insight:</strong> {graphData.keyTakeaway}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setIsGraphModalOpen(false)}>
                  Close Graph
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#89918C] text-xs">
              No graph data available. Click &quot;Concept Graph&quot; to synthesize one.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
