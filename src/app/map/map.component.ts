import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import { AnimalsService } from '../services/animals.service';
import { SettingsService } from '../services/settings.service';

export enum LayerNames {
  Default = 'Default',
  Detailed = 'Detailed',
  Dark = 'Dark',
  Black = 'Black',
}

type MapTileLayerRecord = Record<LayerNames, L.TileLayer>;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {

  backgroundColour: string = "#d2b790"

  private map: L.Map | undefined;
  private isDarkMode: boolean = false;
  private minZoom: number = 2;
  private maxZoom: number = 7;
  private viewportX: number = -70;
  private viewportY: number = 98;
  private viewportZoom: number = 3;
  private mapBoundary: L.LatLngBounds = L.latLngBounds(L.latLng(-144, 0), L.latLng(0, 176));

  //Download map tiles here https://github.com/jeanropke/RDOMap#map-tiles
  private mapLayers: MapTileLayerRecord = {
    [LayerNames.Default]: L.tileLayer('https://s.rsg.sc/sc/images/games/RDR2/map/game/{z}/{x}/{y}.jpg', {
      noWrap: true,
      bounds: this.mapBoundary,
      attribution: '<a href="https://www.rockstargames.com/" target="_blank">Rockstar Games</a>',
    }),
    [LayerNames.Detailed]: L.tileLayer(`${this.getHostLayers()}webp/detailed/{z}/{x}_{y}.webp`, {
      noWrap: true,
      bounds: this.mapBoundary,
      attribution: '<a href="https://rdr2map.com/" target="_blank">RDR2Map</a>',
    }),
    [LayerNames.Dark]: L.tileLayer(`${this.getHostLayers()}webp/darkmode/{z}/{x}_{y}.webp`, {
      noWrap: true,
      bounds: this.mapBoundary,
      attribution: '<a href="https://github.com/TDLCTV" target="_blank">TDLCTV</a>',
    }),
    [LayerNames.Black]: L.tileLayer(`${this.getHostLayers()}webp/black/{z}/{x}_{y}.webp`, {
      noWrap: true,
      bounds: this.mapBoundary,
      attribution: '<a href="https://github.com/AdamNortonUK" target="_blank">AdamNortonUK</a>',
    }),
  };

  constructor(
    private settingsService: SettingsService,
    private animalsService: AnimalsService,
  ) { }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.beforeLoad();

    this.map = L.map('map', {
      preferCanvas: true,
      attributionControl: false,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      zoomControl: false,
      crs: L.CRS.Simple,
      layers: [this.mapLayers[this.settingsService.settings.baseLayer]],
    }).setView([this.viewportX, this.viewportY], this.viewportZoom);

    L.control.zoom({
      position: 'bottomright',
    }).addTo(this.map);

    L.control.layers(this.mapLayers).addTo(this.map);

    this.map.on('baselayerchange', (e) => {
      const typedLayerName = e.name as keyof typeof LayerNames;
      this.settingsService.settings.baseLayer = LayerNames[typedLayerName];
      this.setMapBackground();
    });

    const southWest = L.latLng(-160, -120);
    const northEast = L.latLng(25, 250);
    const bounds = L.latLngBounds(southWest, northEast);
    this.map.setMaxBounds(bounds);

    this.map.on('resize', () => {
      this.map?.invalidateSize();
    });

    this.setMapBackground();

    this.afterLoad();
  }

  private beforeLoad(): void {
  }

  private afterLoad(): void {
  }

  private getHostLayers(): string {
    return this.settingsService.settings.useHostedLayers ? 'assets/maps/' : 'https://map-tiles.b-cdn.net/assets/rdr3/';
  }

  setMapBackground(): void {
    this.isDarkMode = [LayerNames.Black, LayerNames.Dark].includes(this.settingsService.settings.baseLayer) ? true : false;
    if (this.isDarkMode) {
      this.backgroundColour = this.settingsService.settings.baseLayer === LayerNames.Black ? '#000' : '#3d3d3d';
    } else {
      this.backgroundColour = '#d2b790';
    }
  }
}
