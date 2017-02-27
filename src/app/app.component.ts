/*
 * Angular 2 decorators and services
 */
import {
  Component,
  ViewEncapsulation
} from '@angular/core';
import { AppState } from './app.service';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.component.css'
  ],
    // <nav>
    //   <a [routerLink]=" ['./'] " routerLinkActive="active">
    //     Index
    //   </a>
    //   <a [routerLink]=" ['./home'] " routerLinkActive="active">
    //     Home
    //   </a>
    //   <a [routerLink]=" ['./detail'] " routerLinkActive="active">
    //     Detail
    //   </a>
    //   <a [routerLink]=" ['./barrel'] " routerLinkActive="active">
    //     Barrel
    //   </a>
    //   <a [routerLink]=" ['./about'] " routerLinkActive="active">
    //     About
    //   </a>
    // </nav>
  template: `
    <main>
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {
  constructor(
    public appState: AppState
  ) {}

}