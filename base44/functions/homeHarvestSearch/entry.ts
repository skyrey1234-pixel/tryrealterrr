import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const location = (body.location || '').trim();
    if (!location) return Response.json({ error: 'A location (zip, city, or address) is required.' }, { status: 400 });

    const baseUrl = (secrets.get('HOMEHARVEST_API_URL') || '').replace(/\/+$/, '');
    if (!baseUrl) return Response.json({ error: 'HOMEHARVEST_API_URL is not configured.' }, { status: 500 });

    const params = new URLSearchParams({
      location,
      listing_type: body.listing_type || 'for_sale',
    });
    if (body.past_days) params.set('past_days', String(body.past_days));
    if (body.radius) params.set('radius', String(body.radius));

    const headers = { Accept: 'application/json' };
    const apiKey = secrets.get('HOMEHARVEST_API_KEY');
    if (apiKey && apiKey !== 'none') headers['x-api-key'] = apiKey;

    const res = await fetch(`${baseUrl}/search?${params.toString()}`, { headers });
    const text = await res.text();
    if (!res.ok) {
      return Response.json({ error: `HomeHarvest service returned ${res.status}: ${text.slice(0, 300)}` }, { status: 502 });
    }

    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      return Response.json({ error: 'HomeHarvest service did not return JSON.' }, { status: 502 });
    }

    const rows = Array.isArray(payload) ? payload : (payload.properties || payload.results || payload.data || []);

    const properties = rows.map((r) => ({
      address: r.address || [r.street, r.unit].filter(Boolean).join(' ') || r.full_street_line || '',
      city: r.city || '',
      state: r.state || '',
      zip: r.zip_code || r.zip || '',
      price: r.list_price ?? r.sold_price ?? r.price ?? null,
      sold_price: r.sold_price ?? null,
      bedrooms: r.beds ?? r.bedrooms ?? null,
      bathrooms: (r.full_baths ?? 0) + (r.half_baths ? r.half_baths * 0.5 : 0) || r.baths || r.bathrooms || null,
      sqft: r.sqft ?? r.living_area ?? null,
      year_built: r.year_built ?? null,
      days_on_market: r.days_on_mls ?? r.days_on_market ?? null,
      status: r.status || '',
      property_type: r.style || r.property_type || '',
      photo_url: r.primary_photo || r.photo_url || (Array.isArray(r.alt_photos) ? r.alt_photos[0] : '') || '',
      listing_url: r.property_url || r.url || '',
    }));

    return Response.json({ count: properties.length, properties });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}