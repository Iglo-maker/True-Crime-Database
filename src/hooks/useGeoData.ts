import { useState, useEffect } from 'react';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';

const BASE = import.meta.env.BASE_URL;

export function useCountriesGeo() {
  const [data, setData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch(`${BASE}geo/countries-110m.json`)
      .then((r) => r.json())
      .then((topo: Topology) => {
        const countries = feature(topo, topo.objects.countries) as GeoJSON.FeatureCollection;
        setData(countries);
      })
      .catch(console.error);
  }, []);

  return data;
}

export function useCountryDetailGeo() {
  const [data, setData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch(`${BASE}geo/countries-50m.json`)
      .then((r) => r.json())
      .then((topo: Topology) => {
        const countries = feature(topo, topo.objects.countries) as GeoJSON.FeatureCollection;
        setData(countries);
      })
      .catch(console.error);
  }, []);

  return data;
}

export function useStatesGeo(countryCode: string | undefined) {
  const [data, setData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!countryCode) return;
    setLoading(true);
    setData(null);

    fetch(`${BASE}geo/states/${countryCode.toUpperCase()}.json`)
      .then((r) => {
        if (!r.ok) throw new Error('No state data');
        return r.json();
      })
      .then((geojson: GeoJSON.FeatureCollection) => {
        setData(geojson);
      })
      .catch(() => {
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [countryCode]);

  return { data, loading };
}
