import { Injectable } from "@angular/core";
import { Event, NavigationEnd, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { PuzzleVisualizationComponent } from "./visualization/PuzzleVisualization.component";
import { AoCPuzzle } from "../lib/AoCPuzzle";
import { HttpParams } from "@angular/common/http";

export enum PUZZLE_STATE {
    DISABLED, // not created or no data
    PAUSED,
    PLAYING,
    DONE
}

@Injectable()
export class NavService {
    public appComponent: any;
    public currentUrl = new BehaviorSubject<string>(undefined);
    public stateBehavior = new BehaviorSubject<PUZZLE_STATE>(PUZZLE_STATE.DISABLED);
    public currentPuzzleComponent: PuzzleVisualizationComponent;
    public puzzle: AoCPuzzle;
    public auto = localStorage.getItem('autoPlay') === 'true';
    public stepDelay = Number(localStorage.getItem('stepDelay') ?? '0');
    public inputFileBehavior = new BehaviorSubject<string>('');
    public lines: string[];
    public classname: string;
    public year: number;
    public day: number;
    public part: string;
    public clazzModule: any;
    public files = ['sample', 'input'];

    constructor(private router: Router) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.stateBehavior.next(PUZZLE_STATE.DISABLED);
                this.currentUrl.next(event.urlAfterRedirects);
                this.puzzle = undefined;

                let arr = this.currentUrl.value.split('/');
                if (arr.length > 2) {
                    this.year = Number(arr[1]);
                    this.day = Number(arr[2]);
                    arr = arr[3].split('?');
                    this.part = arr[0];
                    const httpParams = new HttpParams({fromString: arr[1]});
                    this.classname = `${this.part}${this.year}${this.day}`;
                    if (httpParams.getAll('files')) {
                        this.files = httpParams.getAll('files');
                    } else {
                        this.files = ['sample', 'input'];
                    }
                    import(
                        /* webpackInclude: /src[\/\\]20\d\d[\/\\]\d\d[\/\\][ab]20\d\d\d\d.ts$/ */
                        `src/${this.year}/${this.day}/${this.classname}`
                    ).then(clazzModule => {
                        this.clazzModule = clazzModule;
                        if (httpParams.get('inputFile')) {
                            this.loadFile(httpParams.get('inputFile'));
                        }
                    });
                } else {
                    this.year = undefined;
                    this.day = undefined;
                    this.part = undefined;
                }
            }
        });
    }

    public getPuzzleLink() {
        let link = 'https://adventofcode.com/';
        if (this.year && this.day) link += `${this.year}/day/${this.day}`;
        return link;
    }

    public closeNav() {
        this.appComponent.sidebarVisible = false;
    }

    public openNav() {
        this.appComponent.sidebarVisible = true;
    }

    public getPuzzleDescription() {
        if (this.year && this.day) return `${this.year} / ${this.day} Part ${this.part}`;
        else return 'Select Day';
    }

    public getPuzzleStepNumber() {
        if (this.puzzle) return `${this.puzzle.stepNumber}`;
        else return '';
    }

    public selectFile(inputFile: string) {
        this.loadFile(inputFile);
        this.router.navigate([], {queryParams: { inputFile }, queryParamsHandling: 'merge'})
    }

    public loadFile(inputFile: string) {
        this.puzzle = null;
        this.inputFileBehavior.next(inputFile);
        const datafile = `${this.year}/${this.day}/${inputFile}`;
        import(
            `data/${datafile}.txt`
        ).then((valueModule) => {
            this.lines = valueModule['default'].trimRight().split(/\r?\n/);
            this.stateBehavior.next(PUZZLE_STATE.PAUSED);
            this.init();

            if (this.auto) {
                this.stateBehavior.next(PUZZLE_STATE.PLAYING);
                this.play();
            }
        })
    }

    public init() {
        if (!this.puzzle || this.stateBehavior.value === PUZZLE_STATE.DONE) {
            this.puzzle = new this.clazzModule[this.classname](this.inputFileBehavior.value, msg => {
                if (this.currentPuzzleComponent) this.currentPuzzleComponent.log(msg);
            });
            this.puzzle.loadData(this.lines);
            this.currentPuzzleComponent.reset();
            this.stateBehavior.next(PUZZLE_STATE.PAUSED);
            return true;
        }
        return false;
    }

    public step() {
        setTimeout(_ => {
            let hasMore = this.puzzle.runStep();
            this.currentPuzzleComponent.step();
            if (!hasMore) this.stateBehavior.next(PUZZLE_STATE.DONE);
        }, 0);
    }

    public play() {
        console.log(`delay: ${this.stepDelay}`);
        setTimeout(_ => {
            if (!this.puzzle || this.stateBehavior.value === PUZZLE_STATE.DONE) return;
            let hasMore = this.puzzle.runStep();
            this.currentPuzzleComponent.step();
            if (!hasMore) this.stateBehavior.next(PUZZLE_STATE.DONE);
            else if (this.stateBehavior.value !== PUZZLE_STATE.PAUSED) this.play();
        }, this.stepDelay);
    }
}