import * as L from 'leaflet';

declare module 'leaflet' {
  function canvasIconLayer(options?: any): any;
}
