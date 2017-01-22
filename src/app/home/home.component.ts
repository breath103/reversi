import {
  Component,
  OnInit,
} from '@angular/core';
import { NgFor } from '@angular/common';

import { Http, Response } from '@angular/http';
import { AppState } from '../app.service';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'home',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: [ './home.component.css' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {
  // Set our default values
  public localState = { value: '' };
  public shorteners = [];

  // TypeScript public modifiers
  constructor(
    private http: Http,
    public appState: AppState,
  ) {}

  public ngOnInit() {
    this.http
        .get("https://1u8e6hia8a.execute-api.us-east-1.amazonaws.com/prod/api/shorteners.json")
        .subscribe((response) => {
          const data = response.json();
          this.shorteners = data.Items;
        });
  }

  public submitState(value: string) {
    this.appState.set('value', value);
    this.localState.value = '';
  }
}
