import { useRef, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { geoMercator, geoPath, geoCentroid } from 'd3-geo';
import { select } from 'd3-selection';
import { useStatesGeo, useCountryDetailGeo } from '../hooks/useGeoData';
import { useTranslation } from 'react-i18next';
import BackArrow from './BackArrow';
import SuggestionModal from './SuggestionModal';
import './CountryPage.css';

/**
 * For projection fitting, filter out geographically distant outlier features
 * (e.g. Alaska/Hawaii for USA, overseas territories for France).
 * Uses IQR-based outlier detection on feature centroids.
 */
function getProjectionFeatures(features: GeoJSON.Feature[]): GeoJSON.Feature[] {
  if (features.length <= 5) return features;

  const centroids = features.map((f) => geoCentroid(f as any));
  const lons = centroids.map((c) => c[0]).slice().sort((a, b) => a - b);
  const lats = centroids.map((c) => c[1]).slice().sort((a, b) => a - b);

  const q1 = (arr: number[]) => arr[Math.floor(arr.length * 0.25)];
  const q3 = (arr: number[]) => arr[Math.floor(arr.length * 0.75)];

  const lonIQR = q3(lons) - q1(lons);
  const latIQR = q3(lats) - q1(lats);
  const lonLow = q1(lons) - 1.5 * lonIQR;
  const lonHigh = q3(lons) + 1.5 * lonIQR;
  const latLow = q1(lats) - 1.5 * latIQR;
  const latHigh = q3(lats) + 1.5 * latIQR;

  const filtered = features.filter((_, i) => {
    const [lon, lat] = centroids[i];
    return lon >= lonLow && lon <= lonHigh && lat >= latLow && lat <= latHigh;
  });

  return filtered.length >= 3 ? filtered : features;
}

export default function CountryPage() {
  const { countryCode } = useParams<{ countryCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const countryName = (location.state as any)?.countryName || countryCode;
  const { data: statesGeo, loading: statesLoading } = useStatesGeo(countryCode);
  const countryDetailGeo = useCountryDetailGeo();

  // Find the country feature for outline
  const countryFeature = useMemo(() => {
    if (!countryDetailGeo || !countryCode) return null;
    return countryDetailGeo.features.find((f) => {
      const props = f.properties || {};
      const iso = props.ISO_A2 || props.iso_a2 || '';
      return iso.toUpperCase() === countryCode.toUpperCase();
    });
  }, [countryDetailGeo, countryCode]);

  // Render SVG map
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const width = window.innerWidth;
    const height = window.innerHeight;
    svg.attr('width', width).attr('height', height);

    // Determine what to render: states if available, otherwise country outline
    const featuresToRender = statesGeo?.features || (countryFeature ? [countryFeature] : []);
    if (featuresToRender.length === 0) return;

    // Use mainland features (without outliers) for projection fitting
    const projFeatures = getProjectionFeatures(featuresToRender);
    const projCollection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: projFeatures,
    };

    const projection = geoMercator().fitExtent(
      [[40, 60], [width - 40, height - 60]],
      projCollection
    );

    const pathGen = geoPath().projection(projection);

    // Draw features
    svg
      .selectAll('path')
      .data(featuresToRender)
      .enter()
      .append('path')
      .attr('d', (d: any) => pathGen(d) || '')
      .attr('fill', 'transparent')
      .attr('stroke', 'var(--fg)')
      .attr('stroke-width', 0.8)
      .attr('opacity', 0.6)
      .style('cursor', statesGeo ? 'pointer' : 'default')
      .style('transition', 'opacity 0.2s, fill 0.2s')
      .on('mouseenter', function (_, d: any) {
        const name = d.properties?.NAME || d.properties?.name || '';
        setHovered(name);
        select(this).attr('opacity', 1).attr('fill', 'rgba(255,255,255,0.1)');
      })
      .on('mouseleave', function () {
        setHovered(null);
        select(this).attr('opacity', 0.6).attr('fill', 'transparent');
      })
      .on('click', (_, d: any) => {
        if (!statesGeo) return;
        const props = d.properties || {};
        const stateName = props.NAME || props.name || 'Unknown';
        const stateCode = props.ISO_3166_2 || props.code || `${countryCode}-${stateName}`;
        navigate(`/country/${countryCode}/state/${encodeURIComponent(stateCode)}`, {
          state: { countryName, stateName },
        });
      });
  }, [statesGeo, countryFeature, countryCode, countryName, navigate]);

  return (
    <div className="country-page" style={{ background: 'var(--bg)' }}>
      <BackArrow to="/" />

      <div className="country-page__title">
        {countryName}
      </div>

      <button
        className="country-page__show-all"
        onClick={() => navigate(`/country/${countryCode}/state/ALL`, {
          state: { countryName, stateName: countryName },
        })}
      >
        {t('country.showAll')}
      </button>

      <button
        className="country-page__suggest"
        onClick={() => setShowSuggestion(true)}
      >
        {t('suggestion.btn')}
      </button>

      {showSuggestion && countryCode && (
        <SuggestionModal
          countryCode={countryCode}
          countryName={countryName}
          onClose={() => setShowSuggestion(false)}
        />
      )}

      {hovered && (
        <div className="country-page__state-label">
          {hovered}
        </div>
      )}

      {statesLoading && (
        <div className="country-page__loading">Loading...</div>
      )}

      {!statesLoading && !statesGeo && (
        <div className="country-page__no-states">
          {t('country.noStates')}
        </div>
      )}

      <svg ref={svgRef} className="country-page__svg" />
    </div>
  );
}
