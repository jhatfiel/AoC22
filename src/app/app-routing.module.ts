import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { GenericPuzzleComponent } from './visualization/GenericPuzzle.component';
import { a201815Component } from './visualization/2018/15/a201815';

const routes: Routes = [
    { path: '', component: MainComponent, pathMatch: 'full'},
    { path: '2018/15/a', component: a201815Component },
    { path: '**', component: GenericPuzzleComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule {
}