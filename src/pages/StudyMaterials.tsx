import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, 
  FileText, 
  File as FileIcon, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  LayoutGrid,
  Sparkles,
  X
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../lib/store';
import { UploadedFile, FlashcardSet, Flashcard, QuizQuestion } from '../types';
import { generateFlashcardsAndQuiz } from '../lib/gemini';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const StudyMaterials = () => {
  const { profile } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [directNotes, setDirectNotes] = useState("");

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(collection(db, 'uploaded_files'), where('userId', '==', profile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fileData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UploadedFile));
      setFiles(fileData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });

    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    if (!selectedFileId) return;

    const q = query(
      collection(db, 'flashcard_sets'), 
      where('fileId', '==', selectedFileId),
      where('userId', '==', profile.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const set = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as FlashcardSet;
        setFlashcardSet(set);
      } else {
        setFlashcardSet(null);
      }
    });

    return () => unsubscribe();
  }, [selectedFileId]);

  const extractText = async (file: File): Promise<string> => {
    if (file.type === 'text/plain') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      });
    }

    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => 'str' in item ? item.str : '').join(' ');
          fullText += pageText + '\n';
        }
        return fullText.trim() || `(Empty or scanned PDF: ${file.name})`;
      } catch (err) {
        console.error('PDF extraction error:', err);
        return `Failed to extract text from ${file.name} automatically.`;
      }
    }

    // Fallback for DOCX, PPTX
    return `Uploaded material: ${file.name}. Type: ${file.type}. Please use the text notes feature if analysis is inaccurate.`;
  };

  const handleDirectNotesSubmit = async () => {
    if (!directNotes.trim() || !profile?.uid) return;
    
    setAnalyzing(true);
    setIsAddModalOpen(false);
    setError(null);

    try {
      const fileDoc = await addDoc(collection(db, 'uploaded_files'), {
        userId: profile.uid,
        fileName: `Notes: ${directNotes.slice(0, 20)}...`,
        fileType: 'text/plain',
        fileSize: directNotes.length,
        downloadURL: '',
        extractedText: directNotes,
        createdAt: new Date().toISOString()
      });

      setSelectedFileId(fileDoc.id);
      await handleAnalyze(directNotes, fileDoc.id, "Direct Notes");
      setDirectNotes("");
    } catch (err) {
      setError('Failed to save notes.');
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.uid) return;

    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload PDF, Word, PPT, or TXT.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Local Extraction (Fastest)
      const extractedText = await extractText(file);
      
      if (!extractedText.trim()) {
        throw new Error('Could not extract any readable text from this file.');
      }

      // 2. Save to Firestore immediately (Reliable)
      // This ensures the record exists even if storage fails
      const fileDoc = await addDoc(collection(db, 'uploaded_files'), {
        userId: profile.uid,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        downloadURL: '', // Will update after storage upload
        extractedText,
        createdAt: new Date().toISOString()
      });

      setSelectedFileId(fileDoc.id);
      
      // 3. Start AI Analysis immediately (User doesn't have to wait for upload)
      handleAnalyze(extractedText, fileDoc.id, file.name);

      // 4. Background Storage Upload (Optional/Async)
      const storageRef = ref(storage, `uploads/${profile.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (err) => {
          console.error('Background upload failed:', err);
          // We don't stop the UI because analysis might still succeed
          // but we notify the user lightly or just log it
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateDoc(doc(db, 'uploaded_files', fileDoc.id), {
              downloadURL
            });
            setUploading(false);
          } catch (err) {
            console.error('Update downloadURL failed:', err);
            setUploading(false);
          }
        }
      );

      // If upload doesn't start or stays at 0, we'll still finish the "uploading" state after a while
      // or when analysis finishes. For now, we rely on the state_changed.
      
    } catch (err) {
      console.error('Full upload process error:', err);
      setError(err instanceof Error ? err.message : 'System error during file processing.');
      setUploading(false);
    }
  };

  const [quizFeedback, setQuizFeedback] = useState<{ [key: number]: { correct: boolean, message: string } }>({});

  const handleAnalyze = async (text: string, fileId: string, title: string) => {
    if (!profile?.uid) return;
    if (!text || text.length < 10) {
      setError('Material content is too short for AI analysis. Please provide more detail.');
      return;
    }
    setAnalyzing(true);
    setError(null);
    try {
      const result = await generateFlashcardsAndQuiz(text);
      
      if (!result.flashcards || result.flashcards.length === 0) {
        throw new Error('AI could not generate enough flashcards from this material.');
      }

      await addDoc(collection(db, 'flashcard_sets'), {
        fileId,
        userId: profile.uid,
        title: `Flashcards for ${title}`,
        cards: result.flashcards.map((c: any) => ({ 
          front: c.front || 'Empty Front', 
          back: c.back || 'Empty Back', 
          known: false 
        })),
        createdAt: new Date().toISOString()
      });

      setQuizQuestions(result.quiz || []);
      setQuizFeedback({}); // Reset feedback for new set
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'AI Analysis failed. Please try again with clearer material.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnswerSubmit = (questionIdx: number, selectedOpt: string, correctOpt: string, explanation: string) => {
    const isCorrect = selectedOpt === correctOpt;
    setQuizFeedback(prev => ({
      ...prev,
      [questionIdx]: {
        correct: isCorrect,
        message: isCorrect ? `Correct! ${explanation}` : `Incorrect. The correct answer is: ${correctOpt}. ${explanation}`
      }
    }));
  };

  const toggleCardKnown = async (idx: number) => {
    if (!flashcardSet) return;
    const newCards = [...flashcardSet.cards];
    newCards[idx].known = !newCards[idx].known;
    await updateDoc(doc(db, 'flashcard_sets', flashcardSet.id), { cards: newCards });
  };

  const handleDeleteFile = async (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this study material? All generated flashcards and progress for this file will be permanently removed.')) {
      try {
        // 1. Delete associated flashcard sets
        const qFlashcards = query(collection(db, 'flashcard_sets'), where('fileId', '==', fileId));
        const flashcardSnap = await getDocs(qFlashcards);
        const deletePromises = flashcardSnap.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // 2. Delete the actual file record
        await deleteDoc(doc(db, 'uploaded_files', fileId));
        
        if (selectedFileId === fileId) {
          setSelectedFileId(null);
          setFlashcardSet(null);
          setQuizQuestions([]);
        }
      } catch (err) {
        console.error('Delete error:', err);
        setError('Failed to delete some records. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar - File List */}
          <div className="w-full md:w-80 space-y-6">
            <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-lg bg-primary-crimson/20 flex items-center justify-center">
                  <FileUp className="text-primary-crimson" size={18} />
                </div>
                Add Material
              </h3>
              
              <div className="space-y-4">
                <label className="relative group cursor-pointer block">
                  <div className="border-2 border-dashed border-white/10 group-hover:border-primary-crimson/50 rounded-2xl p-8 transition-all flex flex-col items-center gap-3 bg-white/5 group-hover:bg-primary-crimson/5">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-text-secondary group-hover:text-primary-crimson group-hover:scale-110 transition-all">
                      <Plus size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white mb-1">Upload Study File</p>
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">
                        PDF, Word, PPT or TXT
                      </p>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={handleFileUpload}
                    disabled={uploading || analyzing}
                  />
                </label>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold text-text-secondary tracking-widest">
                    <span className="bg-[#0A0A0B] px-2 font-mono">OR</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm font-bold text-white group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-accent-plum/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <FileText size={18} className="text-accent-plum group-hover:rotate-12 transition-transform" />
                  Type or Paste Notes
                </button>
              </div>

              {uploading && (
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">
                    <span>{progress === 100 ? 'Finalizing...' : 'Upload Progress'}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary-crimson shadow-[0_0_10px_rgba(224,30,55,0.5)]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-xl flex items-start gap-2 text-error text-[10px] leading-relaxed">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div className="glass-card p-6 min-h-[300px]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-4">Your Library</h3>
              <div className="space-y-3">
                {files.map((file) => (
                  <div 
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group flex items-center justify-between ${
                      selectedFileId === file.id 
                        ? 'bg-primary-crimson/10 border-primary-crimson/30' 
                        : 'bg-white/5 border-transparent hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded-lg ${selectedFileId === file.id ? 'bg-primary-crimson/20 text-primary-crimson' : 'bg-white/5 text-text-secondary'}`}>
                        <FileIcon size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{file.fileName}</p>
                        <p className="text-[10px] text-text-secondary">{(file.fileSize / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                      className="p-1.5 text-text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {files.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto mb-2 opacity-20" size={32} />
                    <p className="text-xs text-text-secondary">No documents uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {!selectedFileId ? (
              <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-[24px] bg-white/5 flex items-center justify-center mb-6">
                  <FileText size={40} className="text-text-secondary opacity-30" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Select a Document</h2>
                <p className="text-text-secondary max-w-sm mx-auto">
                  Upload a study material to generate high-quality flashcards and AI-powered quizzes automatically.
                </p>
              </div>
            ) : analyzing ? (
              <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary-crimson/5 animate-pulse" />
                <div className="relative z-10">
                  <div className="relative mb-8">
                    <Loader2 className="animate-spin text-primary-crimson mx-auto" size={64} />
                    <Sparkles className="absolute -top-2 -right-2 text-highlight-gold animate-bounce" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">AI Brainstorming...</h2>
                  <div className="space-y-4 max-w-sm mx-auto">
                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                          <span>Processing Content</span>
                          <span className="animate-pulse">Thinking</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary-crimson"
                            initial={{ width: "0%" }}
                            animate={{ width: "95%" }}
                            transition={{ duration: 15, ease: "easeOut" }}
                          />
                       </div>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      We're teaching our AI your material. This usually takes 10-15 seconds for deep learning.
                    </p>
                  </div>
                </div>
              </div>
            ) : flashcardSet ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button 
                      onClick={() => setActiveTab('flashcards')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'flashcards' ? 'bg-primary-crimson text-white shadow-lg' : 'text-text-secondary hover:text-white'
                      }`}
                    >
                      <LayoutGrid size={16} />
                      Flashcards
                    </button>
                    <button 
                      onClick={() => setActiveTab('quiz')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'quiz' ? 'bg-primary-crimson text-white shadow-lg' : 'text-text-secondary hover:text-white'
                      }`}
                    >
                      <BookOpen size={16} />
                      Quiz
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'flashcards' ? (
                    <motion.div 
                      key="flashcards"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="flex flex-col items-center gap-8">
                        <div 
                          className="perspective-1000 w-full max-w-lg aspect-[4/3] cursor-pointer"
                          onClick={() => setIsFlipped(!isFlipped)}
                        >
                          <motion.div 
                            className="relative w-full h-full preserve-3d transition-all duration-500"
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                          >
                            {/* Front */}
                            <div className="absolute inset-0 backface-hidden glass-card p-12 flex flex-col items-center justify-center text-center shadow-2xl">
                              <span className="absolute top-6 left-6 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Question</span>
                              <h3 className="text-xl md:text-2xl font-bold leading-relaxed">{flashcardSet.cards[currentCardIndex].front}</h3>
                              <p className="absolute bottom-6 text-xs text-text-secondary opacity-50">Click to reveal answer</p>
                            </div>
                            {/* Back */}
                            <div className="absolute inset-0 backface-hidden glass-card p-12 flex flex-col items-center justify-center text-center rotate-y-180 bg-white/5 border-primary-crimson/20 shadow-2xl overflow-y-auto">
                              <span className="absolute top-6 left-6 text-[10px] font-bold uppercase tracking-widest text-primary-crimson">Explanation</span>
                              <p className="text-lg leading-relaxed text-white/90">{flashcardSet.cards[currentCardIndex].back}</p>
                              <p className="absolute bottom-6 text-xs text-text-secondary opacity-50">Click to flip back</p>
                            </div>
                          </motion.div>
                        </div>

                        <div className="flex flex-col items-center gap-4 w-full px-6">
                           <div className="flex items-center justify-between w-full max-w-md">
                            <button 
                              disabled={currentCardIndex === 0}
                              onClick={() => { setCurrentCardIndex(currentCardIndex - 1); setIsFlipped(false); }}
                              className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all"
                            >
                              <ChevronLeft size={24} />
                            </button>
                            
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-bold text-white">{currentCardIndex + 1} / {flashcardSet.cards.length}</span>
                              <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary-crimson shadow-[0_0_8px_#E11D48]"
                                  style={{ width: `${((currentCardIndex + 1) / flashcardSet.cards.length) * 100}%` }}
                                />
                              </div>
                            </div>

                            <button 
                              disabled={currentCardIndex === flashcardSet.cards.length - 1}
                              onClick={() => { setCurrentCardIndex(currentCardIndex + 1); setIsFlipped(false); }}
                              className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all"
                            >
                              <ChevronRight size={24} />
                            </button>
                          </div>

                          <div className="flex gap-4">
                            <button 
                              onClick={() => toggleCardKnown(currentCardIndex)}
                              className={`px-8 py-3 rounded-2xl font-bold transition-all border ${
                                flashcardSet.cards[currentCardIndex].known 
                                  ? 'bg-success/20 border-success text-success' 
                                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                              }`}
                            >
                              {flashcardSet.cards[currentCardIndex].known ? 'I know this! ✅' : 'Mark as known'}
                            </button>
                            <button 
                              onClick={() => { setCurrentCardIndex(0); setIsFlipped(false); }}
                              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-text-secondary transition-all"
                              title="Reset"
                            >
                              <RotateCcw size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="quiz"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <div className="glass-card p-8 border-accent-plum/20">
                         <div className="flex items-center gap-2 mb-6">
                            <BookOpen className="text-accent-plum" size={24} />
                            <h2 className="text-xl font-bold">Comprehensive Quiz</h2>
                         </div>
                         <p className="text-text-secondary mb-8">This quiz is generated based on the specific concepts from your document. Test your understanding below.</p>
                         
                         <div className="space-y-12">
                            {quizQuestions.length > 0 ? (
                              quizQuestions.map((q, i) => (
                                <div key={i} className="space-y-4">
                                  <p className="text-lg font-bold text-white flex gap-3">
                                    <span className="text-primary-crimson">Q{i+1}:</span> {q.question}
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((opt, optIdx) => (
                                      <button 
                                        key={optIdx}
                                        disabled={quizFeedback[i] !== undefined}
                                        className={`text-left p-4 rounded-xl border transition-all text-sm flex items-center gap-3 ${
                                          quizFeedback[i] 
                                            ? opt === q.correctAnswer 
                                              ? 'bg-success/20 border-success text-success'
                                              : quizFeedback[i].message.includes(opt) 
                                                ? 'bg-error/20 border-error text-error'
                                                : 'bg-white/5 border-white/10 opacity-50'
                                            : 'bg-white/5 border-white/10 hover:border-primary-crimson/50 hover:bg-primary-crimson/5'
                                        }`}
                                        onClick={() => handleAnswerSubmit(i, opt, q.correctAnswer, q.explanation)}
                                      >
                                        <span className="text-text-secondary opacity-50">{String.fromCharCode(65 + optIdx)}.</span>
                                        {opt}
                                      </button>
                                    ))}
                                  </div>
                                  {quizFeedback[i] && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className={`p-4 rounded-xl border flex gap-3 text-sm leading-relaxed ${
                                        quizFeedback[i].correct 
                                          ? 'bg-success/10 border-success/20 text-success' 
                                          : 'bg-error/10 border-error/20 text-error'
                                      }`}
                                    >
                                      {quizFeedback[i].correct ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                                      <p>{quizFeedback[i].message}</p>
                                    </motion.div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-12">
                                <p className="text-text-secondary">No quiz questions generated yet. Run analysis to see results.</p>
                              </div>
                            )}
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-[24px] bg-primary-crimson/10 flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} className="text-primary-crimson" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Analysis Complete</h2>
                <p className="text-text-secondary mb-8">
                  We've successfully uploaded your file. Click 'Generate' to create your learning tools.
                </p>
                <button 
                  onClick={() => {
                    const f = files.find(f => f.id === selectedFileId);
                    if (f) handleAnalyze(f.extractedText, f.id, f.fileName);
                  }}
                  className="btn-primary"
                >
                  Generate Educational Set
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="text-accent-plum" size={20} />
                  Direct Notes
                </h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-text-secondary"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-text-secondary">Paste your study material, lecture transcript, or textbook snips here.</p>
                <textarea
                  className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-crimson/50 transition-all resize-none"
                  placeholder="Paste or type your notes here..."
                  value={directNotes}
                  onChange={(e) => setDirectNotes(e.target.value)}
                />
                <button 
                  onClick={handleDirectNotesSubmit}
                  disabled={!directNotes.trim()}
                  className="w-full btn-primary py-4 disabled:opacity-50 disabled:grayscale"
                >
                  Generate from Notes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyMaterials;
