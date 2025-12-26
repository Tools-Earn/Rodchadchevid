import React, { useState, useRef, useEffect } from 'react';
import { 
  ASPECT_RATIOS, 
  CARTOON_STYLES, 
  TONE_OPTIONS, 
  VERBOSITY_LEVELS 
} from './constants';
import { AspectRatio, Verbosity, PromptOptions } from './types';
import { SelectionCard } from './components/SelectionCard';
import { generateInfographicPrompt, generatePreviewImage, transcribeAudio } from './services/geminiService';
import { 
  Wand2, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Loader2, 
  Sparkles, 
  ChevronDown, 
  Heart, 
  FileText,
  Mic,
  Square,
  BookOpenText,
  Palette
} from 'lucide-react';

export default function App() {
  // Form State
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState(CARTOON_STYLES[0].id);
  const [customStyle, setCustomStyle] = useState('');
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
  const [layoutPreference, setLayoutPreference] = useState('');
  const [specificContent, setSpecificContent] = useState('');
  const [verbosity, setVerbosity] = useState<Verbosity>(Verbosity.STANDARD);
  const [tone, setTone] = useState(TONE_OPTIONS[0].id);

  // App State
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [copied, setCopied] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const resultRef = useRef<HTMLDivElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64String = (reader.result as string).split(',')[1];
          const mimeType = audioBlob.type || 'audio/webm';
          
          setIsTranscribing(true);
          try {
            const text = await transcribeAudio(base64String, mimeType);
            if (text) {
              setTopic(prev => {
                  const newText = prev ? `${prev} ${text}` : text;
                  return newText;
              });
            }
          } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการแปลผลเสียง (Transcription Error)');
          } finally {
            setIsTranscribing(false);
          }
        };
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาตรวจสอบสิทธิ์การเข้าถึง');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
        alert('กรุณากรอกเนื้อหา หรือ หัวข้อเรื่อง');
        return;
    }
    
    setIsGenerating(true);
    setGeneratedPrompt(null);
    setGeneratedImage(null);
    setCopied(false);

    try {
      let selectedStyleLabel = CARTOON_STYLES.find(s => s.id === style)?.label || style;
      
      // Use custom style if selected
      if (style === 'custom') {
        if (!customStyle.trim()) {
          selectedStyleLabel = "Free Style";
        } else {
          selectedStyleLabel = customStyle;
        }
      }

      const selectedToneLabel = TONE_OPTIONS.find(t => t.id === tone)?.label || tone;

      const options: PromptOptions = {
        topic,
        style: selectedStyleLabel,
        ratio,
        layoutPreference: layoutPreference || 'จัดวางองค์ประกอบให้สวยงาม อ่านง่าย',
        verbosity,
        tone: selectedToneLabel,
        specificContent: specificContent.trim()
      };

      const result = await generateInfographicPrompt(options);
      setGeneratedPrompt(result);
      
      // Auto scroll to result after delay
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (error) {
      alert('เกิดข้อผิดพลาดในการสร้าง Prompt กรุณาลองใหม่');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGeneratePreview = async () => {
    if (!generatedPrompt) return;
    
    setIsGeneratingImage(true);
    setGeneratedImage(null); // Clear previous image

    try {
      const imageBase64 = await generatePreviewImage(generatedPrompt, ratio);
      if (imageBase64) {
        setGeneratedImage(imageBase64);
      } else {
        alert('ไม่สามารถสร้างรูปภาพตัวอย่างได้ (Prompt อาจยาวเกินไป หรือติดเงื่อนไขความปลอดภัย)');
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10 font-sans text-gray-700 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl shadow-neu-flat text-violet-500">
              <Palette className="w-8 h-8" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-800 leading-tight drop-shadow-sm">
                Qua<span className="text-violet-500">lia</span>
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">ปรุงแต่งทุกตัวอักษร ให้กลายเป็นภาพอินโฟกราฟิก</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 space-y-12 w-full">
        
        {/* Main Form Container - Neumorphic Card */}
        <div className="rounded-[2.5rem] shadow-neu-flat p-8 md:p-10 space-y-10 bg-background relative">
          
          {/* Section 1: Topic/Content */}
          <section className="relative">
            <label className="block text-lg font-bold text-gray-700 mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full shadow-neu-flat-sm text-violet-500 text-lg font-bold">1</span>
              <span>บทความ หรือ หัวข้อที่ต้องการสรุป <span className="text-violet-500">*</span></span>
            </label>
            <div className="relative group">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="วางบทความยาวๆ ที่นี่... เช่น 'ประวัติความเป็นมาของ AI...', ข่าวสารประจำวัน, หรือเนื้อหาวิชาการที่ต้องการสรุป"
                className="w-full p-6 pr-16 text-lg rounded-3xl shadow-neu-pressed bg-background focus:outline-none focus:shadow-neu-pressed-sm text-gray-700 placeholder-gray-400 h-56 resize-none transition-all duration-300"
              />
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`absolute right-4 bottom-4 p-4 rounded-full transition-all duration-300 active:scale-95 ${
                    isRecording 
                    ? 'shadow-neu-pressed text-red-500 animate-pulse' 
                    : 'shadow-neu-flat-sm text-gray-400 hover:text-violet-500'
                }`}
                title="ใช้เสียงพิมพ์ (Voice Typing)"
              >
                {isTranscribing ? (
                     <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                ) : isRecording ? (
                     <div className="relative">
                         <Square className="w-6 h-6 fill-current" />
                     </div>
                ) : (
                     <Mic className="w-6 h-6" />
                )}
              </button>
            </div>
          </section>

          {/* Section 2: Style */}
          <section>
            <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full shadow-neu-flat-sm text-violet-500 text-lg font-bold">2</span>
              เลือกสไตล์ภาพประกอบ (Art Style)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {CARTOON_STYLES.map((s) => (
                <SelectionCard 
                  key={s.id}
                  {...s}
                  selected={style === s.id}
                  onClick={setStyle}
                />
              ))}
            </div>
            
            {/* Custom Style Input */}
            {style === 'custom' && (
              <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <input 
                  type="text" 
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  placeholder="ระบุสไตล์ที่คุณต้องการ... เช่น สีน้ำมัน, ลายเส้นดินสอ"
                  className="w-full p-4 rounded-2xl shadow-neu-pressed bg-background focus:outline-none text-gray-700"
                  autoFocus
                />
              </div>
            )}
          </section>

          {/* Section 3: Ratio & Tone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section>
              <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-3">
                 <span className="flex items-center justify-center w-10 h-10 rounded-full shadow-neu-flat-sm text-violet-500 text-lg font-bold">3</span>
                 สัดส่วนภาพ (Ratio)
              </h2>
              <div className="space-y-4">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRatio(r.value)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 neu-transition ${
                      ratio === r.value 
                        ? 'shadow-neu-pressed bg-background text-violet-600' 
                        : 'shadow-neu-flat-sm bg-background text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`${ratio === r.value ? 'text-violet-500' : 'text-gray-400'}`}>{r.icon}</span>
                        <span className="font-bold text-sm">{r.label}</span>
                      </div>
                      {ratio === r.value && <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6]" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-3">
                 <span className="flex items-center justify-center w-10 h-10 rounded-full shadow-neu-flat-sm text-violet-500 text-lg font-bold">4</span>
                 อารมณ์และโทน (Mood)
              </h2>
              <div className="space-y-4">
                {TONE_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 neu-transition ${
                      tone === t.id 
                        ? 'shadow-neu-pressed bg-background text-violet-600' 
                        : 'shadow-neu-flat-sm bg-background text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className={`mr-4 ${tone === t.id ? 'text-violet-500' : 'text-gray-400'}`}>{t.icon}</span>
                    <span className="font-bold text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Section 5: Details & Verbosity */}
          <section className="space-y-8">
            <h2 className="text-lg font-bold text-gray-700 flex items-center gap-3">
               <span className="flex items-center justify-center w-10 h-10 rounded-full shadow-neu-flat-sm text-violet-500 text-lg font-bold">5</span>
               รายละเอียดเพิ่มเติม
            </h2>

             {/* Specific Content */}
             <div className="p-1">
                <label className="block text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-400" />
                  หมายเหตุเพิ่มเติม (Specific Instructions)
                </label>
                <textarea
                  value={specificContent}
                  onChange={(e) => setSpecificContent(e.target.value)}
                  placeholder="เช่น 'ขอเน้นสีแดง', 'ห้ามมีรูปคน'..."
                  className="w-full p-4 rounded-2xl shadow-neu-pressed bg-background focus:outline-none text-gray-700 h-24 resize-none placeholder-gray-400"
                />
            </div>
            
            {/* Verbosity */}
            <div className="p-1">
              <label className="block text-sm font-bold text-gray-600 mb-4">
                ความละเอียดของเนื้อหา (Content Density)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {VERBOSITY_LEVELS.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setVerbosity(v.value)}
                    className={`flex flex-col items-center justify-center py-6 px-4 rounded-2xl transition-all duration-300 h-full ${
                      verbosity === v.value
                        ? 'shadow-neu-pressed bg-background text-violet-600'
                        : 'shadow-neu-flat-sm bg-background text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="font-bold text-base mb-2">{v.label}</span>
                    <span className="text-xs text-center font-light leading-snug opacity-80">
                      {v.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout/Characteristics */}
            <div className="p-1">
              <label className="block text-sm font-bold text-gray-600 mb-3">
                รูปลักษณะของ Infographic (Layout)
              </label>
              <textarea
                value={layoutPreference}
                onChange={(e) => setLayoutPreference(e.target.value)}
                placeholder="ระบุลักษณะที่ต้องการ เช่น จัดวางแบบ Timeline..."
                className="w-full p-4 rounded-2xl shadow-neu-pressed bg-background focus:outline-none text-gray-700 h-24 resize-none placeholder-gray-400"
              />
            </div>
          </section>

          <div className="pt-6">
            <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className={`
                w-full py-5 rounded-2xl font-bold text-xl text-white transform transition-all duration-300 active:scale-[0.98]
                flex items-center justify-center gap-3 relative overflow-hidden
                ${isGenerating || !topic 
                    ? 'bg-gray-300 shadow-none cursor-not-allowed' 
                    : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-neu-flat hover:shadow-neu-pressed hover:brightness-105'
                }
                `}
            >
                {isGenerating ? (
                <>
                    <Loader2 className="animate-spin w-6 h-6" />
                    กำลังสร้างสรรค์...
                </>
                ) : (
                <>
                    <Wand2 className="w-6 h-6" />
                    สร้าง Prompt
                </>
                )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div ref={resultRef} className="scroll-mt-24">
            {generatedPrompt && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10">
                    
                    <div className="flex items-center justify-center text-violet-300">
                        <ChevronDown className="animate-bounce w-8 h-8" />
                    </div>

                    {/* Result Card */}
                    <div className="rounded-[2.5rem] shadow-neu-flat p-8 md:p-10 bg-background relative overflow-hidden">
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                    <Sparkles className="text-amber-400 w-6 h-6 fill-amber-400" />
                                    Prompt ของคุณพร้อมแล้ว
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">คัดลอกไปใช้ในเครื่องมือ AI Art ได้เลย</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button 
                                    onClick={handleCopy}
                                    className={`flex-1 md:flex-none py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                                        copied 
                                        ? 'shadow-neu-pressed bg-background text-violet-500' 
                                        : 'shadow-neu-flat-sm bg-background text-gray-600 hover:text-violet-500'
                                    }`}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'คัดลอกแล้ว' : 'คัดลอก Prompt'}
                                </button>
                            </div>
                        </div>

                        {/* Prompt Display Area */}
                        <div className="rounded-2xl shadow-neu-pressed p-6 bg-background relative group">
                             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={handleCopy} className="p-2 shadow-neu-flat-sm rounded-lg hover:text-violet-500 transition-colors">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="font-mono text-base md:text-lg text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                                {generatedPrompt}
                            </p>
                        </div>

                        <div className="mt-10 flex justify-center">
                            <button 
                                onClick={() => handleGeneratePreview()}
                                disabled={isGeneratingImage}
                                className="w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-white bg-violet-500 hover:bg-violet-600 shadow-neu-flat hover:shadow-neu-pressed transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {isGeneratingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                                ทดลองสร้างภาพตัวอย่าง (Preview)
                            </button>
                        </div>
                    </div>

                    {/* Image Preview Section */}
                    {generatedImage && (
                        <div className="rounded-[2.5rem] shadow-neu-flat p-8 md:p-10 bg-background animate-in zoom-in-95 duration-500">
                            <h3 className="font-bold text-xl text-gray-700 mb-8 flex items-center gap-3">
                                <ImageIcon className="text-violet-500 w-6 h-6" />
                                ตัวอย่างภาพ (AI Generated Preview)
                            </h3>
                            
                            <div className="flex justify-center rounded-3xl p-4 shadow-neu-pressed bg-background">
                                <img 
                                    src={generatedImage} 
                                    alt="Generated Infographic Preview" 
                                    className="max-h-[600px] w-auto rounded-xl object-contain shadow-lg"
                                />
                            </div>
                            <p className="text-center text-gray-400 text-xs mt-6">
                                *ภาพนี้สร้างโดย AI (Gemini Flash Image) เพื่อแสดงแนวทางองค์ประกอบ
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center mt-auto">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full shadow-neu-flat bg-background text-sm text-gray-500">
          <span>By</span>
          <span className="font-bold text-violet-500">Qualia</span>
          <Heart className="w-3 h-3 text-violet-500 fill-violet-500 ml-1" />
        </div>
      </footer>
    </div>
  );
}