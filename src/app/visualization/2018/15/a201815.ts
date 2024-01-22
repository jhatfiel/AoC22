import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NavService } from "../../../nav.service";
import { PuzzleVisualizationComponent } from "../../PuzzleVisualization.component";
import * as Phaser from "phaser";
import { Character, a201815 } from "../../../../2018/15/a201815";
import { Pair } from "../../../../lib/gridParser";

class GameScene extends Phaser.Scene {
    puzzle: a201815;
    elves: Phaser.GameObjects.Image[] = [];
    goblins: Phaser.GameObjects.Image[] = [];
    graphics: Phaser.GameObjects.Graphics;

    constructor() { super('puzzle'); }

    init(data: any) { this.puzzle = data.puzzle; }

    preload() {
        this.load.image('wall', '/assets/MossyWall.png');
        this.load.image('floor', '/assets/Floor.png');
        this.load.image('goblin', '/assets/Goblin.png');
        this.load.image('elf', '/assets/Elf.png');
    }

    create() {
        this.puzzle.gp.grid.forEach((row, rowNdx) => {
            row.forEach((c, colNdx) => {
                if (c === '#') this.add.image(64*colNdx, 64*rowNdx, 'wall').setOrigin(0);
                else           this.add.image(64*colNdx, 64*rowNdx, 'floor').setOrigin(0);
            })
        })

        this.puzzle.elves.forEach((elf, ndx) => {
            this.elves.push(this.createCharacter(this, this.puzzle, elf, 'elf'));
        })
        
        this.puzzle.goblins.forEach((goblin, ndx) => {
            this.goblins.push(this.createCharacter(this, this.puzzle, goblin, 'goblin'));
        })
    }

    update(time: number, delta: number) {
        this.goblins.forEach((goblin, ndx) => {
            if (this.puzzle.goblins[ndx].hp <= 0) goblin.destroy();
            goblin.x = this.puzzle.goblins[ndx].pos.x*64 + 32;
            goblin.y = this.puzzle.goblins[ndx].pos.y*64 + 32;
        })
        this.elves.forEach((elf, ndx) => {
            if (this.puzzle.elves[ndx].hp <= 0) elf.destroy();
            elf.x = this.puzzle.elves[ndx].pos.x*64 + 32;
            elf.y = this.puzzle.elves[ndx].pos.y*64 + 32;
        })
    }

    createCharacter(game: Phaser.Scene, puzzle: a201815, c: Character, imageName: string): Phaser.GameObjects.Image {
        let rotation = 0;
        let rowHalfDistance = puzzle.gp.height/2 - c.pos.y;
        let colHalfDistance = puzzle.gp.width/2 - c.pos.x;
        if (Math.abs(rowHalfDistance) > Math.abs(colHalfDistance)) {
            rotation = (rowHalfDistance > 0)?Math.PI:0;
        } else {
            rotation = (colHalfDistance > 0)?Math.PI/2:3*Math.PI/2;
        }

        let image = game.add.image(64*c.pos.x + 32, 64*c.pos.y + 32, imageName).setRotation(rotation).setInteractive({ useHandCursor: true });
        this.graphics = game.add.graphics();
        image.on('pointerover', (pointer, gameObject) => {
            this.graphics.lineStyle(16, 0xFFFFFF, 1.0);
            this.graphics.beginPath();
            this.graphics.moveTo(image.x, image.y);
            c.plannedMoves?.forEach(p => {
                this.graphics.lineTo(32+64*p.x, 32+64*p.y);
            })
            this.graphics.strokePath();
        });
        image.on('pointerout', (pointer, gameObject) => {
            this.graphics.clear();
        });
        return image;
    }
}

@Component({
    selector: 'a201815',
    templateUrl: './a201815.html',
    styleUrls: ['./a201815.css']
})
export class a201815Component extends PuzzleVisualizationComponent implements OnInit, AfterViewChecked {
    @ViewChild('scrollOutput') private scrollOutput: ElementRef
    output: string = '';
    game: Phaser.Game;
    puzzle: a201815;

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
        this.puzzle = this.navService.puzzle as a201815;
        let config: Phaser.Types.Core.GameConfig = {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            scale: {},
            width: this.puzzle.gp.width*64,
            height: this.puzzle.gp.height*64,
            parent: 'viz',
            scene: GameScene,
        };
        this.game = new Phaser.Game(config);
        this.game.scene.start('puzzle', {puzzle: this.puzzle})
    }

    log(msg) {
        this.output += msg + "\n";
    }

    step() {

    }
}