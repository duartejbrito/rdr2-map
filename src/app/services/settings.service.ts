import { Injectable } from '@angular/core';
import { LayerNames } from '../map/map.component';

type SettingType = Map<string, string> &
  Record<string, string> & {
    baseLayer: LayerNames,
    useHostedLayers: boolean,
  }

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  domain = 'domain';
  proxyConfig = 'proxyConfig';
  settings = this.createSettingProxy('rd2map');

  constructor() {
    Object.entries({
      baseLayer: { default: LayerNames.Default },
      useHostedLayers: { default: false },
    }).forEach(([name, config]) => this.addSetting(this.settings, name, config));
  }

  createSettingProxy(domain: string) {
    return new Proxy(new Map([[this.domain, domain]]), new SettingHandler()) as SettingType;
  }

  addSetting(target: SettingType, name: string, config: any = {}) {
    const proxyConfig = target[this.proxyConfig] as unknown as Map<string, string>;
    if (proxyConfig.has(name)) {
      throw new TypeError(`A setting was already registered as ${name}.`);
    }
    config = Object.assign(Object.create(null), config);
    delete config.value;
    config.listeners = [];
    if (!('default' in config)) {
      config.default = 'type' in config ? config.type() : false;
    }
    if (!('type' in config)) {
      config.type = (x: any) => x;
    }
    if (!('filter' in config)) {
      config.filter = (_: any) => true;
    }
    if (!('settingName' in config)) {
      config.settingName = `${proxyConfig.get(this.domain)}.${name}`;
    }
    proxyConfig.set(name, config);
  }

  // private addListener(target: Map<Symbol, string>, names: string | string[], callback: ((value: void) => void | PromiseLike<void>) | null | undefined) {
  //   if (!Array.isArray(names)) {
  //     names = names.split(' ');
  //   }
  //   names.forEach(name => {
  //     this.settingHandler.checkAndGetSettingConfig(target, name, ReferenceError).listeners?.push(callback);
  //   });
  //   return callback;
  // }
}

export class SettingHandler implements ProxyHandler<Map<string, string>> {

  proxyConfig = 'proxyConfig';

  get(target: Map<string, string>, p: string, _: any): any {
    if (p === this.proxyConfig) {
      return target;
    }

    const config = this.checkAndGetSettingConfig(target, p, ReferenceError);
    if ('value' in config) {
      return config.value;
    }

    let value = localStorage.getItem(config.settingName);

    if (value === null) {
      value = config.default;
    } else {
      try {
        // JSON.parse might raise SyntaxError, bc the setting is malformed
        value = config.type(JSON.parse(value));
      } catch (e) {
        value = config.default;
      }
    }

    value = config.filter(value) ? value : config.default;

    config.value = value;

    return config.value;
  }

  set(target: Map<string, string>, p: string, value: any): boolean {
    const config = this.checkAndGetSettingConfig(target, p, TypeError);
    if (value === config.default) {
      localStorage.removeItem(config.settingName);
    } else {
      localStorage.setItem(config.settingName, JSON.stringify(value));
    }
    if (!('value' in config) || config.value !== value) {
      const resolved = Promise.resolve();
      config.listeners?.forEach((callback: ((value: void) => void | PromiseLike<void>) | null | undefined) => resolved.then(callback));
    }
    config.value = value;
    return true;
  }

  checkAndGetSettingConfig(target: Map<string, string>, p: string, errorType: ErrorConstructor): any {
    if (!target.has(p)) {
      throw new errorType(`"${p}" is not configured as a persisted setting.`);
    } else {
      return target.get(p);
    }
  }
}
