import { AfterViewInit, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavService } from './nav.service';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
    @ViewChild('sidebar') sidebar: ElementRef;
    sidebarVisible = false;
    navItems: MenuItem[] = [
        {label: 'Home', routerLink: '/'},
        {label: '2015', items: []},
        {label: '2016', items: []},
        {label: '2017', items: []},
        {label: '2018', items: [
            {label: '15: Beverage Bandits', routerLink: '2018/15/a', queryParams: { files: ['a', 'sample', 'sample1', 'sample2', 'sample3', 'sample4', 'sample5', 'sample6', 'input']}},
            {label: '16: Chronal Classification', routerLink: '2018/16/a'},
            {label: '17: Reservoir Research', routerLink: '2018/17/a', queryParams: { files: ['sample1', 'sample', 'input']}},
            {label: '18: Settlers of The North Pole', routerLink: '2018/18/a'},
            {label: '19: Go With The Flow', routerLink: '2018/19/a'},
            {label: '20: A Regular Map', routerLink: '2018/20/a', queryParams: { files: ['sample', 'sample2', 'sample3', 'sample4', 'sample5', 'input']}},
            {label: '21: Chronal Conversion', routerLink: '2018/21/a'},
            {label: '22: Mode Maze', routerLink: '2018/22/a'},
            {label: '23: Experimental Emergency Teleportation', routerLink: '2018/23/a'},
            {label: '24: Immune System Simulator 20XX', routerLink: '2018/24/a'},
            {label: '25: Four-Dimensional Adventure', routerLink: '2018/25/a', queryParams: { files: ['sample', 'sample2', 'sample3', 'sample4', 'input']}},
        ]},
        {label: '2019', items: []},
        {label: '2020', items: []},
        {label: '2021', items: []},
        {label: '2022', items: []},
        {label: '2023', items: [
            {label: '23: A Long Walk', routerLink: '2023/23/a'},
            {label: '23: A Long Walk (Part 2)', routerLink: '2023/23/b'},
            {label: '24: Never Tell Me The Odds', routerLink: '2023/24/a'},
            {label: '25: Snowverload', routerLink: '2023/25/a', queryParams: { files: ['sample', 'sample2', 'input']}, queryParamsHandling: 'merge'}
        ]},
    ];

    constructor(private navService: NavService) { }

    ngAfterViewInit(): void {
        this.navService.appComponent = this;
        this.assignCommand(this.navItems);
    }

    assignCommand(items: MenuItem[]) {
        items.forEach(mi => {
            if (mi.items) this.assignCommand(mi.items);
            if (mi.routerLink) mi.command = _ => this.sidebarVisible = false;
        })
    }
}
