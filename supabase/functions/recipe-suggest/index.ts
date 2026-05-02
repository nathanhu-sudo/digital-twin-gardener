import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No pantry items provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Sort to prioritize expiring soon
    const sorted = [...items].sort((a: any, b: any) => (a.daysRemaining ?? 99) - (b.daysRemaining ?? 99));
    const itemList = sorted
      .map((i: any) => `- ${i.name} (${i.weightKg}kg, ${i.daysRemaining} days left)`)
      .join("\n");

    const systemPrompt = `You are a creative, practical home chef helping users reduce food waste. Suggest 3 simple recipes using primarily the ingredients provided. PRIORITIZE items expiring soonest. You may assume common pantry staples (oil, salt, pepper, garlic, onion, spices, flour, eggs) are available, but call them out as "pantry staples" in extras.`;

    const userPrompt = `Here is what's in my pantry:\n${itemList}\n\nSuggest 3 recipes I can make tonight. Prioritize using items that expire soonest.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_recipes",
              description: "Return 3 recipe suggestions",
              parameters: {
                type: "object",
                properties: {
                  recipes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Recipe name" },
                        description: { type: "string", description: "1-sentence appetizing description" },
                        prepTimeMinutes: { type: "number" },
                        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                        usesItems: {
                          type: "array",
                          items: { type: "string" },
                          description: "Pantry items used from the provided list",
                        },
                        extras: {
                          type: "array",
                          items: { type: "string" },
                          description: "Extra ingredients needed (mark pantry staples)",
                        },
                        steps: {
                          type: "array",
                          items: { type: "string" },
                          description: "Concise cooking steps (4-6 steps)",
                        },
                      },
                      required: ["title", "description", "prepTimeMinutes", "difficulty", "usesItems", "extras", "steps"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["recipes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_recipes" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No recipes returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recipe-suggest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
