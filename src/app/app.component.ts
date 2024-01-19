import { AfterViewInit, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavItem } from './nav-item';
import { NavService } from './nav.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
    @ViewChild('appDrawer') appDrawer: ElementRef;
    navItems: NavItem[] = [
        {displayName: 'Home', route: '/'},
        {displayName: '2015'},
        {displayName: '2016'},
        {displayName: '2017'},
        {displayName: '2018'},
        {displayName: '2019'},
        {displayName: '2020'},
        {displayName: '2021'},
        {displayName: '2022'},
        {displayName: '2023', children: [
            {displayName: '23: A Long Walk', route: '2023/23/a'},
            {displayName: '23: A Long Walk (Part 2)', route: '2023/23/b'},
            {displayName: '24: Never Tell Me The Odds', route: '2023/24/a'},
            {displayName: '25: Snowverload', route: '2023/25/a', files: ['sample', 'sample2', 'input']}
        ]},
    ]

    constructor(private navService: NavService) { }

    ngAfterViewInit(): void {
        this.navService.appDrawer = this.appDrawer;
    }
}
