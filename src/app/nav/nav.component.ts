import { Component, OnInit } from "@angular/core";
import { NavService, PUZZLE_STATE } from "../nav.service";

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
    playIcon = 'pi-play';
    inputFile: string;

    constructor(public navService: NavService) {
        this.navService.inputFileBehavior.subscribe(inputFile => {
            console.log(`Changed inputFile to ${inputFile}`);
            this.inputFile = inputFile;
        })
        this.navService.stateBehavior.subscribe(state => {
            if (state === PUZZLE_STATE.PLAYING) this.playIcon = 'pi-pause'; 
            if (state === PUZZLE_STATE.PAUSED) this.playIcon = 'pi-play'; 
            if (state === PUZZLE_STATE.DONE) this.playIcon = 'pi-replay';
        })
    }

    PUZZLE_STATE() { return PUZZLE_STATE; }

    ngOnInit(): void { }

    updateAuto() {
        localStorage.setItem('autoPlay', this.navService.auto?"true":"false");
    }

    updateStepDelay() {
        localStorage.setItem('stepDelay', this.navService.stepDelay.toString());
    }

    step() {
        if (this.navService.init()) return;
        this.playIcon = 'pi-play';
        this.navService.stateBehavior.next(PUZZLE_STATE.PAUSED);
        this.navService.step();
    }

    playPause() {
        if (this.navService.stateBehavior.value === PUZZLE_STATE.PLAYING) {
            this.navService.stateBehavior.next(PUZZLE_STATE.PAUSED);
        } else {
            this.playIcon = 'pi-pause';
            this.navService.init();
            this.navService.stateBehavior.next(PUZZLE_STATE.PLAYING);
            this.navService.play();
        }
    }

    pause() {
        this.navService.init();
        this.navService.stateBehavior.next(PUZZLE_STATE.PAUSED);
        this.playIcon = 'pi-play';
    }

    selectFile() {
        this.navService.selectFile(this.inputFile);
    }

    getFiles() {
        return this.navService.files;
    }
}