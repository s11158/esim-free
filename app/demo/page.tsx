import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Product demo — esim.free",
  description: "A short walkthrough of the esim.free prepaid travel eSIM purchase and digital delivery flow.",
  alternates: { canonical: "/demo/" },
};

export default function DemoPage() {
  return (
    <LegalPage eyebrow="Product demo" title="From plan to connection in minutes." lead="This short walkthrough shows what a customer selects, buys and receives when ordering a prepaid travel eSIM from esim.free.">
      <section className="demo-frame">
        <video className="demo-video" controls playsInline preload="metadata" aria-label="esim.free product and delivery walkthrough">
          <source src="/esim-free-product-demo.mp4" type="video/mp4" />
          Your browser cannot play this video. Read the <a href="/product/">written product walkthrough</a> instead.
        </video>
        <p className="demo-note">24 seconds · captions included · no audio required</p>
      </section>

      <section>
        <h2>What the demo covers</h2>
        <ul>
          <li>Selecting a fixed destination, data allowance, validity period and price.</li>
          <li>Completing one payment with no subscription or recurring billing.</li>
          <li>Receiving an eSIM QR activation profile and instructions by email.</li>
          <li>Installing the profile on a compatible, carrier-unlocked device.</li>
          <li>Getting order, activation and refund support from esim.free.</li>
        </ul>
      </section>

      <section>
        <h2>Review information</h2>
        <p>The demo explains the product and digital fulfilment model; it does not simulate or claim an active payment-provider interface. The live checkout will display the approved payment processor or Merchant of Record before a customer pays.</p>
      </section>
    </LegalPage>
  );
}
