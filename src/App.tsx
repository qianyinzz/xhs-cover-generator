import { useState, useRef, FormEvent } from 'react';
import html2canvas from 'html2canvas';
import { Download, Sparkles, LayoutTemplate, Palette, Type, Hash, Image as ImageIcon, BookOpen } from 'lucide-react';

// Types
type TemplateType = 'tutorial' | 'pitfall' | 'result' | 'persona' | 'tool' | 'meme' | 'quote' | 'list' | 'minimal' | 'news';

interface CoverData {
  template: TemplateType;
  title: string;
  subtitle: string;
  tags: string[];
  bgColor: string;
  textColor: string;
  accentColor: string;
  emoji: string;
}

const TEMPLATES: { id: TemplateType; name: string; defaultData: Partial<CoverData> }[] = [
  {
    id: 'tutorial',
    name: '干货教程',
    defaultData: {
      title: '3步学会Python',
      subtitle: '入门到实战，新手必看',
      tags: ['🐍 编程', '⚡ 速成', '✅ 实用'],
      bgColor: '#FFE5E5',
      textColor: '#333333',
      accentColor: '#FF4D4D',
      emoji: '📚',
    },
  },
  {
    id: 'pitfall',
    name: '踩坑避雷',
    defaultData: {
      title: '千万别踩的5个坑！',
      subtitle: '独立开发一年，这些亏我吃够了',
      tags: ['⚠️ 避坑指南', '💰 血泪教训'],
      bgColor: '#FFF0D4',
      textColor: '#333333',
      accentColor: '#FF9900',
      emoji: '💣',
    },
  },
  {
    id: 'result',
    name: '成果展示',
    defaultData: {
      title: '从0到1',
      subtitle: '我做出了第一个产品',
      tags: ['📈 收入', '👥 用户', '⏰ 耗时'],
      bgColor: '#E5F6FF',
      textColor: '#333333',
      accentColor: '#0099FF',
      emoji: '🚀',
    },
  },
  {
    id: 'persona',
    name: '人设故事',
    defaultData: {
      title: '独立开发1年',
      subtitle: '我想说的话... 后悔？不后悔！',
      tags: ['💼 真实分享', '🎯 经验总结'],
      bgColor: '#F3E8FF',
      textColor: '#333333',
      accentColor: '#9900FF',
      emoji: '✨',
    },
  },
  {
    id: 'tool',
    name: '工具推荐',
    defaultData: {
      title: '这个工具太香了！',
      subtitle: 'Cursor - AI编程神器',
      tags: ['⭐⭐⭐⭐⭐', '免费', '必备'],
      bgColor: '#E6FFED',
      textColor: '#333333',
      accentColor: '#00CC44',
      emoji: '🛠️',
    },
  },
  {
    id: 'meme',
    name: '梗图吐槽',
    defaultData: {
      title: '又出Bug了',
      subtitle: '独立开发的日常be like',
      tags: ['😂 真实', '😢 破防', '💀 绷不住'],
      bgColor: '#F1F5F9',
      textColor: '#333333',
      accentColor: '#64748B',
      emoji: '🤡',
    },
  },
  {
    id: 'quote',
    name: '金句名言',
    defaultData: {
      title: '“做难事必有所得”',
      subtitle: '写给所有在迷茫中坚持的人',
      tags: ['💡 人生感悟', '🧗‍♀️ 自我成长'],
      bgColor: '#1A1A1A',
      textColor: '#FFFFFF',
      accentColor: '#F59E0B',
      emoji: '🖋️',
    },
  },
  {
    id: 'list',
    name: '盘点清单',
    defaultData: {
      title: '年度红黑榜',
      subtitle: 'TOP 5 绝对不能错过的宝藏好物',
      tags: ['🏆 榜单', '🛍️ 购物分享', '✨ 强烈推荐'],
      bgColor: '#FDF2F8',
      textColor: '#333333',
      accentColor: '#DB2777',
      emoji: '📋',
    },
  },
  {
    id: 'minimal',
    name: '极简风格',
    defaultData: {
      title: 'ORDINARY DAY',
      subtitle: '保持生活松弛感的秘诀',
      tags: ['🌿 极简', '📸 日常碎片'],
      bgColor: '#FFFFFF',
      textColor: '#333333',
      accentColor: '#9CA3AF',
      emoji: '☕',
    },
  },
  {
    id: 'news',
    name: '资讯播报',
    defaultData: {
      title: '刚刚宣布！突发大降价',
      subtitle: '一图看懂最新行业新规',
      tags: ['🚨 重磅', '📰 第一时间', '📉 价格跳水'],
      bgColor: '#FEF2F2',
      textColor: '#333333',
      accentColor: '#DC2626',
      emoji: '📢',
    },
  },
];

const COLORS = [
  '#FFE5E5', '#FFF0D4', '#E5F6FF', '#F3E8FF', '#E6FFED', '#F1F5F9',
  '#FFD1D1', '#FFE4B5', '#D1EEFF', '#E9D5FF', '#C1F0C1', '#E2E8F0',
  '#FFFFFF', '#1A1A1A', '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'
];

const VALID_CODE = '83921';

export default function App() {
  const [hasAccess, setHasAccess] = useState(false);
  const [activationInput, setActivationInput] = useState('');
  const [activationError, setActivationError] = useState(false);

  const [activeTab, setActiveTab] = useState<'editor' | 'titles' | 'reference'>('editor');
  const [coverData, setCoverData] = useState<CoverData>({
    template: 'tutorial',
    title: TEMPLATES[0].defaultData.title!,
    subtitle: TEMPLATES[0].defaultData.subtitle!,
    tags: TEMPLATES[0].defaultData.tags!,
    bgColor: TEMPLATES[0].defaultData.bgColor!,
    textColor: TEMPLATES[0].defaultData.textColor!,
    accentColor: TEMPLATES[0].defaultData.accentColor!,
    emoji: TEMPLATES[0].defaultData.emoji!,
  });

  const [topicInput, setTopicInput] = useState('');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);

  const handleVerifyCode = (e: FormEvent) => {
    e.preventDefault();
    if (activationInput === VALID_CODE) {
      setHasAccess(true);
      setActivationError(false);
    } else {
      setActivationError(true);
      setTimeout(() => setActivationError(false), 500);
    }
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF2442] to-[#ff6677] flex items-center justify-center p-4">
        <form
          onSubmit={handleVerifyCode}
          className={`bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center transition-all duration-300 ${activationError ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        >
          <div className="w-16 h-16 bg-[#FF2442] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black mb-2 text-gray-800">请输入兑换码</h1>
          <p className="text-sm text-gray-500 mb-6 font-medium">输入有效兑换码以解锁强大的小红书封面编辑器</p>

          <input
            type="text"
            value={activationInput}
            onChange={(e) => setActivationInput(e.target.value)}
            placeholder="例如: 12345"
            className={`w-full px-4 py-3 rounded-xl border-2 text-center text-xl font-bold tracking-widest outline-none transition-all ${activationError
              ? 'border-red-500 bg-red-50 text-red-600 focus:border-red-500'
              : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-[#FF2442]'
              }`}
          />
          {activationError && <p className="text-red-500 text-xs font-bold mt-2">兑换码不正确，请重试</p>}

          <button
            type="submit"
            className="w-full mt-6 bg-[#FF2442] text-white font-bold py-3 rounded-xl shadow-[0_4px_14px_0_rgba(255,36,66,0.39)] hover:shadow-[0_6px_20px_rgba(255,36,66,0.23)] hover:bg-[#ff3b56] transition-all"
          >
            立即解锁
          </button>
        </form>
      </div>
    );
  }

  const handleTemplateChange = (templateId: TemplateType) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setCoverData({
        ...coverData,
        template: templateId,
        ...template.defaultData,
      });
    }
  };

  const handleDownload = async () => {
    if (!coverRef.current) return;
    try {
      const canvas = await html2canvas(coverRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: null,
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `xiaohongshu-cover-${Date.now()}.png`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error('Failed to generate image', error);
      alert('生成图片失败，请重试');
    }
  };

  const handleAddTitle = () => {
    if (!topicInput.trim()) return;
    setGeneratedTitles([topicInput.trim(), ...generatedTitles]);
    setTopicInput('');
  };

  const applyTitle = (title: string) => {
    setCoverData({ ...coverData, title });
    setActiveTab('editor');
  };

  const renderCoverPreview = () => {
    const { template, title, subtitle, tags, bgColor, textColor, accentColor, emoji } = coverData;

    const commonClasses = "relative w-full aspect-[3/4] overflow-hidden flex flex-col p-8 shadow-2xl rounded-2xl transition-all duration-300";

    switch (template) {
      case 'tutorial':
        return (
          <div ref={coverRef} className={commonClasses} style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="absolute top-0 left-0 w-full h-32 opacity-20" style={{ background: `linear-gradient(to bottom, ${accentColor}, transparent)` }}></div>
            <div className="flex-1 flex flex-col justify-center items-center text-center z-10">
              <div className="text-6xl mb-6">{emoji}</div>
              <h1 className="text-4xl font-black mb-4 leading-tight tracking-tight" style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.5)' }}>{title}</h1>
              <div className="inline-block px-4 py-2 rounded-full font-bold text-lg mb-8" style={{ backgroundColor: accentColor, color: '#fff' }}>
                {subtitle}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 z-10 mt-auto">
              {tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-lg text-sm font-medium shadow-sm border border-white/40">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      case 'pitfall':
        return (
          <div ref={coverRef} className={commonClasses} style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}></div>
            <div className="flex-1 flex flex-col justify-center items-center text-center z-10">
              <div className="text-7xl mb-4 animate-bounce">{emoji}</div>
              <div className="bg-black text-white px-6 py-2 transform -rotate-2 font-black text-2xl mb-6 shadow-lg border-4" style={{ borderColor: accentColor }}>
                {title}
              </div>
              <h2 className="text-2xl font-bold px-4 leading-snug bg-white/80 py-2 rounded-xl">
                {subtitle}
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3 z-10 mt-auto">
              {tags.map((tag, i) => (
                <span key={i} className="px-4 py-2 font-black text-white rounded-md transform rotate-1 shadow-md" style={{ backgroundColor: accentColor }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      case 'result':
        return (
          <div ref={coverRef} className={commonClasses} style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: accentColor }}></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: accentColor }}></div>
            <div className="flex-1 flex flex-col justify-center z-10">
              <div className="text-5xl mb-6">{emoji}</div>
              <h1 className="text-5xl font-black mb-2 tracking-tighter" style={{ color: accentColor }}>{title}</h1>
              <h2 className="text-3xl font-bold mb-8 text-gray-800">{subtitle}</h2>

              <div className="grid grid-cols-1 gap-3 w-full max-w-[80%]">
                {tags.map((tag, i) => (
                  <div key={i} className="flex items-center bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-sm border-l-4" style={{ borderLeftColor: accentColor }}>
                    <span className="font-bold text-lg">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'persona':
        return (
          <div ref={coverRef} className={commonClasses} style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="flex-1 flex flex-col justify-between z-10 p-4">
              <div className="text-4xl self-start bg-white/50 p-4 rounded-full shadow-sm">{emoji}</div>

              <div className="mt-auto mb-8">
                <div className="inline-block px-3 py-1 mb-3 rounded-md text-sm font-bold tracking-widest uppercase" style={{ backgroundColor: textColor, color: bgColor }}>
                  STORY TIME
                </div>
                <h1 className="text-4xl font-serif font-bold mb-4 leading-tight">{title}</h1>
                <p className="text-xl font-medium opacity-80 border-l-2 pl-4" style={{ borderColor: accentColor }}>{subtitle}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold border" style={{ borderColor: textColor }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      case 'tool':
        return (
          <div ref={coverRef} className={commonClasses} style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
            <div className="flex-1 flex flex-col items-center justify-center z-10 text-center">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-5xl mb-8 transform rotate-3 border-4" style={{ borderColor: accentColor }}>
                {emoji}
              </div>
              <div className="bg-black text-white px-4 py-1 rounded-full text-sm font-bold mb-4 uppercase tracking-wider">
                RECOMMENDED
              </div>
              <h1 className="text-4xl font-black mb-4">{title}</h1>
              <h2 className="text-xl font-bold px-6 py-2 rounded-2xl bg-white/60 shadow-sm mb-8">
                {subtitle}
              </h2>
            </div>
            <div className="flex justify-center gap-2 z-10 mt-auto bg-white/40 p-3 rounded-2xl backdrop-blur-sm">
              {tags.map((tag, i) => (
                <span key={i} className="text-sm font-bold" style={{ color: accentColor }}>
                  {tag} {i < tags.length - 1 && <span className="mx-1 text-gray-400">|</span>}
                </span>
              ))}
            </div>
          </div>
        );
      case 'meme':
        return (
          <div ref={coverRef} className={commonClasses} style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="flex-1 flex flex-col items-center justify-center z-10 text-center">
              <h1 className="text-4xl font-black mb-8 bg-white px-6 py-3 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
                {title}
              </h1>
              <div className="text-8xl mb-8 filter drop-shadow-xl">{emoji}</div>
              <h2 className="text-2xl font-bold bg-black text-white px-6 py-2 transform rotate-1">
                {subtitle}
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-2 z-10 mt-auto">
              {tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      case 'quote':
        return (
          <div ref={coverRef} className={commonClasses} style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="absolute top-8 left-8 text-8xl opacity-20 font-serif" style={{ color: accentColor }}>"</div>
            <div className="absolute bottom-16 right-8 text-8xl opacity-20 font-serif transform rotate-180" style={{ color: accentColor }}>"</div>
            <div className="flex-1 flex flex-col justify-center items-center z-10 px-8 text-center pt-12">
              <h1 className="text-4xl font-serif font-black mb-10 leading-relaxed tracking-wider">
                {title}
              </h1>
              <div className="w-16 h-1 mb-6" style={{ backgroundColor: accentColor }}></div>
              <h2 className="text-2xl font-medium tracking-widest opacity-90">
                {subtitle}
              </h2>
            </div>
            <div className="flex flex-col items-center z-10 mt-auto pb-4">
              <div className="text-4xl mb-4 opacity-80">{emoji}</div>
              <div className="flex flex-wrap justify-center gap-3">
                {tags.map((tag, i) => (
                  <span key={i} className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      case 'list':
        return (
          <div ref={coverRef} className={commonClasses} style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-12 -translate-y-12 rotate-45 opacity-10" style={{ backgroundColor: accentColor }}></div>
            <div className="flex flex-col pt-8 pb-4 z-10 h-full">
              <div className="flex items-center gap-4 mb-8 bg-white/60 p-4 rounded-2xl shadow-sm backdrop-blur-md">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl shadow-inner" style={{ backgroundColor: accentColor, color: '#fff' }}>
                  {emoji}
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight" style={{ color: accentColor }}>{title}</h1>
                  <h2 className="text-lg font-bold opacity-80 mt-1">{subtitle}</h2>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-4 px-2">
                {tags.slice(0, 3).map((tag, i) => (
                  <div key={i} className="flex items-center bg-white/80 p-4 rounded-xl shadow-sm border border-gray-100/50">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xl mr-4" style={{ backgroundColor: accentColor, color: '#fff' }}>
                      {i + 1}
                    </div>
                    <span className="flex-1 text-base font-semibold">{tag}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-8 pt-4 border-t-2 border-dashed" style={{ borderColor: `${accentColor}40` }}>
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-white/90 rounded-md text-sm font-bold shadow-sm" style={{ color: accentColor }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      case 'minimal':
        return (
          <div ref={coverRef} className={commonClasses} style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="flex-1 flex flex-col justify-between items-center z-10 text-center p-8">
              <div className="text-sm font-medium tracking-[0.3em] uppercase opacity-40 mt-4 mb-auto">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>

              <div className="flex flex-col items-center my-auto">
                <div className="text-5xl mb-8 opacity-90">{emoji}</div>
                <h1 className="text-5xl font-light tracking-widest mb-6" style={{ color: accentColor }}>
                  {title}
                </h1>
                <h2 className="text-xl font-light tracking-wider opacity-60">
                  {subtitle}
                </h2>
              </div>

              <div className="mt-auto flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-50">
                {tags.map((tag, i) => (
                  <span key={i} className="text-xs tracking-widest uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {/* Subtle frame */}
            <div className="absolute inset-4 border border-current opacity-10 pointer-events-none rounded-sm"></div>
          </div>
        );
      case 'news':
        return (
          <div ref={coverRef} className={commonClasses} style={{ backgroundColor: bgColor, color: textColor }}>
            {/* News ticker style top bar */}
            <div className="absolute top-0 left-0 w-full flex overflow-hidden opacity-20" style={{ backgroundColor: accentColor }}>
              <div className="whitespace-nowrap py-1 font-bold text-xs text-white uppercase tracking-widest animate-pulse">
                BREAKING NEWS • LATEST UPDATE • BREAKING NEWS • LATEST UPDATE • BREAKING NEWS
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1/3 opacity-5" style={{ backgroundImage: 'linear-gradient(0deg, #000 0%, transparent 100%)' }}></div>

            <div className="flex-1 flex flex-col justify-center z-10 pt-10">
              <div className="inline-block self-start mb-6 px-4 py-1 text-white font-black text-xl shadow-md border-l-4 border-black" style={{ backgroundColor: accentColor }}>
                {emoji} HOT ISSUE
              </div>

              <h1 className="text-5xl font-black mb-4 leading-none tracking-tight px-4 py-2 border-l-8" style={{ borderLeftColor: accentColor, backgroundColor: 'rgba(255,255,255,0.8)' }}>
                {title}
              </h1>

              <h2 className="text-2xl font-bold bg-black text-white px-4 py-3 ml-2 self-start shadow-xl">
                {subtitle}
              </h2>

              <div className="mt-auto mb-4 bg-white/90 p-4 border-t-4 shadow-lg" style={{ borderTopColor: accentColor }}>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-sm font-black border border-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">小</div>
            <h1 className="text-xl font-bold">爆款封面生成器</h1>
          </div>
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'editor' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ImageIcon className="w-4 h-4 inline-block mr-1" /> 封面制作
            </button>
            <button
              onClick={() => setActiveTab('titles')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'titles' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Type className="w-4 h-4 inline-block mr-1" /> 爆款标题
            </button>
            <button
              onClick={() => setActiveTab('reference')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'reference' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <BookOpen className="w-4 h-4 inline-block mr-1" /> 参考库
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'editor' && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Editor Controls */}
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-red-500" /> 选择模板
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateChange(t.id)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${coverData.template === t.id
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-200 hover:bg-gray-50'
                        }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5 text-blue-500" /> 文案内容
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">主标题</label>
                  <input
                    type="text"
                    value={coverData.title}
                    onChange={(e) => setCoverData({ ...coverData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    placeholder="输入吸引眼球的标题"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">副标题</label>
                  <input
                    type="text"
                    value={coverData.subtitle}
                    onChange={(e) => setCoverData({ ...coverData, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    placeholder="补充说明或副标题"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签 (用逗号分隔)</label>
                  <input
                    type="text"
                    value={coverData.tags.join(', ')}
                    onChange={(e) => setCoverData({ ...coverData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    placeholder="标签1, 标签2, 标签3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">中心 Emoji</label>
                  <input
                    type="text"
                    value={coverData.emoji}
                    onChange={(e) => setCoverData({ ...coverData, emoji: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-2xl"
                    placeholder="🚀"
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-500" /> 颜色搭配
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">背景色</label>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCoverData({ ...coverData, bgColor: color })}
                          className={`w-8 h-8 rounded-full border-2 shadow-sm ${coverData.bgColor === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">文字颜色</label>
                      <input
                        type="color"
                        value={coverData.textColor}
                        onChange={(e) => setCoverData({ ...coverData, textColor: e.target.value })}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">强调色</label>
                      <input
                        type="color"
                        value={coverData.accentColor}
                        onChange={(e) => setCoverData({ ...coverData, accentColor: e.target.value })}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Preview & Export */}
            <div className="w-full lg:w-1/2 flex flex-col items-center">
              <div className="sticky top-24 w-full flex flex-col items-center">
                <div className="w-full max-w-[360px] mx-auto mb-6">
                  {renderCoverPreview()}
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full max-w-[360px] bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
                >
                  <Download className="w-6 h-6" />
                  下载高清封面
                </button>
                <p className="text-sm text-gray-500 mt-4">建议尺寸：1080 × 1440 (3:4)</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'titles' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Type className="w-6 h-6 text-blue-500" /> 手动添加标题
              </h2>
              <p className="text-gray-500 mb-6">输入你构思好的小红书标题，添加到下方列表中以供随时切换对比效果。</p>

              <div className="flex gap-4">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTitle()}
                  placeholder="例如：早八打工人必备的神仙平替"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-lg"
                />
                <button
                  onClick={handleAddTitle}
                  disabled={!topicInput.trim()}
                  className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  <Type className="w-5 h-5" />
                  添加标题
                </button>
              </div>
            </div>

            {generatedTitles.length > 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-gray-400" /> 备选标题列表
                </h3>
                <div className="space-y-3">
                  {generatedTitles.map((title, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-colors group">
                      <span className="text-lg font-medium text-gray-800">{title}</span>
                      <button
                        onClick={() => applyTitle(title)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 font-medium text-sm px-3 py-1 bg-white rounded-md shadow-sm border border-red-100 hover:bg-red-50 transition-all"
                      >
                        使用此标题
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reference' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">爆款封面参考库</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEMPLATES.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="aspect-[3/4] bg-gray-100 relative flex items-center justify-center p-4">
                    {/* Mini preview of the template */}
                    <div className="w-full h-full transform scale-90 origin-center pointer-events-none">
                      <div className="w-full h-full relative overflow-hidden flex flex-col p-6 shadow-xl rounded-xl" style={{ backgroundColor: t.defaultData.bgColor, color: t.defaultData.textColor }}>
                        {t.id === 'tutorial' && (
                          <>
                            <div className="absolute top-0 left-0 w-full h-24 opacity-20" style={{ background: `linear-gradient(to bottom, ${t.defaultData.accentColor}, transparent)` }}></div>
                            <div className="flex-1 flex flex-col justify-center items-center text-center z-10">
                              <div className="text-4xl mb-4">{t.defaultData.emoji}</div>
                              <h1 className="text-2xl font-black mb-2 leading-tight">{t.defaultData.title}</h1>
                              <div className="inline-block px-3 py-1 rounded-full font-bold text-xs mb-4" style={{ backgroundColor: t.defaultData.accentColor, color: '#fff' }}>
                                {t.defaultData.subtitle}
                              </div>
                            </div>
                          </>
                        )}
                        {t.id === 'pitfall' && (
                          <>
                            <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}></div>
                            <div className="flex-1 flex flex-col justify-center items-center text-center z-10">
                              <div className="text-5xl mb-2">{t.defaultData.emoji}</div>
                              <div className="bg-black text-white px-4 py-1 transform -rotate-2 font-black text-lg mb-4 border-2" style={{ borderColor: t.defaultData.accentColor }}>
                                {t.defaultData.title}
                              </div>
                            </div>
                          </>
                        )}
                        {t.id === 'result' && (
                          <>
                            <div className="flex-1 flex flex-col justify-center z-10">
                              <div className="text-4xl mb-4">{t.defaultData.emoji}</div>
                              <h1 className="text-3xl font-black mb-2" style={{ color: t.defaultData.accentColor }}>{t.defaultData.title}</h1>
                              <h2 className="text-xl font-bold mb-4">{t.defaultData.subtitle}</h2>
                            </div>
                          </>
                        )}
                        {t.id === 'persona' && (
                          <>
                            <div className="flex-1 flex flex-col justify-between z-10 p-2">
                              <div className="text-3xl self-start">{t.defaultData.emoji}</div>
                              <div className="mt-auto mb-4">
                                <h1 className="text-2xl font-serif font-bold mb-2">{t.defaultData.title}</h1>
                                <p className="text-sm font-medium opacity-80 border-l-2 pl-2" style={{ borderColor: t.defaultData.accentColor }}>{t.defaultData.subtitle}</p>
                              </div>
                            </div>
                          </>
                        )}
                        {t.id === 'tool' && (
                          <>
                            <div className="flex-1 flex flex-col items-center justify-center z-10 text-center">
                              <div className="text-4xl mb-4 transform rotate-3">{t.defaultData.emoji}</div>
                              <h1 className="text-2xl font-black mb-2">{t.defaultData.title}</h1>
                            </div>
                          </>
                        )}
                        {t.id === 'meme' && (
                          <>
                            <div className="flex-1 flex flex-col items-center justify-center z-10 text-center">
                              <h1 className="text-2xl font-black mb-4 bg-white px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
                                {t.defaultData.title}
                              </h1>
                              <div className="text-6xl">{t.defaultData.emoji}</div>
                            </div>
                          </>
                        )}
                        {t.id === 'quote' && (
                          <>
                            <div className="absolute top-4 left-4 text-4xl opacity-20 font-serif" style={{ color: t.defaultData.accentColor }}>"</div>
                            <div className="flex-1 flex flex-col justify-center items-center z-10 px-4 text-center">
                              <h1 className="text-2xl font-serif font-black mb-4 leading-relaxed tracking-wider">{t.defaultData.title}</h1>
                              <div className="w-8 h-1 mb-2" style={{ backgroundColor: t.defaultData.accentColor }}></div>
                              <h2 className="text-xs font-medium tracking-widest opacity-90">{t.defaultData.subtitle}</h2>
                            </div>
                          </>
                        )}
                        {t.id === 'list' && (
                          <>
                            <div className="flex flex-col pt-2 pb-2 z-10 h-full">
                              <div className="flex items-center gap-2 mb-4 bg-white/60 p-2 rounded-xl shadow-sm">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-inner" style={{ backgroundColor: t.defaultData.accentColor, color: '#fff' }}>{t.defaultData.emoji}</div>
                                <div><h1 className="text-lg font-black tracking-tight" style={{ color: t.defaultData.accentColor }}>{t.defaultData.title}</h1></div>
                              </div>
                              <div className="flex-1 flex flex-col justify-center space-y-2">
                                {[1, 2].map((num) => (
                                  <div key={num} className="flex items-center bg-white/80 p-2 rounded-lg shadow-sm border border-gray-100/50">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs mr-2" style={{ backgroundColor: t.defaultData.accentColor, color: '#fff' }}>{num}</div>
                                    <div className="flex-1 h-2 rounded-full opacity-20" style={{ backgroundColor: t.defaultData.accentColor }}></div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        {t.id === 'minimal' && (
                          <>
                            <div className="flex-1 flex flex-col justify-between items-center z-10 text-center p-4">
                              <div className="flex flex-col items-center my-auto">
                                <div className="text-3xl mb-4 opacity-90">{t.defaultData.emoji}</div>
                                <h1 className="text-2xl font-light tracking-widest mb-2" style={{ color: t.defaultData.accentColor }}>{t.defaultData.title}</h1>
                              </div>
                            </div>
                            <div className="absolute inset-2 border border-current opacity-10 pointer-events-none rounded-sm"></div>
                          </>
                        )}
                        {t.id === 'news' && (
                          <>
                            <div className="flex-1 flex flex-col justify-center z-10 pt-4">
                              <div className="inline-block self-start mb-2 px-2 py-0.5 text-white font-black text-xs shadow-md border-l-2 border-black" style={{ backgroundColor: t.defaultData.accentColor }}>{t.defaultData.emoji} HOT</div>
                              <h1 className="text-2xl font-black mb-2 leading-none tracking-tight px-2 py-1 border-l-4" style={{ borderLeftColor: t.defaultData.accentColor, backgroundColor: 'rgba(255,255,255,0.8)' }}>{t.defaultData.title}</h1>
                              <h2 className="text-sm font-bold bg-black text-white px-2 py-1 ml-1 self-start shadow-md">{t.defaultData.subtitle}</h2>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100">
                    <h3 className="font-bold text-lg mb-1">{t.name}</h3>
                    <p className="text-sm text-gray-500">适用场景：{
                      t.id === 'tutorial' ? '干货分享、知识科普' :
                        t.id === 'pitfall' ? '经验教训、避坑指南' :
                          t.id === 'result' ? '数据展示、成果汇报' :
                            t.id === 'persona' ? '个人经历、心路历程' :
                              t.id === 'tool' ? '好物推荐、软件安利' :
                                t.id === 'meme' ? '行业吐槽、搞笑日常' :
                                  t.id === 'quote' ? '语录分享、情感共鸣' :
                                    t.id === 'list' ? '好物盘点、内容合集' :
                                      t.id === 'minimal' ? '高级感Vlog、日常碎片' :
                                        '突发新闻、行业资讯'
                    }</p>
                    <button
                      onClick={() => {
                        handleTemplateChange(t.id);
                        setActiveTab('editor');
                      }}
                      className="mt-4 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      使用此模板
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
