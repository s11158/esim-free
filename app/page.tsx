"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { detectLanguage, LANGUAGES, Language, MESSAGES, Messages } from "./i18n";

type Plan = {
  id: string;
  scope: "country" | "region" | "global";
  dest: string;
  destName: string;
  gb: number;
  days: number;
  price: number;
  unlimited: boolean;
  minutes: number;
  sms: number;
  coverage: string[];
};

type Selection =
  | { type: "countries"; codes: string[] }
  | { type: "dest"; code: string };

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "SAR", "TRY", "RUB", "INR", "CNY", "JPY", "KRW", "BRL"] as const;
type Currency = (typeof CURRENCIES)[number];

const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, AED: 3.67, SAR: 3.75, TRY: 41,
  RUB: 88, INR: 87, CNY: 7.2, JPY: 148, KRW: 1390, BRL: 5.5,
};

const MAX_DAYS = 180;
const MAX_GB = 500;
const MAX_PRICE = 150;

function flagEmoji(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)));
}

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

function parseCatalog(csv: string): Plan[] {
  return csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [id, scope, dest, destName, gb, days, price, unlimited, minutes, sms, coverage] = splitCsvLine(line);
      const gbNumber = Number(gb);
      return {
        id,
        scope: scope as Plan["scope"],
        dest,
        destName,
        gb: gbNumber,
        days: Number(days),
        price: Number(price),
        unlimited: unlimited === "yes" || gbNumber >= 1000,
        minutes: Number(minutes) || 0,
        sms: Number(sms) || 0,
        coverage: coverage ? coverage.split("|") : [],
      };
    })
    .filter((plan) => plan.id && plan.price > 0);
}

function countryName(code: string, language: Language) {
  try {
    return new Intl.DisplayNames([LANGUAGES[language].locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function formatData(plan: Plan, t: Messages) {
  if (plan.unlimited) return t.unlimited;
  if (plan.gb < 1) return `${Math.round(plan.gb * 1024)} ${t.mb}`;
  return `${Number.isInteger(plan.gb) ? plan.gb : plan.gb.toFixed(1)} ${t.gb}`;
}

function formatDays(days: number, t: Messages) {
  if (days === 0) return t.lifetime;
  return `${days} ${t.days}`;
}

export default function Home() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [language, setLanguage] = useState<Language>("en");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [selection, setSelection] = useState<Selection>({ type: "countries", codes: ["TR"] });
  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [daysNeed, setDaysNeed] = useState(7);
  const [gbNeed, setGbNeed] = useState(1);
  const [budget, setBudget] = useState(MAX_PRICE);
  const [extras, setExtras] = useState<"any" | "data" | "voice">("any");
  const [sortBy, setSortBy] = useState("price");
  const [visible, setVisible] = useState(10);
  const pickerRef = useRef<HTMLDivElement>(null);
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
      const savedCurrency = window.localStorage.getItem("esim-currency");
      if (savedCurrency && (CURRENCIES as readonly string[]).includes(savedCurrency)) {
        setCurrency(savedCurrency as Currency);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch("/data/catalog.csv")
      .then((response) => {
        if (!response.ok) throw new Error("Catalog unavailable");
        return response.text();
      })
      .then((csv) => setPlans(parseCatalog(csv)))
      .catch(() => setPlans([]));
  }, []);

  useEffect(() => {
    const cached = window.localStorage.getItem("esim-rates");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.ts < 24 * 3600 * 1000) {
          setRates(parsed.rates);
          return;
        }
      } catch {}
    }
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((response) => response.json() as Promise<{ rates?: Record<string, number> }>)
      .then((data) => {
        if (data && data.rates) {
          setRates(data.rates);
          window.localStorage.setItem("esim-rates", JSON.stringify({ ts: Date.now(), rates: data.rates }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) setPickerOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const countryCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const plan of plans) {
      if (plan.scope === "country" && /^[A-Z]{2}$/.test(plan.dest)) codes.add(plan.dest);
      for (const code of plan.coverage) if (/^[A-Z]{2}$/.test(code)) codes.add(code);
    }
    return [...codes];
  }, [plans]);

  const regionDests = useMemo(() => {
    const map = new Map<string, { name: string; scope: string; coverage: number }>();
    for (const plan of plans) {
      if (plan.scope === "country") continue;
      const existing = map.get(plan.dest);
      if (!existing || plan.coverage.length > existing.coverage) {
        map.set(plan.dest, { name: plan.destName, scope: plan.scope, coverage: plan.coverage.length });
      }
    }
    return [...map.entries()]
      .map(([code, item]) => ({ code, ...item }))
      .sort((a, b) => (a.scope === b.scope ? a.name.localeCompare(b.name) : a.scope === "global" ? -1 : 1));
  }, [plans]);

  const localizedCountries = useMemo(
    () =>
      countryCodes
        .map((code) => ({ code, name: countryName(code, language) }))
        .sort((a, b) => a.name.localeCompare(b.name, LANGUAGES[language].locale)),
    [countryCodes, language],
  );

  const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1;

  function priceLabel(usd: number) {
    return new Intl.NumberFormat(LANGUAGES[language].locale, {
      style: "currency",
      currency,
      minimumFractionDigits: usd * rate < 10 ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(usd * rate);
  }

  const results = useMemo(() => {
    const selectedCodes = selection.type === "countries" ? selection.codes : [];
    return plans
      .filter((plan) => {
        if (selection.type === "dest") return plan.dest === selection.code;
        if (selectedCodes.length === 0) return true;
        if (selectedCodes.length === 1) {
          const code = selectedCodes[0];
          if (plan.scope === "country") return plan.dest === code;
          return plan.coverage.includes(code);
        }
        return selectedCodes.every((code) => plan.coverage.includes(code));
      })
      .filter((plan) => plan.days === 0 || plan.days >= daysNeed)
      .filter((plan) => plan.unlimited || plan.gb >= gbNeed)
      .filter((plan) => budget >= MAX_PRICE || plan.price <= budget)
      .filter((plan) => {
        if (extras === "voice") return plan.minutes > 0 || plan.sms > 0;
        if (extras === "data") return plan.minutes === 0 && plan.sms === 0;
        return true;
      })
      .sort((first, second) => {
        if (sortBy === "perGb") {
          const firstUnit = first.unlimited ? first.price / Math.max(first.days, 1) : first.price / Math.max(first.gb, 0.1);
          const secondUnit = second.unlimited ? second.price / Math.max(second.days, 1) : second.price / Math.max(second.gb, 0.1);
          return firstUnit - secondUnit;
        }
        if (sortBy === "data") {
          const firstGb = first.unlimited ? Number.MAX_SAFE_INTEGER : first.gb;
          const secondGb = second.unlimited ? Number.MAX_SAFE_INTEGER : second.gb;
          return secondGb - firstGb || first.price - second.price;
        }
        return first.price - second.price;
      });
  }, [plans, selection, daysNeed, gbNeed, budget, extras, sortBy]);

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

  function changeCurrency(next: Currency) {
    setCurrency(next);
    window.localStorage.setItem("esim-currency", next);
  }

  function toggleCountry(code: string) {
    setVisible(10);
    setSelection((current) => {
      if (current.type !== "countries") return { type: "countries", codes: [code] };
      const codes = current.codes.includes(code)
        ? current.codes.filter((item) => item !== code)
        : [...current.codes, code];
      return { type: "countries", codes };
    });
  }

  function pickDest(code: string) {
    setVisible(10);
    setPickerOpen(false);
    setSearch("");
    setSelection({ type: "dest", code });
  }

  function toggleTheme() {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    window.localStorage.setItem("esim-theme", nextTheme);
  }

  const searchLower = search.trim().toLowerCase();
  const filteredRegions = regionDests.filter(
    (region) => !searchLower || region.name.toLowerCase().includes(searchLower),
  );
  const filteredCountries = localizedCountries.filter(
    (country) => !searchLower || country.name.toLowerCase().includes(searchLower) || country.code.toLowerCase() === searchLower,
  );

  const selectionLabel =
    selection.type === "dest"
      ? regionDests.find((region) => region.code === selection.code)?.name ?? selection.code
      : selection.codes.map((code) => countryName(code, language)).join(", ");

  function planDestLabel(plan: Plan) {
    if (plan.scope === "country") return countryName(plan.dest, language);
    return plan.destName;
  }

  function planFlag(plan: Plan) {
    if (plan.scope === "country") return flagEmoji(plan.dest);
    return plan.scope === "global" ? "🌍" : "🗺️";
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
          <label className="language-switcher currency-switcher">
            <span aria-hidden="true">💱</span>
            <select aria-label={t.currencyLabel} value={currency} onChange={(event) => changeCurrency(event.target.value as Currency)}>
              {CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}
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
          <a className="primary-action" href="#catalog">{t.findEsim}</a>
        </div>

        <div className="hero-proof">
          <div><strong>14 000+</strong><span>{t.statPlans}</span></div>
          <div><strong>220+</strong><span>{t.statCountries}</span></div>
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

          <div className="filter-panel finder-panel">
            <div className="field field-country picker-field" ref={pickerRef}>
              <span>{t.country}</span>
              <div className="picker-box">
                {selection.type === "countries" && selection.codes.map((code) => (
                  <button key={code} type="button" className="chip" onClick={() => toggleCountry(code)}>
                    <b aria-hidden="true">{flagEmoji(code)}</b> {countryName(code, language)} <i aria-hidden="true">x</i>
                  </button>
                ))}
                {selection.type === "dest" && (
                  <button type="button" className="chip chip-region" onClick={() => setSelection({ type: "countries", codes: [] })}>
                    <b aria-hidden="true">🌍</b> {selectionLabel} <i aria-hidden="true">x</i>
                  </button>
                )}
                <input
                  value={search}
                  placeholder={t.countrySearch}
                  onFocus={() => setPickerOpen(true)}
                  onChange={(event) => { setSearch(event.target.value); setPickerOpen(true); }}
                />
              </div>
              {pickerOpen && (
                <div className="picker-drop">
                  {filteredRegions.length > 0 && (
                    <>
                      <p className="picker-group">{t.regionsGroup}</p>
                      {filteredRegions.map((region) => (
                        <button key={region.code} type="button" className="picker-item" onClick={() => pickDest(region.code)}>
                          <b aria-hidden="true">{region.scope === "global" ? "🌍" : "🗺️"}</b>
                          <span>{region.name}</span>
                          <em>{t.coversLabel.replace("{count}", String(region.coverage))}</em>
                        </button>
                      ))}
                    </>
                  )}
                  <p className="picker-group">{t.countriesGroup}</p>
                  {filteredCountries.slice(0, 60).map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      className={`picker-item${selection.type === "countries" && selection.codes.includes(country.code) ? " active" : ""}`}
                      onClick={() => toggleCountry(country.code)}
                    >
                      <b aria-hidden="true">{flagEmoji(country.code)}</b>
                      <span>{country.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {selection.type === "countries" && selection.codes.length > 1 && (
                <p className="picker-hint">{t.multiHint}</p>
              )}
            </div>

            <label className="field slider-field">
              <span>{t.tripDays}: <strong>{daysNeed} {t.days}</strong></span>
              <input type="range" min={1} max={MAX_DAYS} value={daysNeed}
                onChange={(event) => { setDaysNeed(Number(event.target.value)); setVisible(10); }} />
            </label>

            <label className="field slider-field">
              <span>{t.dataNeeded}: <strong>{gbNeed} {t.gb}</strong></span>
              <input type="range" min={1} max={MAX_GB} value={gbNeed}
                onChange={(event) => { setGbNeed(Number(event.target.value)); setVisible(10); }} />
            </label>

            <label className="field slider-field">
              <span>{t.maxPrice}: <strong>{budget >= MAX_PRICE ? t.noLimit : priceLabel(budget)}</strong></span>
              <input type="range" min={1} max={MAX_PRICE} value={budget}
                onChange={(event) => { setBudget(Number(event.target.value)); setVisible(10); }} />
            </label>

            <label className="field">
              <span>{t.extrasLabel}</span>
              <div className="select-wrap">
                <select value={extras} onChange={(event) => { setExtras(event.target.value as typeof extras); setVisible(10); }}>
                  <option value="any">{t.extrasAny}</option>
                  <option value="data">{t.extrasData}</option>
                  <option value="voice">{t.extrasVoice}</option>
                </select>
              </div>
            </label>

            <label className="field">
              <span>{t.sort}</span>
              <div className="select-wrap">
                <select value={sortBy} onChange={(event) => { setSortBy(event.target.value); setVisible(10); }}>
                  <option value="price">{t.cheapest}</option>
                  <option value="perGb">{t.cheapestPerGb}</option>
                  <option value="data">{t.moreData}</option>
                </select>
              </div>
            </label>
          </div>

          <div className="results-head" aria-live="polite">
            <p><strong>{selectionLabel || t.world}</strong> <span>· {t.offers.replace("{count}", String(results.length))}</span></p>
            <p>{t.providerPurchase}</p>
          </div>

          {results.length > 0 ? (
            <div className="plan-list">
              {results.slice(0, visible).map((plan, index) => {
                const checkoutParams = new URLSearchParams({
                  plan: plan.id,
                  destination: planDestLabel(plan),
                  data: formatData(plan, t),
                  validity: formatDays(plan.days, t),
                  price: plan.price.toFixed(2),
                });
                return (
                  <article className="plan" key={plan.id}>
                    <div className="country-cell">
                      <b className="plan-flag" aria-hidden="true">{planFlag(plan)}</b>
                      <div>
                        <span>{t.country}</span>
                        <strong>{planDestLabel(plan)}</strong>
                        {plan.scope !== "country" && (
                          <em className="coverage-note">{t.coversLabel.replace("{count}", String(plan.coverage.length))}</em>
                        )}
                      </div>
                    </div>
                    <div className="plan-facts">
                      <div><span>{t.dataLabel}</span><strong>{formatData(plan, t)}</strong></div>
                      <div><span>{t.durationLabel}</span><strong>{formatDays(plan.days, t)}</strong></div>
                      {(plan.minutes > 0 || plan.sms > 0) && (
                        <div>
                          <span>{t.extrasLabel}</span>
                          <strong>
                            {plan.minutes > 0 ? `${plan.minutes} ${t.minutesShort}` : ""}
                            {plan.minutes > 0 && plan.sms > 0 ? " · " : ""}
                            {plan.sms > 0 ? `${plan.sms} SMS` : ""}
                          </strong>
                        </div>
                      )}
                    </div>
                    <div className="plan-price">
                      {index === 0 && <span className="best">{t.best}</span>}
                      <strong>{priceLabel(plan.price)}</strong>
                    </div>
                    <a className="plan-link" href={`/checkout/?${checkoutParams.toString()}`} aria-label={`${t.choose}: Esim.free`}>
                      {t.choose}
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
            <button className="more-button" type="button" onClick={() => setVisible((current) => current + 10)}>
              {t.showMore} <span>{Math.min(10, results.length - visible)}</span>
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
          <a href="#catalog">{t.choosePlan}</a>
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
