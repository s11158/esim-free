import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "eSIM plans and pricing — esim.free",
  description: "Simple prepaid travel eSIM plans sold and supported directly by esim.free.",
  alternates: { canonical: "/pricing/" },
};

const PLANS = [
  { name: "Global 3 Days", duration: "3 days", data: "Unlimited data", coverage: "Up to 180 destinations", price: "$9.99" },
  { name: "Global 7 Days", duration: "7 days", data: "Unlimited data", coverage: "Up to 180 destinations", price: "$19.99", featured: true },
  { name: "Global 14 Days", duration: "14 days", data: "Unlimited data", coverage: "Up to 180 destinations", price: "$27.99" },
  { name: "Global 30 Days", duration: "30 days", data: "Unlimited data", coverage: "Up to 180 destinations", price: "$49.99" },
];

export default function PricingPage() {
  return (
    <LegalPage eyebrow="Clear prepaid pricing" title="Choose once. Connect worldwide." lead="esim.free sells prepaid, data-only travel eSIM plans directly to customers. Every purchase includes digital delivery, activation instructions and customer support.">
      <section className="pricing-grid" id="plans">
        {PLANS.map((plan) => (
          <article className={`pricing-card${plan.featured ? " pricing-card-featured" : ""}`} key={plan.name}>
            {plan.featured && <span className="pricing-badge">Most popular</span>}
            <p>{plan.name}</p>
            <strong>{plan.price}</strong>
            <span>one-time payment</span>
            <ul>
              <li>{plan.data}</li>
              <li>{plan.duration} validity</li>
              <li>{plan.coverage}</li>
              <li>QR delivery by email</li>
              <li>Activation guide and support</li>
            </ul>
            <a href="mailto:staskochukov@gmail.com?subject=esim.free%20plan%20order">Request this plan</a>
          </article>
        ))}
      </section>

      <section>
        <h2>What you are buying</h2>
        <p>All products are prepaid digital eSIM data plans sold by esim.free. They do not include a telephone number, voice calls or SMS unless a specific product explicitly says otherwise. Coverage, speed and supported networks vary by destination and local network conditions.</p>
        <p>The displayed price is the price charged for the selected plan before any tax that must legally be shown at checkout. There are no recurring charges and no automatic renewal.</p>
      </section>

      <section>
        <h2>Delivery and activation</h2>
        <p>After successful payment, the customer receives an eSIM QR code and installation instructions electronically. Most orders are delivered within minutes. A compatible, carrier-unlocked device and internet access for installation are required.</p>
        <p>Secure Paddle Checkout will be connected after Paddle completes the website and account review. Until then, the pricing page is available for product review and purchase enquiries.</p>
      </section>
    </LegalPage>
  );
}
