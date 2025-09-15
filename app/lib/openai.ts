import OpenAI from 'openai';

// 定义支持的吉卜力风格类型
export type GhibliStyle = 
  | 'spirited-away'    // 千与千寻风格
  | 'totoro'           // 龙猫风格
  | 'howls-castle'     // 哈尔的移动城堡风格
  | 'castle-in-sky'    // 天空之城风格
  | 'ponyo';           // 悬崖上的金鱼姬风格

// 风格名称映射
const STYLE_NAMES: Record<GhibliStyle, string> = {
  'spirited-away': 'Spirited Away',
  'totoro': 'My Neighbor Totoro',
  'howls-castle': 'Howl\'s Moving Castle',
  'castle-in-sky': 'Castle in the Sky',
  'ponyo': 'Ponyo'
};

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 将图片转换为指定的吉卜力风格
 * @param imageFile - 用户上传的图片文件
 * @param style - 选择的吉卜力风格
 * @returns 生成的图片数据
 */
export async function transformToGhibliStyle(
  imageFile: File,
  style: GhibliStyle
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    // 验证 API Key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API Key 未配置');
    }

    // 验证风格参数
    if (!Object.keys(STYLE_NAMES).includes(style)) {
      throw new Error(`不支持的风格: ${style}`);
    }

    // 将文件转换为 base64
    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = imageFile.type;

    // 构建提示词
    const styleName = STYLE_NAMES[style];
    const prompt = `Transform this image into Studio Ghibli ${styleName} style with soft colors, hand-drawn aesthetic, dreamy atmosphere`;

    // 调用 OpenAI DALL-E 3 API
    const response = await openai.images.edit({
      model: 'dall-e-2', // 注意：DALL-E 3 目前不支持图像编辑，使用 DALL-E 2
      image: `data:${mimeType};base64,${base64Image}`,
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url'
    });

    // 检查响应
    if (!response.data || response.data.length === 0) {
      throw new Error('OpenAI API 返回空结果');
    }

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error('生成的图片 URL 为空');
    }

    return {
      success: true,
      imageUrl: imageUrl
    };

  } catch (error) {
    console.error('OpenAI API 调用失败:', error);
    
    let errorMessage = '图片转换失败';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * 使用 DALL-E 3 生成新图片（基于文本描述）
 * @param description - 图片描述
 * @param style - 选择的吉卜力风格
 * @returns 生成的图片数据
 */
export async function generateGhibliImage(
  description: string,
  style: GhibliStyle
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    // 验证 API Key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API Key 未配置');
    }

    // 验证风格参数
    if (!Object.keys(STYLE_NAMES).includes(style)) {
      throw new Error(`不支持的风格: ${style}`);
    }

    // 构建提示词
    const styleName = STYLE_NAMES[style];
    const prompt = `${description}, in Studio Ghibli ${styleName} style with soft colors, hand-drawn aesthetic, dreamy atmosphere`;

    // 调用 OpenAI DALL-E 3 API
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url'
    });

    // 检查响应
    if (!response.data || response.data.length === 0) {
      throw new Error('OpenAI API 返回空结果');
    }

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error('生成的图片 URL 为空');
    }

    return {
      success: true,
      imageUrl: imageUrl
    };

  } catch (error) {
    console.error('OpenAI API 调用失败:', error);
    
    let errorMessage = '图片生成失败';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * 获取所有支持的吉卜力风格列表
 * @returns 风格列表
 */
export function getSupportedStyles(): Array<{ value: GhibliStyle; label: string }> {
  return Object.entries(STYLE_NAMES).map(([value, label]) => ({
    value: value as GhibliStyle,
    label: label
  }));
}

/**
 * 验证风格参数是否有效
 * @param style - 要验证的风格
 * @returns 是否为有效风格
 */
export function isValidStyle(style: string): style is GhibliStyle {
  return Object.keys(STYLE_NAMES).includes(style);
}
