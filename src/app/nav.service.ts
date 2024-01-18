import { Injectable } from "@angular/core";
import { Event, NavigationEnd, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { AoCPuzzle } from "../lib/AoCPuzzle";
import { PuzzleVisualizationComponent } from "./visualization/PuzzleVisualization.component";

@Injectable()
export class NavService {
    public appDrawer: any;
    public currentUrl = new BehaviorSubject<string>(undefined);
    public canPlay = false;
    public currentPuzzleComponent: PuzzleVisualizationComponent;

    constructor(private router: Router) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.currentUrl.next(event.urlAfterRedirects);
            }
        });
    }

    public closeNav() {
        this.appDrawer.close();
    }

    public openNav() {
        this.appDrawer.open();
    }

    public step() {

    }

    public play() {
        setTimeout(_ => this.currentPuzzleComponent.go(), 0);
    }

    public selectFile(fn: string) {
        setTimeout(_ => this.currentPuzzleComponent.selectFile(fn), 0);
    }
}