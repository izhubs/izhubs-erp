import { generateLandingPageBlocks } from '../core/engine/izlanding/ai';

async function run() {
  console.log('Testing Vibe Code Generation...');
  console.log('Environment GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
  
  try {
    const blocks = await generateLandingPageBlocks('Tạo một landing page bán khoá học Tiếng Anh Giao Tiếp siêu tốc cho người đi làm.');
    console.log('\n--- KẾT QUẢ TỪ GEMINI ---');
    console.log(JSON.stringify(blocks, null, 2));
    console.log('--- HOÀN TẤT ---');
  } catch (error: any) {
    console.error('LỖI KHI GỘI GEMINI:', error.message);
  }
}

run();
