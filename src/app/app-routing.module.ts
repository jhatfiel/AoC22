import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { GenericPuzzleComponent } from './visualization/GenericPuzzle.component';
import { a201815Component } from './visualization/2018/15/a201815';
import { a201817Component } from './visualization/2018/17/a201817';
import { a201820Component } from './visualization/2018/20/a201820';

const routes: Routes = [
    { path: '', component: MainComponent, pathMatch: 'full'},
    { path: '2018/15/a', component: a201815Component },
    { path: '2018/17/a', component: a201817Component },
    { path: '2018/20/a', component: a201820Component },
    { path: '**', component: GenericPuzzleComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule {
}