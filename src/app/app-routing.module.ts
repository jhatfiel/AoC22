import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { a202325Component } from './visualization/2023/25/a202325';
import { a202324Component } from './visualization/2023/24/a202324';
import { GenericPuzzleComponent } from './visualization/GenericPuzzleComponent';

const routes: Routes = [
    { path: '', component: MainComponent, pathMatch: 'full'},
    { path: '2023', children: [
        { path: '24/a', component: a202324Component },
        { path: '25/a', component: a202325Component }
    ]},
    { path: '**', component: GenericPuzzleComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule {
}