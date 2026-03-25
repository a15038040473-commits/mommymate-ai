import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// API Configuration - 使用环境变量，本地开发走 .env，Vercel 部署走 .env.production
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';


// Interface
interface DailyData {
  id: string;
  warmup_audio_keyword: string;
  warmup_title: string;
  core_task_text: string;
  core_sentences: string[];
  review_text: string;
}

export default function DailyDetail() {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/schedule/daily/${dayId}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching daily detail:', err);
        setLoading(false);
      });
  }, [dayId]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower for kids
      window.speechSynthesis.speak(utterance);
    } else {
      alert("您的浏览器不支持语音播报功能");
    }
  };

  if (loading) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-on-surface-variant font-medium animate-pulse">AI 正在为您生成定制化教学内容...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-background text-on-background min-h-screen flex items-center justify-center">
        <p>数据加载失败，请确认为何无法连接到后端。</p>
        <button onClick={() => navigate(-1)} className="ml-4 px-4 py-2 bg-primary text-white rounded-full">返回</button>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen pb-12 font-lexend">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 rounded-b-[3rem] bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-xl shadow-[0_24px_48px_-12px_rgba(20,29,33,0.06)] flex items-center justify-between px-8 h-20 w-full">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:scale-95 transition-transform duration-200 text-primary dark:text-primary-container">
            <span className="material-symbols-outlined text-3xl">arrow_back</span>
          </button>
        </div>
        <h1 className="font-lexend font-bold text-[1.75rem] tracking-tight text-primary dark:text-primary-container">周一 {dayId} 的发音</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <main className="max-w-2xl mx-auto space-y-12 pt-28 px-3">
        {/* Section 1: Warm-up */}
        <section className="relative space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-primary text-on-primary rounded-full px-4 py-1.5 text-sm font-bold tracking-wide uppercase">Warm-up</span>
            <span className="material-symbols-outlined text-green-500 font-bold" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
          </div>
          <a 
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(data.warmup_audio_keyword)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block bg-surface-container-lowest rounded-xl shadow-[0_16px_32px_rgba(0,104,121,0.04)] border-2 border-primary/5 relative overflow-hidden group px-4 py-8 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
              <span className="material-symbols-outlined text-[140px]">music_note</span>
            </div>
            <div className="flex items-center justify-between gap-6 relative z-10">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-on-surface-variant leading-tight group-hover:text-primary transition-colors">{data.warmup_title}</h3>
                <p className="text-sm mt-2 text-on-surface-variant/80 max-w-xs truncate flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">search</span>
                  Keyword: {data.warmup_audio_keyword}
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg shrink-0 group-hover:bg-cyan-600 transition-colors">
                <span className="material-symbols-outlined text-4xl">play_arrow</span>
              </div>
            </div>
          </a>
        </section>

        {/* Section 2: Core Task */}
        <section className="relative space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-secondary text-on-secondary rounded-full px-4 py-1.5 text-sm font-bold tracking-wide uppercase">Active Task</span>
            <span className="w-3 h-3 bg-secondary rounded-full animate-pulse"></span>
          </div>
          <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-xl relative overflow-hidden space-y-6 px-4 py-8">
            <div className="bg-secondary-container/30 rounded-2xl leading-relaxed text-on-secondary-container font-medium px-4 py-8 relative z-10">
              <p className="text-lg whitespace-pre-wrap">{data.core_task_text}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 relative z-10">
              {(data.core_sentences || []).map((sentence, idx) => (
                <div 
                  key={idx} 
                  onClick={() => speakText(sentence)}
                  className="bg-white p-6 rounded-2xl flex items-center gap-6 shadow-sm border border-secondary/10 hover:translate-y-[-4px] transition-transform cursor-pointer active:scale-95 group"
                >
                  <div className={`${idx % 2 === 0 ? 'bg-tertiary-container text-tertiary' : 'bg-primary-container text-primary'} w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-2xl">
                      volume_up
                    </span>
                  </div>
                  <p className="font-bold text-on-surface text-lg">{sentence}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 text-center text-sm text-outline">
              *点击喇叭或卡片可播放纯正英文发音*
            </div>
          </div>
        </section>

        {/* Section 3: Review */}
        <section className="relative space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-surface-container-highest text-on-surface-variant rounded-full px-4 py-1.5 text-sm font-bold tracking-wide uppercase">Review</span>
          </div>
          <div className="bg-surface-container rounded-xl border-2 border-dashed border-outline-variant/30 px-4 py-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant shadow-inner">
                <span className="material-symbols-outlined text-4xl">back_hand</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-on-surface-variant">Review Guideline</h3>
                <p className="text-on-surface-variant/90 text-md whitespace-pre-wrap leading-relaxed">{data.review_text}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
