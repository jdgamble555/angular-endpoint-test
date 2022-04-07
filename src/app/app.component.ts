import { Component } from '@angular/core';

import { RestService } from './rest.service';
import { StateService } from './state.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'angular-test';
  data: string;

  constructor(
    private rest: RestService,
    private state: StateService
  ) {
    this.data = this.rest.data;

    if (typeof window === undefined) {
      if (process.env['firebase']) {
        this.state.saveState('fb', process.env['firebase']);
      }
    } else {
      if (this.state.hasState('fb')) {
        console.log(this.state.getState('fb'));
      }
    }
  }
}
