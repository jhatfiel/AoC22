import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NavService } from "../../../nav.service";
import { PuzzleVisualizationComponent } from "../../PuzzleVisualization.component";
import * as Phaser from "phaser";
import { Character, a201815 } from "../../../../2018/15/a201815";
import { PhaserComponent } from "../../Phaser.component";

// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/graphics/
// great page for reference information about Phaser
class GameScene extends Phaser.Scene {
    puzzle: a201815;
    elves: Phaser.GameObjects.Sprite[] = [];
    goblins: Phaser.GameObjects.Sprite[] = [];
    pathGraphics: Phaser.GameObjects.Graphics;
    highlightGraphics: Phaser.GameObjects.Graphics;
    component: a201815Component;
    navService: NavService;

    constructor() { super('puzzle'); }

    init(data: any) {
        this.puzzle = data.puzzle;
        this.component = data.component;
        this.navService = data.navService;
    }

    preload() {
        this.goblins = [];
        this.elves = [];
        this.load.image('wall', '/assets/MossyWall.png');
        this.load.image('floor', '/assets/Floor.png');
        //this.load.image('goblin', '/assets/Goblin.png');
        //this.load.image('elf', '/assets/Elf.png');
        //this.load.image('elfsprite', '/assets/ElfSprite.png');
        //this.load.atlas('a-elfsprite', '/assets/ElfSprite.json');
        this.load.spritesheet('elf', '/assets/ElfSprite.png', { frameWidth: 64 });
        this.load.spritesheet('goblin', '/assets/GoblinSprite.png', { frameWidth: 64 });
    }

    create() {
        this.puzzle.gp.grid.forEach((row, rowNdx) => {
            row.forEach((c, colNdx) => {
                if (c === '#') this.add.image(64*colNdx, 64*rowNdx, 'wall').setOrigin(0);
                else           this.add.image(64*colNdx, 64*rowNdx, 'floor').setOrigin(0);
            })
        })

        this.puzzle.elves.forEach((elf, ndx) => {
            this.elves.push(this.createCharacter(elf, 'elf'));
        })
        
        this.puzzle.goblins.forEach((goblin, ndx) => {
            this.goblins.push(this.createCharacter(goblin, 'goblin'));
        })

        if (this.anims.get('elfwalk') === undefined) {
            this.anims.create({key: 'elfwalk', repeat: -1, frames: this.anims.generateFrameNumbers('elf', {frames: [0, 1, 2, 3]})});
            this.anims.create({key: 'elfattack', repeat: -1, frames: this.anims.generateFrameNumbers('elf', {frames: [4, 5]})});
            this.anims.create({key: 'goblinwalk', repeat: -1, frames: this.anims.generateFrameNumbers('goblin', {frames: [0, 1, 2, 3]})});
            this.anims.create({key: 'goblinattack', repeat: -1, frames: this.anims.generateFrameNumbers('goblin', {frames: [4, 5]})});
        }
    }

    rotationFromTo(fromX: number, fromY: number, toX: number, toY: number): number {
        if (toX < fromX) return 3*Math.PI/2;
        if (toX > fromX) return Math.PI/2;
        if (toY < fromY) return 0;
        if (toY > fromY) return Math.PI
    }

    updateCharacter(graphicArray: Phaser.GameObjects.Sprite[], 
                graphicObj: Phaser.GameObjects.Sprite, 
                ndx: number, 
                characterArr: Character[]) {
        if (!graphicObj) return;
        let c = characterArr[ndx];
        if (c.hp <= 0) {
            graphicObj.destroy();
            graphicArray[ndx] === null;
            if (this.component.selectedCharacter === c) {
                this.highlightCharacter(c);
                this.component.selectedCharacter = undefined;
            }
        } else {
            let newX = c.pos.x*64 + 32;
            let newY = c.pos.y*64 + 32;
            if (!graphicObj.anims.isPlaying) {
                if (graphicObj.x !== newX || graphicObj.y !== newY) {
                    // moving
                    graphicObj.setData('moved', true);
                    graphicObj.play(graphicObj.name + 'walk')
                    graphicObj.rotation = this.rotationFromTo(graphicObj.x, graphicObj.y, newX, newY);
                    this.tweens.add({
                        targets: graphicObj,
                        x: newX,
                        y: newY,
                        ease: 'Linear',
                        repeat: 0,
                        duration: this.navService.stepDelay/2,
                        onComplete: _ => {
                            if (c.hp > 0) { graphicObj.stop(); graphicObj.setFrame(0); }
                        }
                    });
                    if (this.component.selectedCharacter === c) this.highlightCharacter(c);
                } else if (c.attacking && !graphicObj.getData('attacked')) {
                    // attacking
                    graphicObj.setData('attacked', true);
                    graphicObj.rotation = this.rotationFromTo(c.pos.x, c.pos.y, c.attacking.pos.x, c.attacking.pos.y);
                    graphicObj.play(graphicObj.name + 'attack');
                    setTimeout(_ => {
                        if (c.hp > 0) { graphicObj.stop(); graphicObj.setFrame(0); }
                    }, graphicObj.getData('moved')?this.navService.stepDelay/2:this.navService.stepDelay);
                }
            }
        }
    }

    step() {
        ['elfwalk', 'elfattack', 'goblinwalk', 'goblinattack'].forEach(a => {
            //this.anims.get(a).duration = Math.floor(this.navService.stepDelay);
            this.anims.get(a).frameRate = 12 * 1000/this.navService.stepDelay; // fps
            // so over 2000 ms, 12 frames will be shown.  We want to always show 12 frames.  
            // fps = 12*1000/sd
        });
        [...this.elves, ...this.goblins].forEach(graphicObj => {
            graphicObj.setData('attacked', false);
            graphicObj.setData('moved', false);
        })
        this.goblins.forEach((graphicObj, ndx, arr) => {
            this.updateCharacter(arr, graphicObj, ndx, this.puzzle.goblins);
        });
        this.elves.forEach((graphicObj, ndx, arr) => {
            this.updateCharacter(arr, graphicObj, ndx, this.puzzle.elves);
        })

    }

    highlightCharacter(c: Character) {
        if (!this.highlightGraphics) this.highlightGraphics = this.add.graphics();
        this.highlightGraphics.clear();
        if (c.hp > 0) {
            this.highlightGraphics.lineStyle(4, 0xFFFFFF, 1);
            this.highlightGraphics.fillStyle(0xFFFFFF, 0.25);
            this.highlightGraphics.fillRect(this.component.selectedCharacter.pos.x*64, this.component.selectedCharacter.pos.y*64, 64, 64);
            this.highlightGraphics.stroke();

            this.highlightGraphics.lineStyle(16, (c.toString().startsWith('E'))?0xDDDDFF:0x115511, 1.0);
            this.highlightGraphics.beginPath();
            this.highlightGraphics.moveTo(32+64*c.pos.x, 32+64*c.pos.y);
            c.plannedMoves?.forEach(p => {
                this.highlightGraphics.lineTo(32+64*p.x, 32+64*p.y);
            })
            this.highlightGraphics.strokePath();
        }
    }

    update(time: number, delta: number) {
    }

    createCharacter(c: Character, imageName: string): Phaser.GameObjects.Sprite {
        let rotation = 0;
        let rowHalfDistance = this.puzzle.gp.height/2 - c.pos.y;
        let colHalfDistance = this.puzzle.gp.width/2 - c.pos.x;
        if (Math.abs(rowHalfDistance) > Math.abs(colHalfDistance)) {
            rotation = (rowHalfDistance > 0)?Math.PI:0;
        } else {
            rotation = (colHalfDistance > 0)?Math.PI/2:3*Math.PI/2;
        }

        let image = this.add.sprite(64*c.pos.x + 32, 64*c.pos.y + 32, imageName).setRotation(rotation).setInteractive({ useHandCursor: true });
        image.name = imageName;
        if (!this.pathGraphics) this.pathGraphics = this.add.graphics();

        image.on('pointerdown', (pointer, gameObject) => {
            this.component.selectedCharacter = c;
            this.highlightCharacter(c);
        })
        image.on('pointerover', (pointer, gameObject) => {
            this.pathGraphics.lineStyle(16, (imageName==='elf')?0xDDDDFF:0x115511, 1.0);
            this.pathGraphics.beginPath();
            this.pathGraphics.moveTo(image.x, image.y);
            c.plannedMoves?.forEach(p => {
                this.pathGraphics.lineTo(32+64*p.x, 32+64*p.y);
            })
            this.pathGraphics.strokePath();
        });
        image.on('pointerout', (pointer, gameObject) => {
            this.pathGraphics.clear();
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
    @ViewChild('phaserComponent') private phaserComponent: PhaserComponent;
    output: string = '';
    puzzle: a201815;
    selectedCharacter: Character;
    sceneType: Phaser.Types.Scenes.SceneType;

    constructor(public router: Router, public navService: NavService) {
        super(navService);
        this.navService.currentUrl.subscribe(_ => { this.output = ''; })
        this.sceneType = GameScene;
    }

    ngOnInit() { }

    ngAfterViewChecked(): void {
        this.scrollOutput.nativeElement.scrollTop = this.scrollOutput.nativeElement.scrollHeight;
    }

    selectedCharacterMoves() {
        return this.selectedCharacter.plannedMoves.map(p => `${p.x},${p.y}`).join(' / ');
    }

    reset() {
        this.output = '';
        this.puzzle = this.navService.puzzle as a201815;
        this.phaserComponent.game.scene.start('puzzle', {puzzle: this.puzzle, component: this, navService: this.navService})
        this.phaserComponent.game.scale.setGameSize(this.puzzle.gp.width*64, this.puzzle.gp.height*64);
    }

    log(msg) {
        this.output += msg + "\n";
    }

    step() {
        (this.phaserComponent.game.scene.getScene('puzzle') as GameScene).step();
    }
}