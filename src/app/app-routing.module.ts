import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { a202325Component } from './visualization/2023/25/a202325';

const routes: Routes = [
    { path: '', component: MainComponent, pathMatch: 'full'},
    { path: '2023', children: [
        { path: '25', component: a202325Component }
    ]}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule {
}