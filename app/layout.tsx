import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/NavBar";
import { Box } from "@mui/material";
import { Analytics } from "@vercel/analytics/next";

// Khai báo metadata cho Next.js
export const metadata: Metadata = {
  title: "CDNVIETPQ - Quản trị Media",
  description: "Hệ thống lưu trữ và quản lý CDN tốc độ cao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar />
            
            <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, md: 4 } }}>
              {children}
            </Box>
          </Box>
        </Providers>
        
        {/* Tích hợp Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}