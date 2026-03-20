'use client';

import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function ProductTourProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Đảm bảo chỉ chạy trên client và khi người dùng chưa xem tour bao giờ
    const hasSeenTour = localStorage.getItem('has_seen_tour');
    if (!hasSeenTour) {
      setTimeout(() => {
        const tour = driver({
          showProgress: true,
          nextBtnText: 'Tiếp tục',
          prevBtnText: 'Quay lại',
          doneBtnText: 'Xong',
          steps: [
            { 
              popover: { 
                title: '🎉 Chào mừng đến với IZhubs!', 
                description: 'Hệ thống đã cấu hình hoàn tất cho ngành của bạn. Hãy dành 2 phút ngắn ngủi này để dạo quanh bộ khung quyền năng này nhé!' 
              } 
            },
            {
              element: 'a[href="/dashboard"]', 
              popover: { 
                title: 'Bảng Điều Khiển Tổng Quan', 
                description: 'Nơi tập hợp các báo cáo doanh thu, tiến độ dự án, và các số liệu cốt lõi nhất. Mọi thứ cập nhật theo thời gian thực.' 
              } 
            },
            {
              element: 'a[href="/contacts"]', 
              popover: { 
                title: 'Quản Lý Khách Hàng (360°)', 
                description: 'Mọi hồ sơ, số điện thoại, và lịch sử giao dịch đều nằm ở đây. Đồng bộ hoá toàn bộ dữ liệu chỉ trong nháy mắt.' 
              } 
            },
            {
              element: 'a[href="/deals"]', 
              popover: { 
                title: 'Cỗ Máy Bán Hàng (Kanban)', 
                description: 'Công cụ tuyệt vời nhất để theo dõi Sales! Kéo thả Deal qua các cột trạng thái để di chuyển khách hàng dần về vạch đích "Chốt đơn".',
              } 
            },
            {
              element: 'a[href="/import"]', 
              popover: { 
                title: 'Nhập Liệu Thư Viện Chợ', 
                description: 'Cần mang tập khách hàng từ các nền tảng khác qua đây? Công cụ Smart Import bằng Excel AI sẽ gánh vác việc đó.' 
              } 
            },
            {
              element: 'a[href="/settings"]', 
              popover: { 
                title: 'Cài Đặt & Tuỳ Chọn (Theme)', 
                description: 'Vào đây để thay đổi tông màu (Theme), cấp quyền nhân viên hoặc thay đổi mô hình vận hành nếu muốn.' 
              } 
            },
            {
              element: 'header button svg', 
              popover: { 
                title: 'Nút Dọn Dẹp Khẩn Cấp', 
                description: 'Nếu bạn có bật nút tạo Demo Data, một nút Remove Demo Data sẽ hiện trên thanh Header. Bấm vào là quét sạch hết data giả lập ngay!' 
              } 
            },
            {
              popover: { 
                title: '🚀 Sẵn sàng cất cánh!', 
                description: 'Bạn đã nắm rõ mọi thứ cơ bản. Chúc bạn có một trải nghiệm thật hiệu quả và mượt mà cùng hệ thống của chúng tôi.' 
              } 
            }
          ],
          onDestroyStarted: () => {
            localStorage.setItem('has_seen_tour', 'true');
            tour.destroy();
          }
        });
        
        try {
          tour.drive();
        } catch(e) {
          console.warn('Driver.js failed to initialize element targeting', e);
        }
      }, 1500); // Đợi DOM Load xong
    }
  }, []);

  return <>{children}</>;
}
