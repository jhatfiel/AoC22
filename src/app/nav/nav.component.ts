import { Component, OnInit } from "@angular/core";
import { NavService, PUZZLE_STATE } from "../nav.service";

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
    playIcon = 'play_arrow';
    constructor(public navService: NavService) {
        this.navService.stateBehavior.subscribe(state => {
            if (state === PUZZLE_STATE.PLAYING) this.playIcon = 'pause'; 
            if (state === PUZZLE_STATE.PAUSED) this.playIcon = 'play_arrow'; 
            if (state === PUZZLE_STATE.DONE) this.playIcon = 'replay';
        })
    }

    PUZZLE_STATE() { return PUZZLE_STATE; }

    ngOnInit(): void { }

    savePreferences(event) {
        localStorage.setItem('autoPlay', event.source.checked);
    }

    step() {
        this.navService.init();
        this.playIcon = 'play_arrow';
        this.navService.stateBehavior.next(PUZZLE_STATE.PAUSED);
        this.navService.step();
    }

    playPause() {
        if (this.navService.stateBehavior.value === PUZZLE_STATE.PLAYING) {
            this.navService.stateBehavior.next(PUZZLE_STATE.PAUSED);
        } else {
            this.playIcon = 'pause';
            this.navService.init();
            this.navService.stateBehavior.next(PUZZLE_STATE.PLAYING);
            this.navService.play();
        }
    }

    pause() {
        this.navService.init();
        this.navService.stateBehavior.next(PUZZLE_STATE.PAUSED);
        this.playIcon = 'play';
    }
}