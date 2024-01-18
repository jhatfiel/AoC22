import { Component, OnInit } from "@angular/core";
import { NavigationEnd, Event, Router } from "@angular/router";
import { AoCPuzzle } from "../../lib/AoCPuzzle";
import { NavService } from "../nav.service";
import { PuzzleVisualizationComponent } from "./PuzzleVisualization.component";

@Component({
    selector: 'GenericPuzzleComponent',
    templateUrl: './GenericPuzzleComponent.html',
    styleUrls: ['./GenericPuzzleComponent.css']
})
export class GenericPuzzleComponent extends PuzzleVisualizationComponent implements OnInit {
    constructor(public router: Router, public navService: NavService) {
        super();
        this.navService.currentPuzzleComponent = this;
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.output = '';
                this.puzzle = undefined;
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
    lines: string[];

    ngOnInit() {
    }

    go() {
            this.puzzle.loadData(this.lines);
            while (this.puzzle.runStep()) {}
    }

    selectFile(inputFile: string) {
        this.output = '';
        const datafile = `${this.year}/${this.day}/${inputFile}`;
        import(
            `data/${datafile}.txt`
        ).then((valueModule) => {
            this.lines = valueModule['default'].split(/\r?\n/);
            this.puzzle = new this.clazzModule[this.classname](inputFile, msg => {
                this.output += msg + "\n";
            });
            this.navService.canPlay = true;
        })
    }
}