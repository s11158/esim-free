import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "eSIM plans and pricing — esim.free",
  description: "Simple prepaid travel eSIM plans sold and supported directly by esim.free.",
  alternates: { canonical: "/pricing/" },
};

const PLANS = [
  { id: "pricing-turkey-10gb", name: "Turkey", duration: "14 days", data: "10 GB", coverage: "Turkey", price: 2.13, featured: true },
  { id: "pricing-vietnam-20gb", name: "Vietnam", duration: "15 days", data: "20 GB", coverage: "Vietnam", price: 6.21 },
  { id: "pricing-canada-75gb", name: "Canada", duration: "30 days", data: "75 GB", coverage: "Canada", price: 22 },
  { id: "pricing-uae-50gb", name: "United Arab Emirates", duration: "20 days", data: "50 GB", coverage: "United Arab Emirates", price: 45 },
];

function checkoutHref(plan: (typeof PLANS)[number]) {
  const params = new URLSearchParams({
    plan: plan.id,
    destination: plan.coverage,
    data: plan.data,
    validity: plan.duration,
    price: plan.price.toFixed(2),
  });
  return `/checkout/?${params.toString()}`;
}

export default function PricingPage() {
  return (
    <LegalPage eyebrow="Clear prepaid pricing" title="One payment. No subscription." lead="esim.free sells fixed, premade, data-only travel eSIM plans directly to customers. Each product includes digital delivery, installation instructions and customer support.">
      <section className="pricing-grid" id="plans">
        {PLANS.map((plan) => (
          <article className={`pricing-card${plan.featured ? " pricing-card-featured" : ""}`} key={plan.name}>
            {plan.featured && <span className="pricing-badge">Most popular</span>}
            <p>{plan.name}</p>
            <strong>${plan.price.toFixed(2)}</strong>
            <span>one-time payment</span>
            <ul>
              <li>Country: {plan.coverage}</li>
              <li>Validity: {plan.duration}</li>
              <li>Data: {plan.data}</li>
            </ul>
            <a href={checkoutHref(plan)}>Buy from esim.free</a>
          </article>
        ))}
      </section>

      <section>
        <h2>What you are buying</h2>
        <p>All listed products are premade prepaid digital eSIM data plans sold and supported by esim.free. They are fixed catalogue products, not consultations, custom work or personalised services. They do not include a telephone number, voice calls or SMS unless a product explicitly says otherwise.</p>
        <p>The displayed USD price is the one-time price for the selected plan before any tax that must legally be shown at checkout. There are no subscriptions, trials, recurring charges or automatic renewals.</p>
      </section>

      <section>
        <h2>Delivery and activation</h2>
        <p>After successful payment, the customer receives an eSIM QR code and installation instructions electronically. Most orders are delivered within minutes. A compatible, carrier-unlocked device and internet access for installation are required.</p>
        <p>Every purchase starts in the esim.free checkout with the selected product, price and destination already filled in. No order button redirects to an upstream eSIM supplier.</p>
      </section>

      <section>
        <h2>Availability</h2>
        <p>Plans depend on destination network capacity and eSIM provisioning availability. If a selected product becomes unavailable before fulfilment, we will offer an equivalent replacement or a full refund. See the <a href="/product/">product and delivery explanation</a> and <a href="/refunds/">Refund Policy</a> before ordering.</p>
      </section>
    </LegalPage>
  );
}
