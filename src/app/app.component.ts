import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'angular-test';

  data!: string;

  isServer: Boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private http: HttpClient
  ) {
    this.isServer = isPlatformServer(platformId);
  }

  async ngOnInit(): Promise<void> {
    this.data = (await this.getData()).r;
  }

  async getData(): Promise<any> {
    return await firstValueFrom(
      this.http.get('/api/me', {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'json'
      })
    );
  }

}
