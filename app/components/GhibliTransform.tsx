'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { GhibliStyle } from '@/app/lib/openai';

const ghibliStyles = [
  {
    id: 'spirited-away' as GhibliStyle,
    name: '千与千寻',
    description: '梦幻神秘的水彩风格',
    emoji: '🏮',
    gradient: 'from-purple-400 to-pink-400'
  },
  {
    id: 'totoro' as GhibliStyle,
    name: '龙猫',
    description: '温暖治愈的森林风格',
    emoji: '🌳',
    gradient: 'from-green-400 to-emerald-400'
  },
  {
    id: 'howls-castle' as GhibliStyle,
    name: '哈尔的移动城堡',
    description: '魔幻浪漫的欧式风格',
    emoji: '🏰',
    gradient: 'from-blue-400 to-indigo-400'
  },
  {
    id: 'castle-in-sky' as GhibliStyle,
    name: '天空之城',
    description: '宏伟壮观的天空风格',
    emoji: '☁️',
    gradient: 'from-sky-400 to-cyan-400'
  },
  {
    id: 'ponyo' as GhibliStyle,
    name: '悬崖上的金鱼姬',
    description: '活泼明亮的海洋风格',
    emoji: '🐠',
    gradient: 'from-orange-400 to-red-400'
  }
];

export default function GhibliTransform() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<GhibliStyle | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputImageUrl, setOutputImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件');
        return;
      }
      
      // 验证文件大小（最大10MB）
      if (file.size > 10 * 1024 * 1024) {
        setError('图片大小不能超过10MB');
        return;
      }

      setSelectedImage(file);
      setSelectedImageUrl(URL.createObjectURL(file));
      setOutputImageUrl(null);
      setError(null);
    }
  };

  const handleStyleSelect = (style: GhibliStyle) => {
    setSelectedStyle(style);
    // 如果已经选择了图片，自动开始转换
    if (selectedImage) {
      handleTransform(style);
    }
  };

  const handleTransform = async (style?: GhibliStyle) => {
    const targetStyle = style || selectedStyle;
    if (!selectedImage || !targetStyle) {
      setError('请先选择图片和风格');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('style', targetStyle);

      const response = await fetch('/api/transform', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '转换失败');
      }

      if (result.success && result.data?.publicUrl) {
        setOutputImageUrl(result.data.publicUrl);
      } else {
        throw new Error('转换结果无效');
      }
    } catch (error) {
      console.error('转换错误:', error);
      setError(error instanceof Error ? error.message : '转换失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setSelectedImageUrl(null);
    setSelectedStyle(null);
    setOutputImageUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="glass-card p-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white mb-2">AI 风格转换</h3>
        <p className="text-white/80 text-lg">选择图片和风格，让AI为您创造独特的艺术作品</p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 左侧：输入区域 */}
        <div className="space-y-6">
          {/* 图片选择 */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">1. 选择图片</h4>
            {!selectedImageUrl ? (
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
                    <p className="text-white/70 text-sm">支持 JPG、PNG、WebP 格式，单个文件最大 10MB</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass p-4 rounded-2xl border border-white/20">
                <div className="flex items-center justify-between mb-3">
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
                <div className="relative w-full h-48 bg-white/10 rounded-xl overflow-hidden">
                  <Image
                    src={selectedImageUrl}
                    alt="选择的图片"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-white/70 text-sm mt-2">
                  {selectedImage?.name} ({(selectedImage?.size || 0 / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>

          {/* 风格选择 */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">2. 选择风格</h4>
            <div className="space-y-3">
              {ghibliStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  disabled={!selectedImage || isProcessing}
                  className={`
                    w-full glass p-4 rounded-xl border-2 transition-all duration-300 text-left
                    ${selectedStyle === style.id 
                      ? `border-white/60 bg-gradient-to-r ${style.gradient} bg-opacity-20` 
                      : 'border-white/20 hover:border-white/40'
                    }
                    ${!selectedImage || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`text-3xl ${selectedStyle === style.id ? 'animate-bounce' : ''}`}>
                      {style.emoji}
                    </div>
                    <div className="flex-1">
                      <h5 className="text-white font-medium mb-1">{style.name}</h5>
                      <p className="text-white/70 text-sm">{style.description}</p>
                    </div>
                    {selectedStyle === style.id && (
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：输出区域 */}
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-white">转换结果</h4>
          <div className="glass p-8 rounded-2xl border border-white/20 min-h-[500px] flex items-center justify-center">
            {isProcessing ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <div>
                  <p className="text-lg font-medium text-white">AI 正在处理中...</p>
                  <p className="text-white/70 text-sm mt-2">这可能需要 30-60 秒，请耐心等待</p>
                </div>
                <div className="w-64 bg-white/20 rounded-full h-2 mx-auto">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            ) : outputImageUrl ? (
              <div className="w-full space-y-4">
                <div className="relative w-full h-96 bg-white/10 rounded-xl overflow-hidden">
                  <Image
                    src={outputImageUrl}
                    alt="Ghibli风格图片"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex gap-3 justify-center">
                  <a
                    href={outputImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gradient-btn px-6 py-2 rounded-full text-sm font-medium"
                  >
                    查看原图
                  </a>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = outputImageUrl;
                      link.download = `ghibli-${selectedStyle}-${Date.now()}.png`;
                      link.click();
                    }}
                    className="glass px-6 py-2 rounded-full text-sm font-medium text-white border border-white/30 hover:bg-white/10 transition-colors"
                  >
                    下载图片
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 text-white/30">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-white/50">风格化后呈现的图片</p>
                  <p className="text-white/30 text-sm mt-2">请先上传图片并选择风格</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
