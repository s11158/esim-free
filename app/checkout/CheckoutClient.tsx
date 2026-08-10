"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Language } from "../i18n";

type Order = {
  plan: string;
  destination: string;
  data: string;
  validity: string;
  price: number | null;
};

type CheckoutCopy = {
  summary: string;
  seller: string;
  destination: string;
  data: string;
  validity: string;
  total: string;
  oneTime: string;
  cryptoTitle: string;
  cryptoText: string;
  pay: string;
  request: string;
  safety: string;
  back: string;
};

type PaymentCopy = {
  email: string;
  emailPlaceholder: string;
  accept: string;
  create: string;
  creating: string;
  wallet: string;
  exactAmount: string;
  expires: string;
  copy: string;
  copied: string;
  waiting: string;
  paid: string;
  paidText: string;
  expired: string;
  expiredText: string;
  retry: string;
  networkWarning: string;
  unavailable: string;
};

type PaymentOrder = {
  orderId: string;
  status: "pending" | "paid" | "expired" | "manual_review";
  fulfillmentStatus: "not_started" | "manual_required" | "fulfilled" | "failed";
  network: string;
  asset: string;
  walletAddress: string;
  exactAmount: string;
  baseAmount: string;
  expiresAt: string;
  createdAt: string;
  paidAt: string | null;
  transactionId: string | null;
  email: string;
};

type StoredOrder = {
  orderId: string;
  token: string;
  planId: string;
};

const COPY: Record<Language, CheckoutCopy> = {
  en: { summary: "Order summary", seller: "Seller", destination: "Destination", data: "Data", validity: "Validity", total: "Total", oneTime: "one-time payment", cryptoTitle: "Pay with crypto", cryptoText: "Create a 60-minute USDT TRC-20 invoice. A unique exact amount identifies this order automatically.", pay: "Create USDT invoice", request: "Request verified crypto payment link", safety: "Send only USDT on TRON (TRC-20) and include any exchange withdrawal fee on top. Never send another asset or use another network.", back: "Choose another plan" },
  ru: { summary: "Ваш заказ", seller: "Продавец", destination: "Страна", data: "Интернет", validity: "Срок", total: "Итого", oneTime: "разовая оплата", cryptoTitle: "Оплата криптовалютой", cryptoText: "Создайте счёт USDT TRC-20 на 60 минут. Уникальная точная сумма автоматически определяет ваш заказ.", pay: "Создать счёт USDT", request: "Получить проверенную ссылку на криптооплату", safety: "Отправляйте только USDT в сети TRON (TRC-20), а комиссию биржи добавляйте сверху. Не используйте другую монету или сеть.", back: "Выбрать другой тариф" },
  es: { summary: "Resumen del pedido", seller: "Vendedor", destination: "Destino", data: "Datos", validity: "Validez", total: "Total", oneTime: "pago único", cryptoTitle: "Pagar con criptomonedas", cryptoText: "Crea una factura USDT TRC-20 válida durante 60 minutos. El importe exacto identifica automáticamente el pedido.", pay: "Crear factura USDT", request: "Solicitar enlace cripto verificado", safety: "Envía solo USDT por TRON (TRC-20) y añade aparte la comisión de retirada. No uses otra moneda o red.", back: "Elegir otro plan" },
  fr: { summary: "Récapitulatif", seller: "Vendeur", destination: "Destination", data: "Données", validity: "Validité", total: "Total", oneTime: "paiement unique", cryptoTitle: "Payer en cryptomonnaie", cryptoText: "Créez une facture USDT TRC-20 valable 60 minutes. Le montant exact identifie automatiquement la commande.", pay: "Créer la facture USDT", request: "Demander le lien crypto vérifié", safety: "Envoyez uniquement des USDT sur TRON (TRC-20) et ajoutez les frais de retrait en plus. N’utilisez aucune autre devise ou réseau.", back: "Choisir un autre forfait" },
  de: { summary: "Bestellübersicht", seller: "Verkäufer", destination: "Reiseziel", data: "Daten", validity: "Gültigkeit", total: "Gesamt", oneTime: "einmalige Zahlung", cryptoTitle: "Mit Krypto bezahlen", cryptoText: "Erstelle eine 60 Minuten gültige USDT-TRC-20-Rechnung. Der exakte Betrag identifiziert die Bestellung automatisch.", pay: "USDT-Rechnung erstellen", request: "Geprüften Krypto-Zahlungslink anfordern", safety: "Sende nur USDT über TRON (TRC-20) und addiere die Auszahlungsgebühr. Verwende keine andere Währung oder Blockchain.", back: "Anderen Tarif wählen" },
  pt: { summary: "Resumo do pedido", seller: "Vendedor", destination: "Destino", data: "Dados", validity: "Validade", total: "Total", oneTime: "pagamento único", cryptoTitle: "Pagar com cripto", cryptoText: "Crie uma fatura USDT TRC-20 válida por 60 minutos. O valor exato identifica o pedido automaticamente.", pay: "Criar fatura USDT", request: "Pedir link cripto verificado", safety: "Envie apenas USDT pela rede TRON (TRC-20) e acrescente a taxa de levantamento. Não use outra moeda ou rede.", back: "Escolher outro plano" },
  ar: { summary: "ملخص الطلب", seller: "البائع", destination: "الوجهة", data: "البيانات", validity: "الصلاحية", total: "الإجمالي", oneTime: "دفعة واحدة", cryptoTitle: "الدفع بالعملات الرقمية", cryptoText: "أنشئ فاتورة USDT TRC-20 صالحة لمدة 60 دقيقة. يحدد المبلغ الدقيق طلبك تلقائياً.", pay: "إنشاء فاتورة USDT", request: "طلب رابط دفع رقمي موثق", safety: "أرسل USDT فقط عبر شبكة TRON (TRC-20) وأضف رسوم السحب فوق المبلغ. لا تستخدم عملة أو شبكة أخرى.", back: "اختيار باقة أخرى" },
  tr: { summary: "Sipariş özeti", seller: "Satıcı", destination: "Hedef", data: "İnternet", validity: "Geçerlilik", total: "Toplam", oneTime: "tek seferlik ödeme", cryptoTitle: "Kripto ile öde", cryptoText: "60 dakika geçerli bir USDT TRC-20 faturası oluşturun. Kesin tutar siparişi otomatik olarak tanımlar.", pay: "USDT faturası oluştur", request: "Doğrulanmış kripto ödeme bağlantısı iste", safety: "Yalnızca TRON (TRC-20) üzerinden USDT gönderin ve çekim ücretini tutara ekleyin. Başka coin veya ağ kullanmayın.", back: "Başka paket seç" },
  zh: { summary: "订单摘要", seller: "卖家", destination: "目的地", data: "流量", validity: "有效期", total: "总计", oneTime: "一次性付款", cryptoTitle: "使用加密货币支付", cryptoText: "创建一张有效期为60分钟的USDT TRC-20账单。系统通过精确金额自动识别订单。", pay: "创建USDT账单", request: "获取已验证的加密支付链接", safety: "仅通过TRON（TRC-20）发送USDT，并在金额之外另付提现费。不要使用其他币种或网络。", back: "选择其他套餐" },
  ja: { summary: "ご注文内容", seller: "販売者", destination: "渡航先", data: "データ", validity: "有効期間", total: "合計", oneTime: "1回払い", cryptoTitle: "暗号資産で支払う", cryptoText: "60分間有効なUSDT TRC-20請求を作成します。正確な金額で注文を自動識別します。", pay: "USDT請求を作成", request: "確認済み決済リンクを依頼", safety: "TRON（TRC-20）のUSDTのみを送金し、出金手数料は別途追加してください。他の通貨やネットワークは使用しないでください。", back: "別のプランを選ぶ" },
  ko: { summary: "주문 요약", seller: "판매자", destination: "여행지", data: "데이터", validity: "유효기간", total: "합계", oneTime: "일회성 결제", cryptoTitle: "암호화폐로 결제", cryptoText: "60분 동안 유효한 USDT TRC-20 청구서를 만드세요. 정확한 금액으로 주문을 자동 식별합니다.", pay: "USDT 청구서 만들기", request: "검증된 암호화폐 결제 링크 요청", safety: "TRON(TRC-20)의 USDT만 보내고 출금 수수료는 별도로 추가하세요. 다른 코인이나 네트워크를 사용하지 마세요.", back: "다른 요금제 선택" },
  hi: { summary: "ऑर्डर सारांश", seller: "विक्रेता", destination: "गंतव्य", data: "डेटा", validity: "वैधता", total: "कुल", oneTime: "एक बार का भुगतान", cryptoTitle: "क्रिप्टो से भुगतान", cryptoText: "60 मिनट के लिए USDT TRC-20 इनवॉइस बनाएँ। सटीक राशि से ऑर्डर स्वतः पहचाना जाता है।", pay: "USDT इनवॉइस बनाएँ", request: "सत्यापित क्रिप्टो भुगतान लिंक माँगें", safety: "केवल TRON (TRC-20) पर USDT भेजें और निकासी शुल्क अलग से जोड़ें। किसी अन्य कॉइन या नेटवर्क का उपयोग न करें।", back: "दूसरा प्लान चुनें" },
};

const PAYMENT_COPY: Record<Language, PaymentCopy> = {
  en: { email: "Delivery email", emailPlaceholder: "you@example.com", accept: "I accept the Terms and Refund Policy", create: "Create secure USDT invoice", creating: "Creating invoice…", wallet: "TRC-20 address", exactAmount: "Send exactly", expires: "Time remaining", copy: "Copy", copied: "Copied", waiting: "Waiting for a confirmed TRON transaction…", paid: "Payment confirmed", paidText: "We matched the transaction to this order. Delivery is being prepared for your email.", expired: "Invoice expired", expiredText: "Do not transfer to this amount. Create a new invoice.", retry: "Create a new invoice", networkWarning: "The unique digits are the order code. Send the amount exactly.", unavailable: "Automatic checkout is being connected. Request a verified payment link instead." },
  ru: { email: "Email для получения eSIM", emailPlaceholder: "you@example.com", accept: "Я принимаю Условия и Политику возвратов", create: "Создать защищённый счёт USDT", creating: "Создаём счёт…", wallet: "Адрес TRC-20", exactAmount: "Отправьте ровно", expires: "Осталось времени", copy: "Копировать", copied: "Скопировано", waiting: "Ждём подтверждённую транзакцию в сети TRON…", paid: "Оплата подтверждена", paidText: "Транзакция сопоставлена с заказом. Готовим выдачу eSIM на ваш email.", expired: "Счёт истёк", expiredText: "Не переводите эту сумму. Создайте новый счёт.", retry: "Создать новый счёт", networkWarning: "Уникальные цифры — код заказа. Отправьте сумму абсолютно точно.", unavailable: "Автоматическая оплата ещё подключается. Запросите проверенную ссылку на оплату." },
  es: { email: "Email de entrega", emailPlaceholder: "tu@ejemplo.com", accept: "Acepto los Términos y la Política de reembolso", create: "Crear factura USDT segura", creating: "Creando factura…", wallet: "Dirección TRC-20", exactAmount: "Envía exactamente", expires: "Tiempo restante", copy: "Copiar", copied: "Copiado", waiting: "Esperando una transacción TRON confirmada…", paid: "Pago confirmado", paidText: "La transacción se vinculó al pedido. Prepararemos la entrega por email.", expired: "Factura vencida", expiredText: "No transfieras este importe. Crea una factura nueva.", retry: "Crear nueva factura", networkWarning: "Los dígitos únicos son el código del pedido. Envía el importe exacto.", unavailable: "El pago automático aún se está conectando. Solicita un enlace verificado." },
  fr: { email: "E-mail de livraison", emailPlaceholder: "vous@exemple.com", accept: "J’accepte les Conditions et la Politique de remboursement", create: "Créer la facture USDT sécurisée", creating: "Création de la facture…", wallet: "Adresse TRC-20", exactAmount: "Envoyez exactement", expires: "Temps restant", copy: "Copier", copied: "Copié", waiting: "En attente d’une transaction TRON confirmée…", paid: "Paiement confirmé", paidText: "La transaction correspond à la commande. La livraison par e-mail est en préparation.", expired: "Facture expirée", expiredText: "N’envoyez pas ce montant. Créez une nouvelle facture.", retry: "Créer une nouvelle facture", networkWarning: "Les chiffres uniques sont le code de commande. Envoyez le montant exact.", unavailable: "Le paiement automatique est en cours de connexion. Demandez un lien vérifié." },
  de: { email: "E-Mail für Lieferung", emailPlaceholder: "du@beispiel.de", accept: "Ich akzeptiere Bedingungen und Rückerstattungsrichtlinie", create: "Sichere USDT-Rechnung erstellen", creating: "Rechnung wird erstellt…", wallet: "TRC-20-Adresse", exactAmount: "Exakt senden", expires: "Verbleibende Zeit", copy: "Kopieren", copied: "Kopiert", waiting: "Warten auf eine bestätigte TRON-Transaktion…", paid: "Zahlung bestätigt", paidText: "Die Transaktion wurde zugeordnet. Die Lieferung per E-Mail wird vorbereitet.", expired: "Rechnung abgelaufen", expiredText: "Diesen Betrag nicht mehr senden. Erstelle eine neue Rechnung.", retry: "Neue Rechnung erstellen", networkWarning: "Die eindeutigen Ziffern sind der Bestellcode. Sende exakt den Betrag.", unavailable: "Die automatische Zahlung wird noch verbunden. Fordere einen geprüften Link an." },
  pt: { email: "Email de entrega", emailPlaceholder: "voce@exemplo.com", accept: "Aceito os Termos e a Política de reembolso", create: "Criar fatura USDT segura", creating: "A criar fatura…", wallet: "Endereço TRC-20", exactAmount: "Envie exatamente", expires: "Tempo restante", copy: "Copiar", copied: "Copiado", waiting: "A aguardar transação TRON confirmada…", paid: "Pagamento confirmado", paidText: "A transação foi associada ao pedido. A entrega por email está a ser preparada.", expired: "Fatura expirada", expiredText: "Não envie este valor. Crie uma nova fatura.", retry: "Criar nova fatura", networkWarning: "Os dígitos únicos são o código do pedido. Envie o valor exato.", unavailable: "O pagamento automático ainda está a ser ligado. Peça um link verificado." },
  ar: { email: "بريد تسليم eSIM", emailPlaceholder: "you@example.com", accept: "أوافق على الشروط وسياسة الاسترداد", create: "إنشاء فاتورة USDT آمنة", creating: "جارٍ إنشاء الفاتورة…", wallet: "عنوان TRC-20", exactAmount: "أرسل بالضبط", expires: "الوقت المتبقي", copy: "نسخ", copied: "تم النسخ", waiting: "بانتظار معاملة TRON مؤكدة…", paid: "تم تأكيد الدفع", paidText: "تم ربط المعاملة بالطلب. يجري تجهيز التسليم عبر البريد الإلكتروني.", expired: "انتهت صلاحية الفاتورة", expiredText: "لا ترسل هذا المبلغ. أنشئ فاتورة جديدة.", retry: "إنشاء فاتورة جديدة", networkWarning: "الأرقام الفريدة هي رمز الطلب. أرسل المبلغ بدقة.", unavailable: "يتم توصيل الدفع الآلي حالياً. اطلب رابط دفع موثقاً." },
  tr: { email: "Teslimat e-postası", emailPlaceholder: "siz@ornek.com", accept: "Koşulları ve İade Politikasını kabul ediyorum", create: "Güvenli USDT faturası oluştur", creating: "Fatura oluşturuluyor…", wallet: "TRC-20 adresi", exactAmount: "Tam olarak gönder", expires: "Kalan süre", copy: "Kopyala", copied: "Kopyalandı", waiting: "Onaylı TRON işlemi bekleniyor…", paid: "Ödeme onaylandı", paidText: "İşlem siparişle eşleştirildi. E-posta teslimatı hazırlanıyor.", expired: "Fatura süresi doldu", expiredText: "Bu tutarı göndermeyin. Yeni fatura oluşturun.", retry: "Yeni fatura oluştur", networkWarning: "Benzersiz rakamlar sipariş kodudur. Tutarı tam gönderin.", unavailable: "Otomatik ödeme bağlanıyor. Doğrulanmış bağlantı isteyin." },
  zh: { email: "接收eSIM的邮箱", emailPlaceholder: "you@example.com", accept: "我接受条款和退款政策", create: "创建安全USDT账单", creating: "正在创建账单…", wallet: "TRC-20地址", exactAmount: "请精确发送", expires: "剩余时间", copy: "复制", copied: "已复制", waiting: "等待已确认的TRON交易…", paid: "付款已确认", paidText: "交易已与订单匹配。正在准备通过邮箱交付。", expired: "账单已过期", expiredText: "请勿转账该金额。请创建新账单。", retry: "创建新账单", networkWarning: "独特数字就是订单代码。请精确发送该金额。", unavailable: "自动支付正在接入，请先申请已验证的支付链接。" },
  ja: { email: "eSIM受取メール", emailPlaceholder: "you@example.com", accept: "利用規約と返金ポリシーに同意します", create: "安全なUSDT請求を作成", creating: "請求を作成中…", wallet: "TRC-20アドレス", exactAmount: "正確に送金", expires: "残り時間", copy: "コピー", copied: "コピー済み", waiting: "確認済みTRON取引を待っています…", paid: "支払い確認済み", paidText: "取引を注文に照合しました。メールでの納品を準備しています。", expired: "請求期限切れ", expiredText: "この金額は送金せず、新しい請求を作成してください。", retry: "新しい請求を作成", networkWarning: "固有の桁が注文コードです。金額を正確に送金してください。", unavailable: "自動決済を接続中です。確認済みリンクを依頼してください。" },
  ko: { email: "eSIM 수령 이메일", emailPlaceholder: "you@example.com", accept: "이용약관 및 환불 정책에 동의합니다", create: "안전한 USDT 청구서 만들기", creating: "청구서 생성 중…", wallet: "TRC-20 주소", exactAmount: "정확히 보내기", expires: "남은 시간", copy: "복사", copied: "복사됨", waiting: "확인된 TRON 거래 대기 중…", paid: "결제 확인됨", paidText: "거래가 주문과 일치했습니다. 이메일 배송을 준비 중입니다.", expired: "청구서 만료", expiredText: "이 금액을 보내지 말고 새 청구서를 만드세요.", retry: "새 청구서 만들기", networkWarning: "고유 숫자가 주문 코드입니다. 정확한 금액을 보내세요.", unavailable: "자동 결제를 연결 중입니다. 검증된 결제 링크를 요청하세요." },
  hi: { email: "eSIM डिलीवरी ईमेल", emailPlaceholder: "you@example.com", accept: "मैं शर्तें और रिफंड नीति स्वीकार करता/करती हूँ", create: "सुरक्षित USDT इनवॉइस बनाएँ", creating: "इनवॉइस बन रहा है…", wallet: "TRC-20 पता", exactAmount: "ठीक यही राशि भेजें", expires: "शेष समय", copy: "कॉपी", copied: "कॉपी हुआ", waiting: "पुष्ट TRON लेनदेन की प्रतीक्षा…", paid: "भुगतान पुष्ट", paidText: "लेनदेन ऑर्डर से मिल गया है। ईमेल डिलीवरी तैयार हो रही है।", expired: "इनवॉइस समाप्त", expiredText: "यह राशि न भेजें। नया इनवॉइस बनाएँ।", retry: "नया इनवॉइस बनाएँ", networkWarning: "विशिष्ट अंक ऑर्डर कोड हैं। राशि बिल्कुल सही भेजें।", unavailable: "स्वचालित भुगतान जोड़ा जा रहा है। सत्यापित लिंक माँगें।" },
};

const DEFAULT_ORDER: Order = {
  plan: "esim-free-plan",
  destination: "—",
  data: "—",
  validity: "—",
  price: null,
};

const PAYMENT_API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL?.replace(/\/$/, "") ?? "";
const STORAGE_KEY = "esim-free-active-order";

function clean(value: string | null, fallback: string) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, 120) : fallback;
}

function createOrderToken() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function formatCountdown(expiresAt: string, now: number) {
  const milliseconds = Math.max(0, new Date(expiresAt).getTime() - now);
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function CheckoutClient() {
  const [language, setLanguage] = useState<Language>("en");
  const [order, setOrder] = useState<Order>(DEFAULT_ORDER);
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [payment, setPayment] = useState<PaymentOrder | null>(null);
  const [storedOrder, setStoredOrder] = useState<StoredOrder | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"amount" | "address" | null>(null);
  const [now, setNow] = useState(0);
  const t = COPY[language];
  const p = PAYMENT_COPY[language];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const supported = Object.keys(COPY) as Language[];
      const rootLanguage = document.documentElement.lang.split("-")[0] as Language;
      setLanguage(supported.includes(rootLanguage) ? rootLanguage : "en");

      const params = new URLSearchParams(window.location.search);
      const amount = Number(params.get("price"));
      setOrder({
        plan: clean(params.get("plan"), DEFAULT_ORDER.plan),
        destination: clean(params.get("destination"), DEFAULT_ORDER.destination),
        data: clean(params.get("data"), DEFAULT_ORDER.data),
        validity: clean(params.get("validity"), DEFAULT_ORDER.validity),
        price: Number.isFinite(amount) && amount > 0 ? amount : null,
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const refreshOrder = useCallback(async (stored: StoredOrder) => {
    if (!PAYMENT_API_URL) return;
    const response = await fetch(`${PAYMENT_API_URL}/api/orders/${stored.orderId}`, {
      headers: { authorization: `Bearer ${stored.token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      if (response.status === 404 || response.status === 401) {
        window.sessionStorage.removeItem(STORAGE_KEY);
        setStoredOrder(null);
        setPayment(null);
      }
      return;
    }
    setPayment(await response.json() as PaymentOrder);
  }, []);

  useEffect(() => {
    if (!PAYMENT_API_URL || order.plan === DEFAULT_ORDER.plan) return;
    const timer = window.setTimeout(() => {
      try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const stored = JSON.parse(raw) as StoredOrder;
        if (stored.planId !== order.plan) return;
        setStoredOrder(stored);
        setNow(Date.now());
        void refreshOrder(stored);
      } catch {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [order.plan, refreshOrder]);

  useEffect(() => {
    if (!storedOrder || payment?.status !== "pending") return;
    const poll = window.setInterval(() => void refreshOrder(storedOrder), 10_000);
    return () => window.clearInterval(poll);
  }, [payment?.status, refreshOrder, storedOrder]);

  useEffect(() => {
    if (payment?.status !== "pending") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [payment?.status]);

  const requestHref = useMemo(() => {
    const subject = `Esim.free crypto payment — ${order.plan}`;
    const body = [
      "Please send me the verified crypto payment link for this Esim.free order:",
      `Plan: ${order.plan}`,
      `Destination: ${order.destination}`,
      `Data: ${order.data}`,
      `Validity: ${order.validity}`,
      `Total: ${order.price === null ? "to confirm" : `$${order.price.toFixed(2)} USD`}`,
    ].join("\n");
    return `mailto:staskochukov@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [order]);

  const displayedAmount = payment ? Number(payment.baseAmount) : order.price;
  const formattedPrice = displayedAmount === null || !Number.isFinite(displayedAmount)
    ? "—"
    : new Intl.NumberFormat(language, { style: "currency", currency: "USD" }).format(displayedAmount);

  async function createInvoice() {
    if (!PAYMENT_API_URL) {
      window.location.href = requestHref;
      return;
    }
    setError("");
    setBusy(true);
    const token = createOrderToken();

    try {
      const response = await fetch(`${PAYMENT_API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-order-token": token,
        },
        body: JSON.stringify({ planId: order.plan, email, acceptTerms: accepted }),
      });
      const result = await response.json() as PaymentOrder & { message?: string };
      if (!response.ok) throw new Error(result.message || "Payment service error");

      const stored: StoredOrder = { orderId: result.orderId, token, planId: order.plan };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      setStoredOrder(stored);
      setPayment(result);
      setNow(Date.now());
    } catch (invoiceError) {
      setError(invoiceError instanceof Error ? invoiceError.message : "Payment service error");
    } finally {
      setBusy(false);
    }
  }

  function resetInvoice() {
    window.sessionStorage.removeItem(STORAGE_KEY);
    setStoredOrder(null);
    setPayment(null);
    setError("");
  }

  async function copyValue(kind: "amount" | "address", value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1_500);
  }

  const liveStatus = payment?.status === "pending" && new Date(payment.expiresAt).getTime() <= now
    ? "expired"
    : payment?.status;

  return (
    <>
      <section className="checkout-grid">
        <article className="checkout-summary">
          <p className="checkout-label">{t.summary}</p>
          <div><span>{t.seller}</span><strong>Esim.free</strong></div>
          <div><span>{t.destination}</span><strong>{order.destination}</strong></div>
          <div><span>{t.data}</span><strong>{order.data}</strong></div>
          <div><span>{t.validity}</span><strong>{order.validity}</strong></div>
          <div className="checkout-total"><span>{t.total}</span><strong>{formattedPrice}</strong></div>
          <small>{t.oneTime}</small>
        </article>

        <article className="checkout-payment">
          <span className="checkout-method">USDT · TRON · TRC-20</span>
          <h2>{t.cryptoTitle}</h2>
          <p>{t.cryptoText}</p>

          {!payment && (
            <div className="checkout-form">
              <label>
                <span>{p.email}</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={p.emailPlaceholder}
                  required
                />
              </label>
              <label className="checkout-consent">
                <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
                <span>{p.accept}: <a href="/terms/">Terms</a> · <a href="/refunds/">Refund Policy</a></span>
              </label>
              <button
                className="checkout-action"
                type="button"
                disabled={busy || !email || !accepted}
                onClick={() => void createInvoice()}
              >
                {busy ? p.creating : PAYMENT_API_URL ? p.create : t.request} <span aria-hidden="true">→</span>
              </button>
              {!PAYMENT_API_URL && <p className="checkout-service-note">{p.unavailable}</p>}
              {error && <p className="checkout-error" role="alert">{error}</p>}
            </div>
          )}

          {payment && liveStatus === "pending" && (
            <div className="crypto-invoice" aria-live="polite">
              <div className="crypto-invoice-row">
                <span>{p.exactAmount}</span>
                <strong>{payment.exactAmount} USDT</strong>
                <button type="button" onClick={() => void copyValue("amount", payment.exactAmount)}>
                  {copied === "amount" ? p.copied : p.copy}
                </button>
              </div>
              <div className="crypto-invoice-row crypto-address-row">
                <span>{p.wallet}</span>
                <strong>{payment.walletAddress}</strong>
                <button type="button" onClick={() => void copyValue("address", payment.walletAddress)}>
                  {copied === "address" ? p.copied : p.copy}
                </button>
              </div>
              <div className="crypto-timer"><span>{p.expires}</span><strong>{formatCountdown(payment.expiresAt, now)}</strong></div>
              <p className="crypto-unique-note">{p.networkWarning}</p>
              <p className="crypto-waiting"><span aria-hidden="true" />{p.waiting}</p>
            </div>
          )}

          {payment && liveStatus === "paid" && (
            <div className="crypto-result crypto-result-success" role="status">
              <strong>{p.paid}</strong>
              <p>{p.paidText}</p>
              {payment.transactionId && <small>TX: {payment.transactionId}</small>}
            </div>
          )}

          {payment && (liveStatus === "expired" || liveStatus === "manual_review") && (
            <div className="crypto-result crypto-result-expired" role="status">
              <strong>{p.expired}</strong>
              <p>{p.expiredText}</p>
              <button type="button" onClick={resetInvoice}>{p.retry}</button>
            </div>
          )}

          <p className="checkout-safety">{t.safety}</p>
        </article>
      </section>

      <Link className="checkout-back" href="/#catalog">← {t.back}</Link>
    </>
  );
}
