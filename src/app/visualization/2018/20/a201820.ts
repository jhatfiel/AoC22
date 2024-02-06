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
    furthestRoom: Phaser.GameObjects.Rectangle;
    furthestPosition: {x:number, y:number};
    furthestDistance = 0;
    parent: Map<string, {x:number, y:number}>;
    rooms = new Map<string, Phaser.GameObjects.Rectangle>();
    roomDoors = new Map<string, Set<string>>();
    roomDirMask = new Map<string, Phaser.Display.Masks.GeometryMask>(); 

    constructor() { super('puzzle'); }

    init(data: any) { 
        this.rooms = new Map();
        this.parent = new Map<string, {x:number, y:number}>();
        this.position = {x:0, y:0};
        this.furthestPosition = {x:0, y:0};
        this.furthestDistance = 0;
        this.puzzle = data.puzzle;
        this.component = data.component;
        //this.cameras.main.setViewport(470, 1, 30, 60);
        //this.cameras.main.zoomTo(0.6, 0);
        //this.cameras.main.setViewport(0, 0, 5);
        //this.cameras.main.zoomTo(10, 0);
        this.cameras.main.pan(0, 0, 0);
        //this.cameras.main.setSize(30, 60);
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            let newZoom = this.cameras.main.zoom;
            if (deltaY > 0) { newZoom = newZoom - .1; }
            if (deltaY < 0) { newZoom = newZoom + .1; }
            this.cameras.main.zoom = newZoom;
            //console.log(`zoom=${newZoom}`)
            //this.cameras.main.centerOn(pointer.worldX, pointer.worldY);
            this.cameras.main.pan(pointer.worldX, pointer.worldY, 500, 'Power2');
        })

        this.input.on('pointermove', pointer => {
            let x = Math.floor(pointer.worldX/this.gridSize);
            let y = Math.floor(pointer.worldY/this.gridSize);
            let key = `${x},${y}`;
            if (this.parent.has(key)) {
                if (this.pathGraphics.getData('key') !== key) {
                    this.children.bringToTop(this.pathGraphics);
                    this.pathGraphics.setData('key', key);
                    this.pathGraphics.clear(); // only clear if we're on a new x/y tile
                    this.pathGraphics.lineStyle(3, 0xFF0000);
                    let prev = {x,y};
                    this.pathGraphics.moveTo(prev.x*this.gridSize+this.gridSize/2, prev.y*this.gridSize+this.gridSize/2);
                    while (this.parent.has(key)) {
                        let parentPos = this.parent.get(key);
                        let parentKey = `${parentPos.x},${parentPos.y}`;
                        this.pathGraphics.lineTo(parentPos.x*this.gridSize+this.gridSize/2, parentPos.y*this.gridSize+this.gridSize/2);
                        prev.x = parentPos.x;
                        prev.y = parentPos.y;
                        key = parentKey;
                    }
                    this.pathGraphics.strokePath();
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
        //this.graphics.lineStyle(this.lineWidth, 0xFFFFFF);
        //this.graphics.strokeRect(0, 0, this.boxWidth, this.boxWidth);
        //this.graphics.generateTexture('room', this.boxWidth, this.boxWidth);
        //this.graphics.clear();
        // save the rooms tile as a sprite to be reused
        // also we should save off the "door" block as a sprite to be reused to "open" pathways to previous rooms
    }

    create() {
        //this.add.image(0, 0, 'room').setOrigin(0);
        let room = this.add.rectangle(0, 0, this.boxWidth, this.boxWidth).setStrokeStyle(this.lineWidth, 0xFFFFFF).setOrigin(0);
        this.rooms.set('0,0', room);
        this.furthestRoom = this.add.rectangle(this.lineWidth, this.lineWidth, this.boxWidth-2*this.lineWidth, this.boxWidth-2*this.lineWidth).setFillStyle(0xFF0000).setOrigin(0);
    }

    update(time: number, delta: number) {}

    step() {
        let pos = this.puzzle.position;
        let key = `${pos.x},${pos.y}`;
        if (!this.rooms.has(key)) {
            this.rooms.set(key, this.add.rectangle(pos.x*this.gridSize, pos.y*this.gridSize, this.boxWidth, this.boxWidth).setStrokeStyle(this.lineWidth, 0x0000FF).setOrigin(0));
            this.roomDoors.set(key, new Set());
            //this.graphics.lineStyle(this.lineWidth, 0x0000FF);
            //this.graphics.strokeRect(pos.x*this.gridSize, pos.y*this.gridSize, this.boxWidth, this.boxWidth);
            let pathLen = this.puzzle.getPathLength();
            if (pathLen >= this.puzzle.minLength) {
                //this.graphics.fillStyle(0x00FF00);
                //this.graphics.fillRect(pos.x*this.gridSize+this.lineWidth, pos.y*this.gridSize+this.lineWidth, this.boxWidth-2*this.lineWidth, this.boxWidth-2*this.lineWidth);
                this.add.rectangle(pos.x*this.gridSize+this.lineWidth, pos.y*this.gridSize+this.lineWidth, this.boxWidth-2*this.lineWidth, this.boxWidth-2*this.lineWidth).setFillStyle(0x00FF00).setOrigin(0);
            }
            if (pathLen > this.furthestDistance) {
                // clear old spot
                /*
                if (this.furthestDistance >= this.puzzle.minLength) {
                    this.graphics.fillStyle(0x00FF00);
                } else {
                    this.graphics.fillStyle(0x000000);
                }
                this.graphics.fillRect(this.furthestPosition.x*this.gridSize+this.lineWidth, this.furthestPosition.y*this.gridSize+this.lineWidth, this.boxWidth-2*this.lineWidth, this.boxWidth-2*this.lineWidth);
                // highlight this spot
                this.graphics.fillStyle(0xFF0000);
                this.graphics.fillRect(this.furthestPosition.x*this.gridSize+this.lineWidth, this.furthestPosition.y*this.gridSize+this.lineWidth, this.boxWidth-2*this.lineWidth, this.boxWidth-2*this.lineWidth);
                */
                this.furthestPosition = {...pos};
                this.furthestDistance = pathLen;
                this.furthestRoom.setPosition(this.furthestPosition.x*this.gridSize+this.lineWidth, this.furthestPosition.y*this.gridSize+this.lineWidth)
                this.children.bringToTop(this.furthestRoom);
            }
        }
        let c = this.puzzle.line.charAt(this.puzzle.stepNumber);
        if ("ENSW".indexOf(c) !== -1) {
            //this.graphics.fillStyle(0x000000);
            let x = pos.x*this.gridSize;
            let y = pos.y*this.gridSize;
            // calculate where the door to the previous room would have been
            let room = this.rooms.get(key);
            //let mask = Array.from(this.roomDoors.get(key).add(c).keys()).sort().join('');
            this.drawDoorDir(this.roomDoors.get(key).add(c), room);
            //console.log(`getting mask=${mask} for room: ${key}`)
            //room.setMask(this.roomDirMask.get(mask));
            // the problem with this mask is that it's a global position, it's not relative to the sprite itself
            // also need to set the door mask for the room we came from...

            /*
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
            */
            // clear out space for the door
            //this.graphics.fillRect(x, y, this.lineWidth*2+1, this.lineWidth*2+1);
            //this.add.rectangle(x, y, this.lineWidth*2+1, this.lineWidth*2+1).setFillStyle(0x000000).setOrigin(0);

        }
    }

    drawDoorDir(doors: Set<string>, rect: Phaser.GameObjects.Rectangle) {
        let graphics = this.make.graphics();
        graphics.lineStyle(this.boxWidth/2, 0xFFFFFF);
        if (doors.has('W')) graphics.lineBetween(rect.x+this.boxWidth/2, rect.y+this.boxWidth/2, rect.x+this.boxWidth+1, rect.y+this.boxWidth/2);
        if (doors.has('S')) graphics.lineBetween(rect.x+this.boxWidth/2, rect.y+this.boxWidth/2, rect.x+this.boxWidth/2, rect.y-1);
        if (doors.has('N')) graphics.lineBetween(rect.x+this.boxWidth/2, rect.y+this.boxWidth/2, rect.x+this.boxWidth/2, rect.y+this.boxWidth+1);
        if (doors.has('E')) graphics.lineBetween(rect.x+this.boxWidth/2, rect.y+this.boxWidth/2, rect.x-1, rect.y+this.boxWidth/2);
        rect.setMask(rect.createGeometryMask(graphics).setInvertAlpha(true));
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
        this.navService.maxSteps = undefined;
        this.navService.maxTimeMS = 25;
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