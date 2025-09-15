/**
 * OpenAI API Key 测试文件
 * 用于验证 API Key 是否有效
 */

const OpenAI = require('openai');
require('dotenv').config();

async function testOpenAIKey() {
  console.log('🔑 OpenAI API Key 测试\n');
  
  // 1. 检查环境变量
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ 错误: OPENAI_API_KEY 环境变量未设置');
    console.log('请在 .env 文件中添加: OPENAI_API_KEY=your_api_key_here');
    process.exit(1);
  }
  
  // 2. 清理 API Key
  const cleanKey = apiKey.trim().replace(/[%\s\n\r]+$/, '');
  console.log('✓ API Key 已找到');
  console.log(`  格式: ${cleanKey.substring(0, 12)}...`);
  console.log(`  长度: ${cleanKey.length} 字符`);
  
  // 3. 验证 API Key 格式
  if (!cleanKey.startsWith('sk-')) {
    console.error('❌ 错误: API Key 格式不正确，应以 "sk-" 开头');
    process.exit(1);
  }
  
  console.log('✓ API Key 格式正确\n');
  
  // 4. 初始化 OpenAI 客户端
  const openai = new OpenAI({
    apiKey: cleanKey,
    timeout: 15000, // 15秒超时
  });
  
  try {
    console.log('🧪 测试 API 连接...');
    
    // 5. 发送最简单的测试请求
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Hello' }
      ],
      max_tokens: 5,
      temperature: 0
    });
    
    // 6. 检查响应
    if (response && response.choices && response.choices[0]) {
      console.log('✅ 成功: API Key 有效且可用');
      console.log(`📝 响应: "${response.choices[0].message.content}"`);
      console.log(`💰 使用情况: ${response.usage?.total_tokens || 'N/A'} tokens`);
      
      return true;
    } else {
      console.error('❌ 错误: API 返回了无效的响应');
      return false;
    }
    
  } catch (error) {
    console.error('❌ API 调用失败:');
    console.error(`   错误信息: ${error.message}`);
    
    // 提供具体的错误诊断
    if (error.status === 401) {
      console.error('   🔍 诊断: API Key 无效或已过期');
    } else if (error.status === 429) {
      console.error('   🔍 诊断: 请求频率过高或配额不足');
    } else if (error.status === 500) {
      console.error('   🔍 诊断: OpenAI 服务器错误');
    } else if (error.message.includes('timeout')) {
      console.error('   🔍 诊断: 网络连接超时');
    } else if (error.code === 'ENOTFOUND') {
      console.error('   🔍 诊断: 无法连接到 OpenAI 服务器，检查网络');
    }
    
    return false;
  }
}

// 运行测试
if (require.main === module) {
  testOpenAIKey()
    .then(success => {
      if (success) {
        console.log('\n🎉 测试完成: API Key 工作正常');
        process.exit(0);
      } else {
        console.log('\n💥 测试失败: API Key 无法使用');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 测试异常:', error.message);
      process.exit(1);
    });
}

module.exports = { testOpenAIKey };



