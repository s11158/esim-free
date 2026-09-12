import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = { title: "Contact and support - Esim.free", description: "Contact Esim.free for orders, activation help, legal, privacy, refunds and partnership questions.", alternates: { canonical: "/contact/" } };

export default function ContactPage() {
  return (
    <LegalPage eyebrow="Customer support" title="We are here to help." lead="One address for every question: technical, legal, billing, privacy, refunds and partnerships. Write to us before or after purchase.">
      <section className="contact-card"><span>Email</span><a href="mailto:support@esim.free">support@esim.free</a><p>We normally respond within two business days. For an active travel connection issue, include "URGENT eSIM" and your order ID in the subject.</p></section>
      <section><h2>What to write about</h2><ul><li><strong>Technical:</strong> installation, activation, no signal, speed, device compatibility. Subject line: "Technical - order ID".</li><li><strong>Orders and refunds:</strong> payment status, delivery of the activation profile, refund requests under our <a href="/refunds/">Refund policy</a>. Subject line: "Order - order ID".</li><li><strong>Legal and privacy:</strong> terms, data protection requests, complaints, notices to the company. Subject line: "Legal".</li><li><strong>Partnerships and press:</strong> supply, affiliate and media enquiries. Subject line: "Partnership".</li></ul></section>
      <section><h2>Include these details</h2><ul><li>The email address used for the order.</li><li>Your order or transaction ID.</li><li>Destination and eSIM plan.</li><li>Device manufacturer and exact model.</li><li>A screenshot of the error, with private information hidden.</li></ul></section>
      <section><h2>Business identity</h2><p>Esim.free is the company that sells the prepaid digital eSIM products listed on this website. Payment receipts and invoices identify the payment merchant and transaction details.</p></section>
      <section><h2>What we sell</h2><p>We sell premade, fixed-price, data-only travel eSIM plans as one-time digital purchases. We do not sell consultations, custom work, subscriptions, trials or physical products. After payment, the eSIM activation profile and installation instructions are delivered electronically.</p></section>
      <section><h2>Security</h2><p>Never email passwords, one-time codes, full card numbers or passport copies. Payment information must be entered only in the secure checkout displayed from this website.</p></section>
    </LegalPage>
  );
}
