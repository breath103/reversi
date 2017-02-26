import { Routes, RouterModule } from '@angular/router';
import { ReversiComponent } from './reversi';
import { AboutComponent } from './about';

export const ROUTES: Routes = [
  { path: '',      component: ReversiComponent },
  { path: 'about', component: AboutComponent },
];
