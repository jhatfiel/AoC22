import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NavService } from "../nav.service";
import { PuzzleVisualizationComponent } from "./PuzzleVisualization.component";

@Component({
    selector: 'GenericPuzzleComponent',
    templateUrl: './GenericPuzzle.component.html',
    styleUrls: ['./GenericPuzzle.component.css']
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