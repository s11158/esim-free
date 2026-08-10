"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { detectLanguage, LANGUAGES, Language, MESSAGES, Messages } from "./i18n";

type Plan = {
  id: string;
  country: string;
  provider: string;
  name: string;
  gb: number;
  days: number;
  price: number;
  pricePerGb: number;
  promo?: string;
  fiveG?: boolean;
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

const PROVIDER_INFO: Record<string, { label: string; url: string; accent: string }> = {
  Airalo: { label: "Airalo", url: "https://airalo.tpx.gr/zKWubZS0", accent: "#ff6b5f" },
  Yesim: { label: "Yesim", url: "https://yesim.tpx.gr/H3g2VJiB", accent: "#a7f45c" },
  Maya: { label: "Maya Mobile", url: "https://mayamobile.pxf.io/k4bdrM", accent: "#7ec8ff" },
  Saily: { label: "Saily", url: "https://saily.com/", accent: "#7e7bff" },
  "Stellar eSim": {
    label: "Stellar",
    url: "https://stellarafi.com/r/ESIM?src=esim.pizza&campaign=esim_pizza_comparison&product=DIGITAL+Product",
    accent: "#ffe45e",
  },
  "Giga.Tel": { label: "Giga.Tel", url: "https://www.giga.tel/", accent: "#fb62c7" },
  Superalink: {
    label: "Superalink",
    url: "https://www.superalink.com/destination/aff/STAS00000",
    accent: "#00e6bc",
  },
  eSIM4Travel: { label: "eSIM4Travel", url: "https://www.esim4travel.com/", accent: "#f3a34b" },
  eSIMCard: { label: "eSIMCard", url: "https://esimcard.com/", accent: "#4be0ff" },
  BNESIM: { label: "BNESIM", url: "https://www.bnesim.com/", accent: "#e2ff63" },
  Roamify: { label: "Roamify", url: "https://www.getroamify.com/", accent: "#ff8f70" },
  "Sim Local": { label: "Sim Local", url: "https://www.simlocal.com/", accent: "#bd9cff" },
};

const CURATED_PLANS: Plan[] = [
  { id: "maya-3", country: "global", provider: "Maya", name: "Unlimited · 180 стран", gb: 999, days: 3, price: 9.99, pricePerGb: 0, promo: "ESIMPIZZA" },
  { id: "maya-7", country: "global", provider: "Maya", name: "Unlimited · 180 стран", gb: 999, days: 7, price: 19.99, pricePerGb: 0, promo: "ESIMPIZZA" },
  { id: "maya-14", country: "global", provider: "Maya", name: "Unlimited · 180 стран", gb: 999, days: 14, price: 27.99, pricePerGb: 0, promo: "ESIMPIZZA" },
  { id: "maya-30", country: "global", provider: "Maya", name: "Unlimited · 180 стран", gb: 999, days: 30, price: 49.99, pricePerGb: 0, promo: "ESIMPIZZA" },
  { id: "airalo-tr-7", country: "turkey", provider: "Airalo", name: "Unlimited · Turk Telekom", gb: 999, days: 7, price: 24.5, pricePerGb: 0 },
  { id: "airalo-th-7", country: "thailand", provider: "Airalo", name: "Unlimited · dtac", gb: 999, days: 7, price: 21.5, pricePerGb: 0 },
  { id: "airalo-th-30", country: "thailand", provider: "Airalo", name: "Unlimited · dtac", gb: 999, days: 30, price: 49, pricePerGb: 0 },
  { id: "airalo-ae-3", country: "uae", provider: "Airalo", name: "Unlimited", gb: 999, days: 3, price: 12.5, pricePerGb: 0 },
  { id: "airalo-ae-7", country: "uae", provider: "Airalo", name: "Unlimited", gb: 999, days: 7, price: 27.5, pricePerGb: 0 },
  { id: "airalo-id-7", country: "indonesia", provider: "Airalo", name: "Unlimited", gb: 999, days: 7, price: 27, pricePerGb: 0 },
  { id: "airalo-jp-7", country: "japan", provider: "Airalo", name: "Unlimited · SoftBank", gb: 999, days: 7, price: 27, pricePerGb: 0 },
  { id: "airalo-ge-3", country: "georgia", provider: "Airalo", name: "3 ГБ · Cellfie", gb: 3, days: 7, price: 11, pricePerGb: 3.67 },
  { id: "airalo-ge-5", country: "georgia", provider: "Airalo", name: "5 ГБ · Cellfie", gb: 5, days: 30, price: 17, pricePerGb: 3.4 },
  { id: "airalo-eg-3", country: "egypt", provider: "Airalo", name: "Unlimited", gb: 999, days: 3, price: 19.5, pricePerGb: 0 },
  { id: "airalo-eg-7", country: "egypt", provider: "Airalo", name: "Unlimited", gb: 999, days: 7, price: 32, pricePerGb: 0 },
  { id: "airalo-it", country: "italy", provider: "Airalo", name: "Unlimited", gb: 999, days: 7, price: 23, pricePerGb: 0 },
  { id: "airalo-es", country: "spain", provider: "Airalo", name: "Unlimited", gb: 999, days: 7, price: 23.5, pricePerGb: 0 },
  { id: "airalo-fr", country: "france", provider: "Airalo", name: "5 ГБ", gb: 5, days: 15, price: 10, pricePerGb: 2 },
  { id: "airalo-de", country: "germany", provider: "Airalo", name: "Unlimited", gb: 999, days: 7, price: 24, pricePerGb: 0 },
  { id: "airalo-uk", country: "uk", provider: "Airalo", name: "Unlimited", gb: 999, days: 7, price: 27, pricePerGb: 0 },
  { id: "airalo-us", country: "usa", provider: "Airalo", name: "Unlimited", gb: 999, days: 7, price: 25, pricePerGb: 0 },
  { id: "airalo-vn", country: "vietnam", provider: "Airalo", name: "Unlimited", gb: 999, days: 7, price: 27, pricePerGb: 0 },
  { id: "airalo-my", country: "malaysia", provider: "Airalo", name: "Unlimited", gb: 999, days: 7, price: 27, pricePerGb: 0 },
  { id: "airalo-sg", country: "singapore", provider: "Airalo", name: "Unlimited", gb: 999, days: 7, price: 27, pricePerGb: 0 },
  { id: "airalo-mx", country: "mexico", provider: "Airalo", name: "Unlimited", gb: 999, days: 7, price: 23.5, pricePerGb: 0 },
  { id: "saily-tr", country: "turkey", provider: "Saily", name: "20 ГБ", gb: 20, days: 30, price: 22.99, pricePerGb: 1.15 },
  { id: "saily-th", country: "thailand", provider: "Saily", name: "20 ГБ", gb: 20, days: 30, price: 19.99, pricePerGb: 1 },
  { id: "saily-ae", country: "uae", provider: "Saily", name: "10 ГБ", gb: 10, days: 30, price: 19.99, pricePerGb: 2 },
  { id: "saily-id", country: "indonesia", provider: "Saily", name: "10 ГБ", gb: 10, days: 30, price: 21.99, pricePerGb: 2.2 },
  { id: "saily-jp", country: "japan", provider: "Saily", name: "20 ГБ", gb: 20, days: 30, price: 24.99, pricePerGb: 1.25 },
  { id: "saily-ge", country: "georgia", provider: "Saily", name: "10 ГБ", gb: 10, days: 30, price: 30.99, pricePerGb: 3.1 },
  { id: "saily-eg", country: "egypt", provider: "Saily", name: "10 ГБ", gb: 10, days: 30, price: 33.99, pricePerGb: 3.4 },
  { id: "saily-it", country: "italy", provider: "Saily", name: "20 ГБ", gb: 20, days: 30, price: 28.99, pricePerGb: 1.45 },
  { id: "saily-es", country: "spain", provider: "Saily", name: "20 ГБ", gb: 20, days: 30, price: 22.99, pricePerGb: 1.15 },
  { id: "saily-fr", country: "france", provider: "Saily", name: "20 ГБ", gb: 20, days: 30, price: 22.99, pricePerGb: 1.15 },
  { id: "saily-de", country: "germany", provider: "Saily", name: "20 ГБ", gb: 20, days: 30, price: 22.99, pricePerGb: 1.15 },
  { id: "saily-uk", country: "uk", provider: "Saily", name: "20 ГБ", gb: 20, days: 30, price: 30.99, pricePerGb: 1.55 },
  { id: "saily-us", country: "usa", provider: "Saily", name: "20 ГБ", gb: 20, days: 30, price: 36.99, pricePerGb: 1.85 },
  { id: "saily-vn", country: "vietnam", provider: "Saily", name: "20 ГБ", gb: 20, days: 30, price: 28.99, pricePerGb: 1.45 },
  { id: "saily-my", country: "malaysia", provider: "Saily", name: "20 ГБ", gb: 20, days: 30, price: 35.99, pricePerGb: 1.8 },
  { id: "saily-sg", country: "singapore", provider: "Saily", name: "20 ГБ", gb: 20, days: 30, price: 22.99, pricePerGb: 1.15 },
  { id: "saily-mx", country: "mexico", provider: "Saily", name: "20 ГБ", gb: 20, days: 30, price: 37.99, pricePerGb: 1.9 },
];

const PARTNER_NAMES = [
  "Airalo",
  "Yesim",
  "Maya Mobile",
  "Stellar",
  "Giga.Tel",
  "Superalink",
  "eSIM4Travel",
  "eSIMCard",
  "Saily",
  "BNESIM",
  "Roamify",
  "Sim Local",
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

function cleanText(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMarketCsv(csv: string): Plan[] {
  return csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line, index) => {
      const [country, provider, name, gb, days, price, pricePerGb, promo, fiveG] = splitCsvLine(line);
      return {
        id: `market-${index}`,
        country,
        provider: cleanText(provider),
        name: cleanText(name),
        gb: Number(gb),
        days: Number(days),
        price: Number(price),
        pricePerGb: Number(pricePerGb),
        promo: promo || undefined,
        fiveG: fiveG === "yes",
      };
    })
    .filter((plan) => COUNTRIES[plan.country] && PROVIDER_INFO[plan.provider] && plan.price > 0 && plan.gb > 0);
}

function countryLabel(key: string, language: Language, t: Messages) {
  if (key === "global") return t.world;

  try {
    return new Intl.DisplayNames([LANGUAGES[language].locale], { type: "region" }).of(COUNTRIES[key].code) ?? key;
  } catch {
    return key;
  }
}

function displayPlanName(plan: Plan, t: Messages) {
  if (plan.provider === "Maya") return `${t.unlimited} · ${t.countries180}`;
  return cleanText(plan.name)
    .replace(/^Unlimited/i, t.unlimited)
    .replace(/Безлимит/gi, t.unlimited)
    .replace(/(\d+(?:\.\d+)?)\s*ГБ/g, `$1 ${t.gb}`);
}

function formatData(plan: Plan, t: Messages) {
  if (plan.gb >= 999 || /unlimited|безлимит/i.test(plan.name)) return t.unlimited;
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
    fetch("/data/esimdb-market.csv")
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
        return plan.gb >= 999 || /unlimited|безлимит/i.test(plan.name);
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
        <a className="brand" href="#top" aria-label="esim.free">
          <Image className="brand-mark" src="/esim-free-logo.png" alt="" width={40} height={40} priority unoptimized />
          <span>esim<span>.free</span></span>
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
                const provider = PROVIDER_INFO[plan.provider];
                return (
                  <article className="plan" key={plan.id}>
                    <div className="rank" aria-label={`#${index + 1}`}>{String(index + 1).padStart(2, "0")}</div>
                    <div className="provider-cell">
                      <i style={{ background: provider.accent }} aria-hidden="true" />
                      <div>
                        <strong>esim.free</strong>
                        <span>{displayPlanName(plan, t)}</span>
                      </div>
                    </div>
                    <div className="plan-facts">
                      <div><span>{t.dataLabel}</span><strong>{formatData(plan, t)}</strong></div>
                      <div><span>{t.durationLabel}</span><strong>{formatDays(plan.days, t)}</strong></div>
                      <div><span>{t.networkLabel}</span><strong>{plan.fiveG ? "5G" : "4G / LTE"}</strong></div>
                    </div>
                    <div className="plan-price">
                      {index === 0 && <span className="best">{t.best}</span>}
                      <strong>{price(plan.price, language)}</strong>
                      {plan.promo && <span>−10% · {plan.promo}</span>}
                    </div>
                    <a className="plan-link" href="/pricing/" aria-label={`${t.choose}: esim.free`}>
                      {t.choose} <span aria-hidden="true">↗</span>
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

      <section className="partners">
        <div className="shell">
          <p>{t.partners}</p>
          <div className="partner-list" aria-label="eSIM network supply partners">
            {PARTNER_NAMES.map((name) => <span key={name}>{name}</span>)}
          </div>
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
            <span>esim<span>.free</span></span>
          </a>
          <p>{t.footerTagline}</p>
          <div className="footer-links"><a href="/product/">Product</a><a href="/demo/">Demo</a><a href="/pricing/">Pricing</a><a href="/terms/">Terms</a><a href="/privacy/">Privacy</a><a href="/refunds/">Refunds</a><a href="/contact/">Contact</a></div>
        </div>
        <div className="shell legal-row">
          <span>© 2026 esim.free</span>
          <span>{t.legal} · staskochukov@gmail.com</span>
        </div>
      </footer>
    </main>
  );
}
