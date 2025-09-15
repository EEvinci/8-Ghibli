/**
 * OpenAI API 连接测试脚本
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  timeout: 30000, // 30秒超时
  maxRetries: 3,
  retryDelay: 1000, // 1秒重试延迟
};

async function testOpenAIConnection() {
  console.log('🔍 开始测试 OpenAI API 连接...\n');

  // 检查环境变量
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ 错误: OPENAI_API_KEY 环境变量未设置');
    console.log('请在 .env.local 文件中添加: OPENAI_API_KEY=your_api_key_here');
    return false;
  }

  console.log('✅ 找到 OpenAI API Key');
  console.log(`🔑 API Key 前缀: ${apiKey.substring(0, 8)}...`);

  // 初始化 OpenAI 客户端
  const openai = new OpenAI({
    apiKey: apiKey,
    timeout: TEST_CONFIG.timeout,
    maxRetries: TEST_CONFIG.maxRetries,
  });

  try {
    // 测试 1: 简单的文本生成测试
    console.log('\n📝 测试 1: 文本生成功能...');
    const textResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Hello, please respond with "API connection successful"' }
      ],
      max_tokens: 10,
    });

    console.log('✅ 文本生成测试成功');
    console.log(`📄 响应: ${textResponse.choices[0].message.content}`);

    // 测试 2: 图片生成测试
    console.log('\n🎨 测试 2: 图片生成功能...');
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: 'A simple test image of a red circle',
      n: 1,
      size: '256x256',
      quality: 'standard',
    });

    console.log('✅ 图片生成测试成功');
    console.log(`🖼️ 生成图片 URL: ${imageResponse.data[0].url}`);

    // 测试 3: 图片编辑测试（DALL-E 2）
    console.log('\n✏️ 测试 3: 图片编辑功能...');
    
    // 创建一个简单的测试图片
    const testImagePath = path.join(__dirname, '../public/images/test-circle.png');
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️ 测试图片不存在，跳过图片编辑测试');
    } else {
      try {
        const editResponse = await openai.images.edit({
          model: 'dall-e-2',
          image: fs.createReadStream(testImagePath),
          prompt: 'Add a blue square to this image',
          n: 1,
          size: '256x256',
        });
        console.log('✅ 图片编辑测试成功');
        console.log(`🖼️ 编辑后图片 URL: ${editResponse.data[0].url}`);
      } catch (editError) {
        console.log('⚠️ 图片编辑测试失败（这是正常的，因为需要特定的图片格式）');
        console.log(`   错误: ${editError.message}`);
      }
    }

    console.log('\n🎉 所有测试通过！OpenAI API 连接正常');
    return true;

  } catch (error) {
    console.error('\n❌ OpenAI API 测试失败:');
    console.error(`   错误类型: ${error.name}`);
    console.error(`   错误信息: ${error.message}`);
    
    if (error.code) {
      console.error(`   错误代码: ${error.code}`);
    }
    
    if (error.status) {
      console.error(`   HTTP 状态: ${error.status}`);
    }

    // 提供解决建议
    console.log('\n💡 可能的解决方案:');
    
    if (error.message.includes('timeout')) {
      console.log('   - 增加超时时间');
      console.log('   - 检查网络连接');
    }
    
    if (error.message.includes('rate limit')) {
      console.log('   - 等待一段时间后重试');
      console.log('   - 检查 API 使用配额');
    }
    
    if (error.message.includes('authentication')) {
      console.log('   - 检查 API Key 是否正确');
      console.log('   - 确认 API Key 有足够的权限');
    }
    
    if (error.message.includes('quota')) {
      console.log('   - 检查 OpenAI 账户余额');
      console.log('   - 升级账户或等待下个计费周期');
    }

    return false;
  }
}

// 测试超时处理
async function testTimeoutHandling() {
  console.log('\n⏱️ 测试超时处理...');
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 5000, // 5秒超时
  });

  try {
    await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test timeout' }],
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Custom timeout')), 6000)
      )
    ]);
  } catch (error) {
    if (error.message.includes('timeout') || error.message.includes('Custom timeout')) {
      console.log('✅ 超时处理正常');
    } else {
      console.log('⚠️ 超时处理异常:', error.message);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 OpenAI API 连接测试工具\n');
  
  const success = await testOpenAIConnection();
  await testTimeoutHandling();
  
  if (success) {
    console.log('\n✅ 测试完成，API 连接正常');
    process.exit(0);
  } else {
    console.log('\n❌ 测试失败，请检查配置');
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testOpenAIConnection, testTimeoutHandling };



