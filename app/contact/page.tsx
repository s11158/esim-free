import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = { title: "Contact and support — esim.free", description: "Contact esim.free for eSIM orders, activation help, privacy or refunds.", alternates: { canonical: "/contact/" } };

export default function ContactPage() {
  return (
    <LegalPage eyebrow="Customer support" title="We are here to help." lead="Contact esim.free before or after purchase for plan selection, delivery, installation, connectivity or refund questions.">
      <section className="contact-card"><span>Email</span><a href="mailto:staskochukov@gmail.com">staskochukov@gmail.com</a><p>We normally respond within two business days. For an active travel connection issue, include “URGENT eSIM” and your order ID in the subject.</p></section>
      <section><h2>Include these details</h2><ul><li>The email address used for the order.</li><li>Your order or transaction ID.</li><li>Destination and eSIM plan.</li><li>Device manufacturer and exact model.</li><li>A screenshot of the error, with private information hidden.</li></ul></section>
      <section><h2>Business identity</h2><p>esim.free is the trading brand that sells the prepaid digital eSIM products listed on this website. Payment receipts and invoices identify the payment merchant and transaction details.</p></section>
      <section><h2>Security</h2><p>Never email passwords, one-time codes, full card numbers or passport copies. Payment information must be entered only in the secure checkout displayed from this website.</p></section>
    </LegalPage>
  );
}
