import { Component, OnInit } from "@angular/core";
import { NavigationEnd, Event, Router } from "@angular/router";
import { AoCPuzzle } from "../../lib/AoCPuzzle";

@Component({
    selector: 'GenericPuzzleComponent',
    templateUrl: './GenericPuzzleComponent.html',
    styleUrls: ['./GenericPuzzleComponent.css']
})
export class GenericPuzzleComponent implements OnInit {
    constructor(public router: Router) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.url = event.urlAfterRedirects;
                let arr = this.url.split('/');
                this.year = Number(arr[1]);
                this.day = Number(arr[2]);
                this.part = arr[3];
                this.classname = `${this.part}${this.year}${this.day}`;

                import(
                    /* webpackInclude: /src[\/\\]20\d\d[\/\\]\d\d[\/\\][ab]20\d\d\d\d.ts$/ */
                    `src/${this.year}/${this.day}/${this.classname}`
                ).then(clazzModule => {
                    this.clazzModule = clazzModule;
                    this.go('sample');
                });
            }
        });
    }

    classname: string;
    year: number;
    day: number;
    part: string;

    url: string;
    clazzModule: any; 
    puzzle: AoCPuzzle;
    output: string = '';

    ngOnInit() {
    }

    go(inputfile: string) {
        this.output = '';
        const datafile = `${this.year}/${this.day}/${inputfile}`;

        import(
            `data/${datafile}.txt`
        ).then((valueModule) => {
            let value = valueModule['default'];
            console.log(`value is [${value}]`);
            this.puzzle = new this.clazzModule[this.classname](inputfile, msg => {
                this.output += msg + "\n";
            });
            this.puzzle.loadData(value.split(/\r?\n/));
            while (this.puzzle.runStep()) {}
        })
    }
}