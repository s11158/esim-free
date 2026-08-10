"use client";

import { useEffect, useMemo, useState } from "react";
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

const COPY: Record<Language, CheckoutCopy> = {
  en: { summary: "Order summary", seller: "Seller", destination: "Destination", data: "Data", validity: "Validity", total: "Total", oneTime: "one-time payment", cryptoTitle: "Pay with crypto", cryptoText: "We confirm the current network, exact amount and verified payment destination before you transfer funds.", pay: "Continue to crypto payment", request: "Request verified crypto payment link", safety: "Never send funds to an address copied from an old message. esim.free confirms each crypto payment against this order.", back: "Choose another plan" },
  ru: { summary: "Ваш заказ", seller: "Продавец", destination: "Страна", data: "Интернет", validity: "Срок", total: "Итого", oneTime: "разовая оплата", cryptoTitle: "Оплата криптовалютой", cryptoText: "Перед переводом мы подтверждаем актуальную сеть, точную сумму и проверенный адрес оплаты.", pay: "Перейти к оплате криптовалютой", request: "Получить проверенную ссылку на криптооплату", safety: "Не переводите средства на адрес из старого сообщения. esim.free сверяет каждый криптоплатёж с этим заказом.", back: "Выбрать другой тариф" },
  es: { summary: "Resumen del pedido", seller: "Vendedor", destination: "Destino", data: "Datos", validity: "Validez", total: "Total", oneTime: "pago único", cryptoTitle: "Pagar con criptomonedas", cryptoText: "Confirmamos la red, el importe exacto y el destino de pago verificado antes de la transferencia.", pay: "Continuar al pago cripto", request: "Solicitar enlace cripto verificado", safety: "No envíes fondos a una dirección de un mensaje antiguo. esim.free verifica cada pago con este pedido.", back: "Elegir otro plan" },
  fr: { summary: "Récapitulatif", seller: "Vendeur", destination: "Destination", data: "Données", validity: "Validité", total: "Total", oneTime: "paiement unique", cryptoTitle: "Payer en cryptomonnaie", cryptoText: "Nous confirmons le réseau, le montant exact et la destination vérifiée avant tout transfert.", pay: "Continuer vers le paiement crypto", request: "Demander le lien crypto vérifié", safety: "N’envoyez jamais de fonds à une adresse provenant d’un ancien message. esim.free vérifie chaque paiement avec cette commande.", back: "Choisir un autre forfait" },
  de: { summary: "Bestellübersicht", seller: "Verkäufer", destination: "Reiseziel", data: "Daten", validity: "Gültigkeit", total: "Gesamt", oneTime: "einmalige Zahlung", cryptoTitle: "Mit Krypto bezahlen", cryptoText: "Vor der Überweisung bestätigen wir Netzwerk, exakten Betrag und geprüftes Zahlungsziel.", pay: "Weiter zur Krypto-Zahlung", request: "Geprüften Krypto-Zahlungslink anfordern", safety: "Sende nie Geld an eine Adresse aus einer alten Nachricht. esim.free gleicht jede Zahlung mit dieser Bestellung ab.", back: "Anderen Tarif wählen" },
  pt: { summary: "Resumo do pedido", seller: "Vendedor", destination: "Destino", data: "Dados", validity: "Validade", total: "Total", oneTime: "pagamento único", cryptoTitle: "Pagar com cripto", cryptoText: "Confirmamos a rede, o valor exato e o destino verificado antes da transferência.", pay: "Continuar para pagamento cripto", request: "Pedir link cripto verificado", safety: "Não envie fundos para um endereço de uma mensagem antiga. A esim.free confere cada pagamento com este pedido.", back: "Escolher outro plano" },
  ar: { summary: "ملخص الطلب", seller: "البائع", destination: "الوجهة", data: "البيانات", validity: "الصلاحية", total: "الإجمالي", oneTime: "دفعة واحدة", cryptoTitle: "الدفع بالعملات الرقمية", cryptoText: "نؤكد الشبكة والمبلغ الدقيق ووجهة الدفع الموثقة قبل التحويل.", pay: "المتابعة إلى الدفع الرقمي", request: "طلب رابط دفع رقمي موثق", safety: "لا ترسل أموالاً إلى عنوان من رسالة قديمة. تتحقق esim.free من كل دفعة مقابل هذا الطلب.", back: "اختيار باقة أخرى" },
  tr: { summary: "Sipariş özeti", seller: "Satıcı", destination: "Hedef", data: "İnternet", validity: "Geçerlilik", total: "Toplam", oneTime: "tek seferlik ödeme", cryptoTitle: "Kripto ile öde", cryptoText: "Transferden önce ağı, kesin tutarı ve doğrulanmış ödeme hedefini onaylarız.", pay: "Kripto ödemeye devam et", request: "Doğrulanmış kripto ödeme bağlantısı iste", safety: "Eski bir mesajdaki adrese para göndermeyin. esim.free her ödemeyi bu siparişle eşleştirir.", back: "Başka paket seç" },
  zh: { summary: "订单摘要", seller: "卖家", destination: "目的地", data: "流量", validity: "有效期", total: "总计", oneTime: "一次性付款", cryptoTitle: "使用加密货币支付", cryptoText: "转账前，我们会确认当前网络、准确金额和已验证的付款地址。", pay: "继续加密货币支付", request: "获取已验证的加密支付链接", safety: "请勿向旧消息中的地址转账。esim.free 会将每笔付款与此订单核对。", back: "选择其他套餐" },
  ja: { summary: "ご注文内容", seller: "販売者", destination: "渡航先", data: "データ", validity: "有効期間", total: "合計", oneTime: "1回払い", cryptoTitle: "暗号資産で支払う", cryptoText: "送金前に、現在のネットワーク、正確な金額、確認済みの支払先をご案内します。", pay: "暗号資産決済へ進む", request: "確認済み決済リンクを依頼", safety: "古いメッセージのアドレスには送金しないでください。esim.freeが注文と入金を照合します。", back: "別のプランを選ぶ" },
  ko: { summary: "주문 요약", seller: "판매자", destination: "여행지", data: "데이터", validity: "유효기간", total: "합계", oneTime: "일회성 결제", cryptoTitle: "암호화폐로 결제", cryptoText: "송금 전에 현재 네트워크, 정확한 금액, 검증된 결제 주소를 확인합니다.", pay: "암호화폐 결제로 이동", request: "검증된 암호화폐 결제 링크 요청", safety: "이전 메시지의 주소로 송금하지 마세요. esim.free가 모든 결제를 이 주문과 대조합니다.", back: "다른 요금제 선택" },
  hi: { summary: "ऑर्डर सारांश", seller: "विक्रेता", destination: "गंतव्य", data: "डेटा", validity: "वैधता", total: "कुल", oneTime: "एक बार का भुगतान", cryptoTitle: "क्रिप्टो से भुगतान", cryptoText: "ट्रांसफ़र से पहले हम नेटवर्क, सही राशि और सत्यापित भुगतान पते की पुष्टि करते हैं।", pay: "क्रिप्टो भुगतान पर जाएँ", request: "सत्यापित क्रिप्टो भुगतान लिंक माँगें", safety: "पुराने संदेश के पते पर धन न भेजें। esim.free हर भुगतान को इस ऑर्डर से मिलाता है।", back: "दूसरा प्लान चुनें" },
};

const DEFAULT_ORDER: Order = {
  plan: "esim-free-plan",
  destination: "—",
  data: "—",
  validity: "—",
  price: null,
};

function clean(value: string | null, fallback: string) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, 120) : fallback;
}

export default function CheckoutClient() {
  const [language, setLanguage] = useState<Language>("en");
  const [order, setOrder] = useState<Order>(DEFAULT_ORDER);
  const cryptoCheckoutUrl = process.env.NEXT_PUBLIC_CRYPTO_CHECKOUT_URL?.trim() ?? "";
  const t = COPY[language];

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

  const requestHref = useMemo(() => {
    const subject = `esim.free crypto payment — ${order.plan}`;
    const body = [
      "Please send me the verified crypto payment link for this esim.free order:",
      `Plan: ${order.plan}`,
      `Destination: ${order.destination}`,
      `Data: ${order.data}`,
      `Validity: ${order.validity}`,
      `Total: ${order.price === null ? "to confirm" : `$${order.price.toFixed(2)} USD`}`,
    ].join("\n");
    return `mailto:staskochukov@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [order]);

  const formattedPrice = order.price === null
    ? "—"
    : new Intl.NumberFormat(language, { style: "currency", currency: "USD" }).format(order.price);

  return (
    <>
      <section className="checkout-grid">
        <article className="checkout-summary">
          <p className="checkout-label">{t.summary}</p>
          <div><span>{t.seller}</span><strong>esim.free</strong></div>
          <div><span>{t.destination}</span><strong>{order.destination}</strong></div>
          <div><span>{t.data}</span><strong>{order.data}</strong></div>
          <div><span>{t.validity}</span><strong>{order.validity}</strong></div>
          <div className="checkout-total"><span>{t.total}</span><strong>{formattedPrice}</strong></div>
          <small>{t.oneTime}</small>
        </article>

        <article className="checkout-payment">
          <span className="checkout-method">USDT · USDC · crypto</span>
          <h2>{t.cryptoTitle}</h2>
          <p>{t.cryptoText}</p>
          <a className="checkout-action" href={cryptoCheckoutUrl || requestHref} rel={cryptoCheckoutUrl ? "noreferrer" : undefined}>
            {cryptoCheckoutUrl ? t.pay : t.request} <span aria-hidden="true">→</span>
          </a>
          <p className="checkout-safety">{t.safety}</p>
        </article>
      </section>

      <Link className="checkout-back" href="/#catalog">← {t.back}</Link>
    </>
  );
}
