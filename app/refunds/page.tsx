import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = { title: "Refund policy — esim.free", description: "Refund eligibility and process for esim.free digital eSIM plans.", alternates: { canonical: "/refunds/" } };

export default function RefundsPage() {
  return (
    <LegalPage eyebrow="Customer policy" title="Refund policy" lead="We want every eSIM to work as described. This policy explains when a digital plan can be cancelled, replaced or refunded.">
      <section><h2>1. Before activation</h2><p>You may request cancellation within 14 days of purchase when the eSIM has not been activated, installed or used and no mobile data has been consumed. Eligibility is confirmed using the technical status supplied by the eSIM platform. If applicable law requires express consent before immediate digital delivery or acknowledgement that a cancellation right may be lost after delivery begins, that consent will be requested at checkout. Mandatory consumer rights remain unaffected.</p></section>
      <section><h2>2. Non-delivery or technical failure</h2><p>If we do not deliver the purchased eSIM, the plan cannot be provisioned, or the service is materially different from the description, contact us promptly. We will first try to deliver, repair or replace the plan. If we cannot resolve the issue within a reasonable time, we will provide an appropriate full or partial refund.</p></section>
      <section><h2>3. When a refund is normally unavailable</h2><ul><li>The eSIM has been activated or mobile data has been consumed.</li><li>The device is incompatible, carrier-locked or incorrectly configured despite clear compatibility requirements.</li><li>The customer selected the wrong destination, plan or validity period.</li><li>The eSIM profile was deleted after installation or the QR code was shared.</li><li>Coverage or speed varies because of local network conditions that were outside our reasonable control.</li><li>The validity period expired after activation or the plan was used in breach of the Terms.</li></ul></section>
      <section><h2>4. How to request a refund</h2><p>Email <a href="mailto:staskochukov@gmail.com">staskochukov@gmail.com</a> with the order email, order or transaction ID, destination, device model and a short description of the issue. Please include screenshots when useful, but never send passwords or full payment-card details.</p></section>
      <section><h2>5. Review and payment</h2><p>We normally acknowledge requests within two business days. Approved refunds are returned to the original payment method. Banks and payment providers may take approximately 5–10 business days to display the funds after approval.</p></section>
      <section><h2>6. Chargebacks</h2><p>Please contact us before starting a payment dispute so we have an opportunity to deliver or fix the service. This does not prevent you from using any rights available through your bank, the payment processor or Merchant of Record displayed at checkout, or applicable law.</p></section>
    </LegalPage>
  );
}
