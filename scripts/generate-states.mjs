// Downloads Natural Earth admin-1 data and splits into per-country GeoJSON files
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const NE_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson';

async function main() {
  console.log('Downloading admin-1 states data...');
  const res = await fetch(NE_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const geojson = await res.json();

  console.log(`Total features: ${geojson.features.length}`);

  const dir = 'public/geo/states';
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  // Group features by country ISO A2 code
  const byCountry = {};
  for (const feat of geojson.features) {
    const props = feat.properties || {};
    const iso = (props.iso_a2 || props.adm0_a3?.slice(0, 2) || '').toUpperCase();
    if (!iso || iso === '-1' || iso === '-99') continue;

    if (!byCountry[iso]) byCountry[iso] = [];

    // Simplify properties to reduce file size
    byCountry[iso].push({
      type: 'Feature',
      properties: {
        name: props.name || props.NAME || '',
        NAME: props.name || props.NAME || '',
        name_en: props.name_en || props.name || '',
        ISO_3166_2: props.iso_3166_2 || '',
        code: props.iso_3166_2 || `${iso}-${props.name}`,
        type_en: props.type_en || '',
      },
      geometry: feat.geometry,
    });
  }

  let count = 0;
  for (const [iso, features] of Object.entries(byCountry)) {
    const fc = { type: 'FeatureCollection', features };
    writeFileSync(`${dir}/${iso}.json`, JSON.stringify(fc));
    count++;
  }

  console.log(`Generated ${count} country state files`);
}

main().catch(console.error);
