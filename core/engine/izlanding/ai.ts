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
        description: 'Loại block. Phải là một trong: hero, features, pricing, hero-personal, about, projects, hero-sale, benefits, testimonials, cta-form, hero-saas, features-grid, iframe-form',
      },
      content: {
        type: Type.OBJECT,
        description: 'Dữ liệu cấu trúc phù hợp với loại block. Ví dụ title, subtitle, items (mảng chuỗi), plans (mảng chuỗi), name, text, list, headline, cta, badge, url. Hãy tự sáng tạo nội dung chữ (copywriting) hấp dẫn, tiếng Việt chuyên nghiệp dựa trên Prompt của user.',
      }
    },
    required: ['type', 'content'],
  },
};

export async function generateLandingPageBlocks(prompt: string, tenantId?: string, userApiKey?: string) {
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
  
  const systemInstruction = `
Bạn là một chuyên gia thiết kế Landing Page (Copywriter + UX/UI Designer) cho một nền tảng SaaS (izhubs ERP).
Nhiệm vụ của bạn là nhận yêu cầu (Prompt) của người dùng và tạo ra toàn bộ cấu trúc trang Landing Page bằng cách xếp chồng các "Blocks" có sẵn của hệ thống.
Tự động viết nội dung chữ (copywriting) thật lôi cuốn, chuyên nghiệp bằng tiếng Việt.

*CÁC BLOCKS CÓ SẴN (bạn chỉ được dùng các type này):*
1. "hero": Dành cho Tech Startup. Content: { "title": "...", "subtitle": "..." }
2. "features": Dành cho Startup. Content: { "items": ["Tính năng 1", "Tính năng 2", "Tính năng 3"] }
3. "pricing": Bảng giá 3 cột. Content: { "plans": ["Gói cơ bản", "Gói Pro", "Gói Doanh nghiệp"] }
4. "hero-personal": Dành cho Portfolio. Content: { "name": "...", "title": "..." }
5. "about": Giới thiệu Portfolio. Content: { "text": "..." }
6. "projects": Dự án Portfolio. Content: { "list": ["Tên dự án 1", "Tên dự án 2"] }
7. "hero-sale": Landing page bán hàng. Content: { "headline": "...", "cta": "..." }
8. "benefits": Lý do nên mua. Content: { "list": ["Lý do 1", "Lý do 2"] }
9. "testimonials": Đánh giá khách hàng. Content: { "list": ["Review 1", "Review 2"] }
10. "cta-form": Vùng điền form cuối trang. Content: { "title": "..." }
11. "hero-saas": Dành cho SaaS hiện đại. Content: { "badge": "...", "title": "...", "subtitle": "..." }
12. "features-grid": Lưới tính năng SaaS. Content: { "items": ["Tính năng A", "Tính năng B", "Tính năng C"] }

CHÚ Ý ĐẶC BIỆT: BẠN CHỈ ĐƯỢC PHÉP TRẢ VỀ DUY NHẤT MÃ JSON (Mảng các block). HOÀN TOÀN KHÔNG giải thích, KHÔNG thêm các câu như "Tuyệt vời!", "Dưới đây là...", KHÔNG có bất kỳ ký tự nào nằm ngoài mảng JSON. Hãy tự do kết hợp các khối cho phù hợp với ngữ cảnh của người dùng.
`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
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
