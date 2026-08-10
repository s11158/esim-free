import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Secure checkout — Esim.free",
  description: "Review and pay for your selected Esim.free travel eSIM plan.",
  alternates: { canonical: "/checkout/" },
};

export default function CheckoutPage() {
  return (
    <LegalPage
      eyebrow="Direct Esim.free checkout"
      title="Your eSIM. Your order."
      lead="Review the selected plan and pay Esim.free directly. You will never be sent to an upstream eSIM supplier storefront."
    >
      <CheckoutClient />
    </LegalPage>
  );
}
