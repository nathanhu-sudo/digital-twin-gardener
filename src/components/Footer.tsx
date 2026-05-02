const Footer = () => (
  <footer className="w-full py-6 px-4 text-center text-xs text-muted-foreground border-t bg-background/80 backdrop-blur-sm space-y-2">
    <p>© {new Date().getFullYear()} SmartPantry AI. All rights reserved.</p>
    <p className="max-w-2xl mx-auto leading-relaxed">
      Powered by{" "}
      <span className="font-medium text-foreground">Lovable Cloud</span> &{" "}
      <span className="font-medium text-foreground">Lovable AI Gateway</span> · AI by{" "}
      <span className="font-medium text-foreground">Google Gemini 2.5 Pro</span> (chat & vision) and{" "}
      <span className="font-medium text-foreground">OpenAI GPT-5 Mini</span> (insights & recipes) · Built with{" "}
      <span className="font-medium text-foreground">React</span>,{" "}
      <span className="font-medium text-foreground">Vite</span>,{" "}
      <span className="font-medium text-foreground">TypeScript</span>,{" "}
      <span className="font-medium text-foreground">Tailwind CSS</span> &{" "}
      <span className="font-medium text-foreground">shadcn/ui</span> · Backend on{" "}
      <span className="font-medium text-foreground">Supabase</span> (Postgres, Auth, Edge Functions, Storage) · Food data from{" "}
      <span className="font-medium text-foreground">Open Food Facts</span> · Icons by{" "}
      <span className="font-medium text-foreground">Lucide</span> · Charts by{" "}
      <span className="font-medium text-foreground">Recharts</span>
    </p>
    <p className="text-[10px] opacity-70">
      All third-party trademarks are property of their respective owners. SmartPantry AI is an independent product and is not affiliated with Google, OpenAI, or Supabase.
    </p>
  </footer>
);

export default Footer;
