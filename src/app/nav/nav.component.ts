import { Component, OnInit } from "@angular/core";
import { NavService } from "../nav.service";
import { NavigationEnd, Event, Router } from "@angular/router";

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
    constructor(public navService: NavService, public router: Router) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.path = event.urlAfterRedirects;
            }
        });
    }

    path: string;

    ngOnInit(): void { }
}