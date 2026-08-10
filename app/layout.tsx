import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://esim.free"),
  title: "Esim.free — affordable travel eSIM plans",
  description: "Buy prepaid travel eSIM plans directly from Esim.free, with clear prices and worldwide coverage.",
  icons: {
    icon: "/esim-free-logo.png",
    shortcut: "/esim-free-logo.png",
    apple: "/esim-free-logo.png",
  },
  openGraph: {
    title: "Esim.free — affordable travel eSIM plans",
    description: "Prepaid data-only eSIM plans sold and supported directly by Esim.free.",
    url: "https://esim.free",
    siteName: "Esim.free",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("esim-theme")==="dark")document.documentElement.dataset.theme="dark";var s=["en","ru","es","fr","de","pt","ar","tr","zh","ja","ko","hi"],l=localStorage.getItem("esim-language");if(!s.includes(l)){l=(navigator.languages||[navigator.language]).map(function(v){return v.toLowerCase().split("-")[0]}).find(function(v){return s.includes(v)})||"en"}document.documentElement.lang=l;document.documentElement.dir=l==="ar"?"rtl":"ltr";document.documentElement.dataset.language=l}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
