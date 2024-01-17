import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NavigationEnd, Event, Router } from "@angular/router";
import { AoCPuzzle } from "../../lib/AoCPuzzle";

@Component({
    selector: 'GenericPuzzleComponent',
    templateUrl: './GenericPuzzleComponent.html',
    styles: []
})
export class GenericPuzzleComponent implements OnInit {
    constructor(public router: Router) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.url = event.urlAfterRedirects;
                let arr = this.url.split('/');
                this.go(Number(arr[1]), Number(arr[2]), arr[3], 'sample');
            }
        });
    }

    url: string;
    puzzle: AoCPuzzle;

    ngOnInit() {

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
            this.puzzle = new clazz(inputfile);
            this.puzzle.loadData(value.split(/\r?\n/));
            while (this.puzzle.runStep()) {}
        })
    }
}