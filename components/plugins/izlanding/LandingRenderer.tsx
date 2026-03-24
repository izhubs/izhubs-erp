import React from 'react';
import ThemeToggle from './ThemeToggle';
import SocialShareFloating from './SocialShareFloating';
import * as LucideIcons from 'lucide-react';

function DynamicIcon({ name, className }: { name?: string, className?: string }) {
  if (!name) return <LucideIcons.Star className={className} />;
  
  // If user typed an emoji, render it directly
  if (/\p{Emoji}/u.test(name)) return <span className={className}>{name}</span>;
  
  // Try to find the Lucide icon by name (capitalize first letter if needed)
  const iconName = name.charAt(0).toUpperCase() + name.slice(1);
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Star;
  return <IconComponent className={className} />;
}

/**
 * Interface that matches the blocks generated in core/engine/izlanding/templates.ts
 */
export interface LandingBlock {
  type: string;
  content: any;
}

interface Props {
  blocks: LandingBlock[];
  className?: string; // Added for dark mode
  searchParams?: Record<string, string | string[] | undefined>; // For UTMs
  projectSettings?: any;
}

export function LandingRenderer({ blocks, className, searchParams, projectSettings }: Props) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold text-gray-300">Trang Trắng</h1>
        <p className="text-gray-400 mt-4">Chưa có nội dung nào được mô tả.</p>
      </div>
    );
  }

  // Task 70: Dynamic Text via searchParams (UTM replacements)
  let processedBlocks = blocks;
  if (searchParams && Object.keys(searchParams).length > 0) {
    let blockString = JSON.stringify(blocks);
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const regex = new RegExp(`{{${key}}}`, 'gi');
        blockString = blockString.replace(regex, value);
      }
    });
    // Remove unmatched double braces
    blockString = blockString.replace(/{{[^}]+}}/g, '');
    try {
      processedBlocks = JSON.parse(blockString);
    } catch {
      processedBlocks = blocks;
    }
  }

  const getVisibilityClasses = (content: any) => {
    if (!content) return '';
    const cls = [];
    if (content.hiddenOnMobile) cls.push('max-md:hidden');
    if (content.hiddenOnTablet) cls.push('md:max-lg:hidden');
    if (content.hiddenOnDesktop) cls.push('lg:hidden');
    return cls.join(' ');
  };

  return (
    <div className={`iz-landing-renderer min-h-screen bg-slate-50 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300 ${className || ''}`}>
      {processedBlocks.filter(Boolean).map((block, index) => {
        const visClass = getVisibilityClasses(block.content || block);
        return (
          <div key={index} data-aos="fade-up" className={`w-full iz-block-wrapper ${visClass}`}>
            {renderBlock(block, index, searchParams)}
          </div>
        );
      })}

      {/* Thanh chia sẻ (Social Share) Floating */}
      <SocialShareFloating />

      {/* Nút Toggle Dark Mode nổi (Do Stitch thiết kế) */}
      <ThemeToggle />

      {/* Task 92: Watermark */}
      {(!projectSettings || !projectSettings.removeWatermark) && (
        <a 
          href="https://izhubs.com" 
          target="_blank" 
          rel="noreferrer" 
          className="fixed bottom-4 right-4 z-[9999] bg-white/50 hover:bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-slate-200/50 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-all flex items-center gap-1.5"
        >
           ⚡ Powered by izLanding
        </a>
      )}
    </div>
  );
}

function renderBlock(block: LandingBlock | any, idx: number, searchParams?: Record<string, string | string[] | undefined>) {
  if (!block) return null;
  const type = block.type;
  const content = block.content || block || {};

  switch (type) {
    // --- TECH STARTUP ---
    case 'hero':
      return (
        <section className="bg-indigo-600 text-white py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">{content.title}</h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-2xl mx-auto">{content.subtitle}</p>
            <div className="flex justify-center gap-4">
              <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg">Bắt đầu ngay</button>
              <button className="bg-transparent border-2 border-indigo-300 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-indigo-700 transition-colors">Tìm hiểu thêm</button>
            </div>
          </div>
        </section>
      );
    case 'features':
      return (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Tính năng nổi bật</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {content.items?.map((item: any, i: number) => {
                const title = typeof item === 'string' ? item : item.title || `Tính năng ${i + 1}`;
                const description = typeof item === 'string' 
                  ? `Mô tả chi tiết về tính năng tuyệt vời này giúp giải quyết vấn đề của khách hàng.` 
                  : item.description || `Mô tả chi tiết tính năng`;
                const icon = typeof item === 'object' && item.icon ? item.icon : 'Star';

                return (
                  <div key={i} className="p-8 border border-slate-100 rounded-2xl bg-slate-50 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                    <div className="w-16 h-16 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full mb-6">
                      <DynamicIcon name={icon} className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{title}</h3>
                    <p className="text-slate-500 leading-relaxed">{description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    case 'pricing':
      return (
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Bảng giá chuyên nghiệp</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {content.plans?.map((plan: string, i: number) => (
                <div key={i} className={`p-8 rounded-2xl ${i === 1 ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-white border text-slate-900 shadow-sm'}`}>
                  <h3 className="text-2xl font-bold mb-4">{plan}</h3>
                  <div className="text-4xl font-extrabold mb-6">{i === 0 ? 'Miễn phí' : (i === 1 ? '499k' : 'Liên hệ')}<span className="text-lg font-normal opacity-70">{i === 1 ? '/tháng' : ''}</span></div>
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-center gap-2"><span>✓</span> Tính năng 1</li>
                    <li className="flex items-center gap-2"><span>✓</span> Tính năng 2</li>
                    <li className="flex items-center gap-2"><span>✓</span> Hỗ trợ 24/7</li>
                  </ul>
                  <button className={`w-full py-3 rounded-xl font-bold ${i === 1 ? 'bg-white text-indigo-600' : 'bg-indigo-50 text-indigo-600'}`}>Chọn gói này</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    // --- PORTFOLIO ---
    case 'hero-personal':
      return (
        <section className="bg-slate-900 text-white py-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto bg-indigo-500 rounded-full mb-6 flex items-center justify-center text-3xl">👨‍💻</div>
            <h1 className="text-5xl font-bold mb-4">Xin chào, tôi là {content.name}</h1>
            <h2 className="text-2xl text-indigo-400 font-medium">{content.title}</h2>
          </div>
        </section>
      );
    case 'about':
      return (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Về tôi</h2>
            <p className="text-lg text-slate-600 leading-relaxed">{content.text}</p>
          </div>
        </section>
      );
    case 'projects':
      return (
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Dự án tiêu biểu</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {content.list?.map((pj: string, i: number) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
                  <div className="h-48 bg-slate-200 group-hover:bg-indigo-100 transition-colors flex items-center justify-center text-4xl">💻</div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{pj}</h3>
                    <p className="text-slate-500 text-sm">Case study chi tiết sẽ được cập nhật sớm.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    // --- SALE PAGE ---
    case 'hero-sale':
      return (
        <section className="bg-gradient-to-br from-rose-500 to-orange-400 text-white py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-bold tracking-wider mb-6 uppercase">Ưu đãi giới hạn</div>
            <h1 className="text-5xl font-extrabold mb-8 leading-tight">{content.headline}</h1>
            <button className="bg-white text-rose-600 px-10 py-4 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-2xl">{content.cta}</button>
          </div>
        </section>
      );
    case 'benefits':
      return (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Tại sao bạn cần sản phẩm này?</h2>
            <ul className="space-y-6">
              {content.list?.map((b: string, i: number) => (
                <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
                  <div className="text-2xl mt-1">🔥</div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{b}</h3>
                    <p className="text-slate-600 text-sm">Chúng tôi cam kết mang lại giá trị thực tế và hiệu quả tức thì.</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    case 'testimonials':
      return (
        <section className="py-20 px-6 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Khách hàng nói gì?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {content.list?.map((t: string, i: number) => (
                <div key={i} className="p-8 bg-slate-800 rounded-2xl relative">
                  <div className="text-4xl text-rose-500 absolute -top-4 left-6">"</div>
                  <p className="text-lg italic mb-6 mt-2 relative z-10">{t}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-600 rounded-full"></div>
                    <div>
                      <div className="font-bold">Khách hàng {i + 1}</div>
                      <div className="text-xs text-slate-400">Đã mua hàng</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case 'cta-form':
      return (
        <section className="py-20 px-6 bg-white text-center">
          <div className="max-w-xl mx-auto border-2 border-rose-100 p-10 rounded-3xl bg-rose-50/50 shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-slate-900">{content.title}</h2>
            <p className="text-slate-600 mb-8">Điền thông tin ngay bây giờ để nhận bộ quà tặng trị giá 5.000.000đ.</p>
            <form className="space-y-4 text-left">
              <div>
                <input type="text" placeholder="Họ và tên của bạn" className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500" />
              </div>
              <div>
                <input type="tel" placeholder="Số điện thoại" className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500" />
              </div>
              <button type="button" className="w-full bg-rose-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-rose-700 transition-colors">Đăng Ký Nhận Quà</button>
            </form>
          </div>
        </section>
      );

    // --- SAAS CONVERSION ---
    case 'hero-saas':
      return (
        <section className="bg-slate-900 text-white pt-32 pb-24 px-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            {content.badge && (
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-semibold tracking-wide mb-6">
                {content.badge}
              </span>
            )}
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight capitalize leading-tight">
              {content.title}
            </h1>
            <p className="text-xl md:text-2xl opacity-80 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              {content.subtitle}
            </p>
          </div>
        </section>
      );
    case 'features-grid':
      return (
        <section className="py-24 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-10">
              {content.items?.map((item: any, i: number) => {
                const title = typeof item === 'string' ? item : item.title || `Tính năng ${i + 1}`;
                const description = typeof item === 'string' 
                  ? `Mô tả chi tiết về tính năng tuyệt vời này giúp khách hàng hiểu rõ giá trị mang lại.` 
                  : item.description || `Mô tả chi tiết`;
                const icon = typeof item === 'object' && item.icon ? item.icon : 'Zap';

                return (
                  <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                       <DynamicIcon name={icon} className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
                    <p className="text-slate-500 leading-relaxed">{description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    case 'iframe-form': {
      // Build query string from searchParams for auto-passthrough to izForm
      const queryStr = searchParams ? new URLSearchParams(searchParams as Record<string, string>).toString() : '';
      const finalUrl = `${content.url}?embed=true${queryStr ? '&' + queryStr : ''}`;

      return (
        <section className="py-24 px-6 bg-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-slate-900">{content.title}</h2>
            <div className="w-full overflow-hidden min-h-[400px]">
              <iframe 
                id={`izform-embed-${idx}`}
                src={finalUrl} 
                className="w-full h-[600px] border-none" 
                title="Embedded Form"
                loading="lazy"
                style={{ transition: 'height 0.3s ease' }}
              ></iframe>
              <script dangerouslySetInnerHTML={{ __html: `
                window.addEventListener('message', function(e) {
                  if (e.data && e.data.type === 'IZFORM_RESIZE' && e.data.height) {
                    var iframe = document.getElementById('izform-embed-${idx}');
                    if (iframe) iframe.style.height = e.data.height + 'px';
                  }
                });
              `}} />
            </div>
          </div>
        </section>
      );
    }
    case 'image-block':
      return (
        <section className="py-20 px-6 bg-white flex justify-center">
          <div className="max-w-5xl w-full text-center">
            {content.imageUrl ? (
              <img 
                src={content.imageUrl} 
                alt={content.caption || 'Image'} 
                loading="lazy"
                decoding="async"
                className="max-w-full h-auto rounded-3xl shadow-xl mx-auto" 
              />
            ) : (
              <div className="w-full h-96 bg-slate-50 flex flex-col items-center justify-center text-slate-400 rounded-3xl border-2 border-dashed border-slate-200">
                 <span className="text-4xl mb-4 text-slate-300">🖼️</span>
                 <span className="font-semibold">Khu vực hiển thị Hình ảnh</span>
                 <span className="text-sm mt-2 opacity-70">Hãy tải ảnh lên từ phần Edit</span>
              </div>
            )}
            {content.caption && <p className="text-slate-500 mt-6 text-lg italic">{content.caption}</p>}
          </div>
        </section>
      );

    case 'custom-html':
      return (
        <section className="py-6 px-0 md:px-6 flex justify-center w-full">
          <div className="w-full max-w-7xl mx-auto">
            {content.html ? (
              <div className="w-full" dangerouslySetInnerHTML={{ __html: content.html }} />
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-300 text-center text-slate-500 rounded-xl bg-slate-50">
                <div className="text-3xl mb-2">🧑‍💻</div>
                Nhập mã Code HTML/JS/CSS tuỳ chỉnh của bạn tại phần chỉnh sửa.
              </div>
            )}
          </div>
        </section>
      );
      
      case 'floating-contact':
      return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-4">
          {content.zalo && (
            <a 
              href={`https://zalo.me/${content.zalo}`} 
              target="_blank" 
              rel="noreferrer" 
              className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-xl hover:-translate-y-1 transition-transform animate-bounce hover:animate-none"
              title="Chat Zalo"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/2048px-Icon_of_Zalo.svg.png" alt="Zalo" className="w-8 h-8 object-contain" />
            </a>
          )}
          {content.phone && (
            <a 
              href={`tel:${content.phone}`}
              className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl hover:-translate-y-1 transition-transform"
              title="Gọi điện"
            >
              <DynamicIcon name="Phone" className="w-7 h-7" />
            </a>
          )}
          {content.messenger && (
            <a 
              href={`https://m.me/${content.messenger}`} 
              target="_blank" 
              rel="noreferrer" 
              className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl hover:-translate-y-1 transition-transform"
              title="Chat Messenger"
            >
              <DynamicIcon name="MessageCircle" className="w-7 h-7" />
            </a>
          )}
        </div>
      );
      
    case 'carousel':
      return (
        <section className="py-12 bg-slate-50 overflow-hidden w-full relative">
          <div className="max-w-7xl mx-auto px-0 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-8 px-6">{content.title || 'Kho Hình Ảnh'}</h2>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-6 pt-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style dangerouslySetInnerHTML={{ __html: `::-webkit-scrollbar { display: none; }` }} />
              {(content.images || ['https://placehold.co/600x400/e2e8f0/64748b?text=Image+1', 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+2', 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+3']).map((img: string, i: number) => (
                <div key={i} className="flex-none w-[80vw] md:w-[400px] aspect-video rounded-xl overflow-hidden snap-center shadow-md bg-white border border-slate-200 hover:shadow-lg transition-shadow">
                  <img src={img} alt={`Slide ${i}`} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
            {content.description && <p className="text-center text-slate-500 mt-4 px-6">{content.description}</p>}
          </div>
        </section>
      );
      
    default:
      return (
        <div className="p-4 border border-dashed border-red-300 bg-red-50 text-red-500 my-4 text-center">
          Unknown block type: {type}
        </div>
      );
  }
}
