import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Product and delivery — esim.free",
  description: "What esim.free sells, how prepaid travel eSIM products are delivered and what customers need to use them.",
  alternates: { canonical: "/product/" },
};

export default function ProductPage() {
  return (
    <LegalPage eyebrow="Product overview" title="A premade travel eSIM, delivered digitally." lead="esim.free sells fixed prepaid mobile-data plans for compatible eSIM devices. Choose a destination and plan once; there is no subscription or physical delivery.">
      <section>
        <h2>Exactly what we sell</h2>
        <p>Each product is a premade, data-only travel eSIM plan with a stated destination or region, data allowance, validity period and one-time USD price. The catalogue is standardised: we do not sell consultations, custom development, personalised services, physical SIM cards, trials or recurring subscriptions.</p>
        <p>Unless a product explicitly says otherwise, it does not include a telephone number, voice calls or SMS.</p>
      </section>

      <section>
        <h2>How an order works</h2>
        <ol>
          <li>Choose a destination and a plan on the <a href="/pricing/">pricing page</a>.</li>
          <li>Confirm device compatibility, coverage, data allowance, validity and final price.</li>
          <li>Complete the one-time payment through the secure checkout displayed on the site.</li>
          <li>Receive the eSIM QR code or manual activation details and installation guide by email.</li>
          <li>Install the profile on a compatible, carrier-unlocked device and activate it according to the supplied instructions.</li>
        </ol>
        <p>Watch the short <a href="/demo/">product demo</a> for the complete customer journey.</p>
      </section>

      <section>
        <h2>Digital fulfilment</h2>
        <p>No item is shipped. After successful payment and provisioning, the activation profile is delivered electronically, normally within minutes. A payment or provisioning review, incorrect email address or temporary network-supplier issue may delay delivery.</p>
        <p>If a paid plan cannot be provisioned, we will offer an equivalent replacement or refund it under the <a href="/refunds/">Refund Policy</a>.</p>
      </section>

      <section>
        <h2>Who provides the service</h2>
        <p>esim.free is the customer-facing store, seller and support contact. We source eSIM provisioning and mobile connectivity from upstream technology and network suppliers, then offer selected fixed plans in our own catalogue. Customers purchase from esim.free rather than being redirected to an external supplier storefront.</p>
      </section>

      <section>
        <h2>What the customer needs</h2>
        <ul>
          <li>An eSIM-compatible, carrier-unlocked phone, tablet or computer.</li>
          <li>Reliable internet access during installation.</li>
          <li>A valid email address for digital delivery.</li>
          <li>A device and location supported by the selected plan.</li>
        </ul>
      </section>

      <section>
        <h2>Support</h2>
        <p>For plan selection, delivery, installation, connectivity or refund questions, use the <a href="/contact/">contact page</a> or email <a href="mailto:staskochukov@gmail.com">staskochukov@gmail.com</a>.</p>
      </section>
    </LegalPage>
  );
}
