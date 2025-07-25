import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import MobileNav from "@/components/footer/mobile-nav";
import NextTopLoader from "nextjs-toploader";
import Chat from "@/components/chat/Chat";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://vidbox.to"),
  title: "Vidbox - Your Ultimate Streaming Guide",
  description:
    "Discover and track your favorite movies and TV shows across all streaming platforms. Get personalized recommendations and streaming availability information.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vidbox.to",
    siteName: "Vidbox",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vidbox Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidbox - Your Ultimate Streaming Guide",
    description:
      "Discover and track your favorite movies and TV shows across all streaming platforms.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scrollbar" suppressHydrationWarning={true}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#EF4444" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
                try {
                  if (localStorage.theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (_) {}
              `,
          }}
        />
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
      </head>
      <body>
        <div className={`${inter.className}`}>
          <NextTopLoader color="#EF4444" />
          <Chat />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="theme"
            disableTransitionOnChange
          >
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                className: '!bg-white !text-gray-900 dark:!bg-gray-800 dark:!text-white border border-gray-200 dark:border-gray-700',
                success: {
                  className: '!bg-white !text-gray-900 dark:!bg-gray-800 dark:!text-white border border-green-500',
                  iconTheme: {
                    primary: '#10B981',
                    secondary: 'white',
                  },
                },
                error: {
                  className: '!bg-white !text-gray-900 dark:!bg-gray-800 dark:!text-white border border-red-500',
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: 'white',
                  },
                },
              }}
            />
            <Header />
            {children}
            <MobileNav />
            <Footer backgroundImage="/footer-bg2.jpg" />
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
