import type { APIRoute } from "astro";

export const prerender = false;

const USGS = "https://earthquake.usgs.gov/fdsnws/event/1/query";
const BBOX = { minlat: 0, maxlat: 13, minlon: -74, maxlon: -59 };
const MIN_MAG = 4.0;
const WINDOW_DAYS = 2;

export const GET: APIRoute = async () => {
  const start = new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString();
  const url =
    `${USGS}?format=geojson&orderby=time&minmagnitude=${MIN_MAG}` +
    `&starttime=${start}` +
    `&minlatitude=${BBOX.minlat}&maxlatitude=${BBOX.maxlat}` +
    `&minlongitude=${BBOX.minlon}&maxlongitude=${BBOX.maxlon}`;

  const headers = {
    "content-type": "application/json",
    "cache-control": "s-maxage=1800, stale-while-revalidate=3600",
  };

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "infoayudavenezuela" },
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`USGS ${res.status}`);

    const data = await res.json();
    const sismos = (data.features || []).map((f: any) => ({
      mag: f.properties.mag,
      place: f.properties.place,
      time: f.properties.time,
      url: f.properties.url,
      depth: Array.isArray(f.geometry?.coordinates) ? f.geometry.coordinates[2] : null,
    }));

    const max = sismos.reduce(
      (a: any, b: any) => (b.mag > (a?.mag ?? -Infinity) ? b : a),
      null,
    );

    return new Response(
      JSON.stringify({ count: sismos.length, max, sismos }),
      { headers },
    );
  } catch (err) {
    console.warn("api/sismos: USGS no disponible.", err);
    return new Response(
      JSON.stringify({ count: 0, max: null, sismos: [] }),
      { headers },
    );
  }
};
