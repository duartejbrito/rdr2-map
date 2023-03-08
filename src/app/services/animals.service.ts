import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import * as L from 'leaflet';
import 'leaflet-canvas-marker/dist/leaflet.canvas-markers.js';

//cenas

declare var HeatmapOverlay: any;

@Injectable({
  providedIn: 'root'
})
export class AnimalsService {
  spawnLayer;
  hmOverlay;

  private animalSpawnsURL = 'assets/data/animal_spawns.json';
  private hmURL = 'assets/data/animal_spawns.json';

  constructor(
    private http: HttpClient
  ) {
    this.hmOverlay = new HeatmapOverlay({
      radius: 2.5,
      maxOpacity: 0.5,
      minOpacity: 0,
      scaleRadius: true,
      useLocalExtrema: false,
      latField: 'lat',
      lngField: 'lng',
      gradient: {
        0.25: 'rgb(125, 125, 125)',
        0.55: 'rgb(48, 25, 52)',
        1.0: 'rgb(255, 42, 32)',
      },
    });

    this.spawnLayer = L.canvasIconLayer({ zoomAnimation: true });
  }

  async init() {
    const spawnsData = await firstValueFrom(this.getJSON(this.animalSpawnsURL));
    const heatmapData = await firstValueFrom(this.getJSON(this.hmURL));

    this.hmOverlay.setData({ data: heatmapData.ANIMALS_COWS.map((item: { x: number, y: number}) => {
        return { lat: item.x, lng: item.y };
      })
    });

    const markers : L.Marker<any>[] = spawnsData.ANIMALS_COWS.map((item: { x: number, y: number}) => {
      return L.marker([item.x, item.y], {
        opacity: .75,
        icon: L.divIcon({
          iconUrl: 'assets/images/icons/animal.png',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -8],
        })
      });
    });

    this.spawnLayer.addLayers(markers);
  }

  private getJSON(url: string): Observable<any> {
    return this.http.get(url);
  }
}
