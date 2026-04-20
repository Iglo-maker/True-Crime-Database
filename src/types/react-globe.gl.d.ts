declare module 'react-globe.gl' {
  import { Component } from 'react';

  interface GlobeProps {
    ref?: any;
    globeImageUrl?: string;
    bumpImageUrl?: string;
    backgroundImageUrl?: string;
    backgroundColor?: string;
    width?: number;
    height?: number;
    animateIn?: boolean;

    // Polygons layer
    polygonsData?: any[];
    polygonCapColor?: string | ((d: any) => string);
    polygonSideColor?: string | ((d: any) => string);
    polygonStrokeColor?: string | ((d: any) => string);
    polygonAltitude?: number | ((d: any) => number);
    polygonLabel?: string | ((d: any) => string);
    onPolygonClick?: (d: any, event: MouseEvent) => void;
    onPolygonHover?: (d: any | null, prev: any | null) => void;

    [key: string]: any;
  }

  const Globe: React.ForwardRefExoticComponent<GlobeProps & React.RefAttributes<any>>;
  export default Globe;
}
