import { Component, OnInit } from "@angular/core";
import { NavigationEnd, Event, Router } from "@angular/router";
import { AoCPuzzle } from "../../lib/AoCPuzzle";
import { NavService } from "../nav.service";

@Component({
    selector: 'PuzzleVisualizationComponent',
    template: '',
    styles: []
})
export abstract class PuzzleVisualizationComponent implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }

    abstract selectFile(fn: string);
    abstract go();
}