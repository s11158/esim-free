import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import ThemeButton from "./ThemeButton";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
};

const LEGAL_LINKS = [
  ["Pricing", "/pricing/"],
  ["Terms", "/terms/"],
  ["Privacy", "/privacy/"],
  ["Refunds", "/refunds/"],
  ["Contact", "/contact/"],
];

export default function LegalPage({ eyebrow, title, lead, children }: LegalPageProps) {
  return (
    <main>
      <nav className="nav shell legal-nav" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label="esim.free home">
          <Image className="brand-mark" src="/esim-free-logo.png" alt="" width={40} height={40} priority unoptimized />
          <span>esim<span>.free</span></span>
        </Link>
        <div className="nav-actions">
          <div className="nav-links legal-nav-links">
            <a href="/pricing/">Pricing</a>
            <a href="/contact/">Contact</a>
          </div>
          <ThemeButton />
        </div>
      </nav>

      <header className="legal-hero shell">
        <p className="eyebrow"><span /> {eyebrow}</p>
        <h1>{title}</h1>
        <p>{lead}</p>
        <span className="legal-updated">Effective 9 August 2026</span>
      </header>

      <article className="legal-content shell">{children}</article>

      <footer>
        <div className="shell footer-row legal-footer">
          <Link className="brand footer-brand" href="/">
            <Image className="brand-mark" src="/esim-free-logo.png" alt="" width={40} height={40} unoptimized />
            <span>esim<span>.free</span></span>
          </Link>
          <p>Affordable travel connectivity, delivered digitally.</p>
          <div>{LEGAL_LINKS.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</div>
        </div>
        <div className="shell legal-row">
          <span>© 2026 esim.free</span>
          <span>Contact: staskochukov@gmail.com</span>
        </div>
      </footer>
    </main>
  );
}
