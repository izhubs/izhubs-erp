import { GoogleGenAI, Type, Schema } from '@google/genai';
import { db } from '@/core/engine/db';

const LandingBlockSchema: Schema = {
  type: Type.ARRAY,
  description: 'Mảng các khối giao diện (blocks) để render thành landing page. Chỉ sử dụng chính xác các loại (type) được quy định.',
  items: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        description: `* Các loại Block MẶC ĐỊNH bắt buộc dùng: 'hero', 'features', 'pricing', 'hero-personal', 'about', 'projects', 'hero-sale', 'benefits', 'testimonials', 'hero-saas', 'features-grid', 'image-block', 'iframe-form'.
  * TUYỆT ĐỐI KHÔNG SỬ DỤNG 'cta-form' HOẶC BẤT KỲ FORM NATIVE/HTML NÀO LÀM FORM THU THẬP LEADS. Việc thu thập leads BẮT BUỘC dùng 'iframe-form' (liên kết với hệ thống izForm). Nếu người dùng yêu cầu tạo form, bạn phải xuất block dạng: { "type": "iframe-form", "content": { "title": "Để lại thông tin" } }
  * Khi xuất nội dung Ảnh, HÃY TỰ ĐỘNG SINH URL ảnh thật từ Unsplash/LoremFlickr (ví dụ: https://loremflickr.com/1200/800/coffee) thay vì 'image-url.jpg'. Keyword của link ảnh phải khớp với chủ đề trang web.`,
      },
      content: {
        type: Type.OBJECT,
        description: 'Dữ liệu cấu trúc phù hợp với loại block. Ví dụ title, subtitle, items (mảng chuỗi), plans (mảng chuỗi), name, text, list, headline, cta, badge, url. Hãy tự sáng tạo nội dung chữ (copywriting) hấp dẫn, tiếng Việt chuyên nghiệp dựa trên Prompt của user.',
      }
    },
    required: ['type', 'content'],
  },
};

export async function generateLandingPageBlocks(prompt: string, tenantId?: string, userApiKey?: string, existingBlocks?: any[]) {
  let apiKey = userApiKey;
  
  if (!apiKey && tenantId) {
    const result = await db.query(
      `SELECT config FROM tenant_modules WHERE tenant_id = $1 AND module_id = 'izlanding'`,
      [tenantId]
    );
    apiKey = result.rows[0]?.config?.gemini_api_key;
  }
  
  if (!apiKey) {
    apiKey = process.env.GEMINI_API_KEY;
  }

  if (!apiKey) {
    throw new Error('Gemini API Key chưa được cấu hình. Vui lòng cài đặt trong phần Quản lý Landing Pages.');
  }

  const client = new GoogleGenAI({ apiKey });
  
  let contextPrompt = prompt;
  if (existingBlocks && existingBlocks.length > 0) {
    contextPrompt = `Dưới đây là cấu trúc Landing Page hiện tại của người dùng:
\`\`\`json
${JSON.stringify(existingBlocks, null, 2)}
\`\`\`
Yêu cầu cập nhật/chỉnh sửa của người dùng:
"${prompt}"

Nhiệm vụ: Dựa vào yêu cầu chỉnh sửa trên, hãy THÊM, SỬA HOẶC XOÁ các khối (blocks) trên cho phù hợp nhất. Nếu người dùng chỉ yêu cầu sửa vài từ, hãy SỬA TRỰC TIẾP vào thuộc tính content của block hiện tại và GIỮ NGUYÊN các khối khác. Nếu họ muốn thêm khối, hãy chèn thêm loại block tương ứng vào mảng. TRẢ VỀ TOÀN BỘ MẢNG SAU KHI ĐÃ CẬP NHẬT.`;
  }

  const systemInstruction = `
Bạn là một chuyên gia thiết kế Landing Page (Copywriter + UX/UI Designer) cho một nền tảng SaaS (izhubs ERP).
Nhiệm vụ của bạn là nhận yêu cầu (Prompt) của người dùng và tạo ra (hoặc cập nhật) cấu trúc trang Landing Page bằng cách xếp chồng các "Blocks" có sẵn của hệ thống.
*QUY TẮC NỘI DUNG VÀ HÌNH ẢNH:*
1. Bạn PHẢI TỰ ĐỘNG tạo các liên kết hình ảnh sống động và bám sát chủ đề bằng URL: \`https://loremflickr.com/1200/800/{từ_khóa_tiếng_anh_viết_liền}\` cho bất kỳ tham số nào yêu cầu Ảnh (như: \`imageUrl\`, \`cover\`, \`avatar\`, v.v.). VD: Bán cafe -> \`https://loremflickr.com/1200/800/coffee,cafe\`
2. Tự động viết nội dung chữ (copywriting) bằng tiếng Việt thật lôi cuốn, chuyên nghiệp, đánh trúng tâm lý khách hàng để tăng tỷ lệ chuyển đổi (CRO).
3. KHÔNG BAO GIỜ DÙNG các placeholder như \`https://via.placeholder.com\` hoặc URL trống. BẮT BUỘC dùng loremflickr hoặc link ảnh có thật.

*CÁC BLOCKS CÓ SẴN (bạn chỉ được dùng các type này):*
1. "hero": Dành cho Tech Startup. Content: { "title": "...", "subtitle": "..." }
2. "features": Dành cho Startup. Content: { "items": [{ "title": "Tính năng 1", "description": "...", "icon": "Star" }] } (Lưu ý: icon phải là tên tiếng Anh chuẩn của thư viện Lucide, ví dụ: Star, Shield, Zap, Rocket, Heart...)
3. "pricing": Bảng giá 3 cột. Content: { "plans": ["Gói cơ bản", "Gói Pro", "Gói Doanh nghiệp"] }
4. "hero-personal": Dành cho Portfolio. Content: { "name": "...", "title": "..." }
5. "about": Giới thiệu Portfolio. Content: { "text": "..." }
6. "projects": Dự án Portfolio. Content: { "list": ["Tên dự án 1", "Tên dự án 2"] }
7. "hero-sale": Landing page bán hàng. Content: { "headline": "...", "cta": "..." }
8. "benefits": Lý do nên mua. Content: { "list": ["Lý do 1", "Lý do 2"] }
9. "testimonials": Đánh giá khách hàng. Content: { "list": ["Review 1", "Review 2"] }
10. "hero-saas": Dành cho SaaS hiện đại. Content: { "badge": "...", "title": "...", "subtitle": "..." }
11. "features-grid": Lưới tính năng SaaS. Content: { "items": [{ "title": "Tính năng A", "description": "...", "icon": "Zap" }] }

CHÚ Ý ĐẶC BIỆT: BẠN CHỈ ĐƯỢC PHÉP TRẢ VỀ DUY NHẤT MÃ JSON (Mảng các block). HOÀN TOÀN KHÔNG giải thích, KHÔNG thêm các câu như "Tuyệt vời!", "Dưới đây là...", KHÔNG có bất kỳ ký tự nào nằm ngoài mảng JSON. Hãy tự do kết hợp các khối cho phù hợp với ngữ cảnh của người dùng.
`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    let text = response.text || '';
    if (!text) return [];
    
    // Extract JSON from conversational text using regex or substring
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      text = jsonMatch[1].trim();
    } else {
      const firstBrace = text.indexOf('{');
      const firstBracket = text.indexOf('[');
      const startIdx = firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace) ? firstBracket : firstBrace;
      
      const lastBrace = text.lastIndexOf('}');
      const lastBracket = text.lastIndexOf(']');
      const endIdx = lastBracket !== -1 && (lastBrace === -1 || lastBracket > lastBrace) ? lastBracket : lastBrace;
      
      if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
        text = text.substring(startIdx, endIdx + 1);
      }
    }

    let parsed = JSON.parse(text);
    
    // Auto-fix if AI returned an object wrapping the array
    if (!Array.isArray(parsed)) {
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
        parsed = parsed.blocks;
      } else if (parsed.items && Array.isArray(parsed.items)) {
        parsed = parsed.items;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        parsed = parsed.data;
      } else if (parsed.type && parsed.content) {
        // Returned a single block object
        parsed = [parsed];
      } else {
        parsed = []; // Unrecognized structure
      }
    }
    
    return parsed;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

/**
 * Phân tích và chấm điểm Landing Page
 * Task 80: AI Critique
 */
export async function critiqueLandingPage(blocks: any[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return '*Không thể phân tích. Thiếu GEMINI_API_KEY.*';
  }
  const llm = new GoogleGenAI({ apiKey });

  const prompt = `Bạn là một chuyên gia UX/UI và Chuyên gia tối ưu hoá chuyển đổi (CRO). 
Hãy phân tích thiết kế Landing Page dưới dạng JSON Blocks sau đây, chấm điểm trên thang 100 và đưa ra lời khuyên cụ thể để cải thiện tỷ lệ chuyển đổi.
Đầu ra PHẢI LÀ MARKDOWN format. Không cần giải thích thêm. Bắt buộc có các phần:
1. Điểm số (ví dụ: 85/100)
2. Điểm mạnh
3. Điểm cần cải thiện
4. Đề xuất viết lại Headline/CTA (nếu cần)

Data:
${JSON.stringify({ blocks }, null, 2)}`;

  const result = await llm.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return result.text || '*Không thể phân tích*';
}

/**
 * Tính năng Killer: Clone URL bất kỳ thành JSON Blocks
 * Task 82: Web Clone
 */
export async function cloneWebsiteToBlocks(url: string): Promise<any[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Thiếu GEMINI_API_KEY');
  const llm = new GoogleGenAI({ apiKey });

  // 1. Fetch website and extract raw text (stripping scripts/styles)
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } });
  const html = await res.text();
  const cleanHtml = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim()
                        .slice(0, 40000);

  const prompt = `Bạn là hệ thống chuyển đổi Website siêu việt của izLanding.
Mục tiêu: Phân tích cấu trúc và copy nguyên bản nội dung/ngữ nghĩa của trang web gốc và chuyển đổi 1-1 thành các Blocks theo đúng Schema.
URL Gốc: ${url}
Nội dung thô bóc tách được:
"""
${cleanHtml}
"""

HÃY TẠO RA MẢNG JSON BLOCKS DỰA TRÊN NỘI DUNG NÀY. Nếu có ảnh, tự chế các URL ảnh phù hợp ngữ cảnh từ loremflickr/unsplash. Giữ đúng tone giọng và thông điệp.`;

  const result = await llm.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: LandingBlockSchema,
      temperature: 0.1,
    }
  });

  const textRes = result.text || '[]';
  let parsed = JSON.parse(textRes);
  if (parsed && typeof parsed === 'object') {
    if (parsed.items && Array.isArray(parsed.items)) parsed = parsed.items;
    else if (parsed.data && Array.isArray(parsed.data)) parsed = parsed.data;
    else if (parsed.type && parsed.content) parsed = [parsed];
  }
  return Array.isArray(parsed) ? parsed : [];
}
