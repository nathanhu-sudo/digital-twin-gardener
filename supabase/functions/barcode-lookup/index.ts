const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ProductResult {
  name: string;
  weightKg: number;
  shelfLifeDays: number;
  co2Impact: 'high' | 'medium' | 'low';
  source: string;
  imageUrl?: string;
  brand?: string;
  categories?: string;
  originCountry?: string;
}

function estimateCo2Impact(categories: string = ''): 'high' | 'medium' | 'low' {
  const cats = categories.toLowerCase();
  if (cats.match(/beef|lamb|veal|meat|steak|mince/)) return 'high';
  if (cats.match(/cheese|butter|cream|dairy|milk|chocolate|pork|chicken|fish|seafood/)) return 'medium';
  return 'low';
}

function estimateShelfLife(categories: string = ''): number {
  const cats = categories.toLowerCase();
  if (cats.match(/fresh.*meat|mince|chicken.*fresh|fish.*fresh|seafood.*fresh/)) return 3;
  if (cats.match(/milk|yogurt|yoghurt|cream/)) return 7;
  if (cats.match(/bread|bakery|baked/)) return 5;
  if (cats.match(/fresh.*fruit|fresh.*vegetable|salad|berries/)) return 5;
  if (cats.match(/cheese/)) return 21;
  if (cats.match(/frozen/)) return 180;
  if (cats.match(/canned|tinned|preserved|pickled/)) return 730;
  if (cats.match(/dried|pasta|rice|cereal|grain|flour|sugar|spice|condiment|sauce|oil/)) return 365;
  if (cats.match(/juice|beverage|drink|water|soda/)) return 90;
  return 14; // default
}

function parseWeight(product: any): number {
  // Try quantity field first
  const quantity = product.quantity || product.product_quantity;
  if (quantity) {
    const match = String(quantity).match(/([\d.]+)\s*(kg|g|ml|l|oz|lb)/i);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      if (unit === 'kg' || unit === 'l') return val;
      if (unit === 'g' || unit === 'ml') return val / 1000;
      if (unit === 'oz') return val * 0.0283495;
      if (unit === 'lb') return val * 0.453592;
    }
    // Try just a number (assumed grams)
    const numMatch = String(quantity).match(/([\d.]+)/);
    if (numMatch) {
      const val = parseFloat(numMatch[1]);
      return val > 10 ? val / 1000 : val; // if > 10, likely grams
    }
  }
  return 0.3; // default
}

async function lookupOpenFoodFacts(barcode: string): Promise<ProductResult | null> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const categories = p.categories || p.categories_tags?.join(', ') || '';

    return {
      name: p.product_name || p.product_name_en || 'Unknown Product',
      weightKg: parseWeight(p),
      shelfLifeDays: estimateShelfLife(categories),
      co2Impact: estimateCo2Impact(categories),
      source: 'Open Food Facts',
      imageUrl: p.image_front_small_url || p.image_url || undefined,
      brand: p.brands || undefined,
      categories,
      originCountry: p.countries || p.origins || undefined,
    };
  } catch (e) {
    console.error('Open Food Facts error:', e);
    return null;
  }
}

async function lookupNZDatabase(barcode: string): Promise<ProductResult | null> {
  try {
    // Query Open Food Facts with NZ-specific endpoint
    const res = await fetch(`https://world.openfoodfacts.net/api/v2/product/${barcode}.json?fields=product_name,brands,quantity,categories,image_front_small_url,countries,origins`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const countries = (p.countries || '').toLowerCase();
    // Only return if it's from NZ
    if (!countries.includes('new zealand') && !countries.includes('nz')) return null;

    const categories = p.categories || '';
    return {
      name: p.product_name || 'Unknown Product',
      weightKg: parseWeight(p),
      shelfLifeDays: estimateShelfLife(categories),
      co2Impact: estimateCo2Impact(categories),
      source: 'NZ Food Database',
      imageUrl: p.image_front_small_url || undefined,
      brand: p.brands || undefined,
      categories,
      originCountry: 'New Zealand',
    };
  } catch (e) {
    console.error('NZ database error:', e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode } = await req.json();
    if (!barcode || typeof barcode !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Barcode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Looking up barcode:', barcode);

    // Query both sources in parallel
    const [offResult, nzResult] = await Promise.all([
      lookupOpenFoodFacts(barcode),
      lookupNZDatabase(barcode),
    ]);

    // Prefer NZ result if available, fall back to Open Food Facts
    const result = nzResult || offResult;

    if (!result) {
      return new Response(
        JSON.stringify({ success: false, error: 'Product not found in any database' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found product:', result.name, 'from', result.source);

    return new Response(
      JSON.stringify({ success: true, product: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to look up barcode' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
