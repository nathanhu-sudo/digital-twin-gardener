import { LegalPage } from "@/components/LegalPage";

export default function Refund() {
  return (
    <LegalPage
      title="Refund Policy"
      updated="20 September 2026"
      sections={[
        {
          heading: "30-day money-back guarantee",
          body: (
            <p>
              We offer a 30-day money-back guarantee. If you're not satisfied with your purchase of a SmartPantry AI
              Lite, Pro, or Lifetime plan, you can request a full refund within 30 days of your order date.
            </p>
          ),
        },
        {
          heading: "How to request a refund",
          body: (
            <>
              <p>
                Refunds are processed by our payment provider and Merchant of Record, Paddle. To request a refund,
                visit{" "}
                <a
                  href="https://paddle.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  paddle.net
                </a>{" "}
                and look up your order, or contact us through the SmartPantry AI app and we'll help you.
              </p>
              <p>Approved refunds are returned to your original payment method.</p>
            </>
          ),
        },
        {
          heading: "Subscriptions",
          body: (
            <p>
              You can cancel a Lite or Pro subscription at any time. Cancellation stops future renewals; your paid
              features remain active until the end of the current billing period. Cancelling a subscription does not
              automatically refund the current period — use the 30-day guarantee above if you're within the window.
            </p>
          ),
        },
        {
          heading: "Questions",
          body: (
            <p>
              If you have any questions about a charge or a refund, contact us via the SmartPantry AI app or website
              and we'll be happy to help.
            </p>
          ),
        },
      ]}
    />
  );
}
