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
  BookOpenText
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
    try {
      const imageBase64 = await generatePreviewImage(generatedPrompt, ratio);
      if (imageBase64) {
        setGeneratedImage(imageBase64);
      } else {
        alert('ไม่สามารถสร้างรูปภาพตัวอย่างได้ในขณะนี้');
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] pb-10 font-sans text-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 p-3 rounded-2xl shadow-lg shadow-emerald-200 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 leading-tight">
                รสชาติของ<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">ชีวิต</span>
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">ปรุงแต่งทุกตัวอักษร ให้กลายเป็นภาพอินโฟกราฟิกที่แสนอร่อยและย่อยง่าย</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 space-y-8 w-full">
        
        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 md:p-8 space-y-8 relative overflow-hidden">
          {/* Decorative background blob */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

          {/* Section 1: Topic/Content */}
          <section className="relative">
            <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold shadow-md shadow-emerald-200">1</span>
              <BookOpenText className="w-5 h-5 text-emerald-600" />
              บทความ หรือ หัวข้อที่ต้องการสรุป (Content Source) <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-3 ml-10">
                วางบทความยาวๆ, เนื้อหาหนังสือเรียน หรือพิมพ์หัวข้อสั้นๆ ที่ต้องการให้ AI สรุปเป็นภาพ
            </p>
            <div className="relative">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="วางบทความยาวๆ ที่นี่... เช่น 'ประวัติความเป็นมาของ AI...', ข่าวสารประจำวัน, หรือเนื้อหาวิชาการที่ต้องการสรุป"
                className="w-full p-4 pr-14 text-lg border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all bg-emerald-50/30 focus:bg-white placeholder-gray-400 h-48 resize-none shadow-inner"
              />
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`absolute right-3 bottom-3 p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 shadow-sm ${
                    isRecording 
                    ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200' 
                    : 'bg-white text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border border-gray-200'
                }`}
                title="ใช้เสียงพิมพ์ (Voice Typing)"
              >
                {isTranscribing ? (
                     <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                ) : isRecording ? (
                     <div className="relative">
                         <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
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
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold shadow-md shadow-emerald-200">2</span>
              เลือกสไตล์ภาพประกอบ (Art Style)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {CARTOON_STYLES.map((s) => (
                <SelectionCard 
                  key={s.id}
                  {...s}
                  selected={style === s.id}
                  onClick={setStyle}
                />
              ))}
            </div>
            
            {/* Custom Style Input - Only shows if 'custom' is selected */}
            {style === 'custom' && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-gray-700 mb-2">ระบุสไตล์ที่คุณต้องการ</label>
                <input 
                  type="text" 
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  placeholder="เช่น สีน้ำมัน, ลายเส้นดินสอ, แอบสแตรกต์..."
                  className="w-full p-3 border-2 border-emerald-100 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                  autoFocus
                />
              </div>
            )}
          </section>

          {/* Section 3: Ratio & Tone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold shadow-md shadow-emerald-200">3</span>
                 สัดส่วนภาพ (Ratio)
              </h2>
              <div className="space-y-3">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRatio(r.value)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 group ${
                      ratio === r.value 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' 
                        : 'border-transparent bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{r.icon}</span>
                        <span className="font-bold text-sm">{r.label}</span>
                      </div>
                      {ratio === r.value && <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold shadow-md shadow-emerald-200">4</span>
                 อารมณ์และโทน (Mood)
              </h2>
              <div className="space-y-3">
                {TONE_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`w-full flex items-center p-3.5 rounded-xl border-2 transition-all duration-200 ${
                      tone === t.id 
                        ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm' 
                        : 'border-transparent bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-2xl mr-3">{t.emoji}</span>
                    <span className="font-bold text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Section 5: Details & Verbosity */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
               <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold shadow-md shadow-emerald-200">5</span>
               รายละเอียดเพิ่มเติม (Optional)
            </h2>

             {/* Specific Content - Modified to be supplementary */}
             <div className="bg-white p-5 rounded-2xl border-2 border-emerald-50 hover:border-emerald-100 transition-colors">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                หมายเหตุเพิ่มเติม (Specific Instructions)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                เช่น "ขอเน้นสีแดง", "ห้ามมีรูปคน", หรือ "ใส่โลโก้ไว้มุมขวา"
              </p>
              <textarea
                value={specificContent}
                onChange={(e) => setSpecificContent(e.target.value)}
                placeholder="คำสั่งพิเศษเพิ่มเติม..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 text-sm transition-all h-20 resize-none placeholder-gray-300"
              />
            </div>
            
            {/* Verbosity */}
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                ความละเอียดของเนื้อหา (Content Density)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                {VERBOSITY_LEVELS.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setVerbosity(v.value)}
                    className={`flex flex-col items-center justify-center py-4 px-3 rounded-lg text-sm transition-all duration-200 h-full ${
                      verbosity === v.value
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-bold text-base mb-1">{v.label}</span>
                    <span className={`text-xs text-center font-light leading-snug ${verbosity === v.value ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {v.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout/Characteristics */}
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                รูปลักษณะของ Infographic (Layout & Characteristics)
              </label>
              <textarea
                value={layoutPreference}
                onChange={(e) => setLayoutPreference(e.target.value)}
                placeholder="ระบุลักษณะที่ต้องการ เช่น จัดวางแบบ Timeline, เน้นกราฟวงกลมตรงกลาง, แบ่งช่องแบบการ์ตูนช่อง, โทนสีพาสเทล..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm transition-all h-24 resize-none"
              />
            </div>
          </section>

          <div className="pt-4">
            <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className={`
                w-full py-4 rounded-2xl font-bold text-xl text-white shadow-xl shadow-emerald-200/50 transform transition-all active:scale-[0.98]
                flex items-center justify-center gap-3 relative overflow-hidden group
                ${isGenerating || !topic 
                    ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-[length:200%_auto] hover:animate-gradient'
                }
                `}
                style={{ backgroundSize: '200% auto' }}
            >
                {isGenerating ? (
                <>
                    <Loader2 className="animate-spin w-6 h-6" />
                    กำลังวิเคราะห์และสร้าง Prompt...
                </>
                ) : (
                <>
                    <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    สรุปเนื้อหา & สร้าง Prompt
                </>
                )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div ref={resultRef} className="scroll-mt-24">
            {generatedPrompt && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
                    
                    <div className="flex items-center justify-center text-gray-400">
                        <ChevronDown className="animate-bounce w-6 h-6" />
                    </div>

                    {/* Result Card */}
                    <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden relative">
                        {/* Decorative Top Bar */}
                        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
                        
                        <div className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        <Sparkles className="text-amber-500 w-6 h-6 fill-amber-500" />
                                        Prompt ของคุณพร้อมแล้ว
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">คัดลอกไปใช้ใน Midjourney, DALL-E หรือเครื่องมืออื่นๆ ได้ทันที</p>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button 
                                        onClick={handleCopy}
                                        className={`flex-1 md:flex-none py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
                                            copied 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'คัดลอกแล้ว' : 'คัดลอก Prompt'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-[#1E1E2E] rounded-2xl p-6 relative group border border-gray-800 shadow-inner">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={handleCopy} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white transition-colors">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="font-mono text-base md:text-lg text-emerald-100 leading-relaxed whitespace-pre-wrap break-words">
                                    {generatedPrompt}
                                </p>
                            </div>

                            <div className="mt-8 flex justify-center">
                                <button 
                                    onClick={() => handleGeneratePreview()}
                                    disabled={isGeneratingImage}
                                    className="w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isGeneratingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                                    ทดลองสร้างภาพตัวอย่าง (Preview)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Image Preview Section */}
                    {generatedImage && (
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-500">
                             <div className="p-6 md:p-8">
                                <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
                                    <ImageIcon className="text-emerald-600 w-5 h-5" />
                                    ตัวอย่างภาพ (AI Generated Preview)
                                </h3>
                                
                                <div className="flex justify-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                    <img 
                                        src={generatedImage} 
                                        alt="Generated Infographic Preview" 
                                        className="max-h-[600px] w-auto rounded-lg shadow-md object-contain"
                                    />
                                </div>
                                <p className="text-center text-gray-400 text-xs mt-4">
                                    *ภาพนี้สร้างโดย AI (Gemini Flash Image) เพื่อแสดงแนวทางองค์ประกอบ อาจไม่เก็บรายละเอียดตัวหนังสือภาษาไทยได้ถูกต้อง 100%
                                </p>
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>

      </main>

      {/* Footer / Credits */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center mt-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-gray-100 shadow-sm text-sm text-gray-500">
          <span>By</span>
          <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
            รสชาติของชีวิต
          </span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500 ml-1" />
        </div>
      </footer>
    </div>
  );
}