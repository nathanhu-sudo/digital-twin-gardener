// Public SEO guides. Rendered by src/components/ArticlePage.tsx at /guides/:slug.

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  updated: string;
  readingTime: string;
  tagline: string;
  intro: string[];
  sections: GuideSection[];
  faqs: GuideFaq[];
  ctaAfterSection: number;
}

export const guides: Guide[] = [
  {
    slug: "how-to-reduce-food-waste-at-home",
    title: "How to Reduce Food Waste at Home: 12 Practical Ways That Actually Stick",
    metaTitle: "How to Reduce Food Waste at Home: 12 Practical Ways (2026) | SmartPantry AI",
    description:
      "Food waste starts long before the bin. 12 practical, proven ways to cut kitchen waste at home — smarter shopping, better storage, and using food up in time.",
    updated: "September 2026",
    readingTime: "6 min read",
    tagline: "Most food waste is accidental. These twelve habits stop it before it happens.",
    intro: [
      "The average household throws away a noticeable slice of the food it buys — and most of it was never meant to be thrown away. It went soft in the crisper drawer, hid behind a jar of sauce, or passed its date while nobody was looking.",
      "The good news: food waste is one of the few household problems you can fix almost entirely with habits, not willpower. Here are twelve that work, grouped by where in the week they happen.",
    ],
    sections: [
      {
        heading: "Before you shop: buy less of the wrong things",
        bullets: [
          "Shop your kitchen first. Before writing a list, spend two minutes looking at what you already have — most repeat-buying happens because nobody checked.",
          "Plan around one flexible meal. Plan six dinners tightly and leave one as a 'use it up' night for whatever is left over.",
          "Don't shop hungry, and don't buy for the person you'd like to be. Buy for the week you actually have.",
          "Buy loose where you can. A whole bag of carrots is cheaper per kilo, but only if you eat them all.",
        ],
      },
      {
        heading: "Store it so it lasts",
        bullets: [
          "Know your fridge zones. Dairy and meat like the coldest shelves; the door is the warmest spot, so keep condiments there, not milk.",
          "Keep ethylene producers away from sensitive produce. Apples, bananas and tomatoes ripen everything around them — give them their own spot.",
          "Herbs last for weeks in a jar of water with a loose bag over the top, like a bouquet.",
          "Freeze before it's too late. Bread, grated cheese, chopped onions, ripe bananas, leftover wine — almost anything can be frozen before it turns.",
        ],
      },
      {
        heading: "Use it up in time",
        bullets: [
          "Make a 'eat me first' shelf. Put anything close to expiring at eye level, where it's the first thing you see.",
          "Learn the difference between best-before and use-by. Best-before is about quality — food is usually fine after it. Use-by is about safety — respect it.",
          "Have a leftovers night. One dinner a week made entirely of leftovers clears the fridge and costs nothing.",
          "Keep rescue recipes in your back pocket. Soups, fried rice, frittatas and curries absorb almost any sad vegetable.",
        ],
      },
      {
        heading: "Make it stick",
        bullets: [
          "Do a five-minute weekly pantry audit. Everything gets seen once a week, so nothing expires in secret.",
          "Track what you actually throw away for two weeks. The pattern (usually one or two repeat offenders) tells you exactly what to buy less of.",
          "Let technology remember for you. A pantry app that warns you before food expires means you never have to hold the whole kitchen in your head — that's exactly what SmartPantry AI does: it tracks what you have, nudges you before things expire, and shows you the kilograms you've saved instead of tossed.",
        ],
        paragraphs: [
          "Pick two or three of these to start with — the eat-me-first shelf and the weekly audit give the biggest wins for the least effort. Once those are automatic, add the rest.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the fastest way to reduce food waste at home?",
        a: "Put anything close to its expiry date on a visible 'eat me first' shelf and do a five-minute check of your fridge and pantry once a week. Most household food waste is food that simply got forgotten.",
      },
      {
        q: "Is food past its best-before date safe to eat?",
        a: "Usually yes. Best-before is about peak quality, not safety — dry goods, canned food and many chilled items are fine well past it. Use-by dates, on the other hand, are about safety and should be respected.",
      },
      {
        q: "Do pantry apps actually help reduce waste?",
        a: "They help most with the forgetting problem: knowing what you have, what expires soon, and what to use next. SmartPantry AI adds expiry alerts, recipe ideas from what you already own, and a running tally of the kilograms you've saved.",
      },
    ],
    ctaAfterSection: 2,
  },
  {
    slug: "best-pantry-inventory-app-2026",
    title: "How to Choose a Pantry Inventory App in 2026 (and Why We Built SmartPantry AI Differently)",
    metaTitle: "Best Pantry Inventory App in 2026: How to Choose One | SmartPantry AI",
    description:
      "What separates a pantry inventory app you'll still use in six months from one you delete in a week. What to look for, what to avoid, and how SmartPantry AI compares.",
    updated: "September 2026",
    readingTime: "5 min read",
    tagline: "Most pantry apps fail for the same reason: they ask too much of you. Here's what to look for instead.",
    intro: [
      "A pantry inventory app promises something everyone wants: never again discovering a mouldy pumpkin or buying a third jar of paprika. The problem isn't finding such an app — it's finding one you'll still be using in six months.",
      "Having built one, here's an honest guide to choosing between the options, whether you end up with SmartPantry AI or not.",
    ],
    sections: [
      {
        heading: "The three common approaches (and where each breaks)",
        bullets: [
          "The spreadsheet or notes app. Free and flexible, but nothing in it updates itself — every entry is manual, so it quietly goes stale within weeks.",
          "The barcode-scanner app. Fast to add items, but scanning every grocery trip gets tiring, and most tell you what you have without telling you what to do about it.",
          "The full kitchen-manager app. Powerful, but with meal planning, budgets and shopping lists bolted on, the daily habit gets heavy — and habit is everything here.",
        ],
      },
      {
        heading: "What to look for when you choose",
        bullets: [
          "Fast entry. If adding an item takes more than a few seconds, you'll stop doing it. Look for photo or AI-based scanning, not just barcodes.",
          "Expiry awareness, not just a list. The app should warn you before food expires — the whole point is acting in time.",
          "A reward loop. The apps that survive are the ones that make the habit feel good: progress, streaks, visible impact.",
          "Low-friction weight handling. 'Half a bag of rice' should be as easy to record as a whole one.",
          "Recipes from what you already have. Closing the loop between 'what's expiring' and 'what's for dinner' is where real savings happen.",
          "Privacy you can verify. Your shopping habits say a lot about your life — check that your data stays yours.",
          "A price that matches your use. Free tiers are fine to start; pay only once the habit has stuck.",
        ],
      },
      {
        heading: "How SmartPantry AI approaches it",
        paragraphs: [
          "We built SmartPantry AI around the habit, not the feature list. Adding an item takes seconds — scan the packaging, a photo, or type the name — and the app fills in typical shelf life and weight for you.",
          "From there it works in the background: warnings before things expire, a dashboard showing kilograms consumed versus tossed, recipe ideas built from what's already in your kitchen, weekly challenges with XP for saving food, and a running community total of waste prevented together.",
        ],
        bullets: [
          "Free tier: full pantry tracking for up to 20 items, forever — no card required.",
          "Lite ($29/year) and Pro ($59/year) unlock unlimited items, deeper sustainability analytics and community insights.",
          "Lifetime ($149) for people who'd rather own it once.",
        ],
      },
      {
        heading: "The five-minute test before you commit",
        paragraphs: [
          "Whatever you pick, try this: add five real items from your kitchen, including one half-used packet. If that takes more than two minutes, or the expiry warnings aren't obvious on day one, the app will be gone from your phone within a month. Habits beat features — always.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the best free pantry inventory app?",
        a: "Look for one that keeps the core loop free: adding items fast, expiry warnings, and a clear view of what to use next. SmartPantry AI's free tier includes full tracking for up to 20 items with no payment details required.",
      },
      {
        q: "Are pantry apps worth it?",
        a: "If forgetting food is where your waste comes from, yes — a reminder before something expires is often the difference between eating it and binning it. The habit matters more than the app, so choose one that's fast enough to keep up.",
      },
      {
        q: "Do I have to scan every grocery purchase?",
        a: "No. Barcode scanning is one option, but SmartPantry AI also accepts a photo of the packaging or a quick typed entry, so you can add items however it suits you that day.",
      },
    ],
    ctaAfterSection: 2,
  },
  {
    slug: "pantry-organization-ideas",
    title: "Pantry Organization Ideas That Stop Food Going to Waste",
    metaTitle: "Pantry Organization Ideas That Prevent Food Waste (2026) | SmartPantry AI",
    description:
      "A well-organized pantry is a waste-prevention system in disguise. Zoning, the first-to-go shelf, clear containers and other ideas that keep food visible and used.",
    updated: "September 2026",
    readingTime: "5 min read",
    tagline: "The best pantry system isn't the prettiest one — it's the one where nothing gets forgotten.",
    intro: [
      "Most pantry advice is about aesthetics: matching jars, printed labels, colour-coded shelves. All lovely — but the real job of a pantry is to make sure food gets eaten before it expires. Organize for visibility, and the waste largely takes care of itself.",
    ],
    sections: [
      {
        heading: "Start with a ruthless clear-out",
        paragraphs: [
          "Take everything out once — yes, everything. Check dates, bin what's gone, and notice what you're throwing away: that pattern is your shopping problem in list form. It's a 30-minute job you'll only need to do deeply once or twice a year.",
        ],
      },
      {
        heading: "Zone your shelves by meal, not by type",
        bullets: [
          "Group by use: breakfast shelf, baking shelf, dinner staples, snacks. You'll see gaps and duplicates instantly.",
          "Keep one basket per category so like items stay together when the shelf gets messy again.",
          "Heavy and bulk items low, daily items at eye level, occasional items high.",
        ],
      },
      {
        heading: "The single highest-impact idea: the 'first-to-go' shelf",
        paragraphs: [
          "Reserve one shelf or basket — at eye level — for anything approaching its expiry date. New shopping goes behind it, old shopping lives in front of it. It's first-in, first-out made visible, and it's the closest thing pantry organization has to a magic trick.",
        ],
      },
      {
        heading: "Clear containers and honest labels",
        bullets: [
          "Decant the things you buy in bulk — flour, rice, pasta — into clear containers so you can see the level at a glance.",
          "Label with the opening or expiry date, not just the contents. A jar labelled 'opened March' tells you something a neat label doesn't.",
          "Don't decant what you don't use weekly; half-used specialty items are better left in their packaging, where the dates survive.",
        ],
      },
      {
        heading: "Pair the physical system with a digital one",
        paragraphs: [
          "A pantry can be perfectly organized and still hide an expiring jar of coconut milk behind the rice — shelves only show what's in front. Pairing the system with a digital inventory closes that gap: SmartPantry AI keeps track of what you have and how soon it expires, nudges you before things turn, and suggests recipes from what's already on the shelf, so the organization work you did once keeps paying off every week.",
        ],
      },
    ],
    faqs: [
      {
        q: "How often should I reorganize my pantry?",
        a: "A five-minute reset weekly (put like with like, front the expiring items) and one deep clear-out every six months is enough for most kitchens.",
      },
      {
        q: "How do I organize a small pantry?",
        a: "Go vertical: stackable clear containers and shelf risers double usable space, and keep the 'first-to-go' idea as a single basket even in the smallest cupboard.",
      },
      {
        q: "What's the best container type for pantry storage?",
        a: "Clear, square, airtight. Clear so you can see levels without opening, square because it shelves better than round, and airtight for shelf life. Label everything with the date you opened it.",
      },
    ],
    ctaAfterSection: 3,
  },
];

export function getGuide(slug: string | undefined): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
