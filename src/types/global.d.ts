declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      fitBounds(bounds: LatLngBounds): void;
    }
    
    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId;
      streetViewControl?: boolean;
      mapTypeControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
    }
    
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }
    
    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class LatLngBounds {
      constructor();
      extend(point: LatLng | LatLngLiteral): void;
    }

    class Circle {
      constructor(opts?: CircleOptions);
      setMap(map: Map | null): void;
      getCenter(): LatLng;
      getRadius(): number;
    }

    class Polygon {
      constructor(opts?: PolygonOptions);
      setMap(map: Map | null): void;
      getPath(): any;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: any;
    }

    enum SymbolPath {
      CIRCLE = 'circle',
      FORWARD_CLOSED_ARROW = 'forward_closed_arrow',
      FORWARD_OPEN_ARROW = 'forward_open_arrow',
      BACKWARD_CLOSED_ARROW = 'backward_closed_arrow',
      BACKWARD_OPEN_ARROW = 'backward_open_arrow'
    }

    interface CircleOptions {
      center?: LatLng | LatLngLiteral;
      radius?: number;
      fillColor?: string;
      fillOpacity?: number;
      strokeWeight?: number;
      strokeColor?: string;
      editable?: boolean;
      draggable?: boolean;
    }

    interface PolygonOptions {
      paths?: LatLng[] | LatLng[][] | LatLngLiteral[] | LatLngLiteral[][];
      fillColor?: string;
      fillOpacity?: number;
      strokeWeight?: number;
      strokeColor?: string;
      editable?: boolean;
      draggable?: boolean;
    }
    
    enum MapTypeId {
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      HYBRID = 'hybrid',
      TERRAIN = 'terrain'
    }
    
    enum ControlPosition {
      TOP_CENTER = 1,
      TOP_LEFT = 2,
      TOP_RIGHT = 3,
      LEFT_TOP = 4,
      RIGHT_TOP = 5,
      LEFT_CENTER = 6,
      RIGHT_CENTER = 7,
      LEFT_BOTTOM = 8,
      RIGHT_BOTTOM = 9,
      BOTTOM_CENTER = 10,
      BOTTOM_LEFT = 11,
      BOTTOM_RIGHT = 12
    }
    
    namespace event {
      function addListener(instance: any, eventName: string, handler: (...args: any[]) => void): any;
      function addListenerOnce(instance: any, eventName: string, handler: (...args: any[]) => void): any;
    }
    
    namespace drawing {
      class DrawingManager {
        constructor(options?: DrawingManagerOptions);
        setMap(map: Map | null): void;
        setDrawingMode(mode: OverlayType | null): void;
      }
      
      interface DrawingManagerOptions {
        drawingMode?: OverlayType | null;
        drawingControl?: boolean;
        drawingControlOptions?: DrawingControlOptions;
        polygonOptions?: PolygonOptions;
        circleOptions?: CircleOptions;
      }
      
      interface DrawingControlOptions {
        position?: ControlPosition;
        drawingModes?: OverlayType[];
      }
      
      interface PolygonOptions {
        fillColor?: string;
        fillOpacity?: number;
        strokeWeight?: number;
        strokeColor?: string;
        editable?: boolean;
        draggable?: boolean;
      }
      
      interface CircleOptions {
        fillColor?: string;
        fillOpacity?: number;
        strokeWeight?: number;
        strokeColor?: string;
        editable?: boolean;
        draggable?: boolean;
      }
      
      enum OverlayType {
        CIRCLE = 'circle',
        MARKER = 'marker',
        POLYGON = 'polygon',
        POLYLINE = 'polyline',
        RECTANGLE = 'rectangle'
      }
    }
  }
}

export {};