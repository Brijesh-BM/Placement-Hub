'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Folder, Code2, Terminal, ChevronRight, Loader2, Sparkles } from 'lucide-react';

interface NoteItem {
  id: string;
  title: string;
  category: string;
  content: string;
  examples: string | null;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/notes');
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-indigo-650 animate-spin" />
        <span className="text-slate-500 mt-4 text-sm font-medium">Gathering learning notes...</span>
      </div>
    );
  }

  const activeNote = notes[selectedIdx] || null;

  // Group notes by Category for sidebar grouping
  const categoriesList = ['DBMS', 'OS', 'CN', 'OOP', 'SQL'];

  return (
    <div className="flex-1 bg-slate-50 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden max-w-7xl mx-auto w-full">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto flex flex-col bg-white">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          <span className="font-bold text-slate-800 text-sm">Revision Notes Index</span>
        </div>

        {/* Groupings list */}
        <div className="p-3 space-y-4 text-left">
          {categoriesList.map(cat => {
            const catNotes = notes.filter(n => n.category.toUpperCase() === cat);
            if (catNotes.length === 0) return null;

            return (
              <div key={cat} className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3 flex items-center gap-1.5">
                  <Folder className="h-3 w-3 text-slate-400" />
                  {cat}
                </span>

                <div className="space-y-0.5">
                  {catNotes.map(n => {
                    const globalIdx = notes.findIndex(item => item.id === n.id);
                    const active = selectedIdx === globalIdx;
                    return (
                      <button
                        key={n.id}
                        onClick={() => setSelectedIdx(globalIdx)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition ${
                          active
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate pr-2">{n.title}</span>
                        <ChevronRight className={`h-3.5 w-3.5 transition ${active ? 'text-indigo-650' : 'text-slate-400'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50 text-left">
        {activeNote ? (
          <article className="max-w-2xl space-y-6">
            
            {/* Note Header */}
            <div className="space-y-1 border-b border-slate-200 pb-4">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full w-fit block">
                {activeNote.category} Topic Note
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight pt-1">{activeNote.title}</h1>
            </div>

            {/* Note Content markdown mock display */}
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line space-y-4 font-medium">
              {activeNote.content}
            </div>

            {/* Code Examples Card if present */}
            {activeNote.examples && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-wider">
                  <Terminal className="h-4.5 w-4.5" />
                  <span>Practical Example / Schema</span>
                </div>
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-xs font-mono text-slate-600 overflow-x-auto whitespace-pre-line text-left leading-relaxed">
                  {activeNote.examples}
                </div>
              </div>
            )}
          </article>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
            <Sparkles className="h-10 w-10 text-indigo-500/35" />
            <span className="text-slate-450 text-xs italic">Select a revision topic from the index to begin.</span>
          </div>
        )}
      </div>
    </div>
  );
}
