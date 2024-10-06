import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from './material.module';

import { AssetsListComponent } from './components/assets-list/assets-list.component';
import { AssetsFormComponent } from './components/assets-form/assets-form.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: '/ativos', pathMatch: 'full' },
  { path: 'ativos', component: AssetsListComponent },
  { path: 'ativos/form', component: AssetsFormComponent },
  { path: 'ativos/edit/:id', component: AssetsFormComponent },
  { path: '404', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), MaterialModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
