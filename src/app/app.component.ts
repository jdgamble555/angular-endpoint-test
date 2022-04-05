import { DOCUMENT, isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, Optional, PLATFORM_ID } from '@angular/core';
import { firstValueFrom, isObservable, Observable } from 'rxjs';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { makeStateKey, TransferState } from '@angular/platform-browser';

declare const Zone: any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'angular-test';

  data!: string;
  baseURL!: string;
  isServer: Boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Optional() @Inject(REQUEST) private request: any,
    @Inject(DOCUMENT) private document: Document,
    private transferState: TransferState,
    private http: HttpClient
  ) {
    this.isServer = isPlatformServer(platformId);

    if (this.isServer) {

      // get data on server, save state
      // get base url from request obj
      this.baseURL = this.request.headers.referer;
      this.waitFor(this.getData().then((data: any) => {
         this.data = data.r;
         this.saveState('posts', this.data);
      }));
    } else {

      // retrieve state on browser
      // get base url from location obj
      if (this.hasState('posts')) {
        this.data = this.getState('posts');
      } else {
        this.baseURL = this.document.location.origin + '/';
        this.getData().then((data: any) => this.data = data.r);
      }
    }
  }

  // get data from REST API
  async getData(): Promise<any> {
    return await firstValueFrom(
      this.http.get(this.baseURL + 'api/me', {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'json'
      })
    )
  };

  //
  // transfer state functions
  //

  saveState<T>(key: string, data: any): void {
    this.transferState.set<T>(makeStateKey(key), data);
  }

  getState<T>(key: string, defaultValue: any = []): T {
    const state = this.transferState.get<T>(
      makeStateKey(key),
      defaultValue
    );
    this.transferState.remove(makeStateKey(key));
    return state;
  }

  hasState<T>(key: string) {
    return this.transferState.hasKey<T>(makeStateKey(key));
  }

  //
  // ZoneJS force await function
  //

  async waitFor<T>(prom: Promise<T> | Observable<T>): Promise<T> {
    if (isObservable(prom)) {
      prom = firstValueFrom(prom);
    }
    const macroTask = Zone.current
      .scheduleMacroTask(
        `WAITFOR-${Math.random()}`,
        () => { },
        {},
        () => { }
      );
    return prom.then((p: T) => {
      macroTask.invoke();
      return p;
    });
  }

}
