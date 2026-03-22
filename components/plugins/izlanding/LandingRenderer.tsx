import React from 'react';

/**
 * Interface that matches the blocks generated in core/engine/izlanding/templates.ts
 */
export interface LandingBlock {
  type: string;
  content: any;
}

interface Props {
  blocks: LandingBlock[];
}

export function LandingRenderer({ blocks }: Props) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold text-gray-300">Trang Trắng</h1>
        <p className="text-gray-400 mt-4">Chưa có nội dung nào được mô tả.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {blocks.map((block, idx) => (
        <React.Fragment key={idx}>
          {renderBlock(block)}
        </React.Fragment>
      ))}
    </div>
  );
}

function renderBlock(block: LandingBlock) {
  const { type, content } = block;

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
              {content.items?.map((item: string, i: number) => (
                <div key={i} className="p-8 border border-slate-100 rounded-2xl bg-slate-50 shadow-sm hover:shadow-md transition-shadow text-center">
                  <div className="text-4xl mb-4">✨</div>
                  <h3 className="text-xl font-bold mb-2">{item}</h3>
                  <p className="text-slate-500">Mô tả chi tiết về tính năng {item.toLowerCase()} tuyệt vời này giúp giải quyết vấn đề của khách hàng.</p>
                </div>
              ))}
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
              {content.items?.map((item: string, i: number) => (
                <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 text-2xl">⚡</div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800">{item}</h3>
                  <p className="text-slate-500">Mô tả chi tiết về tính năng tuyệt vời này giúp khách hàng hiểu rõ giá trị mang lại.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case 'iframe-form':
      return (
        <section className="py-24 px-6 bg-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-slate-900">{content.title}</h2>
            <div className="w-full bg-slate-50 rounded-3xl shadow-inner border border-slate-200 overflow-hidden min-h-[600px] p-6">
              <iframe 
                src={`${content.url}?embed=true`} 
                className="w-full h-[700px] border-none" 
                title="Embedded Form"
                loading="lazy"
              ></iframe>
            </div>
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
