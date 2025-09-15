const OpenAI = require('openai');
require('dotenv').config();

async function testAPI() {
  console.log('🔍 测试 OpenAI API 连接...\n');
  
  // 检查环境变量
  const apiKey = process.env.OPENAI_API_KEY;
  console.log('API Key 状态:', apiKey ? `已设置 (${apiKey.substring(0, 15)}...)` : '未设置');
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY 环境变量未设置');
    return;
  }
  
  // 清理 API Key（移除可能的特殊字符）
  const cleanApiKey = apiKey.trim().replace(/[%\s]+$/, '');
  console.log('清理后的 API Key:', `${cleanApiKey.substring(0, 15)}...`);
  
  const openai = new OpenAI({
    apiKey: cleanApiKey,
    timeout: 30000, // 30秒超时
  });
  
  try {
    console.log('📝 测试简单的文本生成...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "Hello World"' }],
      max_tokens: 10,
    });
    
    console.log('✅ 文本生成成功:', response.choices[0].message.content);
    
    // 测试图片生成
    console.log('🎨 测试图片生成...');
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: 'A simple red circle',
      n: 1,
      size: '256x256',
    });
    
    console.log('✅ 图片生成成功:', imageResponse.data[0].url);
    console.log('🎉 所有测试通过！');
    
  } catch (error) {
    console.error('❌ API 调用失败:', error.message);
    if (error.code) console.error('错误代码:', error.code);
    if (error.status) console.error('HTTP 状态:', error.status);
  }
}

testAPI();



