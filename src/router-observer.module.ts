import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { RouterObserverService } from './router-observer.service';
import { ROUTER_OBSERVER_OPTIONS } from './router-observer.options';

export interface RouterObserverOptions {
  whitelistedRoutes?: Array<string | RegExp>;
  blacklistedRoutes?: Array<string | RegExp>;
  delay?: number;
  timeout?: number;
  routingGroups?: Array<RouterObserverRoutingGroupOptions>;
}

export interface RouterObserverRoutingGroupOptions {
  name: string;
  whitelistedRoutes?: Array<string | RegExp>;
  blacklistedRoutes?: Array<string | RegExp>;
  delay?: number;
  timeout?: number;
}

@NgModule()
export class RouterObserverModule {

  constructor( @Optional() @SkipSelf() parentModule: RouterObserverModule) {
    if (parentModule) {
      throw new Error(`RouterObserverModule is already loaded. It should only be imported in your application's main module.`);
    }
  }
  static forRoot(options: RouterObserverOptions = {}): ModuleWithProviders {
    return {
      ngModule: RouterObserverModule,
      providers: [
        {
          provide: ROUTER_OBSERVER_OPTIONS,
          useValue: options
        },
        RouterObserverService
      ]
    };
  }
}
