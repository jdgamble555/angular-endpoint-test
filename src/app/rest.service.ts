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
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    @Optional() @Inject(REQUEST) private request: any
  ) {
    this.isServer = isPlatformServer(this.platformId);
  }

  async getData(): Promise<void> {

    if (this.isServer) {

      // get data on server, save state
      // get base url from request obj
      const host: string = this.request.get('host');
      this.baseURL = (host.startsWith('localhost') ? 'http://' : 'https://') + host;
      this.data = await this.fetchData();
      this.saveState('rest', this.data);

    } else {

      // retrieve state on browser
      // get base url from location obj
      if (this.hasState('rest')) {
        this.data = this.getState('rest');
      } else {
        this.baseURL = this.document.location.origin;
        this.data = await this.fetchData();
      }
    }
  }

  private async fetchData(): Promise<any> {
    return (await firstValueFrom<any>(this.http.get(this.baseURL + '/api/me', {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json'
    }))).r;
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
