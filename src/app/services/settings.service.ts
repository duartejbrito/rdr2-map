import { Inject, inject, Injectable } from '@angular/core';

// interface ISetting {
//   name: string,
//   config: ISettingConfig
// }

// interface ISettingConfig {
//   settingName: string,
//   value: any,
//   default: any,
//   type(value?: any): any,
//   filter(value: any): boolean,
//   listeners: (((value: void) => void | PromiseLike<void>) | null | undefined)[]
// }

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private domain: symbol;
  private proxyConfig: symbol;
  private settingHandler: SettingHandler;

  constructor() {
    this.domain = Symbol('domain');
    this.proxyConfig = Symbol('proxyConfig');

    this.settingHandler = new SettingHandler(this.proxyConfig);
    const settings = this.createSettingProxy('rd2map');
    Object.entries({
      baseLayer: { default: 'map.layers.default' },
    }).forEach(([name, config]) => this.addSetting(settings, name, config));
  }

  createSettingProxy(domain: string): Map<Symbol, string> {
    return new Proxy(new Map([[this.domain, domain]]), {
      has: (target, name): boolean => true
    });
  }

  addSetting(target: Map<Symbol, string>, name: string, config: any) {
    console.log('addSetting', target, name, config);
    if (target.has(Symbol(name))) {
      throw new TypeError(`A setting was already registered as ${name}.`);
    }
    // config = Object.assign(Object.create(null), config);
    // delete config.value;
    // config.listeners = [];
    // if (!('default' in config)) {
    //   config.default = 'type' in config ? config.type() : false;
    // }
    // if (!('type' in config)) {
    //   config.type = (x: any) => x;
    // }
    // if (!('filter' in config)) {
    //   config.filter = (_: any) => true;
    // }
    // if (!('settingName' in config)) {
    //   config.settingName = `${target.get(this.domain)}.${name}`;
    // }
    // target.set(Symbol(name), config);
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

export class SettingHandler implements ProxyHandler<Map<Symbol, string>> {
  constructor(
    private proxyConfig = Symbol('proxyConfig'),
  ) { }

  get(target: Map<Symbol, string>, p: PropertyKey, _: any): any {
    // if (p === this.proxyConfig) {
    //   return target.values().next().value;
    // }

    // const config = this.checkAndGetSettingConfig(target, p, ReferenceError);
    // if ('value' in config) {
    //   return config.value;
    // }
    // let value = localStorage.getItem(config.settingName);
    // if (value === null) {
    //   value = config.default;
    // } else {
    //   try {
    //     value = config.type(JSON.parse(value));
    //   } catch (e) {
    //     value = config.default;
    //   }
    // }

    // value = config.filter(value) ? value : config.default;

    // config.value = value;

    // return config.value;
    return {};
  }

  set(target: Map<Symbol, string>, p: PropertyKey, value: any): boolean {
    // const config = this.checkAndGetSettingConfig(target, p, TypeError);
    //   if (value === config.default) {
    //     localStorage.removeItem(config.settingName);
    //   } else {
    //     localStorage.setItem(config.settingName, JSON.stringify(value));
    //   }
    //   if (!('value' in config) || config.value !== value) {
    //     const resolved = Promise.resolve();
    //     config.listeners?.forEach((callback: ((value: void) => void | PromiseLike<void>) | null | undefined) => resolved.then(callback));
    //   }
    //   config.value = value;
    return true;
  }

  public has(target: Map<Symbol, string>, p: string | symbol): boolean {
    return target.has(Symbol(p.toString()));
  }

  checkAndGetSettingConfig(target: Map<Symbol, string>, p: PropertyKey, errorType: ErrorConstructor): any {
    if (!target.has(Symbol(p.toString()))) {
      throw new errorType(`"${p.toString()}" is not configured as a persisted setting.`);
    } else {
      return target.get(Symbol(p.toString()));
    }
  }
}
