import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = { title: "Contact and support — Esim.free", description: "Contact Esim.free for eSIM orders, activation help, privacy or refunds.", alternates: { canonical: "/contact/" } };

export default function ContactPage() {
  return (
    <LegalPage eyebrow="Customer support" title="We are here to help." lead="Contact Esim.free before or after purchase for plan selection, delivery, installation, connectivity or refund questions.">
      <section className="contact-card"><span>Email</span><a href="mailto:staskochukov@gmail.com">staskochukov@gmail.com</a><p>We normally respond within two business days. For an active travel connection issue, include “URGENT eSIM” and your order ID in the subject.</p></section>
      <section><h2>Include these details</h2><ul><li>The email address used for the order.</li><li>Your order or transaction ID.</li><li>Destination and eSIM plan.</li><li>Device manufacturer and exact model.</li><li>A screenshot of the error, with private information hidden.</li></ul></section>
      <section><h2>Business identity</h2><p>Esim.free is the company that sells the prepaid digital eSIM products listed on this website. Payment receipts and invoices identify the payment merchant and transaction details.</p></section>
      <section><h2>What we sell</h2><p>We sell premade, fixed-price, data-only travel eSIM plans as one-time digital purchases. We do not sell consultations, custom work, subscriptions, trials or physical products. After payment, the eSIM activation profile and installation instructions are delivered electronically.</p></section>
      <section><h2>Security</h2><p>Never email passwords, one-time codes, full card numbers or passport copies. Payment information must be entered only in the secure checkout displayed from this website.</p></section>
    </LegalPage>
  );
}
