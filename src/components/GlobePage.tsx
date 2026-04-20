import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { useCountriesGeo } from '../hooks/useGeoData';
import { useTheme } from '../contexts/ThemeContext';
import BackArrow from './BackArrow';
import GlobeControls from './GlobeControls';
import './GlobePage.css';

const DAY_IMG = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

function getCountryCode(feat: GeoJSON.Feature): string {
  const props = feat.properties || {};
  return props.ISO_A2 || props.iso_a2 || props.ADM0_A3?.slice(0, 2) || '';
}

function getCountryName(feat: GeoJSON.Feature): string {
  const props = feat.properties || {};
  return props.NAME || props.name || props.ADMIN || '';
}

const SUN_ORBIT_RADIUS = 300;
const SUN_SIZE = 12;
const MOON_SIZE = 5;

export default function GlobePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { inverted } = useTheme();
  const countriesGeo = useCountriesGeo();
  const globeRef = useRef<any>(null);
  const sunRef = useRef<THREE.Mesh | null>(null);
  const moonRef = useRef<THREE.Mesh | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sunAngleRef = useRef(0);
  const manualSunRef = useRef(false);

  const [rotating, setRotating] = useState(true);
  const [speed, setSpeed] = useState(0.3);
  const [sunPosition, setSunPosition] = useState(1);
  const [hovered, setHovered] = useState<GeoJSON.Feature | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Always use day texture — DirectionalLight creates the day/night shadow naturally
  const globeImage = DAY_IMG;

  // Set up rotation controls
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = rotating;
        controls.autoRotateSpeed = speed;
      }
    }
  }, [rotating, speed]);

  // Add Sun, Moon, and DirectionalLight to scene
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    // Wait for scene to be ready
    const timer = setTimeout(() => {
      const scene = globe.scene();
      if (!scene) return;

      // Dim/remove default lights from react-globe.gl
      const toRemove: THREE.Object3D[] = [];
      scene.traverse((child: THREE.Object3D) => {
        if ((child as any).isAmbientLight) {
          (child as THREE.AmbientLight).intensity = 0.4;
        } else if ((child as any).isDirectionalLight) {
          toRemove.push(child);
        }
      });
      toRemove.forEach((l) => scene.remove(l));

      // Sun mesh
      const sunGeo = new THREE.SphereGeometry(SUN_SIZE, 24, 24);
      const sunMat = new THREE.MeshBasicMaterial({
        color: 0xffdd44,
        transparent: true,
        opacity: 0.95,
      });
      const sun = new THREE.Mesh(sunGeo, sunMat);
      sun.position.set(SUN_ORBIT_RADIUS, 0, 0);
      scene.add(sun);
      sunRef.current = sun;

      // Sun glow
      const glowGeo = new THREE.SphereGeometry(SUN_SIZE * 2.2, 24, 24);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffee88,
        transparent: true,
        opacity: 0.12,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      sun.add(glow);

      // DirectionalLight from sun → globe center (parallel rays like real sunlight)
      const sunLight = new THREE.DirectionalLight(0xffffee, 1.8);
      sunLight.position.copy(sun.position);
      sunLight.target.position.set(0, 0, 0);
      scene.add(sunLight);
      scene.add(sunLight.target);
      sunLightRef.current = sunLight;

      // Moon mesh
      const moonGeo = new THREE.SphereGeometry(MOON_SIZE, 16, 16);
      const moonMat = new THREE.MeshBasicMaterial({
        color: 0xccccdd,
        transparent: true,
        opacity: 0.9,
      });
      const moon = new THREE.Mesh(moonGeo, moonMat);
      moon.position.set(-SUN_ORBIT_RADIUS, 0, 0);
      scene.add(moon);
      moonRef.current = moon;

      // Faint moon light (reflected glow)
      const moonLight = new THREE.PointLight(0x8888bb, 0.08, SUN_ORBIT_RADIUS * 2);
      moon.add(moonLight);

      // Initial angle based on time of day
      const hours = new Date().getHours();
      sunAngleRef.current = ((hours - 6) / 24) * Math.PI * 2;
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Animation loop for sun/moon orbit
  useEffect(() => {
    let animId: number;

    const animate = () => {
      if (!manualSunRef.current) {
        // Natural progression: very slow orbit
        sunAngleRef.current += 0.001;
      }

      const angle = sunAngleRef.current;
      const x = Math.cos(angle) * SUN_ORBIT_RADIUS;
      const y = Math.sin(angle) * SUN_ORBIT_RADIUS * 0.4; // Slight tilt
      const z = Math.sin(angle) * SUN_ORBIT_RADIUS * 0.7;

      if (sunRef.current) {
        sunRef.current.position.set(x, y, z);
      }
      if (sunLightRef.current) {
        sunLightRef.current.position.set(x, y, z);
      }
      if (moonRef.current) {
        moonRef.current.position.set(-x, -y, -z);
      }

      // Update sunPosition state for texture switching (throttled)
      if (!manualSunRef.current) {
        const normalizedY = (Math.sin(angle) + 1) / 2;
        // Only update if value changed significantly (avoid re-renders)
        setSunPosition((prev) => {
          const newVal = Math.round(normalizedY * 100) / 100;
          return Math.abs(prev - newVal) > 0.05 ? newVal : prev;
        });
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Handle manual sun position change from slider
  const handleSunChange = useCallback((val: number) => {
    manualSunRef.current = true;
    setSunPosition(val);
    // Map slider (0-1) to angle
    sunAngleRef.current = Math.asin(val * 2 - 1);

    // Reset manual override after 3 seconds of no interaction
    clearTimeout((handleSunChange as any)._timer);
    (handleSunChange as any)._timer = setTimeout(() => {
      manualSunRef.current = false;
    }, 3000);
  }, []);

  const handleCountryClick = useCallback(
    (feat: any) => {
      const code = getCountryCode(feat);
      const name = getCountryName(feat);
      if (code) {
        navigate(`/country/${code}`, { state: { countryName: name } });
      }
    },
    [navigate]
  );

  const handleCountryHover = useCallback((feat: any) => {
    setHovered(feat || null);
  }, []);

  const polygonCapColor = useCallback(
    (feat: any) => {
      if (feat === hovered) return inverted ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.15)';
      return inverted ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
    },
    [hovered, inverted]
  );

  const polygonSideColor = useCallback(
    () => (inverted ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'),
    [inverted]
  );

  const polygonStrokeColor = useCallback(
    () => (inverted ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)'),
    [inverted]
  );

  return (
    <div className="globe-page" style={{ background: 'var(--bg)' }}>
      <BackArrow to="/" />

      {hovered && (
        <div className="globe-page__tooltip">
          {getCountryName(hovered)}
        </div>
      )}

      <Globe
        ref={globeRef}
        globeImageUrl={globeImage}
        backgroundColor="rgba(0,0,0,0)"
        polygonsData={countriesGeo?.features || []}
        polygonCapColor={polygonCapColor}
        polygonSideColor={polygonSideColor}
        polygonStrokeColor={polygonStrokeColor}
        polygonAltitude={(feat: any) => (feat === hovered ? 0.02 : 0.005)}
        onPolygonClick={handleCountryClick}
        onPolygonHover={handleCountryHover}
        polygonLabel={(feat: any) => getCountryName(feat)}
        animateIn={true}
        width={window.innerWidth}
        height={window.innerHeight}
      />

      <button
        className="globe-page__rotation-toggle"
        onClick={() => setRotating(!rotating)}
        title={t('globe.rotation')}
      >
        {rotating ? '\u23F8' : '\u25B6'}
      </button>

      <div
        className={`globe-page__panel-trigger ${panelOpen ? 'open' : ''}`}
        onMouseEnter={() => setPanelOpen(true)}
        onMouseLeave={() => setPanelOpen(false)}
      >
        <div className="globe-page__panel-line" />
        {panelOpen && (
          <GlobeControls
            sunPosition={sunPosition}
            onSunChange={handleSunChange}
            speed={speed}
            onSpeedChange={setSpeed}
          />
        )}
      </div>
    </div>
  );
}
