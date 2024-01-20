import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NavService } from "../../../nav.service";
import { PuzzleVisualizationComponent } from "../../PuzzleVisualization.component";
import * as Phaser from "phaser";
import { a201815 } from "../../../../2018/15/a201815";

@Component({
    selector: 'a201815',
    templateUrl: './a201815.html',
    styleUrls: ['./a201815.css']
})
export class a201815Component extends PuzzleVisualizationComponent implements OnInit, AfterViewChecked {
    @ViewChild('scrollOutput') private scrollOutput: ElementRef
    output: string = '';
    game: Phaser.Game;

    constructor(public router: Router, public navService: NavService) {
        super(navService);
        this.navService.currentUrl.subscribe(_ => { this.output = ''; })
    }

    ngOnInit() {
        window.addEventListener('resize', event => { this.game.scale.setMaxZoom(); }, false);
    }

    ngAfterViewChecked(): void {
        this.scrollOutput.nativeElement.scrollTop = this.scrollOutput.nativeElement.scrollHeight;
    }

    reset() {
        this.output = '';
        if (this.game) {
            this.game.destroy(true);
        }
        let puzzle = this.navService.puzzle as a201815;
        let preload = function () {
            this.load.image('wall', '/assets/MossyWall.png');
            this.load.image('floor', '/assets/Floor.png');
            this.load.image('goblin', '/assets/Goblin.png');
            this.load.image('elf', '/assets/Elf.png');
        };
        let create = function () {
            puzzle.gp.grid.forEach((row, rowNdx) => {
                row.forEach((c, colNdx) => {
                    if (c === '#') this.add.image(64*colNdx, 64*rowNdx, 'wall').setOrigin(0);
                    else           this.add.image(64*colNdx, 64*rowNdx, 'floor').setOrigin(0);
                    if ('GE'.indexOf(c) !== -1) {
                        let rotation = 0;
                        let rowHalfDistance = puzzle.gp.height/2 - rowNdx;
                        let colHalfDistance = puzzle.gp.width/2 - colNdx;
                        if (Math.abs(rowHalfDistance) > Math.abs(colHalfDistance)) {
                            rotation = (rowHalfDistance > 0)?Math.PI:0;
                        } else {
                            rotation = (colHalfDistance > 0)?Math.PI/2:3*Math.PI/2;
                        }
                        if (c === 'G') this.add.image(64*colNdx + 32, 64*rowNdx + 32, 'goblin').setRotation(rotation);
                        if (c === 'E') this.add.image(64*colNdx + 32, 64*rowNdx + 32, 'elf').setRotation(rotation);
                    }
                })
            })
        };
        let update = function () { };
        let config: Phaser.Types.Core.GameConfig = {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            scale: {},
            width: puzzle.gp.width*64,
            height: puzzle.gp.height*64,
            parent: 'viz',
            scene: {
                preload: preload,
                create: create,
                update: update
            },
        };
        this.game = new Phaser.Game(config);
    }

    log(msg) {
        this.output += msg + "\n";
    }

    step() { }
}