import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home';
import { ReversiComponent } from './reversi';

import { AboutComponent } from './about';
import { NoContentComponent } from './no-content';

import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '',      component: HomeComponent },
  { path: 'home',  component: ReversiComponent },
  { path: 'about', component: AboutComponent },
  { path: '**',    component: NoContentComponent },
];
