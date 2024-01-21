import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NavService } from "../../../nav.service";
import { PuzzleVisualizationComponent } from "../../PuzzleVisualization.component";
import * as Phaser from "phaser";
import { a201815 } from "../../../../2018/15/a201815";
import { Pair } from "../../../../lib/gridParser";

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

    elves: Phaser.GameObjects.Image[] = [];
    goblins: Phaser.GameObjects.Image[] = [];

    createCharacter(game: Phaser.Scene, puzzle: a201815, pos: Pair, imageName: string) {
        let rotation = 0;
        let rowHalfDistance = puzzle.gp.height/2 - pos.y;
        let colHalfDistance = puzzle.gp.width/2 - pos.x;
        if (Math.abs(rowHalfDistance) > Math.abs(colHalfDistance)) {
            rotation = (rowHalfDistance > 0)?Math.PI:0;
        } else {
            rotation = (colHalfDistance > 0)?Math.PI/2:3*Math.PI/2;
        }
        return game.add.image(64*pos.x + 32, 64*pos.y + 32, imageName).setRotation(rotation);
    }

    reset() {
        let that = this;
        this.output = '';
        this.goblins = [];
        this.elves = [];
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
                })
            })

            puzzle.elves.forEach((elf, ndx) => {
                that.elves.push(that.createCharacter(this, puzzle, elf.pos, 'elf'));
            })
            
            puzzle.goblins.forEach((goblin, ndx) => {
                that.goblins.push(that.createCharacter(this, puzzle, goblin.pos, 'goblin'));
            })

        };

        let update = function () {
            that.goblins.forEach((goblin, ndx) => {
                if (puzzle.goblins[ndx].hp <= 0) goblin.destroy();
                goblin.x = puzzle.goblins[ndx].pos.x*64 + 32;
                goblin.y = puzzle.goblins[ndx].pos.y*64 + 32;
            })
            that.elves.forEach((elf, ndx) => {
                if (puzzle.elves[ndx].hp <= 0) elf.destroy();
                elf.x = puzzle.elves[ndx].pos.x*64 + 32;
                elf.y = puzzle.elves[ndx].pos.y*64 + 32;
            })
        };

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

    step() {

    }
}