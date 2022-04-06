import { Component } from '@angular/core';

import { RestService } from './rest.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'angular-test';
  data: string;

  constructor(private rest: RestService) {
    this.data = this.rest.data;
    console.log(this.data);
  }

}
