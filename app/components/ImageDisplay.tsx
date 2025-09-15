'use client';

interface ImageDisplayProps {
  inputImage?: File | null;
  outputImageUrl?: string | null;
  onImageUpload: (file: File) => void;
  isProcessing?: boolean;
}

export default function ImageDisplay({ 
  inputImage, 
  outputImageUrl, 
  onImageUpload, 
  isProcessing = false 
}: ImageDisplayProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="flex gap-6">
      {/* 输入区域 - 左侧 */}
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
          输入区域
        </h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center min-h-[300px] flex flex-col justify-center">
          {inputImage ? (
            <div className="space-y-4">
              <img
                src={URL.createObjectURL(inputImage)}
                alt="上传的原始图片"
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
              />
              <p className="text-sm text-gray-600">
                原始图片: {inputImage.name}
              </p>
              <p className="text-xs text-gray-500">
                大小: {(inputImage.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  点击选择图片或拖拽到此处
                </p>
                <p className="text-xs text-gray-500">
                  支持 JPG, PNG, WebP 格式
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                选择图片
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 分隔线 */}
      <div className="w-px bg-gray-300"></div>

      {/* 输出区域 - 右侧 */}
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
          输出区域
        </h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center min-h-[300px] flex flex-col justify-center">
          {isProcessing ? (
            <div className="space-y-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">
                AI 正在处理中...
              </p>
              <p className="text-xs text-gray-500">
                请稍候，这可能需要几秒钟
              </p>
            </div>
          ) : outputImageUrl ? (
            <div className="space-y-4">
              <img
                src={outputImageUrl}
                alt="AI 生成的吉卜力风格图片"
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
              />
              <p className="text-sm text-gray-600">
                AI 生成的吉卜力风格图片
              </p>
              <div className="flex gap-2 justify-center">
                <a
                  href={outputImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  查看原图
                </a>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = outputImageUrl;
                    link.download = `ghibli-style-${Date.now()}.png`;
                    link.click();
                  }}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  下载图片
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">
                  转换结果将显示在这里
                </p>
                <p className="text-xs text-gray-400">
                  请先上传图片并选择风格
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
