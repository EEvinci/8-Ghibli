const OpenAI = require('openai');
const { HttpsProxyAgent } = require('https-proxy-agent');
require('dotenv').config();

async function testAPIWithoutProxy() {
  console.log('🔍 测试 OpenAI API 连接（绕过代理）...\n');
  
  // 临时禁用代理
  delete process.env.http_proxy;
  delete process.env.https_proxy;
  delete process.env.HTTP_PROXY;
  delete process.env.HTTPS_PROXY;
  
  const apiKey = process.env.OPENAI_API_KEY?.trim().replace(/[%\s]+$/, '');
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY 环境变量未设置');
    return;
  }
  
  console.log('API Key 状态:', `已设置 (${apiKey.substring(0, 15)}...)`);
  
  const openai = new OpenAI({
    apiKey: apiKey,
    timeout: 30000,
    // 明确禁用代理
    httpAgent: false,
    httpsAgent: false,
  });
  
  try {
    console.log('📝 测试文本生成（无代理）...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "Hello World"' }],
      max_tokens: 10,
    });
    
    console.log('✅ 文本生成成功:', response.choices[0].message.content);
    return true;
    
  } catch (error) {
    console.error('❌ 无代理测试失败:', error.message);
    
    // 尝试使用代理
    console.log('\n🔄 尝试使用代理连接...');
    try {
      const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7890');
      const openaiWithProxy = new OpenAI({
        apiKey: apiKey,
        timeout: 30000,
        httpAgent: proxyAgent,
      });
      
      const proxyResponse = await openaiWithProxy.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say "Hello World"' }],
        max_tokens: 10,
      });
      
      console.log('✅ 代理连接成功:', proxyResponse.choices[0].message.content);
      return true;
      
    } catch (proxyError) {
      console.error('❌ 代理连接也失败:', proxyError.message);
      return false;
    }
  }
}

testAPIWithoutProxy();



