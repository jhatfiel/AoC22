import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NavService } from "../../../nav.service";
import { PuzzleVisualizationComponent } from "../../PuzzleVisualization.component";
import * as Phaser from "phaser";
import { LineType, a201817 } from "../../../../2018/17/a201817";
import { PhaserComponent } from "../../Phaser.component";

class GameScene extends Phaser.Scene {
    puzzle: a201817;
    component: a201817Component;
    clayGraphics: Phaser.GameObjects.Graphics;
    waterGraphics: Phaser.GameObjects.Graphics;

    constructor() { super('puzzle'); }

    init(data: any) { 
        this.puzzle = data.puzzle;
        this.component = data.component;
        //this.cameras.main.setViewport(470, 1, 30, 60);
        this.cameras.main.zoomTo(10, 0);
        this.cameras.main.pan(500, 0, 0);
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
            //console.log(pointer.worldX, pointer.worldY);
            if (!pointer.isDown) return;
            this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
        })
    }

    preload() {
        this.clayGraphics = this.add.graphics();
        this.waterGraphics = this.add.graphics();
        this.puzzle.typeLines.filter(line => line.type === LineType.CLAY).forEach(line => {
            console.log(`Line: ${JSON.stringify(line)}`);
            this.clayGraphics.lineStyle(1, 0xFFFFFF, 1);
            //this.clayGraphics.lineBetween(line.x1, line.y1, line.x2, line.y2);
            this.clayGraphics.fillStyle(0xFFFFFF);
            this.clayGraphics.fillRect(line.x1, line.y1, (line.x2-line.x1+1), (line.y2-line.y1+1))
        });
    }

    create() {
    }

    update(time: number, delta: number) {
        this.waterGraphics.clear();
        this.puzzle.fallToCheck.forEach(line => {
            let color = 0x00FF00;
            this.waterGraphics.fillStyle(color);
            this.waterGraphics.fillRect(line.x1, line.y1, (line.x2-line.x1+1), (line.y2-line.y1+1))
        })
        this.puzzle.typeLines.filter(line => line.type === LineType.RESTING || line.type === LineType.FLOWING).forEach(line => {
            let color = 0xFF0000;
            if (line.type === LineType.RESTING) color = 0x8888FF;
            this.waterGraphics.fillStyle(color);
            this.waterGraphics.fillRect(line.x1, line.y1, (line.x2-line.x1+1), (line.y2-line.y1+1))
            //this.waterGraphics.lineStyle(1, color, 1);
            //this.waterGraphics.lineBetween(line.x1, line.y1, line.x2, line.y2);

        })
    }
}

@Component({
    selector: 'a201817',
    templateUrl: './a201817.html',
    styleUrls: ['./a201817.css']
})
export class a201817Component extends PuzzleVisualizationComponent implements OnInit, AfterViewChecked {
    @ViewChild('phaserComponent') private phaserComponent: PhaserComponent;
    puzzle: a201817;
    sceneType: Phaser.Types.Scenes.SceneType;

    constructor(public router: Router, public navService: NavService) {
        super(navService);
        this.sceneType = GameScene;
    }

    ngOnInit() { }

    ngAfterViewChecked(): void {
    }

    reset() {
        this.puzzle = this.navService.puzzle as a201817;
        this.phaserComponent.game.scene.start('puzzle', {puzzle: this.puzzle, component: this})
        //this.phaserComponent.game.scale.resize(this.puzzle.xMax+1, this.puzzle.yMax+1);
        //console.log(`setting viewport ${this.puzzle.xMin}, 0, ${this.puzzle.xMax-this.puzzle.xMin}, ${this.getHeight()}`);
        //sceneManager.getScene('puzzle').cameras.main.setViewport(this.puzzle.xMin, 0, this.puzzle.xMax-this.puzzle.xMin, this.getHeight());
    }

    getWidth() { return this.puzzle.xMax+1; }
    getHeight() { return this.puzzle.yMax+1; }

    log(msg) {
        console.log(msg);
    }

    step() { }
}