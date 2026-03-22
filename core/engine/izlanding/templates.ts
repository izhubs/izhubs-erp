export interface LandingTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  blocks: any[]; // simplified for now: JSON representation of sections
}

export const TEMPLATES: LandingTemplate[] = [
  {
    id: 'blank',
    name: 'Trang Trắng',
    description: 'Bắt đầu từ đầu với một trang hoàn toàn trống.',
    thumbnail: '📄',
    blocks: [],
  },
  {
    id: 'startup',
    name: 'Tech Startup',
    description: 'Hero hiện đại, tính năng, bảng giá chuyên nghiệp.',
    thumbnail: '🚀',
    blocks: [
      { type: 'hero', content: { title: 'Xây dựng tương lai', subtitle: 'Giải pháp SaaS toàn diện' } },
      { type: 'features', content: { items: ['Nhanh chóng', 'Bảo mật', 'Dễ mở rộng'] } },
      { type: 'pricing', content: { plans: ['Cơ bản', 'Chuyên nghiệp', 'Doanh nghiệp'] } },
    ],
  },
  {
    id: 'portfolio',
    name: 'Cá nhân / Portfolio',
    description: 'Giới thiệu bản thân, dịch vụ, cv và dự án.',
    thumbnail: '👤',
    blocks: [
      { type: 'hero-personal', content: { name: 'Nguyễn Văn A', title: 'Fullstack Developer' } },
      { type: 'about', content: { text: 'Tôi là lập trình viên với 5 năm kinh nghiệm...' } },
      { type: 'projects', content: { list: ['Dự án 1', 'Dự án 2'] } },
    ],
  },
  {
    id: 'ecommerce',
    name: 'Bán hàng (Sale Page)',
    description: 'Tối ưu chuyển đổi với Hero, lợi ích, và form đăng ký.',
    thumbnail: '🛍️',
    blocks: [
      { type: 'hero-sale', content: { headline: 'Giải pháp cho vấn đề của bạn', cta: 'Mua ngay' } },
      { type: 'benefits', content: { list: ['Lợi ích 1', 'Lợi ích 2', 'Lợi ích 3'] } },
      { type: 'testimonials', content: { list: ['Rất tốt!', 'Tuyệt vời!'] } },
      { type: 'cta-form', content: { title: 'Đăng ký ngay hôm nay' } },
    ],
  },
];
