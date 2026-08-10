import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = { title: "Privacy policy — esim.free", description: "How esim.free collects and uses personal data.", alternates: { canonical: "/privacy/" } };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy policy" lead="This policy explains what information esim.free uses to deliver eSIM products, provide support and keep transactions secure.">
      <section><h2>1. Who controls your data</h2><p>esim.free is the trading brand responsible for the customer information used to operate this website and fulfil eSIM orders. Privacy enquiries may be sent to <a href="mailto:staskochukov@gmail.com">staskochukov@gmail.com</a>.</p></section>
      <section><h2>2. Information we collect</h2><p>We may collect your name, email address, destination and selected plan, order and transaction identifiers, support messages, device and browser information, IP address, and technical activation or data-usage status required to deliver and troubleshoot an eSIM. Payment card details are collected directly by the payment processor and are not stored by esim.free.</p></section>
      <section><h2>3. Why we use it</h2><p>We use information to process and deliver orders, provide activation support, prevent fraud, keep business and tax records, comply with law, resolve disputes and improve reliability. The legal basis may be performance of a contract, legal obligation, legitimate interests or consent, depending on the activity and your location.</p></section>
      <section><h2>4. Who receives it</h2><p>Information may be shared only as needed with Paddle or another displayed payment processor, upstream eSIM and mobile-network suppliers, email and customer-support providers, GitHub Pages hosting, professional advisers and authorities where legally required. These parties receive only the information needed for their role.</p></section>
      <section><h2>5. International transfers</h2><p>Travel connectivity is global, so service providers may process information outside your country. Where required, we use contractual or other lawful safeguards for international transfers.</p></section>
      <section><h2>6. Retention and security</h2><p>Order and tax records are retained for the period required by applicable law. Support and technical records are kept only as long as reasonably needed for service, fraud prevention and disputes. We use reasonable organisational and technical controls, but no internet system can be guaranteed completely secure.</p></section>
      <section><h2>7. Cookies and local storage</h2><p>The site uses local browser storage to remember language and light/dark theme preferences. Essential hosting and security technologies may also process basic request information. We do not sell personal information or use it for third-party behavioural advertising.</p></section>
      <section><h2>8. Your rights</h2><p>Depending on your location, you may request access, correction, deletion, restriction, portability or objection, and may withdraw consent where consent is the basis. Contact us with your email and request. We may need to verify identity before responding.</p></section>
      <section><h2>9. Children and updates</h2><p>The service is not directed to children under 18. We may update this policy when our service or legal obligations change; the effective date above shows the current version.</p></section>
    </LegalPage>
  );
}
