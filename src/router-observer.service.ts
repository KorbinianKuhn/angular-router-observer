import { Injectable, EventEmitter, Inject } from '@angular/core';
import { ROUTER_OBSERVER_OPTIONS } from './router-observer.options';
import { Router, RouterEvent } from '@angular/router';

export interface RoutingInterface {
  timestamp: number;
  id: number;
  url: string;
}

export interface RoutingGroupInterface {
  name: string;
  routings: Array<RoutingInterface>;
  whitelistedRoutes: Array<string | RegExp>;
  blacklistedRoutes: Array<string | RegExp>;
  delay: number;
  timeout: number;
  isPendingEventSent: boolean;
}

export interface RoutingTimeout {
  routingGroupName: string;
  id: number;
  url: string;
  timeout: number;
}

export interface DelayedRoutingEnd {
  routingGroupName: string;
  id: number;
  url: string;
  timeout: number;
}

@Injectable()
export class RouterObserverService {
  public isPending: EventEmitter<string> = new EventEmitter();
  public hasFinished: EventEmitter<string> = new EventEmitter();
  public timedOutRouting: EventEmitter<RoutingTimeout> = new EventEmitter();
  public delayedRoutingEnd: EventEmitter<DelayedRoutingEnd> = new EventEmitter();

  private routingGroups: Array<RoutingGroupInterface> = [];

  constructor(@Inject(ROUTER_OBSERVER_OPTIONS) config: any, private router: Router) {
    const routingGroups = config.routingGroups ? JSON.parse(JSON.stringify(config.routingGroups)) : [];

    routingGroups.push({ name: 'default' });

    for (const group of routingGroups) {
      if (group.whitelistedRoutes === undefined) {
        group.whitelistedRoutes = config.whitelistedRoutes;
      }
      if (group.blacklistedRoutes === undefined) {
        group.blacklistedRoutes = config.blacklistedRoutes;
      }
      if (group.delay === undefined) {
        group.delay = config.delay === undefined ? 50 : config.delay;
      }
      if (group.timeout === undefined) {
        group.timeout = config.timeout === undefined ? null : config.timeout;
      }

      this.routingGroups.push(Object.assign(group, {
        isPendingEventSent: false,
        routings: [],
      }));
    }

    this.router.events.subscribe((event: RouterEvent) => {
      switch (event.constructor.name) {
        case 'NavigationStart':
          this.addRoutingStart(new Date().getTime(), event.url, event.id);
          break;
        case 'NavigationEnd':
          this.addRoutingEnd(event.url, event.id);
          break;
        case 'NavigationCancel':
          this.addRoutingEnd(event.url, event.id);
          break;
        case 'NavigationError':
          this.addRoutingEnd(event.url, event.id);
          break;
      }
    });
  }

  private isString(value: any): boolean {
    return (typeof value === 'string' || value instanceof String);
  }

  private isRegex(value: any): boolean {
    return value instanceof RegExp;
  }

  private urlMatchesListItem(url: string, list: Array<string | RegExp>): boolean {
    for (const item of list) {
      if (this.isRegex(item)) {
        if (url.match(item)) {
          return true;
        }
      } else if (this.isString(item)) {
        if (url.includes(item.toString())) {
          return true;
        }
      }
    }
    return false;
  }

  private isUrlAllowed(group: RoutingGroupInterface, url: string): boolean {
    return group.whitelistedRoutes ? this.urlMatchesListItem(url, group.whitelistedRoutes) : true;
  }

  private isUrlForbidden(group: RoutingGroupInterface, url: string): boolean {
    return group.blacklistedRoutes ? this.urlMatchesListItem(url, group.blacklistedRoutes) : false;
  }

  private isUrlRelevant(group: RoutingGroupInterface, url: string): boolean {
    return (this.isUrlAllowed(group, url) && !this.isUrlForbidden(group, url));
  }

  public addRoutingStart(timestamp: number, url: string, id: number) {
    for (const group of this.routingGroups) {
      if (this.isUrlRelevant(group, url)) {
        const routing = { timestamp, url, id } as RoutingInterface;
        group.routings.push(routing);
        setTimeout(() => {
          if (group.routings.length > 0 && !group.isPendingEventSent) {
            this.emitPending(group);
          }
        }, group.delay);
        if (group.timeout !== null) {
          setTimeout(() => {
            if (group.routings.indexOf(routing) !== -1) {
              this.routingTimedOut(group, routing);
            }
          }, group.timeout);
        }
      }
    }
  }

  public addRoutingEnd(url: string, id: number) {
    for (const group of this.routingGroups) {
      if (this.isUrlRelevant(group, url)) {
        const routing = group.routings.find(o => o.id === id);
        if (routing) {
          group.routings.splice(group.routings.indexOf(routing), 1);
          if (group.routings.length === 0 && group.isPendingEventSent) {
            this.emitFinished(group);
          }
        } else {
          this.emitDelayedResponse(group, url, id);
        }
      }
    }
  }

  private routingTimedOut(group: RoutingGroupInterface, routing: RoutingInterface): void {
    if (group.routings.indexOf(routing) !== -1) {
      group.routings.splice(group.routings.indexOf(routing), 1);
      this.emitTimedOutRouting(group, routing);
      if (group.routings.length === 0 && group.isPendingEventSent) {
        this.emitFinished(group);
      }
    }
  }

  private emitPending(group: RoutingGroupInterface) {
    group.isPendingEventSent = true;
    this.isPending.emit(group.name);
  }

  private emitFinished(group: RoutingGroupInterface) {
    group.isPendingEventSent = false;
    this.hasFinished.emit(group.name);
  }

  private emitTimedOutRouting(group: RoutingGroupInterface, routing: RoutingInterface) {
    this.timedOutRouting.emit({
      routingGroupName: group.name,
      url: routing.url,
      id: routing.id,
      timeout: group.timeout
    });
  }

  private emitDelayedResponse(group: RoutingGroupInterface, url: string, id: number) {
    this.delayedRoutingEnd.emit({
      routingGroupName: group.name,
      url,
      id,
      timeout: group.timeout
    });
  }
}
