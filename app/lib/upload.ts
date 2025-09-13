export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    id?: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
    hash?: string;
    category?: string;
    tags?: string[];
    uploadedAt: string;
    databaseSaved?: boolean;
    databaseError?: string;
    mode?: string;
  };
  error?: string;
  details?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * 上传文件到服务器
 * @param file 要上传的文件
 * @param onProgress 进度回调函数
 * @returns Promise<UploadResponse>
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> {
  try {
    // 创建FormData
    const formData = new FormData();
    formData.append('file', file);

    // 创建XMLHttpRequest以支持进度监控
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // 监听上传进度
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
        }
      });

      // 监听请求完成
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('响应解析失败'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error || '上传失败'));
          } catch (error) {
            reject(new Error(`上传失败: ${xhr.status} ${xhr.statusText}`));
          }
        }
      });

      // 监听请求错误
      xhr.addEventListener('error', () => {
        reject(new Error('网络错误，请检查网络连接'));
      });

      // 监听请求超时
      xhr.addEventListener('timeout', () => {
        reject(new Error('上传超时，请重试'));
      });

      // 设置超时时间（30秒）
      xhr.timeout = 30000;

      // 发送请求
      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });

  } catch (error) {
    throw new Error(error instanceof Error ? error.message : '上传失败');
  }
}

/**
 * 验证文件是否符合要求
 * @param file 要验证的文件
 * @returns 验证结果
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // 检查文件类型
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `不支持的文件类型。支持的类型: ${ALLOWED_TYPES.join(', ')}`
    };
  }

  // 检查文件大小
  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: `文件过大。最大允许大小: ${MAX_SIZE / 1024 / 1024}MB`
    };
  }

  return { isValid: true };
}
