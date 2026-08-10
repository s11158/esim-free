export const LANGUAGES = {
  en: { label: "English", locale: "en-US", dir: "ltr" },
  ru: { label: "Русский", locale: "ru-RU", dir: "ltr" },
  es: { label: "Español", locale: "es-ES", dir: "ltr" },
  fr: { label: "Français", locale: "fr-FR", dir: "ltr" },
  de: { label: "Deutsch", locale: "de-DE", dir: "ltr" },
  pt: { label: "Português", locale: "pt-BR", dir: "ltr" },
  ar: { label: "العربية", locale: "ar-AE", dir: "rtl" },
  tr: { label: "Türkçe", locale: "tr-TR", dir: "ltr" },
  zh: { label: "中文", locale: "zh-CN", dir: "ltr" },
  ja: { label: "日本語", locale: "ja-JP", dir: "ltr" },
  ko: { label: "한국어", locale: "ko-KR", dir: "ltr" },
  hi: { label: "हिन्दी", locale: "hi-IN", dir: "ltr" },
} as const;

export type Language = keyof typeof LANGUAGES;

type FaqItem = { question: string; answer: string };

export type Messages = {
  metaTitle: string;
  metaDescription: string;
  navPlans: string;
  navHow: string;
  themeToggle: string;
  languageLabel: string;
  heroEyebrow: string;
  heroLine1: string;
  heroLine2: string;
  heroLead: string;
  findEsim: string;
  statPlans: string;
  statCountries: string;
  statMarkup: string;
  catalogEyebrow: string;
  catalogTitle: string;
  checked: string;
  country: string;
  data: string;
  duration: string;
  sort: string;
  anyData: string;
  from1: string;
  from3: string;
  from10: string;
  unlimited: string;
  anyDuration: string;
  upToWeek: string;
  upToMonth: string;
  overMonth: string;
  cheapest: string;
  cheapestPerGb: string;
  moreData: string;
  offers: string;
  providerPurchase: string;
  dataLabel: string;
  durationLabel: string;
  networkLabel: string;
  best: string;
  choose: string;
  emptyTitle: string;
  emptyText: string;
  showMore: string;
  priceNote: string;
  stepsEyebrow: string;
  stepsTitle: string;
  compare: string;
  buy: string;
  connect: string;
  compareText: string;
  buyText: string;
  connectText: string;
  partners: string;
  faqEyebrow: string;
  questions: string;
  faqIntro: string;
  choosePlan: string;
  faq: FaqItem[];
  footerTagline: string;
  help: string;
  legal: string;
  world: string;
  countries180: string;
  lifetime: string;
  days: string;
  gb: string;
  mb: string;
};

export const MESSAGES: Record<Language, Messages> = {
  en: {
    metaTitle: "esim.free — find the cheapest eSIM for your trip",
    metaDescription: "Buy affordable prepaid travel eSIM plans directly from esim.free.",
    navPlans: "Plans", navHow: "How it works", themeToggle: "Switch light and dark theme", languageLabel: "Language",
    heroEyebrow: "Direct prices. No endless tabs.", heroLine1: "The cheapest", heroLine2: "eSIM. Instantly.",
    heroLead: "Choose a destination. We source plans from global network partners and sell the lowest-priced available eSIM directly to you.", findEsim: "Find an eSIM",
    statPlans: "plans available", statCountries: "popular destinations", statMarkup: "external checkout redirects",
    catalogEyebrow: "Plan finder", catalogTitle: "Where are you going?", checked: "Prices checked 08 Aug 2026",
    country: "Destination", data: "Data", duration: "Validity", sort: "Show first", anyData: "Any data", from1: "From 1 GB", from3: "From 3 GB", from10: "From 10 GB", unlimited: "Unlimited",
    anyDuration: "Any", upToWeek: "Up to 7 days", upToMonth: "8–30 days", overMonth: "Over 30 days", cheapest: "Lowest price", cheapestPerGb: "Lowest per GB", moreData: "Most data",
    offers: "{count} offers", providerPurchase: "Sold and supported by esim.free", dataLabel: "Data", durationLabel: "Validity", networkLabel: "Network", best: "Lowest price", choose: "Choose",
    emptyTitle: "No plans match these filters.", emptyText: "Try changing the data amount or validity.", showMore: "Show more", priceNote: "Coverage can vary with local networks. The displayed plan price is charged by esim.free before any legally required checkout tax.",
    stepsEyebrow: "Three simple steps", stepsTitle: "Choose. Install. Connect.", compare: "Compare", buy: "Buy", connect: "Connect",
    compareText: "Select a destination and data amount. The lowest-priced options appear first.", buyText: "Pay esim.free securely. We deliver and support your plan.", connectText: "Scan the QR code and follow the instructions in your email.",
    partners: "Coverage supplied through global eSIM network partners", faqEyebrow: "The essentials", questions: "Questions", faqIntro: "Straight answers without fine print or marketing fog.", choosePlan: "Choose a plan",
    faq: [
      { question: "Why is it cheaper here?", answer: "We source connectivity in bulk from global eSIM suppliers and sell it directly, keeping our operating costs low." },
      { question: "Does my phone support eSIM?", answer: "Most recent iPhones, Samsung Galaxy and Google Pixel phones support eSIM. Check your exact model before paying." },
      { question: "When should I install the eSIM?", answer: "Install it at home over Wi‑Fi, then enable mobile data when you arrive. Activation rules can vary by plan." },
      { question: "How does esim.free make money?", answer: "We buy connectivity from upstream suppliers and include a transparent retail margin in the displayed price. Your purchase, delivery and support are handled by esim.free." },
    ],
    footerTagline: "The shortest route to affordable connectivity.", help: "Help", legal: "Products are sold and fulfilled by esim.free.", world: "Worldwide", countries180: "180 countries", lifetime: "No expiry", days: "days", gb: "GB", mb: "MB",
  },
  ru: {
    metaTitle: "esim.free — самая дешёвая eSIM для поездки", metaDescription: "Купите недорогую туристическую eSIM напрямую у esim.free.",
    navPlans: "Тарифы", navHow: "Как это работает", themeToggle: "Переключить светлую и тёмную тему", languageLabel: "Язык",
    heroEyebrow: "Прямые цены. Без лишних вкладок.", heroLine1: "Самая дешёвая", heroLine2: "eSIM — сразу.", heroLead: "Выберите страну. Мы закупаем связь у глобальных сетевых партнёров и продаём вам подходящую eSIM напрямую по минимальной доступной цене.", findEsim: "Найти eSIM",
    statPlans: "доступных тарифов", statCountries: "популярных стран", statMarkup: "переходов на чужую оплату",
    catalogEyebrow: "Подбор тарифа", catalogTitle: "Куда едете?", checked: "Цены сверены 08.08.2026", country: "Страна", data: "Интернет", duration: "Срок", sort: "Сначала",
    anyData: "Любой объём", from1: "От 1 ГБ", from3: "От 3 ГБ", from10: "От 10 ГБ", unlimited: "Безлимит", anyDuration: "Любой", upToWeek: "До 7 дней", upToMonth: "8–30 дней", overMonth: "Больше 30 дней", cheapest: "Дешевле всего", cheapestPerGb: "Дешевле за ГБ", moreData: "Больше интернета",
    offers: "{count} предложений", providerPurchase: "Продавец и поддержка — esim.free", dataLabel: "Интернет", durationLabel: "Срок", networkLabel: "Сеть", best: "Самый дешёвый", choose: "Выбрать",
    emptyTitle: "Под этот фильтр тарифов пока нет.", emptyText: "Попробуйте изменить объём интернета или срок действия.", showMore: "Показать ещё", priceNote: "Покрытие зависит от местных сетей. Указанную цену тарифа взимает esim.free; обязательный налог, если применим, показывается при оплате.",
    stepsEyebrow: "Три простых шага", stepsTitle: "Выбрали. Установили. В сети.", compare: "Сравните", buy: "Купите", connect: "Подключитесь", compareText: "Укажите страну и нужный объём. Дешёвые варианты будут сверху.", buyText: "Безопасно оплатите заказ esim.free. Мы доставим тариф и окажем поддержку.", connectText: "Отсканируйте QR-код и включите eSIM по инструкции в письме.",
    partners: "Покрытие обеспечивают глобальные eSIM-поставщики", faqEyebrow: "Коротко о главном", questions: "Вопросы", faqIntro: "Короткие ответы без мелкого шрифта и маркетингового тумана.", choosePlan: "Выбрать тариф",
    faq: [
      { question: "Почему здесь дешевле?", answer: "Мы закупаем связь оптом у глобальных eSIM-поставщиков и продаём её напрямую, сохраняя низкие операционные расходы." },
      { question: "Мой телефон поддерживает eSIM?", answer: "Большинство современных iPhone, Samsung Galaxy и Google Pixel поддерживают eSIM. Проверьте модель перед оплатой." },
      { question: "Когда устанавливать eSIM?", answer: "Лучше установить её дома по Wi‑Fi, а активировать передачу данных уже в поездке. Точные правила зависят от тарифа." },
      { question: "Как esim.free зарабатывает?", answer: "Мы закупаем связь у поставщиков и включаем прозрачную розничную маржу в указанную цену. Продажу, доставку и поддержку выполняет esim.free." },
    ],
    footerTagline: "Самый короткий путь к дешёвой связи.", help: "Помощь", legal: "Тарифы продаёт и обслуживает esim.free.", world: "Весь мир", countries180: "180 стран", lifetime: "Без срока", days: "дн.", gb: "ГБ", mb: "МБ",
  },
  es: {
    metaTitle: "esim.free — encuentra la eSIM más barata", metaDescription: "Compra planes eSIM de viaje directamente a esim.free, con precios claros y cobertura mundial.",
    navPlans: "Planes", navHow: "Cómo funciona", themeToggle: "Cambiar tema claro u oscuro", languageLabel: "Idioma",
    heroEyebrow: "Venta directa. Precio claro.", heroLine1: "La eSIM más", heroLine2: "barata. Al instante.", heroLead: "Elige un destino. Obtenemos conectividad de socios de red globales y esim.free vende y atiende cada plan directamente.", findEsim: "Buscar una eSIM",
    statPlans: "planes disponibles", statCountries: "destinos populares", statMarkup: "redirecciones a pagos externos",
    catalogEyebrow: "Buscador de planes", catalogTitle: "¿A dónde viajas?", checked: "Precios revisados el 08/08/2026", country: "Destino", data: "Datos", duration: "Validez", sort: "Mostrar primero",
    anyData: "Cualquier cantidad", from1: "Desde 1 GB", from3: "Desde 3 GB", from10: "Desde 10 GB", unlimited: "Ilimitado", anyDuration: "Cualquiera", upToWeek: "Hasta 7 días", upToMonth: "8–30 días", overMonth: "Más de 30 días", cheapest: "Precio más bajo", cheapestPerGb: "Menor precio por GB", moreData: "Más datos",
    offers: "{count} ofertas", providerPurchase: "Vendido y atendido por esim.free", dataLabel: "Datos", durationLabel: "Validez", networkLabel: "Red", best: "Precio más bajo", choose: "Elegir",
    emptyTitle: "No hay planes con estos filtros.", emptyText: "Prueba otro volumen de datos o duración.", showMore: "Ver más", priceNote: "La cobertura depende de las redes locales. esim.free cobra el precio mostrado; los impuestos obligatorios aparecen al pagar.",
    stepsEyebrow: "Tres pasos simples", stepsTitle: "Elige. Instala. Conecta.", compare: "Compara", buy: "Compra", connect: "Conecta", compareText: "Selecciona destino y datos. Las opciones más baratas aparecen primero.", buyText: "Paga de forma segura a esim.free. Entregamos y asistimos tu plan.", connectText: "Escanea el código QR y sigue las instrucciones del correo.",
    partners: "Cobertura suministrada por socios globales de redes eSIM", faqEyebrow: "Lo esencial", questions: "Preguntas", faqIntro: "Respuestas claras, sin letra pequeña ni humo comercial.", choosePlan: "Elegir un plan",
    faq: [
      { question: "¿Por qué es más barato aquí?", answer: "Compramos conectividad al por mayor y vendemos directamente, reduciendo costes de intermediarios innecesarios." },
      { question: "¿Mi teléfono admite eSIM?", answer: "La mayoría de iPhone, Samsung Galaxy y Google Pixel recientes admiten eSIM. Comprueba el modelo antes de pagar." },
      { question: "¿Cuándo instalo la eSIM?", answer: "Instálala en casa con Wi‑Fi y activa los datos al llegar. Las reglas pueden variar según el plan." },
      { question: "¿Cómo gana dinero esim.free?", answer: "Compramos conectividad a proveedores mayoristas e incluimos un margen minorista transparente en el precio mostrado. esim.free gestiona la venta, entrega y soporte." },
    ],
    footerTagline: "El camino más corto hacia una conexión asequible.", help: "Ayuda", legal: "Los productos son vendidos y entregados por esim.free.", world: "Todo el mundo", countries180: "180 países", lifetime: "Sin caducidad", days: "días", gb: "GB", mb: "MB",
  },
  fr: {
    metaTitle: "esim.free — trouvez l’eSIM la moins chère", metaDescription: "Achetez directement auprès d’esim.free des forfaits eSIM de voyage à prix clair et couverture mondiale.",
    navPlans: "Forfaits", navHow: "Comment ça marche", themeToggle: "Changer de thème clair ou sombre", languageLabel: "Langue",
    heroEyebrow: "Vente directe. Prix clair.", heroLine1: "L’eSIM la moins", heroLine2: "chère. Tout de suite.", heroLead: "Choisissez une destination. Nous nous approvisionnons auprès de partenaires réseau mondiaux et esim.free vend et assiste chaque forfait directement.", findEsim: "Trouver une eSIM",
    statPlans: "forfaits disponibles", statCountries: "destinations populaires", statMarkup: "redirections vers un paiement externe",
    catalogEyebrow: "Recherche de forfait", catalogTitle: "Où partez-vous ?", checked: "Prix vérifiés le 08/08/2026", country: "Destination", data: "Données", duration: "Validité", sort: "Afficher d’abord",
    anyData: "Tout volume", from1: "À partir de 1 Go", from3: "À partir de 3 Go", from10: "À partir de 10 Go", unlimited: "Illimité", anyDuration: "Toute durée", upToWeek: "Jusqu’à 7 jours", upToMonth: "8–30 jours", overMonth: "Plus de 30 jours", cheapest: "Prix le plus bas", cheapestPerGb: "Prix par Go", moreData: "Plus de données",
    offers: "{count} offres", providerPurchase: "Vendu et pris en charge par esim.free", dataLabel: "Données", durationLabel: "Validité", networkLabel: "Réseau", best: "Prix le plus bas", choose: "Choisir",
    emptyTitle: "Aucun forfait ne correspond.", emptyText: "Modifiez le volume de données ou la durée.", showMore: "Afficher plus", priceNote: "La couverture dépend des réseaux locaux. esim.free facture le prix affiché ; les taxes obligatoires apparaissent au paiement.",
    stepsEyebrow: "Trois étapes simples", stepsTitle: "Choisissez. Installez. Connectez-vous.", compare: "Comparez", buy: "Achetez", connect: "Connectez-vous", compareText: "Choisissez la destination et les données. Les offres les moins chères apparaissent en premier.", buyText: "Payez esim.free en toute sécurité. Nous livrons et assistons votre forfait.", connectText: "Scannez le QR code et suivez les instructions reçues par e-mail.",
    partners: "Couverture fournie par des partenaires eSIM mondiaux", faqEyebrow: "L’essentiel", questions: "Questions", faqIntro: "Des réponses claires, sans petites lignes ni jargon marketing.", choosePlan: "Choisir un forfait",
    faq: [
      { question: "Pourquoi est-ce moins cher ici ?", answer: "Nous achetons la connectivité en gros et vendons directement, ce qui réduit les coûts d’intermédiaires inutiles." },
      { question: "Mon téléphone accepte-t-il l’eSIM ?", answer: "La plupart des iPhone, Samsung Galaxy et Google Pixel récents acceptent l’eSIM. Vérifiez votre modèle avant de payer." },
      { question: "Quand installer l’eSIM ?", answer: "Installez-la chez vous en Wi‑Fi, puis activez les données à l’arrivée. Les règles varient selon le forfait." },
      { question: "Comment esim.free gagne de l’argent ?", answer: "Nous achetons la connectivité auprès de fournisseurs en gros et intégrons une marge transparente au prix affiché. esim.free assure la vente, la livraison et l’assistance." },
    ],
    footerTagline: "Le chemin le plus court vers une connexion abordable.", help: "Aide", legal: "Les produits sont vendus et livrés par esim.free.", world: "Monde entier", countries180: "180 pays", lifetime: "Sans expiration", days: "jours", gb: "Go", mb: "Mo",
  },
  de: {
    metaTitle: "esim.free — die günstigste eSIM für deine Reise", metaDescription: "Kaufe Reiseziel-eSIMs mit klaren Preisen und weltweiter Abdeckung direkt bei esim.free.",
    navPlans: "Tarife", navHow: "So funktioniert’s", themeToggle: "Helles oder dunkles Design wählen", languageLabel: "Sprache",
    heroEyebrow: "Direktverkauf. Klare Preise.", heroLine1: "Die günstigste", heroLine2: "eSIM. Sofort.", heroLead: "Wähle ein Reiseziel. Wir beziehen Konnektivität von globalen Netzpartnern; esim.free verkauft und unterstützt jeden Tarif direkt.", findEsim: "eSIM finden",
    statPlans: "verfügbare Tarife", statCountries: "beliebte Reiseziele", statMarkup: "Weiterleitungen zu externen Zahlungen",
    catalogEyebrow: "Tariffinder", catalogTitle: "Wohin geht’s?", checked: "Preise geprüft am 08.08.2026", country: "Reiseziel", data: "Daten", duration: "Gültigkeit", sort: "Zuerst anzeigen",
    anyData: "Beliebiges Volumen", from1: "Ab 1 GB", from3: "Ab 3 GB", from10: "Ab 10 GB", unlimited: "Unbegrenzt", anyDuration: "Beliebig", upToWeek: "Bis 7 Tage", upToMonth: "8–30 Tage", overMonth: "Über 30 Tage", cheapest: "Niedrigster Preis", cheapestPerGb: "Preis pro GB", moreData: "Meiste Daten",
    offers: "{count} Angebote", providerPurchase: "Verkauf und Support durch esim.free", dataLabel: "Daten", durationLabel: "Gültigkeit", networkLabel: "Netz", best: "Niedrigster Preis", choose: "Wählen",
    emptyTitle: "Keine passenden Tarife gefunden.", emptyText: "Ändere Datenmenge oder Gültigkeit.", showMore: "Mehr anzeigen", priceNote: "Die Abdeckung hängt von lokalen Netzen ab. esim.free berechnet den angezeigten Preis; Pflichtsteuern erscheinen an der Kasse.",
    stepsEyebrow: "Drei einfache Schritte", stepsTitle: "Wählen. Installieren. Verbinden.", compare: "Vergleichen", buy: "Kaufen", connect: "Verbinden", compareText: "Reiseziel und Datenmenge wählen. Die günstigsten Optionen stehen oben.", buyText: "Sicher an esim.free zahlen. Wir liefern und unterstützen deinen Tarif.", connectText: "QR-Code scannen und den Anweisungen in der E-Mail folgen.",
    partners: "Abdeckung durch globale eSIM-Netzpartner", faqEyebrow: "Kurz erklärt", questions: "Fragen", faqIntro: "Klare Antworten ohne Kleingedrucktes und Marketingnebel.", choosePlan: "Tarif wählen",
    faq: [
      { question: "Warum ist es hier günstiger?", answer: "Wir kaufen Konnektivität im Großhandel und verkaufen direkt. Dadurch entfallen unnötige Zwischenkosten." },
      { question: "Unterstützt mein Handy eSIM?", answer: "Die meisten neueren iPhones, Samsung Galaxy und Google Pixel unterstützen eSIM. Prüfe dein Modell vor dem Bezahlen." },
      { question: "Wann sollte ich die eSIM installieren?", answer: "Installiere sie zu Hause im WLAN und aktiviere mobile Daten erst am Ziel. Die Regeln können je Tarif variieren." },
      { question: "Wie verdient esim.free Geld?", answer: "Wir kaufen Konnektivität im Großhandel und rechnen eine transparente Handelsspanne in den angezeigten Preis ein. Verkauf, Lieferung und Support erfolgen durch esim.free." },
    ],
    footerTagline: "Der kürzeste Weg zu günstiger Verbindung.", help: "Hilfe", legal: "Produkte werden von esim.free verkauft und geliefert.", world: "Weltweit", countries180: "180 Länder", lifetime: "Kein Ablauf", days: "Tage", gb: "GB", mb: "MB",
  },
  pt: {
    metaTitle: "esim.free — encontre o eSIM mais barato", metaDescription: "Compre planos eSIM de viagem diretamente da esim.free, com preços claros e cobertura mundial.",
    navPlans: "Planos", navHow: "Como funciona", themeToggle: "Alternar tema claro e escuro", languageLabel: "Idioma",
    heroEyebrow: "Venda direta. Preço claro.", heroLine1: "O eSIM mais", heroLine2: "barato. Na hora.", heroLead: "Escolha um destino. Obtemos conectividade de parceiros globais e a esim.free vende e dá suporte a cada plano diretamente.", findEsim: "Encontrar eSIM",
    statPlans: "planos disponíveis", statCountries: "destinos populares", statMarkup: "redirecionamentos para pagamentos externos",
    catalogEyebrow: "Busca de planos", catalogTitle: "Para onde você vai?", checked: "Preços verificados em 08/08/2026", country: "Destino", data: "Dados", duration: "Validade", sort: "Mostrar primeiro",
    anyData: "Qualquer volume", from1: "A partir de 1 GB", from3: "A partir de 3 GB", from10: "A partir de 10 GB", unlimited: "Ilimitado", anyDuration: "Qualquer", upToWeek: "Até 7 dias", upToMonth: "8–30 dias", overMonth: "Mais de 30 dias", cheapest: "Menor preço", cheapestPerGb: "Menor preço por GB", moreData: "Mais dados",
    offers: "{count} ofertas", providerPurchase: "Vendido e atendido pela esim.free", dataLabel: "Dados", durationLabel: "Validade", networkLabel: "Rede", best: "Menor preço", choose: "Escolher",
    emptyTitle: "Nenhum plano corresponde aos filtros.", emptyText: "Tente alterar os dados ou a validade.", showMore: "Ver mais", priceNote: "A cobertura depende das redes locais. A esim.free cobra o preço exibido; impostos obrigatórios aparecem no checkout.",
    stepsEyebrow: "Três passos simples", stepsTitle: "Escolha. Instale. Conecte.", compare: "Compare", buy: "Compre", connect: "Conecte", compareText: "Escolha destino e dados. As opções mais baratas aparecem primeiro.", buyText: "Pague com segurança à esim.free. Entregamos e damos suporte ao seu plano.", connectText: "Escaneie o QR code e siga as instruções do e-mail.",
    partners: "Cobertura fornecida por parceiros globais de rede eSIM", faqEyebrow: "O essencial", questions: "Dúvidas", faqIntro: "Respostas claras, sem letras miúdas ou enrolação de marketing.", choosePlan: "Escolher plano",
    faq: [
      { question: "Por que é mais barato aqui?", answer: "Compramos conectividade no atacado e vendemos diretamente, reduzindo custos de intermediários desnecessários." },
      { question: "Meu celular aceita eSIM?", answer: "A maioria dos iPhones, Samsung Galaxy e Google Pixel recentes aceita eSIM. Verifique o modelo antes de pagar." },
      { question: "Quando instalar o eSIM?", answer: "Instale em casa pelo Wi‑Fi e ative os dados ao chegar. As regras podem variar conforme o plano." },
      { question: "Como o esim.free ganha dinheiro?", answer: "Compramos conectividade de fornecedores no atacado e incluímos uma margem transparente no preço exibido. A esim.free cuida da venda, entrega e suporte." },
    ],
    footerTagline: "O caminho mais curto para uma conexão acessível.", help: "Ajuda", legal: "Os produtos são vendidos e entregues pela esim.free.", world: "Mundo todo", countries180: "180 países", lifetime: "Sem validade", days: "dias", gb: "GB", mb: "MB",
  },
  ar: {
    metaTitle: "esim.free — اعثر على أرخص شريحة eSIM", metaDescription: "اشترِ باقات eSIM للسفر مباشرة من esim.free بأسعار واضحة وتغطية عالمية.",
    navPlans: "الباقات", navHow: "كيف يعمل", themeToggle: "التبديل بين الوضع الفاتح والداكن", languageLabel: "اللغة",
    heroEyebrow: "بيع مباشر. سعر واضح.", heroLine1: "أرخص شريحة", heroLine2: "eSIM فوراً.", heroLead: "اختر وجهتك. نحصل على الاتصال من شركاء شبكات عالميين وتبيع esim.free كل باقة وتدعمها مباشرة.", findEsim: "ابحث عن eSIM",
    statPlans: "باقة متاحة", statCountries: "وجهة شائعة", statMarkup: "تحويلات إلى دفع خارجي",
    catalogEyebrow: "اختيار الباقة", catalogTitle: "إلى أين ستسافر؟", checked: "تم التحقق من الأسعار في 08/08/2026", country: "الوجهة", data: "البيانات", duration: "الصلاحية", sort: "اعرض أولاً",
    anyData: "أي حجم", from1: "من 1 GB", from3: "من 3 GB", from10: "من 10 GB", unlimited: "غير محدود", anyDuration: "أي مدة", upToWeek: "حتى 7 أيام", upToMonth: "8–30 يوماً", overMonth: "أكثر من 30 يوماً", cheapest: "الأقل سعراً", cheapestPerGb: "الأقل لكل GB", moreData: "بيانات أكثر",
    offers: "{count} عرضاً", providerPurchase: "البيع والدعم من esim.free", dataLabel: "البيانات", durationLabel: "الصلاحية", networkLabel: "الشبكة", best: "الأقل سعراً", choose: "اختر",
    emptyTitle: "لا توجد باقات مطابقة.", emptyText: "جرّب تغيير حجم البيانات أو مدة الصلاحية.", showMore: "عرض المزيد", priceNote: "تعتمد التغطية على الشبكات المحلية. تفرض esim.free السعر المعروض وتظهر الضرائب الإلزامية عند الدفع.",
    stepsEyebrow: "ثلاث خطوات بسيطة", stepsTitle: "اختر. ثبّت. اتصل.", compare: "قارن", buy: "اشترِ", connect: "اتصل", compareText: "اختر الوجهة وحجم البيانات. تظهر الخيارات الأرخص أولاً.", buyText: "ادفع بأمان إلى esim.free. نحن نسلّم الباقة ونقدم الدعم.", connectText: "امسح رمز QR واتبع التعليمات المرسلة إلى بريدك.",
    partners: "التغطية مقدمة عبر شركاء شبكات eSIM عالميين", faqEyebrow: "المهم باختصار", questions: "الأسئلة", faqIntro: "إجابات واضحة بلا حروف صغيرة أو عبارات تسويقية.", choosePlan: "اختر باقة",
    faq: [
      { question: "لماذا السعر أقل هنا؟", answer: "نشتري الاتصال بالجملة ونبيع مباشرة، ما يقلل تكاليف الوسطاء غير الضرورية." },
      { question: "هل يدعم هاتفي eSIM؟", answer: "تدعم معظم أجهزة iPhone وSamsung Galaxy وGoogle Pixel الحديثة eSIM. تحقق من طراز هاتفك قبل الدفع." },
      { question: "متى أثبّت eSIM؟", answer: "ثبّتها في المنزل عبر Wi‑Fi، ثم فعّل البيانات عند الوصول. قد تختلف قواعد التفعيل حسب الباقة." },
      { question: "كيف يربح esim.free؟", answer: "نشتري الاتصال بالجملة من الموردين ونضيف هامش بيع شفافاً إلى السعر المعروض. تتولى esim.free البيع والتسليم والدعم." },
    ],
    footerTagline: "أقصر طريق إلى اتصال بسعر مناسب.", help: "المساعدة", legal: "تبيع esim.free المنتجات وتقوم بتسليمها.", world: "حول العالم", countries180: "180 دولة", lifetime: "بلا انتهاء", days: "يوم", gb: "GB", mb: "MB",
  },
  tr: {
    metaTitle: "esim.free — seyahatiniz için en ucuz eSIM", metaDescription: "Şeffaf fiyatlı ve dünya çapında kapsamalı seyahat eSIM paketlerini doğrudan esim.free’dan satın alın.",
    navPlans: "Paketler", navHow: "Nasıl çalışır", themeToggle: "Açık ve koyu temayı değiştir", languageLabel: "Dil",
    heroEyebrow: "Doğrudan satış. Şeffaf fiyat.", heroLine1: "En ucuz", heroLine2: "eSIM. Anında.", heroLead: "Gideceğiniz yeri seçin. Bağlantıyı küresel ağ ortaklarından tedarik eder, her paketi doğrudan esim.free olarak satar ve destekleriz.", findEsim: "eSIM bul",
    statPlans: "mevcut paket", statCountries: "popüler ülke", statMarkup: "harici ödemeye yönlendirme",
    catalogEyebrow: "Paket bulucu", catalogTitle: "Nereye gidiyorsunuz?", checked: "Fiyatlar 08.08.2026 tarihinde kontrol edildi", country: "Hedef", data: "İnternet", duration: "Geçerlilik", sort: "Önce göster",
    anyData: "Herhangi bir miktar", from1: "1 GB ve üzeri", from3: "3 GB ve üzeri", from10: "10 GB ve üzeri", unlimited: "Sınırsız", anyDuration: "Herhangi", upToWeek: "7 güne kadar", upToMonth: "8–30 gün", overMonth: "30 günden fazla", cheapest: "En düşük fiyat", cheapestPerGb: "GB başına en düşük", moreData: "En çok internet",
    offers: "{count} teklif", providerPurchase: "Satış ve destek esim.free tarafından", dataLabel: "İnternet", durationLabel: "Geçerlilik", networkLabel: "Şebeke", best: "En düşük fiyat", choose: "Seç",
    emptyTitle: "Bu filtrelere uygun paket yok.", emptyText: "İnternet miktarını veya süreyi değiştirin.", showMore: "Daha fazla göster", priceNote: "Kapsama yerel ağlara bağlıdır. Gösterilen fiyatı esim.free tahsil eder; zorunlu vergiler ödeme sırasında görünür.",
    stepsEyebrow: "Üç kolay adım", stepsTitle: "Seçin. Kurun. Bağlanın.", compare: "Karşılaştırın", buy: "Satın alın", connect: "Bağlanın", compareText: "Hedefi ve internet miktarını seçin. En ucuz seçenekler üstte görünür.", buyText: "esim.free’a güvenle ödeme yapın. Paketinizi teslim eder ve destekleriz.", connectText: "QR kodunu tarayın ve e-postadaki talimatları izleyin.",
    partners: "Kapsama küresel eSIM ağ ortakları tarafından sağlanır", faqEyebrow: "Kısaca", questions: "Sorular", faqIntro: "Küçük yazılar ve pazarlama karmaşası olmadan net yanıtlar.", choosePlan: "Paket seç",
    faq: [
      { question: "Burada neden daha ucuz?", answer: "Bağlantıyı toptan alıp doğrudan satarak gereksiz aracı maliyetlerini azaltırız." },
      { question: "Telefonum eSIM destekliyor mu?", answer: "Yeni iPhone, Samsung Galaxy ve Google Pixel modellerinin çoğu eSIM destekler. Ödemeden önce modelinizi kontrol edin." },
      { question: "eSIM’i ne zaman kurmalıyım?", answer: "Evde Wi‑Fi üzerinden kurun, mobil veriyi varışta açın. Kurallar pakete göre değişebilir." },
      { question: "esim.free nasıl para kazanıyor?", answer: "Bağlantıyı toptan tedarikçilerden alır ve gösterilen fiyata şeffaf bir perakende marjı ekleriz. Satış, teslimat ve destek esim.free tarafından sağlanır." },
    ],
    footerTagline: "Uygun fiyatlı bağlantıya en kısa yol.", help: "Yardım", legal: "Ürünler esim.free tarafından satılır ve teslim edilir.", world: "Dünya çapında", countries180: "180 ülke", lifetime: "Süresiz", days: "gün", gb: "GB", mb: "MB",
  },
  zh: {
    metaTitle: "esim.free — 找到旅行中最便宜的 eSIM", metaDescription: "直接从 esim.free 购买价格透明、覆盖全球的旅行 eSIM 套餐。",
    navPlans: "套餐", navHow: "使用方法", themeToggle: "切换浅色和深色主题", languageLabel: "语言",
    heroEyebrow: "直接销售。价格透明。", heroLine1: "最便宜的", heroLine2: "eSIM，即刻找到。", heroLead: "选择目的地。我们从全球网络合作伙伴采购连接服务，并由 esim.free 直接销售和支持套餐。", findEsim: "查找 eSIM",
    statPlans: "种套餐可选", statCountries: "个热门目的地", statMarkup: "跳转至外部付款",
    catalogEyebrow: "套餐查找", catalogTitle: "您要去哪里？", checked: "价格核对于 2026/08/08", country: "目的地", data: "流量", duration: "有效期", sort: "优先显示",
    anyData: "不限流量", from1: "1 GB 起", from3: "3 GB 起", from10: "10 GB 起", unlimited: "无限流量", anyDuration: "不限", upToWeek: "最多 7 天", upToMonth: "8–30 天", overMonth: "超过 30 天", cheapest: "价格最低", cheapestPerGb: "每 GB 最低", moreData: "流量最多",
    offers: "{count} 个套餐", providerPurchase: "由 esim.free 销售并提供支持", dataLabel: "流量", durationLabel: "有效期", networkLabel: "网络", best: "价格最低", choose: "选择",
    emptyTitle: "没有符合筛选条件的套餐。", emptyText: "请调整流量或有效期。", showMore: "显示更多", priceNote: "覆盖范围取决于当地网络。esim.free 收取所示套餐价格；法定税费会在结账时显示。",
    stepsEyebrow: "三个简单步骤", stepsTitle: "选择。安装。联网。", compare: "比较", buy: "购买", connect: "连接", compareText: "选择目的地和流量，最便宜的选项会排在前面。", buyText: "安全支付给 esim.free。我们负责交付套餐并提供支持。", connectText: "扫描二维码并按照邮件中的说明操作。",
    partners: "覆盖服务由全球 eSIM 网络合作伙伴提供", faqEyebrow: "重要信息", questions: "常见问题", faqIntro: "没有小字条款，也没有营销话术，只有清晰答案。", choosePlan: "选择套餐",
    faq: [
      { question: "为什么这里更便宜？", answer: "我们从上游供应商批量采购连接服务，再以透明价格直接销售，从而减少不必要的中间环节。" },
      { question: "我的手机支持 eSIM 吗？", answer: "大多数新款 iPhone、Samsung Galaxy 和 Google Pixel 都支持 eSIM。付款前请确认具体型号。" },
      { question: "什么时候安装 eSIM？", answer: "建议在家通过 Wi‑Fi 安装，抵达后再开启移动数据。激活规则可能因套餐而异。" },
      { question: "esim.free 如何盈利？", answer: "我们从上游供应商批量采购连接服务，并在所示价格中加入透明的零售利润。销售、交付和支持均由 esim.free 负责。" },
    ],
    footerTagline: "实惠上网的最短路径。", help: "帮助", legal: "产品由 esim.free 销售并交付。", world: "全球", countries180: "180 个国家", lifetime: "永久有效", days: "天", gb: "GB", mb: "MB",
  },
  ja: {
    metaTitle: "esim.free — 旅行先で最安のeSIMを検索", metaDescription: "透明な価格の旅行用eSIMをesim.freeから直接購入できます。",
    navPlans: "プラン", navHow: "使い方", themeToggle: "ライト・ダークテーマを切り替える", languageLabel: "言語",
    heroEyebrow: "直接販売。透明な価格。", heroLine1: "最安のeSIMを", heroLine2: "すぐに。", heroLead: "渡航先を選ぶだけ。世界各地のネットワークパートナーから通信を仕入れ、esim.freeが直接販売・サポートします。", findEsim: "eSIMを探す",
    statPlans: "以上のプラン", statCountries: "の人気渡航先", statMarkup: "外部決済への移動",
    catalogEyebrow: "プラン検索", catalogTitle: "どこへ行きますか？", checked: "価格確認日：2026/08/08", country: "渡航先", data: "データ", duration: "有効期間", sort: "並び順",
    anyData: "指定なし", from1: "1 GB以上", from3: "3 GB以上", from10: "10 GB以上", unlimited: "無制限", anyDuration: "指定なし", upToWeek: "7日以内", upToMonth: "8〜30日", overMonth: "30日超", cheapest: "価格が安い順", cheapestPerGb: "1 GB単価が安い順", moreData: "データ量が多い順",
    offers: "{count} 件", providerPurchase: "esim.freeが販売・サポート", dataLabel: "データ", durationLabel: "有効期間", networkLabel: "回線", best: "最安", choose: "選ぶ",
    emptyTitle: "条件に合うプランがありません。", emptyText: "データ量または期間を変更してください。", showMore: "さらに表示", priceNote: "対応エリアは現地ネットワークにより異なります。表示価格はesim.freeが請求し、法定税は決済時に表示されます。",
    stepsEyebrow: "かんたん3ステップ", stepsTitle: "選ぶ。設定する。つながる。", compare: "比較", buy: "購入", connect: "接続", compareText: "渡航先とデータ量を選ぶと、安いプランから表示されます。", buyText: "esim.freeへ安全にお支払いください。プランの提供とサポートを行います。", connectText: "QRコードを読み取り、メールの手順に従います。",
    partners: "世界各地のeSIMネットワークパートナーによる接続", faqEyebrow: "知っておきたいこと", questions: "よくある質問", faqIntro: "小さな文字や曖昧な広告表現のない、明確な回答です。", choosePlan: "プランを選ぶ",
    faq: [
      { question: "なぜ安いのですか？", answer: "上流サプライヤーから通信を卸仕入れし、不要な中間コストを抑えて直接販売しているためです。" },
      { question: "私のスマホはeSIMに対応していますか？", answer: "最近のiPhone、Samsung Galaxy、Google Pixelの多くが対応しています。購入前に機種を確認してください。" },
      { question: "eSIMはいつ設定しますか？", answer: "自宅のWi‑Fiで設定し、到着後にモバイルデータを有効にするのがおすすめです。条件はプランにより異なります。" },
      { question: "esim.freeの収益源は？", answer: "上流サプライヤーから通信を卸仕入れし、表示価格に透明な小売マージンを含めています。販売、納品、サポートはesim.freeが行います。" },
    ],
    footerTagline: "手頃な通信への最短ルート。", help: "ヘルプ", legal: "商品はesim.freeが販売・提供します。", world: "世界中", countries180: "180か国", lifetime: "期限なし", days: "日", gb: "GB", mb: "MB",
  },
  ko: {
    metaTitle: "esim.free — 여행용 최저가 eSIM 찾기", metaDescription: "투명한 가격의 여행용 eSIM을 esim.free에서 직접 구매하세요.",
    navPlans: "요금제", navHow: "이용 방법", themeToggle: "라이트·다크 테마 전환", languageLabel: "언어",
    heroEyebrow: "직접 판매. 투명한 가격.", heroLine1: "가장 저렴한", heroLine2: "eSIM을 바로.", heroLead: "여행지를 선택하세요. 글로벌 네트워크 파트너로부터 연결 서비스를 공급받아 esim.free가 직접 판매하고 지원합니다.", findEsim: "eSIM 찾기",
    statPlans: "개 이상의 요금제", statCountries: "개 인기 여행지", statMarkup: "외부 결제로 이동",
    catalogEyebrow: "요금제 찾기", catalogTitle: "어디로 가시나요?", checked: "가격 확인: 2026.08.08", country: "여행지", data: "데이터", duration: "유효기간", sort: "우선 표시",
    anyData: "데이터 무관", from1: "1 GB 이상", from3: "3 GB 이상", from10: "10 GB 이상", unlimited: "무제한", anyDuration: "기간 무관", upToWeek: "최대 7일", upToMonth: "8~30일", overMonth: "30일 초과", cheapest: "최저가", cheapestPerGb: "GB당 최저가", moreData: "데이터 많은 순",
    offers: "{count}개 상품", providerPurchase: "esim.free가 판매 및 지원", dataLabel: "데이터", durationLabel: "유효기간", networkLabel: "네트워크", best: "최저가", choose: "선택",
    emptyTitle: "조건에 맞는 요금제가 없습니다.", emptyText: "데이터 용량이나 유효기간을 변경해 보세요.", showMore: "더 보기", priceNote: "서비스 범위는 현지 네트워크에 따라 달라집니다. 표시된 요금은 esim.free가 청구하며 법정 세금은 결제 시 표시됩니다.",
    stepsEyebrow: "간단한 세 단계", stepsTitle: "선택. 설치. 연결.", compare: "비교", buy: "구매", connect: "연결", compareText: "여행지와 데이터 용량을 선택하면 가장 저렴한 상품이 먼저 표시됩니다.", buyText: "esim.free에 안전하게 결제하세요. 요금제 배송과 지원을 제공합니다.", connectText: "QR 코드를 스캔하고 이메일 안내를 따르세요.",
    partners: "글로벌 eSIM 네트워크 파트너가 제공하는 서비스", faqEyebrow: "핵심 정보", questions: "자주 묻는 질문", faqIntro: "작은 글씨나 마케팅 표현 없이 명확하게 답합니다.", choosePlan: "요금제 선택",
    faq: [
      { question: "왜 더 저렴한가요?", answer: "상위 공급업체에서 연결 서비스를 도매로 구매하고 불필요한 중간 비용을 줄여 직접 판매하기 때문입니다." },
      { question: "내 휴대폰이 eSIM을 지원하나요?", answer: "최근 iPhone, Samsung Galaxy, Google Pixel 대부분이 eSIM을 지원합니다. 결제 전 정확한 모델을 확인하세요." },
      { question: "eSIM은 언제 설치하나요?", answer: "집에서 Wi‑Fi로 설치한 뒤 도착지에서 모바일 데이터를 켜는 것이 좋습니다. 조건은 요금제마다 다를 수 있습니다." },
      { question: "esim.free는 어떻게 수익을 내나요?", answer: "상위 공급업체에서 연결 서비스를 도매로 구매하고 표시 가격에 투명한 소매 마진을 포함합니다. 판매, 배송 및 지원은 esim.free가 담당합니다." },
    ],
    footerTagline: "합리적인 연결로 가는 가장 짧은 길.", help: "도움말", legal: "상품은 esim.free가 판매하고 제공합니다.", world: "전 세계", countries180: "180개국", lifetime: "만료 없음", days: "일", gb: "GB", mb: "MB",
  },
  hi: {
    metaTitle: "esim.free — यात्रा के लिए सबसे सस्ती eSIM", metaDescription: "पारदर्शी कीमत पर यात्रा eSIM सीधे esim.free से खरीदें।",
    navPlans: "प्लान", navHow: "यह कैसे काम करता है", themeToggle: "लाइट और डार्क थीम बदलें", languageLabel: "भाषा",
    heroEyebrow: "सीधी बिक्री। पारदर्शी कीमत।", heroLine1: "सबसे सस्ती", heroLine2: "eSIM, तुरंत।", heroLead: "गंतव्य चुनें। हम वैश्विक नेटवर्क भागीदारों से कनेक्टिविटी लेते हैं और esim.free प्लान सीधे बेचता व सपोर्ट करता है।", findEsim: "eSIM खोजें",
    statPlans: "प्लान उपलब्ध", statCountries: "लोकप्रिय गंतव्य", statMarkup: "बाहरी भुगतान रीडायरेक्ट",
    catalogEyebrow: "प्लान खोज", catalogTitle: "आप कहाँ जा रहे हैं?", checked: "कीमतें 08/08/2026 को जाँची गईं", country: "गंतव्य", data: "डेटा", duration: "वैधता", sort: "पहले दिखाएँ",
    anyData: "कोई भी डेटा", from1: "1 GB से", from3: "3 GB से", from10: "10 GB से", unlimited: "अनलिमिटेड", anyDuration: "कोई भी", upToWeek: "7 दिन तक", upToMonth: "8–30 दिन", overMonth: "30 दिन से अधिक", cheapest: "सबसे कम कीमत", cheapestPerGb: "प्रति GB सबसे कम", moreData: "सबसे अधिक डेटा",
    offers: "{count} विकल्प", providerPurchase: "esim.free द्वारा बिक्री और सहायता", dataLabel: "डेटा", durationLabel: "वैधता", networkLabel: "नेटवर्क", best: "सबसे कम कीमत", choose: "चुनें",
    emptyTitle: "इन फ़िल्टर से कोई प्लान नहीं मिला।", emptyText: "डेटा या वैधता बदलकर देखें।", showMore: "और दिखाएँ", priceNote: "कवरेज स्थानीय नेटवर्क पर निर्भर करता है। दिखाया गया मूल्य esim.free लेता है; अनिवार्य कर चेकआउट पर दिखते हैं।",
    stepsEyebrow: "तीन आसान चरण", stepsTitle: "चुनें। इंस्टॉल करें। जुड़ें।", compare: "तुलना करें", buy: "खरीदें", connect: "जुड़ें", compareText: "गंतव्य और डेटा चुनें। सबसे सस्ते विकल्प पहले दिखेंगे।", buyText: "esim.free को सुरक्षित भुगतान करें। हम प्लान डिलीवर करते हैं और सहायता देते हैं।", connectText: "QR कोड स्कैन करें और ईमेल के निर्देशों का पालन करें।",
    partners: "वैश्विक eSIM नेटवर्क भागीदारों द्वारा कवरेज", faqEyebrow: "ज़रूरी बातें", questions: "सवाल", faqIntro: "छोटे अक्षरों और मार्केटिंग के शोर के बिना साफ जवाब।", choosePlan: "प्लान चुनें",
    faq: [
      { question: "यहाँ कीमत कम क्यों है?", answer: "हम अपस्ट्रीम सप्लायर से कनेक्टिविटी थोक में खरीदकर अनावश्यक बिचौलिया लागत कम करते हैं और सीधे बेचते हैं।" },
      { question: "क्या मेरा फोन eSIM सपोर्ट करता है?", answer: "अधिकांश नए iPhone, Samsung Galaxy और Google Pixel eSIM सपोर्ट करते हैं। भुगतान से पहले अपना मॉडल जाँचें।" },
      { question: "eSIM कब इंस्टॉल करूँ?", answer: "घर पर Wi‑Fi से इंस्टॉल करें और पहुँचने पर मोबाइल डेटा चालू करें। नियम प्लान के अनुसार अलग हो सकते हैं।" },
      { question: "esim.free पैसे कैसे कमाता है?", answer: "हम अपस्ट्रीम सप्लायर से कनेक्टिविटी थोक में खरीदते हैं और दिखाए गए मूल्य में पारदर्शी खुदरा मार्जिन शामिल करते हैं। बिक्री, डिलीवरी और सहायता esim.free संभालता है।" },
    ],
    footerTagline: "किफ़ायती कनेक्टिविटी का सबसे छोटा रास्ता।", help: "मदद", legal: "उत्पाद esim.free द्वारा बेचे और डिलीवर किए जाते हैं।", world: "दुनिया भर में", countries180: "180 देश", lifetime: "कोई समाप्ति नहीं", days: "दिन", gb: "GB", mb: "MB",
  },
};

export function detectLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem("esim-language");
  if (saved && saved in LANGUAGES) return saved as Language;

  for (const value of navigator.languages ?? [navigator.language]) {
    const code = value.toLowerCase().split("-")[0];
    if (code in LANGUAGES) return code as Language;
  }
  return "en";
}
