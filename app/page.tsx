"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { detectLanguage, LANGUAGES, Language, MESSAGES, Messages } from "./i18n";

type Plan = {
  id: string;
  country: string;
  gb: number;
  days: number;
  price: number;
  pricePerGb: number;
  unlimited?: boolean;
};

type Country = {
  code: string;
  flag: string;
};

const COUNTRIES: Record<string, Country> = {
  turkey: { code: "TR", flag: "🇹🇷" },
  thailand: { code: "TH", flag: "🇹🇭" },
  uae: { code: "AE", flag: "🇦🇪" },
  indonesia: { code: "ID", flag: "🇮🇩" },
  japan: { code: "JP", flag: "🇯🇵" },
  georgia: { code: "GE", flag: "🇬🇪" },
  egypt: { code: "EG", flag: "🇪🇬" },
  italy: { code: "IT", flag: "🇮🇹" },
  spain: { code: "ES", flag: "🇪🇸" },
  france: { code: "FR", flag: "🇫🇷" },
  germany: { code: "DE", flag: "🇩🇪" },
  uk: { code: "GB", flag: "🇬🇧" },
  usa: { code: "US", flag: "🇺🇸" },
  vietnam: { code: "VN", flag: "🇻🇳" },
  malaysia: { code: "MY", flag: "🇲🇾" },
  singapore: { code: "SG", flag: "🇸🇬" },
  mexico: { code: "MX", flag: "🇲🇽" },
  global: { code: "001", flag: "🌍" },
};

const CURATED_PLANS: Plan[] = [
  { id: "plan-001", country: "global", gb: 999, days: 3, price: 9.99, pricePerGb: 0, unlimited: true },
  { id: "plan-002", country: "global", gb: 999, days: 7, price: 19.99, pricePerGb: 0, unlimited: true },
  { id: "plan-003", country: "global", gb: 999, days: 14, price: 27.99, pricePerGb: 0, unlimited: true },
  { id: "plan-004", country: "global", gb: 999, days: 30, price: 49.99, pricePerGb: 0, unlimited: true },
  { id: "plan-005", country: "turkey", gb: 999, days: 7, price: 24.5, pricePerGb: 0, unlimited: true },
  { id: "plan-006", country: "thailand", gb: 999, days: 7, price: 21.5, pricePerGb: 0, unlimited: true },
  { id: "plan-007", country: "thailand", gb: 999, days: 30, price: 49, pricePerGb: 0, unlimited: true },
  { id: "plan-008", country: "uae", gb: 999, days: 3, price: 12.5, pricePerGb: 0, unlimited: true },
  { id: "plan-009", country: "uae", gb: 999, days: 7, price: 27.5, pricePerGb: 0, unlimited: true },
  { id: "plan-010", country: "indonesia", gb: 999, days: 7, price: 27, pricePerGb: 0, unlimited: true },
  { id: "plan-011", country: "japan", gb: 999, days: 7, price: 27, pricePerGb: 0, unlimited: true },
  { id: "plan-012", country: "georgia", gb: 3, days: 7, price: 11, pricePerGb: 3.67 },
  { id: "plan-013", country: "georgia", gb: 5, days: 30, price: 17, pricePerGb: 3.4 },
  { id: "plan-014", country: "egypt", gb: 999, days: 3, price: 19.5, pricePerGb: 0, unlimited: true },
  { id: "plan-015", country: "egypt", gb: 999, days: 7, price: 32, pricePerGb: 0, unlimited: true },
  { id: "plan-016", country: "italy", gb: 999, days: 7, price: 23, pricePerGb: 0, unlimited: true },
  { id: "plan-017", country: "spain", gb: 999, days: 7, price: 23.5, pricePerGb: 0, unlimited: true },
  { id: "plan-018", country: "france", gb: 5, days: 15, price: 10, pricePerGb: 2 },
  { id: "plan-019", country: "germany", gb: 999, days: 7, price: 24, pricePerGb: 0, unlimited: true },
  { id: "plan-020", country: "uk", gb: 999, days: 7, price: 27, pricePerGb: 0, unlimited: true },
  { id: "plan-021", country: "usa", gb: 999, days: 7, price: 25, pricePerGb: 0, unlimited: true },
  { id: "plan-022", country: "vietnam", gb: 999, days: 7, price: 27, pricePerGb: 0, unlimited: true },
  { id: "plan-023", country: "malaysia", gb: 999, days: 7, price: 27, pricePerGb: 0, unlimited: true },
  { id: "plan-024", country: "singapore", gb: 999, days: 7, price: 27, pricePerGb: 0, unlimited: true },
  { id: "plan-025", country: "mexico", gb: 999, days: 7, price: 23.5, pricePerGb: 0, unlimited: true },
  { id: "plan-026", country: "turkey", gb: 20, days: 30, price: 22.99, pricePerGb: 1.15 },
  { id: "plan-027", country: "thailand", gb: 20, days: 30, price: 19.99, pricePerGb: 1 },
  { id: "plan-028", country: "uae", gb: 10, days: 30, price: 19.99, pricePerGb: 2 },
  { id: "plan-029", country: "indonesia", gb: 10, days: 30, price: 21.99, pricePerGb: 2.2 },
  { id: "plan-030", country: "japan", gb: 20, days: 30, price: 24.99, pricePerGb: 1.25 },
  { id: "plan-031", country: "georgia", gb: 10, days: 30, price: 30.99, pricePerGb: 3.1 },
  { id: "plan-032", country: "egypt", gb: 10, days: 30, price: 33.99, pricePerGb: 3.4 },
  { id: "plan-033", country: "italy", gb: 20, days: 30, price: 28.99, pricePerGb: 1.45 },
  { id: "plan-034", country: "spain", gb: 20, days: 30, price: 22.99, pricePerGb: 1.15 },
  { id: "plan-035", country: "france", gb: 20, days: 30, price: 22.99, pricePerGb: 1.15 },
  { id: "plan-036", country: "germany", gb: 20, days: 30, price: 22.99, pricePerGb: 1.15 },
  { id: "plan-037", country: "uk", gb: 20, days: 30, price: 30.99, pricePerGb: 1.55 },
  { id: "plan-038", country: "usa", gb: 20, days: 30, price: 36.99, pricePerGb: 1.85 },
  { id: "plan-039", country: "vietnam", gb: 20, days: 30, price: 28.99, pricePerGb: 1.45 },
  { id: "plan-040", country: "malaysia", gb: 20, days: 30, price: 35.99, pricePerGb: 1.8 },
  { id: "plan-041", country: "singapore", gb: 20, days: 30, price: 22.99, pricePerGb: 1.15 },
  { id: "plan-042", country: "mexico", gb: 20, days: 30, price: 37.99, pricePerGb: 1.9 },
];

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += character;
    }
  }

  cells.push(cell);
  return cells;
}

function parseMarketCsv(csv: string): Plan[] {
  return csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line, index) => {
      const [country, gb, days, price, pricePerGb, unlimited] = splitCsvLine(line);
      return {
        id: `market-${index}`,
        country,
        gb: Number(gb),
        days: Number(days),
        price: Number(price),
        pricePerGb: Number(pricePerGb),
        unlimited: unlimited === "yes",
      };
    })
    .filter((plan) => COUNTRIES[plan.country] && plan.price > 0 && plan.gb > 0);
}

function countryLabel(key: string, language: Language, t: Messages) {
  if (key === "global") return t.world;

  try {
    return new Intl.DisplayNames([LANGUAGES[language].locale], { type: "region" }).of(COUNTRIES[key].code) ?? key;
  } catch {
    return key;
  }
}

function formatData(plan: Plan, t: Messages) {
  if (plan.unlimited || plan.gb >= 999) return t.unlimited;
  if (plan.gb < 1) return `${Math.round(plan.gb * 1000)} ${t.mb}`;
  return `${Number.isInteger(plan.gb) ? plan.gb : plan.gb.toFixed(1)} ${t.gb}`;
}

function formatDays(days: number, t: Messages) {
  if (days === 0) return t.lifetime;
  return `${days} ${t.days}`;
}

function price(value: number, language: Language) {
  return new Intl.NumberFormat(LANGUAGES[language].locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 10 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function Home() {
  const [marketPlans, setMarketPlans] = useState<Plan[]>([]);
  const [language, setLanguage] = useState<Language>("en");
  const [selectedCountry, setSelectedCountry] = useState("turkey");
  const [dataFilter, setDataFilter] = useState("1plus");
  const [durationFilter, setDurationFilter] = useState("any");
  const [sortBy, setSortBy] = useState("price");
  const [visible, setVisible] = useState(8);
  const t = MESSAGES[language];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const detected = detectLanguage();
      const messages = MESSAGES[detected];
      const root = document.documentElement;
      setLanguage(detected);
      root.lang = detected;
      root.dir = LANGUAGES[detected].dir;
      root.dataset.language = detected;
      document.title = messages.metaTitle;
      document.querySelector('meta[name="description"]')?.setAttribute("content", messages.metaDescription);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch("/data/catalog.csv")
      .then((response) => {
        if (!response.ok) throw new Error("Catalog unavailable");
        return response.text();
      })
      .then((csv) => setMarketPlans(parseMarketCsv(csv)))
      .catch(() => setMarketPlans([]));
  }, []);

  const results = useMemo(() => {
    return [...CURATED_PLANS, ...marketPlans]
      .filter((plan) => plan.country === selectedCountry || plan.country === "global")
      .filter((plan) => {
        if (dataFilter === "any") return true;
        if (dataFilter === "1plus") return plan.gb >= 1;
        if (dataFilter === "3plus") return plan.gb >= 3;
        if (dataFilter === "10plus") return plan.gb >= 10;
        return Boolean(plan.unlimited || plan.gb >= 999);
      })
      .filter((plan) => {
        if (durationFilter === "week") return plan.days > 0 && plan.days <= 7;
        if (durationFilter === "month") return plan.days > 7 && plan.days <= 30;
        if (durationFilter === "long") return plan.days === 0 || plan.days > 30;
        return true;
      })
      .sort((first, second) => {
        if (sortBy === "perGb") {
          const firstUnit = first.pricePerGb || first.price / Math.max(first.gb, 1);
          const secondUnit = second.pricePerGb || second.price / Math.max(second.gb, 1);
          return firstUnit - secondUnit;
        }
        if (sortBy === "data") return second.gb - first.gb || first.price - second.price;
        return first.price - second.price;
      });
  }, [dataFilter, durationFilter, marketPlans, selectedCountry, sortBy]);

  const country = COUNTRIES[selectedCountry];
  const currentCountryLabel = countryLabel(selectedCountry, language, t);

  function changeLanguage(next: Language) {
    const root = document.documentElement;
    const messages = MESSAGES[next];
    setLanguage(next);
    root.lang = next;
    root.dir = LANGUAGES[next].dir;
    root.dataset.language = next;
    document.title = messages.metaTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", messages.metaDescription);
    window.localStorage.setItem("esim-language", next);
  }

  function toggleTheme() {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    window.localStorage.setItem("esim-theme", nextTheme);
  }

  return (
    <main>
      <nav className="nav shell" aria-label={t.navPlans}>
        <a className="brand" href="#top" aria-label="Esim.free">
          <Image className="brand-mark" src="/esim-free-logo.png" alt="" width={40} height={40} priority unoptimized />
          <span>Esim<span>.free</span></span>
        </a>
        <div className="nav-actions">
          <div className="nav-links">
            <a href="#catalog">{t.navPlans}</a>
            <a href="#how">{t.navHow}</a>
          </div>
          <label className="language-switcher">
            <span aria-hidden="true">🌐</span>
            <select aria-label={t.languageLabel} value={language} onChange={(event) => changeLanguage(event.target.value as Language)}>
              {Object.entries(LANGUAGES).map(([code, item]) => <option key={code} value={code}>{item.label}</option>)}
            </select>
          </label>
          <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={t.themeToggle} title={t.themeToggle}>
            <span className="theme-icon theme-icon-sun" aria-hidden="true">☀</span>
            <span className="theme-icon theme-icon-moon" aria-hidden="true">☾</span>
          </button>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> {t.heroEyebrow}</p>
          <h1>{t.heroLine1}<br />{t.heroLine2}</h1>
          <p className="hero-lead">{t.heroLead}</p>
          <a className="primary-action" href="#catalog">{t.findEsim} <span aria-hidden="true">↓</span></a>
        </div>

        <div className="hero-proof">
          <div><strong>5 400+</strong><span>{t.statPlans}</span></div>
          <div><strong>17</strong><span>{t.statCountries}</span></div>
          <div><strong>0%</strong><span>{t.statMarkup}</span></div>
        </div>
      </section>

      <section className="catalog-section" id="catalog">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span /> {t.catalogEyebrow}</p>
              <h2>{t.catalogTitle}</h2>
            </div>
            <p>{t.checked}</p>
          </div>

          <div className="filter-panel">
            <label className="field field-country">
              <span>{t.country}</span>
              <div className="select-wrap country-select">
                <b aria-hidden="true">{country.flag}</b>
                <select value={selectedCountry} onChange={(event) => { setSelectedCountry(event.target.value); setVisible(8); }}>
                  {Object.entries(COUNTRIES)
                    .filter(([key]) => key !== "global")
                    .map(([key]) => <option key={key} value={key}>{countryLabel(key, language, t)}</option>)}
                </select>
              </div>
            </label>

            <label className="field">
              <span>{t.data}</span>
              <div className="select-wrap">
                <select value={dataFilter} onChange={(event) => { setDataFilter(event.target.value); setVisible(8); }}>
                  <option value="any">{t.anyData}</option>
                  <option value="1plus">{t.from1}</option>
                  <option value="3plus">{t.from3}</option>
                  <option value="10plus">{t.from10}</option>
                  <option value="unlimited">{t.unlimited}</option>
                </select>
              </div>
            </label>

            <label className="field">
              <span>{t.duration}</span>
              <div className="select-wrap">
                <select value={durationFilter} onChange={(event) => { setDurationFilter(event.target.value); setVisible(8); }}>
                  <option value="any">{t.anyDuration}</option>
                  <option value="week">{t.upToWeek}</option>
                  <option value="month">{t.upToMonth}</option>
                  <option value="long">{t.overMonth}</option>
                </select>
              </div>
            </label>

            <label className="field">
              <span>{t.sort}</span>
              <div className="select-wrap">
                <select value={sortBy} onChange={(event) => { setSortBy(event.target.value); setVisible(8); }}>
                  <option value="price">{t.cheapest}</option>
                  <option value="perGb">{t.cheapestPerGb}</option>
                  <option value="data">{t.moreData}</option>
                </select>
              </div>
            </label>
          </div>

          <div className="results-head" aria-live="polite">
            <p><strong>{country.flag} {currentCountryLabel}</strong> <span>· {t.offers.replace("{count}", String(results.length))}</span></p>
            <p>{t.providerPurchase}</p>
          </div>

          {results.length > 0 ? (
            <div className="plan-list">
              {results.slice(0, visible).map((plan, index) => {
                const checkoutParams = new URLSearchParams({
                  plan: plan.id,
                  destination: currentCountryLabel,
                  data: formatData(plan, t),
                  validity: formatDays(plan.days, t),
                  price: plan.price.toFixed(2),
                });
                return (
                  <article className="plan" key={plan.id}>
                    <div className="country-cell">
                      <b className="plan-flag" aria-hidden="true">{country.flag}</b>
                      <div>
                        <span>{t.country}</span>
                        <strong>{currentCountryLabel}</strong>
                      </div>
                    </div>
                    <div className="plan-facts">
                      <div><span>{t.dataLabel}</span><strong>{formatData(plan, t)}</strong></div>
                      <div><span>{t.durationLabel}</span><strong>{formatDays(plan.days, t)}</strong></div>
                    </div>
                    <div className="plan-price">
                      {index === 0 && <span className="best">{t.best}</span>}
                      <strong>{price(plan.price, language)}</strong>
                    </div>
                    <a className="plan-link" href={`/checkout/?${checkoutParams.toString()}`} aria-label={`${t.choose}: Esim.free`}>
                      {t.choose} <span aria-hidden="true">→</span>
                    </a>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <strong>{t.emptyTitle}</strong>
              <p>{t.emptyText}</p>
            </div>
          )}

          {visible < results.length && (
            <button className="more-button" type="button" onClick={() => setVisible((current) => current + 8)}>
              {t.showMore} <span>{Math.min(8, results.length - visible)}</span>
            </button>
          )}

          <p className="price-note">{t.priceNote}</p>
        </div>
      </section>

      <section className="how shell" id="how">
        <div className="section-heading light-heading">
          <div>
            <p className="eyebrow"><span /> {t.stepsEyebrow}</p>
            <h2>{t.stepsTitle}</h2>
          </div>
        </div>
        <div className="steps">
          <article><span>01</span><h3>{t.compare}</h3><p>{t.compareText}</p></article>
          <article><span>02</span><h3>{t.buy}</h3><p>{t.buyText}</p></article>
          <article><span>03</span><h3>{t.connect}</h3><p>{t.connectText}</p></article>
        </div>
      </section>

      <section className="faq shell" id="faq">
        <div className="faq-intro">
          <p className="eyebrow"><span /> {t.faqEyebrow}</p>
          <h2>{t.questions}</h2>
          <p>{t.faqIntro}</p>
          <a href="#catalog">{t.choosePlan} <span aria-hidden="true">↓</span></a>
        </div>
        <div className="faq-list">
          {t.faq.map((item) => (
            <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>
          ))}
        </div>
      </section>

      <footer>
        <div className="shell footer-row">
          <a className="brand footer-brand" href="#top">
            <Image className="brand-mark" src="/esim-free-logo.png" alt="" width={40} height={40} unoptimized />
            <span>Esim<span>.free</span></span>
          </a>
          <p>{t.footerTagline}</p>
          <div className="footer-links"><a href="/product/">Product</a><a href="/demo/">Demo</a><a href="/pricing/">Pricing</a><a href="/terms/">Terms</a><a href="/privacy/">Privacy</a><a href="/refunds/">Refunds</a><a href="/contact/">Contact</a></div>
        </div>
        <div className="shell legal-row">
          <span>© 2026 Esim.free</span>
          <span>{t.legal} · staskochukov@gmail.com</span>
        </div>
      </footer>
    </main>
  );
}
