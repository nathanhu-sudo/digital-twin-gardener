import { LegalPage } from "@/components/LegalPage";

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Notice"
      updated="20 September 2026"
      sections={[
        {
          heading: "1. Who we are",
          body: (
            <p>
              SmartPantry AI is operated by Nathan Hu ("we", "us"). For the purposes of privacy law, Nathan Hu is the
              data controller for the personal data described in this notice.
            </p>
          ),
        },
        {
          heading: "2. What we collect",
          body: (
            <>
              <p>We collect the following categories of personal data:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Account data — name, email address, login credentials, profile photo/avatar.</li>
                <li>Pantry and usage data — the grocery items, weights, expiry dates, photos/scans you add, and how you use features (challenges, achievements, leaderboards, AI features).</li>
                <li>Support and communications — messages you send us and notification preferences.</li>
                <li>Technical data — device identifiers, IP address, browser type, and basic usage/telemetry used to keep the Service secure and improve it.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "3. Why we use it (purposes and legal basis)",
          body: (
            <ul className="list-disc pl-5 space-y-1">
              <li>Creating and managing your account — performance of our contract with you.</li>
              <li>Providing the Service (pantry tracking, reminders, analytics, AI features) — performance of contract.</li>
              <li>Security and fraud prevention — our legitimate interests.</li>
              <li>Product improvement and aggregated statistics — our legitimate interests.</li>
              <li>Customer support — performance of contract and legitimate interests.</li>
              <li>Optional notifications and marketing — your consent, which you can withdraw at any time.</li>
              <li>Meeting legal obligations (e.g. tax records) — legal obligation.</li>
            </ul>
          ),
        },
        {
          heading: "4. Who we share it with",
          body: (
            <ul className="list-disc pl-5 space-y-1">
              <li>Service providers and subprocessors that host and operate the Service (cloud hosting, database, and infrastructure providers).</li>
              <li>Paddle, our Merchant of Record, for the sale of our products, subscription management, payment processing, tax compliance, and invoicing.</li>
              <li>Professional advisers (legal, accounting) where needed.</li>
              <li>Authorities where required by law.</li>
            </ul>
          ),
        },
        {
          heading: "5. International transfers",
          body: (
            <p>
              Some of our service providers process data outside New Zealand, the UK, and the EEA. Where data is
              transferred internationally, we rely on appropriate safeguards such as adequacy decisions or standard
              contractual clauses.
            </p>
          ),
        },
        {
          heading: "6. Retention",
          body: (
            <p>
              We keep personal data for as long as your account is active and as needed for the purposes above. When
              data is no longer needed, it is deleted or anonymised. You can ask us to delete your account and data
              at any time.
            </p>
          ),
        },
        {
          heading: "7. Your rights",
          body: (
            <>
              <p>
                Depending on where you live, you may have the right to access, correct, delete, restrict, or port
                your personal data, to object to processing, and to withdraw consent at any time. Where GDPR or UK
                GDPR applies, we respond to requests within one month and you have the right to complain to your
                supervisory authority.
              </p>
              <p>To exercise any of these rights, contact us via the SmartPantry AI app or website.</p>
            </>
          ),
        },
        {
          heading: "8. Security",
          body: (
            <p>
              We apply appropriate technical and organisational measures to protect your data, including encryption
              in transit, access controls, and row-level security on our database.
            </p>
          ),
        },
        {
          heading: "9. Cookies",
          body: (
            <p>
              We use essential cookies and local storage to keep you signed in and remember your preferences. We do
              not use third-party advertising cookies. You can manage cookies through your browser settings; blocking
              essential cookies may prevent sign-in.
            </p>
          ),
        },
        {
          heading: "10. Changes",
          body: (
            <p>
              We may update this notice from time to time. The "last updated" date above shows the latest version;
              material changes will be highlighted in the app.
            </p>
          ),
        },
      ]}
    />
  );
}
