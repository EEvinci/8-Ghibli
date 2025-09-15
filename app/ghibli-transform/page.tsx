'use client';

import { useState } from 'react';
import ImageDisplay from '@/app/components/ImageDisplay';
import GhibliStyleSelector from '@/app/components/GhibliStyleSelector';
import { GhibliStyle } from '@/app/lib/openai';

export default function GhibliTransformPage() {
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [outputImageUrl, setOutputImageUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<GhibliStyle>('spirited-away');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (file: File) => {
    setInputImage(file);
    setOutputImageUrl(null); // 清除之前的结果
    setError('');
  };

  const handleGenerate = async () => {
    if (!inputImage) {
      setError('请先上传图片');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', inputImage);
      formData.append('style', selectedStyle);

      // 创建 AbortController 用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2分钟超时

      const response = await fetch('/api/transform', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setOutputImageUrl(result.data.publicUrl);
      } else {
        setError(result.error || '生成失败');
      }
    } catch (err) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        setError('请求超时，请重试。AI 图片生成可能需要较长时间，请耐心等待。');
      } else if (error.message.includes('Failed to fetch')) {
        setError('网络连接失败，请检查网络连接后重试');
      } else if (error.message.includes('HTTP 500')) {
        setError('服务器内部错误，可能是 OpenAI API 调用失败，请稍后重试');
      } else if (error.message.includes('HTTP 400')) {
        setError('请求参数错误，请检查图片格式和大小');
      } else {
        setError(`生成失败: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 顶部标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Ghibli 风格图像转换
          </h1>
          <p className="text-lg text-gray-600">
            将您的图片转换为经典的吉卜力工作室风格
          </p>
        </div>

        {/* 中间图片展示区域 */}
        <div className="mb-8">
          <ImageDisplay
            inputImage={inputImage}
            outputImageUrl={outputImageUrl}
            onImageUpload={handleImageUpload}
            isProcessing={isProcessing}
          />
        </div>

        {/* 底部控制区域 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                选择风格:
              </label>
              <GhibliStyleSelector
                value={selectedStyle}
                onChange={setSelectedStyle}
                disabled={isProcessing}
              />
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={!inputImage || isProcessing}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                !inputImage || isProcessing
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? '生成中...' : '生成'}
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
              {error}
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>工作流程：上传图片 → 选择风格 → 点击生成 → 查看结果</p>
          </div>
        </div>
      </div>
    </div>
  );
}
