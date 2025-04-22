import "~/styles/globals.css";

import { type Metadata } from "next";
import { Montserrat } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react"; 

export const metadata: Metadata = {
  title: "AlgoSHPE",
  description: "Algorithms Course Presented By SHPE",
  icons: [{ rel: "icon", url: "/algoshpelogo.png", sizes: "48x48" }],
};

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-montserrat',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans">
        <TRPCReactProvider> {/* ✅ Add this */}
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
