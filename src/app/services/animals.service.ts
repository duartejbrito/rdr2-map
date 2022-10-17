import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
// import * as L from 'leaflet';
// import '../../../node_modules/heatmap.js/build/heatmap.js';
// import '../../../node_modules/leaflet-heatmap/leaflet-heatmap.js';
// import '../../assets/js/heatmap.js';
// import '../../assets/js/leaflet-heatmap.js';
// import 'heatmap.js';
// import 'leaflet-heatmap';

// declare var HeatmapOverlay:any;

@Injectable({
  providedIn: 'root'
})
export class AnimalsService {
  // overlay;

  private animalLegendaryURL = 'assets/data/animal_legendary.json';
  private animalSpawnsURL = 'assets/data/animal_spawns.json';

  constructor(
    private http: HttpClient
  ) {
    // this.overlay = new HeatmapOverlay({
    //   radius: 2.5,
    //   maxOpacity: 0.5,
    //   minOpacity: 0,
    //   scaleRadius: true,
    //   useLocalExtrema: false,
    //   latField: 'lat',
    //   lngField: 'lng',
    //   gradient: {
    //     0.25: 'rgb(125, 125, 125)',
    //     0.55: 'rgb(48, 25, 52)',
    //     1.0: 'rgb(255, 42, 32)',
    //   },
    // });
  }

  async init() {
    await firstValueFrom(this.getJSON(this.animalLegendaryURL));
    await firstValueFrom(this.getJSON(this.animalSpawnsURL));
  }

  private getJSON(url: string): Observable<any> {
    return this.http.get(url);
  }
}
