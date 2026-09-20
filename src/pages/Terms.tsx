import { LegalPage } from "@/components/LegalPage";

export default function Terms() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="20 September 2026"
      sections={[
        {
          heading: "1. Who we are",
          body: (
            <>
              <p>
                SmartPantry AI ("the Service") is operated by Nathan Hu ("we", "us", "the Seller"). By creating an
                account or continuing to use the Service, you agree to these Terms & Conditions and confirm you are
                contracting with Nathan Hu.
              </p>
            </>
          ),
        },
        {
          heading: "2. The Service",
          body: (
            <p>
              SmartPantry AI is a pantry-tracking and food-waste reduction application. It lets you track grocery
              items and expiry dates, receive reminders, view sustainability analytics, take part in challenges and
              leaderboards, and use AI-powered features such as recipe suggestions, scanning, and insights. Features
              available to you depend on the plan you select (Free, Lite, Pro, or Lifetime).
            </p>
          ),
        },
        {
          heading: "3. Eligibility and your account",
          body: (
            <>
              <p>You must be of legal age in your jurisdiction to use the Service.</p>
              <p>
                You are responsible for keeping your login credentials confidential and for all activity that occurs
                under your account. You must provide accurate information and keep it up to date.
              </p>
            </>
          ),
        },
        {
          heading: "4. Acceptable use",
          body: (
            <>
              <p>You must not misuse the Service. In particular, you must not:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the Service for any unlawful purpose, fraud, or spam.</li>
                <li>Infringe the intellectual property rights of others.</li>
                <li>Introduce malware, probe or scan our systems, or scrape the Service.</li>
                <li>Reverse engineer, resell, redistribute, or circumvent technical limits of the Service.</li>
                <li>Use AI features to generate illegal content, deepfakes, hate speech, or malware, or to attempt to bypass safety systems.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "5. AI-generated content",
          body: (
            <>
              <p>
                Some features use generative AI (including recipe suggestions, insights, scanning, and chat). AI
                outputs may be inaccurate or incomplete and are not a substitute for professional advice (for
                example, medical, nutritional, or food-safety advice). Always verify outputs — especially expiry
                dates, allergens, and quantities — before relying on them.
              </p>
              <p>
                You are responsible for the content you submit (prompts, photos, scans) and for how you use the
                outputs. You must have the rights to any content you upload. We may remove or restrict content,
                filter or refuse outputs, and suspend accounts that repeatedly infringe others' rights. Rights
                holders may contact us to request takedown of infringing material.
              </p>
            </>
          ),
        },
        {
          heading: "6. Intellectual property",
          body: (
            <p>
              We retain all ownership of the Service and its intellectual property, including the software,
              documentation, and branding. We grant you a limited, non-exclusive, non-transferable right to use the
              Service within your selected plan. You retain ownership of the content you add; you grant us a limited
              licence to host and process it solely to provide the Service.
            </p>
          ),
        },
        {
          heading: "7. Payments, subscriptions and refunds",
          body: (
            <>
              <p>
                Paid plans (Lite, Pro, Lifetime) are billed through our payment provider. Payment, billing, tax,
                cancellation, and refund mechanics are governed by Paddle's Buyer Terms, available at{" "}
                <a
                  href="https://www.paddle.com/legal/checkout-buyer-terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  https://www.paddle.com/legal/checkout-buyer-terms
                </a>
                .
              </p>
              <p>
                Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of
                Record for all our orders. Paddle provides all customer service inquiries and handles returns.
              </p>
              <p>
                Subscriptions renew automatically at the chosen billing frequency until cancelled. You can cancel at
                any time; access continues until the end of the paid period. See our Refund Policy for details.
              </p>
            </>
          ),
        },
        {
          heading: "8. Service availability",
          body: (
            <p>
              We do not guarantee that the Service will be uninterrupted or error-free. The Service is provided "as
              is" and, to the fullest extent permitted by law, we disclaim all implied warranties, including
              merchantability and fitness for a particular purpose.
            </p>
          ),
        },
        {
          heading: "9. Suspension and termination",
          body: (
            <p>
              We may suspend or terminate your access to the Service for material breach of these terms, non-payment,
              security or fraud risk, or repeated or serious violations of our policies. When your access ends, your
              data may be deleted after a reasonable period; you may contact us before termination to request an
              export.
            </p>
          ),
        },
        {
          heading: "10. Liability",
          body: (
            <>
              <p>
                To the fullest extent permitted by law, we are not liable for indirect, consequential, or special
                damages (including loss of profits, data, or goodwill). Our aggregate liability is capped at the fees
                you paid in the 12 months before the claim. Nothing in these terms excludes liability for fraud,
                death, or personal injury where such exclusion is not permitted by law.
              </p>
              <p>
                You indemnify us against claims arising from your content, your unlawful use of the Service, or your
                breach of these terms.
              </p>
            </>
          ),
        },
        {
          heading: "11. General",
          body: (
            <>
              <p>
                These terms are governed by the laws of New Zealand, and disputes will be resolved in the courts of
                New Zealand. You may not assign these terms without our consent; we may assign them in connection
                with a merger or acquisition. We are not liable for failures caused by events beyond our reasonable
                control.
              </p>
              <p>Questions about these terms? Contact us via the SmartPantry AI app or website.</p>
            </>
          ),
        },
      ]}
    />
  );
}
