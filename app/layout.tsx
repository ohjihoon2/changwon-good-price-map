import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "창원시 임산부 할인음식점 지도",
  description: "창원시의 임산부를 위한 든든하고 따뜻한 할인음식점을 지도에서 쉽게 찾아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
