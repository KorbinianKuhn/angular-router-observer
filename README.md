# angular-router-observer

[![Dev Dependencies](routers://img.shields.io/david/dev/KorbinianKuhn/angular-router-observer.svg?style=flat-square)](routers://david-dm.org/KorbinianKuhn/angular-router-observer)
[![npm](routers://img.shields.io/npm/dt/@korbiniankuhn/angular-router-observer.svg?style=flat-square)](routers://www.npmjs.com/package/@korbiniankuhn/angular-router-observer)
[![npm-version](https://img.shields.io/npm/v/@korbiniankuhn/angular-router-observer.svg?style=flat-square)](https://www.npmjs.com/package/@korbiniankuhn/angular-router-observer) [![Greenkeeper badge](https://badges.greenkeeper.io/KorbinianKuhn/angular-router-observer.svg)](https://greenkeeper.io/)
![license](https://img.shields.io/github/license/KorbinianKuhn/angular-router-observer.svg?style=flat-square)

Small utility to track angular router events to get notified on completion and timeouts. Example use case is a loading bar that appears while routing is pending. Easy configurable debounce delay, routing timeout and url blacklisting or whitelisting.

## Installation

For installation use the [Node Package Manager](https://github.com/npm/npm):

```
$ npm install --save @korbiniankuhn/angular-router-observer
```

or clone the repository:

```
$ git clone https://github.com/KorbinianKuhn/angular-router-observer
```

## Getting Started

Import the ```RouterObserverModule``` and add it to your imports list. Call the ```forRoot``` method.

```typescript
import { RouterObserverModule } from '@korbiniankuhn/angular-router-observer';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    // ...
    RouterObserverModule.forRoot()
  ]
})
export class AppModule {}
```

Subscribe to the events of the ```RouterObserverService```:

``` typescript
export class LoadingBarComponent implements OnInit {
  private showLoadingBar = false;

  constructor(private routerObserver: RouterObserverService) {}

  ngOnInit() {
    routerObserver.isPending.subscribe((groupName) => {
      this.showLoadingBar = true;
    });

    routerObserver.hasFinished.subscribe((groupName) => {
      this.showLoadingBar = false;
    });
  }
}
```

## Options

You can configure the observer with following options. By default a delay of 50ms and no timeout is set.

``` typescript
// ...
RouterObserverModule.forRoot({
  whitelistedRoutes: ['/users', /posts/],
  blacklistedRoutes: [/messages/],
  delay: 0,
  timeout: 10000
})
```

The observer can have multiple routing groups with different settings, to observe different routings across components. By default a routingGroup with the name ```default``` is created. A ```routingGroup``` inherits and overwrites the global options.

``` typescript
// ...
RouterObserverModule.forRoot({
  whitelistedRoutes: ['/users', /posts/],
  blacklistedRoutes: [/messages/],
  delay: 0,
  timeout: 10000,
  routingGroups: [{
    name: 'localhost',
    whitelistedRoutes: [/messages/],
    blacklistedRoutes: null,
    timeout: 2000
  }]
})
```

## Events

The following events are emitted by the observer.

``` typescript
/ ...
routerObserver.isPending.subscribe((groupName) => {
  console.log(groupName);
  // default

  if (groupName === 'custom') {
    console.log('show my custom loading bar');
  }
});

routerObserver.hasFinished.subscribe((groupName) => {
  console.log(groupName);
  // default
});

routerObserver.timedOutRouting.subscribe((object) => {
  console.log(object);
  // { routingGroupName: 'default', url: 'localhost', timeout: 2000 }
});

routerObserver.delayedRoutingEnd.subscribe((object) => {
  console.log(object);
  // { routingGroupName: 'default', url: 'localhost', timeout: 2000, duration: 3629 }
});
```

## Testing

First you have to install all dependencies:

```
$ npm install
```

To execute all unit tests once, use:

```
$ npm test
```

To get information about the test coverage, use:

```
$ npm run coverage
```

## Contribution

Get involved and push in your ideas.

Do not forget to add corresponding tests to keep up 100% test coverage.

## License

The MIT License

Copyright (c) 2018 Korbinian Kuhn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.