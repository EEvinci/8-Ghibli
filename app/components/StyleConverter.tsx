"use client";
import { useState, useRef } from 'react';
import Image from 'next/image';

interface StyleConverterProps {
  onStyleConvert?: (originalImage: string, style: string) => void;
}

const styles = [
  {
    id: 'anime',
    name: '动漫风格',
    description: '将图片转换为动漫卡通风格',
    preview: '🎨'
  },
  {
    id: 'oil_painting',
    name: '油画风格',
    description: '经典油画艺术效果',
    preview: '🖼️'
  },
  {
    id: 'watercolor',
    name: '水彩风格',
    description: '柔和的水彩画效果',
    preview: '🎨'
  },
  {
    id: 'sketch',
    name: '素描风格',
    description: '黑白素描艺术效果',
    preview: '✏️'
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    description: '未来科技感风格',
    preview: '🤖'
  },
  {
    id: 'vintage',
    name: '复古风格',
    description: '怀旧复古色调',
    preview: '📸'
  }
];

export default function StyleConverter({ onStyleConvert }: StyleConverterProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handleConvert = async () => {
    if (!selectedImage || !selectedStyle) return;
    
    setIsConverting(true);
    // 模拟风格转换过程
    setTimeout(() => {
      setIsConverting(false);
      onStyleConvert?.(selectedImage, selectedStyle);
    }, 3000);
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setSelectedStyle(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="glass-card p-8 space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white mb-2">AI 风格转换</h3>
        <p className="text-white/80 text-lg">选择图片和风格，让AI为您创造独特的艺术作品</p>
      </div>

      {/* 图片选择区域 */}
      <div className="space-y-4">
        <h4 className="text-xl font-semibold text-white">1. 选择图片</h4>
        {!selectedImage ? (
          <div
            className="glass border-2 border-dashed border-white/30 rounded-2xl p-8 text-center cursor-pointer hover:border-white/50 transition-all duration-300"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 text-white/60">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-white">点击选择图片</p>
                <p className="text-white/70 text-sm">支持 JPG、PNG、WebP 格式</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass p-6 rounded-2xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-medium text-white">已选择图片</h5>
              <button
                onClick={clearSelection}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative w-full h-64 bg-white/10 rounded-xl overflow-hidden">
              <Image
                src={selectedImage}
                alt="选择的图片"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* 风格选择区域 */}
      <div className="space-y-4">
        <h4 className="text-xl font-semibold text-white">2. 选择风格</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleSelect(style.id)}
              className={`
                glass p-4 rounded-xl border-2 transition-all duration-300 text-left
                ${selectedStyle === style.id 
                  ? 'border-blue-400 bg-blue-500/20' 
                  : 'border-white/20 hover:border-white/40'
                }
              `}
            >
              <div className="text-2xl mb-2">{style.preview}</div>
              <h5 className="text-white font-medium mb-1">{style.name}</h5>
              <p className="text-white/70 text-xs">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 转换按钮 */}
      <div className="flex justify-center pt-6">
        <button
          onClick={handleConvert}
          disabled={!selectedImage || !selectedStyle || isConverting}
          className={`
            px-8 py-4 rounded-full font-medium text-lg transition-all duration-300
            ${selectedImage && selectedStyle && !isConverting
              ? 'gradient-btn hover:scale-105' 
              : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
            }
          `}
        >
          {isConverting ? (
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>转换中...</span>
            </div>
          ) : (
            '开始转换'
          )}
        </button>
      </div>

      {/* 转换进度 */}
      {isConverting && (
        <div className="glass p-6 rounded-2xl border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <div className="flex-1">
              <h5 className="text-white font-medium mb-2">AI正在处理您的图片</h5>
              <p className="text-white/70 text-sm">这可能需要几秒钟时间，请耐心等待...</p>
              <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}