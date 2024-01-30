import { Component, Input, OnInit } from "@angular/core";
import { ResizedEvent } from "angular-resize-event";
import * as Phaser from "phaser";

class Blank extends Phaser.Scene { }

@Component({
    selector: 'PhaserComponent',
    template: '<div id="phaser-div" class="phaser-div" (resized)="onResized($event)"></div>',
    styles: [``]
})
export class PhaserComponent implements OnInit {
    @Input() scene: Phaser.Types.Scenes.SceneType = undefined;
    @Input() scale = '';
    constructor() { }

    game: Phaser.Game;

    ngOnInit() { 
        let config: Phaser.Types.Core.GameConfig = {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            scale: {},
            //width: this.puzzle.gp.width*64,
            //height: this.puzzle.gp.height*64,
            parent: 'phaser-div',
            scene: [Blank, this.scene]
        };
        /*
        if (this.scale === 'NONE') {
            config.mode = Phaser.Scale.NONE;
        }
        */
        this.game = new Phaser.Game(config);
        //window.addEventListener('resize', event => { this.game.scale.setMaxZoom(); }, false);
    }

    onResized(event: ResizedEvent) {
        //this.game.scale.setMaxZoom();
    }
}