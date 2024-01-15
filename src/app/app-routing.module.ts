import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { a202325Component } from './visualization/2023/25/a202325';
import { a202323Component } from './visualization/2023/23/a202323';
import { a202324Component } from './visualization/2023/24/a202324';
import { b202323Component } from './visualization/2023/23/b202323';

const routes: Routes = [
    { path: '', component: MainComponent, pathMatch: 'full'},
    { path: '2023', children: [
        { path: '23', component: a202323Component },
        { path: '23b', component: b202323Component },
        { path: '24', component: a202324Component },
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