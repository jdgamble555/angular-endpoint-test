import { DOCUMENT, isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  data!: string;
  baseURL!: string;
  isServer: Boolean;

  constructor(
    private transferState: TransferState,
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    @Optional() @Inject(REQUEST) private request: any
  ) {
    this.isServer = isPlatformServer(platformId);
  }

  async getData(): Promise<void> {

    if (this.isServer) {

      // get data on server, save state
      // get base url from request obj
      this.baseURL = this.request.headers.referer;
      const data = await this.fetchData();
      this.data = data.r;
      this.saveState('rest', this.data);

    } else {

      // retrieve state on browser
      // get base url from location obj
      if (this.hasState('rest')) {
        this.data = this.getState('rest');
      } else {
        this.baseURL = this.document.location.origin + '/';
        const data = await this.fetchData();
        this.data = data.r;
      }
    }
  }

  private async fetchData(): Promise<any> {
    return firstValueFrom(this.http.get(this.baseURL + 'api/me', {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json'
    }));
  }

  // state transfer functions
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

  hasState<T>(key: string): boolean {
    return this.transferState.hasKey<T>(makeStateKey(key));
  }
}
