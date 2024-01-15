import { Component, OnInit } from "@angular/core";
import { NavService } from "../nav.service";

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styles: ['']
})
export class NavComponent implements OnInit {
    constructor(public navService: NavService) { }

    ngOnInit(): void { }
}