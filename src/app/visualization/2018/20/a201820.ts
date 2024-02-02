import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NavService } from "../../../nav.service";
import { PuzzleVisualizationComponent } from "../../PuzzleVisualization.component";
import * as Phaser from "phaser";
import { a201820 } from "../../../../2018/20/a201820";
import { PhaserComponent } from "../../Phaser.component";

class GameScene extends Phaser.Scene {
    puzzle: a201820;
    component: a201820Component;
    graphics: Phaser.GameObjects.Graphics;
    pathGraphics: Phaser.GameObjects.Graphics;
    gridSize = 12;
    lineWidth = 1;
    boxWidth = this.gridSize-this.lineWidth;
    position: {x:number, y:number};
    drawn = new Set<string>();
    furthestPosition: {x:number, y:number};
    furthestDistance = 0;
    parent: Map<string, {x:number, y:number}>;

    constructor() { super('puzzle'); }

    init(data: any) { 
        this.drawn = new Set<string>();
        this.parent = new Map<string, {x:number, y:number}>();
        this.position = {x:0, y:0};
        this.furthestPosition = {x:0, y:0};
        this.furthestDistance = 0;
        this.puzzle = data.puzzle;
        this.component = data.component;
        //this.cameras.main.setViewport(470, 1, 30, 60);
        this.cameras.main.zoomTo(5, 0);
        this.cameras.main.pan(0, 0, 0);
        //this.cameras.main.setSize(30, 60);
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            let newZoom = this.cameras.main.zoom;
            if (deltaY > 0) { newZoom = newZoom - .1; }
            if (deltaY < 0) { newZoom = newZoom + .1; }
            this.cameras.main.zoom = newZoom;
            //console.log(`zoom=${newZoom}`)
            //this.cameras.main.centerOn(pointer.worldX, pointer.worldY);
            this.cameras.main.pan(pointer.worldX, pointer.worldY, 2000, 'Power2');
        })

        this.input.on('pointermove', pointer => {
            let x = Math.floor(pointer.worldX/this.gridSize);
            let y = Math.floor(pointer.worldY/this.gridSize);
            let key = `${x},${y}`;
            if (this.parent.has(key)) {
                if (this.pathGraphics.getData('key') !== key) {
                    this.pathGraphics.setData('key', key);
                    this.pathGraphics.clear(); // only clear if we're on a new x/y tile
                    this.pathGraphics.lineStyle(1, 0xFFFFFF);
                    let prev = {x,y};
                    while (this.parent.has(key)) {
                        let parentPos = this.parent.get(key);
                        let parentKey = `${parentPos.x},${parentPos.y}`;
                        this.pathGraphics.lineBetween(prev.x*this.gridSize+this.gridSize/2, prev.y*this.gridSize+this.gridSize/2, parentPos.x*this.gridSize+this.gridSize/2, parentPos.y*this.gridSize+this.gridSize/2);
                        prev.x = parentPos.x;
                        prev.y = parentPos.y;
                        key = parentKey;
                    }
                }
            } else {
                this.pathGraphics.clear(); // only clear if we're on a new x/y tile
                this.pathGraphics.setData('key', '');
            }
            //console.log(pointer.worldX, pointer.worldY);
            if (!pointer.isDown) return;
            this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
        })
    }

    preload() {
        this.graphics = this.add.graphics();
        this.pathGraphics = this.add.graphics();
        this.pathGraphics.lineStyle(1, 0xFFFFFF);
        this.graphics.lineStyle(this.lineWidth, 0xFFFFFF);
        this.graphics.strokeRect(0, 0, this.boxWidth, this.boxWidth);
        this.drawn.add('0,0');
    }

    create() {
    }

    update(time: number, delta: number) {}

    step() {
        let pos = this.puzzle.position;
        let key = `${pos.x},${pos.y}`;
        if (!this.drawn.has(key)) {
            this.drawn.add(key);
            this.graphics.lineStyle(this.lineWidth, 0x0000FF);
            this.graphics.strokeRect(pos.x*this.gridSize, pos.y*this.gridSize, this.boxWidth, this.boxWidth);
            let pathLen = this.puzzle.getPathLength();
            if (pathLen >= this.puzzle.minLength) {
                this.graphics.fillStyle(0x00FF00);
                this.graphics.fillRect(pos.x*this.gridSize+this.lineWidth, pos.y*this.gridSize+this.lineWidth, this.boxWidth-2*this.lineWidth, this.boxWidth-2*this.lineWidth);
            }
            if (pathLen > this.furthestDistance) {
                // clear old spot
                if (this.furthestDistance >= this.puzzle.minLength) {
                    this.graphics.fillStyle(0x00FF00);
                } else {
                    this.graphics.fillStyle(0x000000);
                }
                this.graphics.fillRect(this.furthestPosition.x*this.gridSize+this.lineWidth, this.furthestPosition.y*this.gridSize+this.lineWidth, this.boxWidth-2*this.lineWidth, this.boxWidth-2*this.lineWidth);
                // highlight this spot
                this.furthestPosition = {...pos};
                this.furthestDistance = pathLen;
                this.graphics.fillStyle(0xFF0000);
                this.graphics.fillRect(this.furthestPosition.x*this.gridSize+this.lineWidth, this.furthestPosition.y*this.gridSize+this.lineWidth, this.boxWidth-2*this.lineWidth, this.boxWidth-2*this.lineWidth);
            }
        }
        let c = this.puzzle.line.charAt(this.puzzle.stepNumber);
        if ("NSEW".indexOf(c) !== -1) {
            this.graphics.fillStyle(0x000000);
            let x = pos.x*this.gridSize;
            let y = pos.y*this.gridSize;
            switch (c) {
                case 'N': 
                    if (!this.parent.has(key)) this.parent.set(key, {x: pos.x, y: pos.y+1});
                    x += (this.boxWidth-2*this.lineWidth)/2;
                    y += this.gridSize-this.lineWidth-1;
                    break;
                case 'S': 
                    if (!this.parent.has(key)) this.parent.set(key, {x: pos.x, y: pos.y-1});
                    x += (this.boxWidth-2*this.lineWidth)/2;
                    y -= this.lineWidth+1;
                    break;
                case 'E': 
                    if (!this.parent.has(key)) this.parent.set(key, {x: pos.x-1, y: pos.y});
                    x -= this.lineWidth+1;
                    y += (this.boxWidth-2*this.lineWidth)/2;
                    break;
                case 'W': 
                    if (!this.parent.has(key)) this.parent.set(key, {x: pos.x+1, y: pos.y});
                    x += this.gridSize-this.lineWidth-1;
                    y += (this.boxWidth-2*this.lineWidth)/2;
                    break;
                default:
                    break;
            }
            this.graphics.fillRect(x, y, this.lineWidth*2+1, this.lineWidth*2+1);
        }
    }
}

@Component({
    selector: 'a201820',
    templateUrl: './a201820.html',
    styleUrls: ['./a201820.css']
})
export class a201820Component extends PuzzleVisualizationComponent implements OnInit, AfterViewChecked {
    @ViewChild('scrollOutput') private scrollOutput: ElementRef
    @ViewChild('phaserComponent') private phaserComponent: PhaserComponent;
    output: string = '';
    puzzle: a201820;
    sceneType: Phaser.Types.Scenes.SceneType;

    constructor(public router: Router, public navService: NavService) {
        super(navService);
        this.sceneType = GameScene;
    }

    ngOnInit() { }

    ngAfterViewChecked(): void {
        this.scrollOutput.nativeElement.scrollTop = this.scrollOutput.nativeElement.scrollHeight;
    }

    reset() {
        this.output = '';
        this.puzzle = this.navService.puzzle as a201820;
        this.phaserComponent.game.scene.start('puzzle', {puzzle: this.puzzle, component: this})
        //this.phaserComponent.game.scale.resize(100, 100);
        //console.log(`setting viewport ${this.puzzle.xMin}, 0, ${this.puzzle.xMax-this.puzzle.xMin}, ${this.getHeight()}`);
        //sceneManager.getScene('puzzle').cameras.main.setViewport(this.puzzle.xMin, 0, this.puzzle.xMax-this.puzzle.xMin, this.getHeight());
    }

    log(msg) {
        this.output += msg + "\n";
    }

    step() {
        (this.phaserComponent.game.scene.getScene('puzzle') as GameScene).step();
    }
}