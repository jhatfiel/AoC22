import { AfterViewInit, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { a202323 } from '../2023/23/a202323';
import { b202323 } from '../2023/23/b202323';
import { a202324 } from '../2023/24/a202324';
import { a202325 } from '../2023/25/a202325';
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
        {displayName: '2015'},
        {displayName: '2016'},
        {displayName: '2017'},
        {displayName: '2018'},
        {displayName: '2019'},
        {displayName: '2020'},
        {displayName: '2021'},
        {displayName: '2022'},
        {displayName: '2023', children: [
            {displayName: '23: A Long Walk', route: '2023/23'},
            {displayName: '23: A Long Walk (Part 2)', route: '2023/23b'},
            {displayName: '24: Never Tell Me The Odds', route: '2023/24'},
            {displayName: '25: Snowverload', route: '2023/25'}
        ]},
    ]

    constructor(private navService: NavService) { }

    ngAfterViewInit(): void {
        this.navService.appDrawer = this.appDrawer;
    }

    go(year: number, day: number, part: string, inputfile: string) {
        const classname = `${part}${year}${day}`;
        const dir = `${year}/${day}`;
        const datafile = `${dir}/${inputfile}`;

        const clazzPromise = import(
            /* webpackInclude: /src[\/\\]20\d\d[\/\\]\d\d[\/\\][ab]20\d\d\d\d.ts$/ */
            `src/${dir}/${classname}`
        );
        const valuePromise = import(
            `data/${datafile}.txt`
        );
        Promise.all([clazzPromise, valuePromise]).then(([clazzModule, valueModule]) => {
            let value = valueModule['default'];
            let clazz = clazzModule[classname];
            console.log(`value is [${value}]`, value);
            let puzzle = new clazz(inputfile);
            puzzle.loadData(value.split(/\r?\n/));
            while (puzzle.runStep()) {}
            //this.output = `Final result: ${puzzle.result}`;
        })
    }
}
