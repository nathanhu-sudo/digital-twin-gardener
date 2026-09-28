// Public SEO landing pages targeting high-intent keywords.
// Rendered by src/components/KeywordPage.tsx at /:slug.

export interface KeywordPageSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface KeywordPageFaq {
  q: string;
  a: string;
}

export interface KeywordPage {
  slug: string;
  keyword: string;
  metaTitle: string;
  description: string;
  h1: string;
  tagline: string;
  intro: string[];
  sections: KeywordPageSection[];
  faqs: KeywordPageFaq[];
}

export const keywordPages: KeywordPage[] = [
  {
    slug: "pantry-inventory-app",
    keyword: "pantry inventory app",
    metaTitle: "Pantry Inventory App — Track Your Kitchen, Waste Less | SmartPantry AI",
    description:
      "SmartPantry AI is a pantry inventory app that tracks what's in your kitchen, warns you before food expires, and suggests recipes from what you already own. Free to start.",
    h1: "A pantry inventory app that actually keeps up with your kitchen",
    tagline: "Know what you have, what expires soon, and what's for dinner — without a spreadsheet.",
    intro: [
      "Most households lose track of what's in their own kitchen. The pasta behind the rice, the yogurt at the back of the fridge, the third jar of paprika bought because nobody checked. A pantry inventory app fixes that by keeping a live record of what you own — and more importantly, what needs eating soon.",
      "SmartPantry AI is built around that one job. Add items in seconds, get warned before anything expires, and see the kilograms you've saved instead of tossed.",
    ],
    sections: [
      {
        heading: "Add items in seconds, not minutes",
        paragraphs: [
          "The reason most pantry apps get abandoned is data entry. SmartPantry AI removes the friction: scan the barcode, snap a photo of the packaging, or just type the name. The app fills in the typical shelf life and weight for you, so a whole grocery trip takes a couple of minutes to log.",
        ],
        bullets: [
          "Barcode scanning with a food database of millions of products",
          "Photo scanning that reads packaging for you",
          "Quick manual entry with sensible defaults for weight and expiry",
        ],
      },
      {
        heading: "Expiry warnings before it's too late",
        paragraphs: [
          "A list of what you own is only half the job. SmartPantry AI watches every item's expiry date and nudges you while there's still time to cook it — in the app, and by email if you want. The 'use me first' view puts whatever's most urgent at the top, so dinner decisions start with what needs saving.",
        ],
      },
      {
        heading: "Recipes from what's already in your kitchen",
        paragraphs: [
          "Knowing the spinach is wilting is only useful if you know what to do with it. SmartPantry AI suggests recipes built from the ingredients you actually have, prioritising the ones closest to expiring — so 'what's for dinner' and 'what needs using up' become the same question.",
        ],
      },
      {
        heading: "See the impact, kilogram by kilogram",
        bullets: [
          "A dashboard showing kilograms consumed versus tossed",
          "Weekly challenges and XP that make saving food a habit",
          "CO₂ estimates for the food you've kept out of the bin",
          "A community total showing waste prevented together",
        ],
      },
      {
        heading: "Free to start, fair to upgrade",
        paragraphs: [
          "The free tier includes full pantry tracking for up to 20 items, forever — no credit card required. When the habit sticks, Lite and Pro unlock unlimited items and deeper sustainability analytics, and a Lifetime option covers everything for a single payment.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a pantry inventory app?",
        a: "An app that keeps a live record of the food in your kitchen — what you have, how much, and when it expires — so nothing gets forgotten and thrown away.",
      },
      {
        q: "Is SmartPantry AI free?",
        a: "Yes. The free tier tracks up to 20 items with expiry warnings and no payment details required. Paid plans unlock unlimited items and deeper analytics.",
      },
      {
        q: "Do I have to scan every item I buy?",
        a: "No. Barcode scanning is one option, but you can also photograph the packaging or type the name — whatever is fastest that day.",
      },
    ],
  },
  {
    slug: "food-waste-app",
    keyword: "food waste app",
    metaTitle: "Food Waste App — Stop Throwing Away Good Food | SmartPantry AI",
    description:
      "SmartPantry AI is a food waste app that warns you before groceries expire, suggests recipes from what you have, and shows the kilograms and CO₂ you've saved. Free to start.",
    h1: "The food waste app that stops waste before it happens",
    tagline: "Most food waste is accidental. SmartPantry AI makes sure you hear about it in time.",
    intro: [
      "The average household throws away a real slice of the food it buys — and most of it was never meant for the bin. It went soft in the crisper, hid behind a jar of sauce, or passed its date while nobody was looking. That's the problem a food waste app should solve: not tracking guilt, but catching food while it's still good.",
      "SmartPantry AI works in the background of your kitchen: it knows what you have, warns you before anything expires, and helps you turn 'about to go off' into dinner.",
    ],
    sections: [
      {
        heading: "Catch food while it's still good",
        paragraphs: [
          "Every item you add gets a shelf life, and the app watches the dates so you don't have to. You get a nudge while there's still time to act — in the app and by email — and the 'use me first' view keeps the most urgent items at the top of every decision.",
        ],
      },
      {
        heading: "Turn expiring food into dinner",
        paragraphs: [
          "The gap between 'this is about to expire' and 'this is dinner' is where most waste happens. SmartPantry AI suggests recipes from the ingredients you already own, prioritising whatever needs using first — so saving food stops feeling like a chore.",
        ],
      },
      {
        heading: "Make the habit stick",
        bullets: [
          "Weekly challenges with XP for saving food",
          "Streaks and badges that reward consistency",
          "A running total of kilograms saved versus tossed",
          "A community counter showing waste prevented together",
        ],
      },
      {
        heading: "Why it works when willpower doesn't",
        paragraphs: [
          "Food waste isn't a knowledge problem — everyone knows they shouldn't throw food away. It's a memory problem. SmartPantry AI holds the whole kitchen in its head so you don't have to: what you bought, when it expires, and what to cook first. Two minutes of logging after a shop replaces the mental list that never quite worked.",
        ],
      },
      {
        heading: "Free to start",
        paragraphs: [
          "Full tracking for up to 20 items, forever, with no credit card. Lite and Pro unlock unlimited items, sustainability analytics and community insights, and a Lifetime option covers everything in one payment.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do food waste apps actually work?",
        a: "They work best on the forgetting problem — knowing what you have and what expires soon. If that's where your waste comes from, a reminder in time is often the difference between eating food and binning it.",
      },
      {
        q: "How much money can a food waste app save?",
        a: "It depends on how much you currently throw away, but food you stop binning is food you don't buy again — even a small weekly reduction adds up to a meaningful amount over a year.",
      },
      {
        q: "Is SmartPantry AI free?",
        a: "Yes — the free tier tracks up to 20 items with expiry warnings, no payment details required.",
      },
    ],
  },
];

export function getKeywordPage(slug: string | undefined): KeywordPage | undefined {
  return keywordPages.find((p) => p.slug === slug);
}
