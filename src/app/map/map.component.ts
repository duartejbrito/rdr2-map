import { AfterViewInit, Component } from '@angular/core';
import { Map, LatLngBounds, LatLng, TileLayer, CRS, Control } from 'leaflet';
import { AnimalsService } from '../services/animals.service';
import { SettingsService } from '../services/settings.service';

export enum LayerNames {
  Default = 'Default',
  Detailed = 'Detailed',
  Dark = 'Dark',
  Black = 'Black',
}

type MapTileLayerRecord = Record<LayerNames, TileLayer>;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {

  backgroundColour: string = "#d2b790"

  private map: Map | undefined;
  private isDarkMode: boolean = false;
  private minZoom: number = 2;
  private maxZoom: number = 7;
  private viewportX: number = -70;
  private viewportY: number = 98;
  private viewportZoom: number = 3;
  private mapBoundary: LatLngBounds = new LatLngBounds(new LatLng(-144, 0), new LatLng(0, 176));

  //Download map tiles here https://github.com/jeanropke/RDOMap#map-tiles
  private mapLayers: MapTileLayerRecord = {
    [LayerNames.Default]: new TileLayer('https://s.rsg.sc/sc/images/games/RDR2/map/game/{z}/{x}/{y}.jpg', {
      noWrap: true,
      bounds: this.mapBoundary,
      attribution: '<a href="https://www.rockstargames.com/" target="_blank">Rockstar Games</a>',
    }),
    [LayerNames.Detailed]: new TileLayer(`${this.getHostLayers()}webp/detailed/{z}/{x}_{y}.webp`, {
      noWrap: true,
      bounds: this.mapBoundary,
      attribution: '<a href="https://rdr2map.com/" target="_blank">RDR2Map</a>',
    }),
    [LayerNames.Dark]: new TileLayer(`${this.getHostLayers()}webp/darkmode/{z}/{x}_{y}.webp`, {
      noWrap: true,
      bounds: this.mapBoundary,
      attribution: '<a href="https://github.com/TDLCTV" target="_blank">TDLCTV</a>',
    }),
    [LayerNames.Black]: new TileLayer(`${this.getHostLayers()}webp/black/{z}/{x}_{y}.webp`, {
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

    this.map = new Map('map', {
      preferCanvas: true,
      attributionControl: false,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      zoomControl: false,
      crs: CRS.Simple,
      layers: [this.mapLayers[this.settingsService.settings.baseLayer]],
    }).setView([this.viewportX, this.viewportY], this.viewportZoom);

    new Control.Zoom({
      position: 'bottomright',
    }).addTo(this.map);

    new Control.Layers(this.mapLayers).addTo(this.map);

    this.map.on('baselayerchange', (e) => {
      const typedLayerName = e.name as keyof typeof LayerNames;
      this.settingsService.settings.baseLayer = LayerNames[typedLayerName];
      this.setMapBackground();
    });

    const southWest = new LatLng(-160, -120);
    const northEast = new LatLng(25, 250);
    const bounds = new LatLngBounds(southWest, northEast);
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
    this.animalsService.hmOverlay.addTo(this.map);
    this.animalsService.spawnLayer.addTo(this.map);
    this.animalsService.init();
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
