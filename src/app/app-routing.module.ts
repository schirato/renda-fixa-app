import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetsListComponent } from './components/assets-list/assets-list.component';

const routes: Routes = [
  { path: 'ativos', component: AssetsListComponent },
  //{ path: '', redirectTo: '/ativos', pathMatch: 'full' },

  // Rota coringa (404 - Página não encontrada)
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
