import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Do I have to scan every single item?",
    a: "No. Scan barcodes or receipts when it's handy, type items in by hand, or use Quick restock to re-add staples like milk and eggs in one tap.",
  },
  {
    q: "Can my partner or flatmates use it with me?",
    a: "Yes. Create a household and share the invite code — everyone sees the same pantry and shopping list.",
  },
  {
    q: "Can I install it on my iPhone or Android?",
    a: "Yes. SmartPantry AI works in your browser and can be added to your home screen like an app — no app store needed. On iPhone tap Share → Add to Home Screen; on Android tap Install when prompted.",
  },
  {
    q: "How is \"money saved\" worked out?",
    a: "It's an estimate based on typical grocery prices per kilogram for each food type, shown in your local currency. It's a guide, not an exact receipt.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The free plan lets you track your pantry, get expiry alerts and earn rewards. Paid plans add unlimited items and AI features.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Monthly and yearly plans can be cancelled at any time and you keep access until the end of the period you paid for. See our refund policy for details.",
  },
];

export function LandingFAQ() {
  return (
    <section className="container max-w-3xl mx-auto px-4 py-16" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-center mb-8">
        Frequently asked questions
      </h2>
      <div className="rounded-2xl border border-border/50 bg-card/90 backdrop-blur-sm px-5 sm:px-8 shadow-sm">
        <Accordion type="single" collapsible>
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`} className={i === FAQS.length - 1 ? "border-b-0" : ""}>
              <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
