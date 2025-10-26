'use client';

import LeftSidebar from '@/components/LeftSidebar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@430&display=swap" rel="stylesheet" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        <div className="container-fluid">
          <div className="row">
            {/* Sidebar sẽ hiển thị cho TẤT CẢ các trang */}
            <div className="col-lg-3 col-md-4 p-0">
              <LeftSidebar />
            </div>

            {/* Nội dung chính của trang (children) */}
            <div className="col-lg-9 col-md-8 p-4">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}