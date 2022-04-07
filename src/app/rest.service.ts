import { DOCUMENT, isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { firstValueFrom } from 'rxjs';
import { StateService } from './state.service';

declare const process: any;

@Injectable({
  providedIn: 'root'
})
export class RestService {

  data!: string;
  baseURL!: string;
  isServer: Boolean;

  constructor(
    private state: StateService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    @Optional() @Inject(REQUEST) private request: any
  ) {
    this.isServer = isPlatformServer(this.platformId);
  }

  async getData(): Promise<void> {

    if (this.isServer) {

      // process test for env variables
      if (process.env['test']) {
        console.log(process.env);
      }
      if (process.env['NEXT_PUBLIC_TEST']) {
        console.log(process.env);
      }

      //
      // get data on server, save state
      // get base url from request obj
      //

      const host: string = this.request.get('host');
      this.baseURL = (host.startsWith('localhost') ? 'http://' : 'https://') + host;
      this.data = await this.fetchData();
      this.state.saveState('rest', this.data);

    } else {

      //
      // retrieve state on browser
      // get base url from location obj
      //

      if (this.state.hasState('rest')) {
        this.data = this.state.getState('rest');
      } else {
        this.baseURL = this.document.location.origin;
        this.data = await this.fetchData();
      }
    }
  }

  private async fetchData(): Promise<any> {
    return (
      await firstValueFrom<any>(this.http.get(this.baseURL + '/api/me', {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'json'
      }))
    ).r;
  }
}
