import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { NavigationEnd, Event, Router } from "@angular/router";
import { AoCPuzzle } from "../../lib/AoCPuzzle";
import { NavService, PUZZLE_STATE } from "../nav.service";
import { PuzzleVisualizationComponent } from "./PuzzleVisualization.component";

@Component({
    selector: 'GenericPuzzleComponent',
    templateUrl: './GenericPuzzleComponent.html',
    styleUrls: ['./GenericPuzzleComponent.css']
})
export class GenericPuzzleComponent extends PuzzleVisualizationComponent implements OnInit, AfterViewChecked {
    @ViewChild('scrollOutput') private scrollOutput: ElementRef
    output: string = '';

    constructor(public router: Router, public navService: NavService) {
        super(navService);
        this.navService.currentUrl.subscribe(_ => { this.output = ''; })
    }

    ngOnInit() { }
    ngAfterViewChecked(): void {
        this.scrollOutput.nativeElement.scrollTop = this.scrollOutput.nativeElement.scrollHeight;
    }

    reset() {
        this.output = '';
    }

    log(msg) {
        this.output += msg + "\n";
    }

    step() { }
}