
// for part b, 1 trillion rocks drop.  I couldn't get my head around what the solution would be, so I read
// https://fasterthanli.me/series/advent-of-code-2022/part-17
// to see that it requires cycle detection.  Now trying to implement that

import { createReadStream } from "fs";
import { createInterface } from "readline";

interface IShape {
    add(): void;       // add it temporarily to the grid
    remove(): void;    // remove from grid
    moveRight(): void; // move right (if possible)
    moveLeft(): void;  // move left (if possible)
    moveDown(): boolean; // move down, return false if it won't move down anymore
    stop(): void;      // remove from grid and permanently write it to the grid
}

abstract class Shape implements IShape {
    constructor(public grid: Array<number>, public row: number, public column: number) { }
    // 0123456
    // ^ column 0 is actually msb - number here would be 
    // ......^ lsb - number here would be 1

    drawShape(enable: boolean) {
        this.pointOffsets().forEach((p) => {
            if (enable) this.grid[this.row+p[0]] |= Math.pow(2, 6-(this.column+p[1]))
            else        this.grid[this.row+p[0]] &= ~Math.pow(2, 6-(this.column+p[1]))
        })
    }

    abstract pointOffsets(): Array<Array<number>>;

    add() { this.drawShape(true); }
    remove() { this.drawShape(false); }
    moveRight() {
        this.remove();
        if (this.pointOffsets().every((p) => this.isClear(this.row+p[0], this.column+1+p[1]))) this.column++;
        this.add();
    }
    moveLeft() {
        this.remove();
        if (this.pointOffsets().every((p) => this.isClear(this.row+p[0], this.column-1+p[1]))) this.column--;
        this.add();
    }
    moveDown() {
        let couldDrop = false;
        this.remove();
        if (this.pointOffsets().every((p) => this.isClear(this.row-1+p[0],this.column+p[1]))) {
            couldDrop = true;
            this.row--;
        }
        this.add();
        return couldDrop;
    }
    isClear(row: number, column: number) {
        let isClear = true;
        if (column < 0 || column > 6 || row < 0 ||
            (this.grid[row] & Math.pow(2, 6-column)) > 0) isClear = false;
        return isClear;
    }
    stop() { this.drawShape(true); }
}

class S1 extends Shape {
    // 0123456
    // &###
    pointOffsets() { return [[0,0], [0,1], [0,2], [0,3]]; }
}

class S2 extends Shape {
    // 0123456
    // .#.....
    // ###....
    // &#.....
    pointOffsets() { return [[0,1], [1,0], [1,1], [1,2], [2,1]]; }
}

class S3 extends Shape {
    // 0123456
    // ..#....
    // ..#....
    // &##....
    pointOffsets() { return [[0,0], [0,1], [0,2], [1,2], [2,2]]; }
}

class S4 extends Shape {
    // 0123456
    // #......
    // #......
    // #......
    // &......
    pointOffsets() { return [[0,0], [1,0], [2,0], [3,0]]; }
}

class S5 extends Shape {
    // 0123456
    // ##.....
    // &#.....
    pointOffsets() { return [[0,0], [0,1], [1,0], [1,1]]; }
}

class C {
    constructor() {}

    cycle = 0;
    grid = new Array<number>();
    wind = '';
    windInd = 0;
    height = 0;
    currentShape = new S1(this.grid, 0, 0);
    pieceCount = 0;
    maxPieceCount = 1000000000000;
    skipPieceCount = 0;
    skipHeightCount = 0;
    lastSeen = new Map<string, Array<number>>();
    // based on the windIndex, the next shape to come out, and the "depth" of each column
    // once we have a cycle where we get back to the exact same state, we know we can jump ahead
    // windIndex can get up to 10091
    // next shape is 0-4
    // depth of each column?  well, 6 columns, and each column could be ... really? deep.
    // we want to smash all these together into a single number to make tracking easier.
    // or just a single string?
    // nextPiece|windInd|column0Depth|column1Depth|...|column6Depth

    // then we store that in lastSeen with the height and piece count at that time.  
    // if we ever see that particular string state again, we know we have a cycle
    
    // so... this likely will not work.  The "depth" of each column is just the tip 
    // of the iceberg, if you will.  There could be much more complexity under that shadow...

    makeKey(): string {
        return "" +
               this.pieceCount%5 + '|' +
               this.windInd.toString().padStart(5, '0') + '|' +
               this.columnDepth(0).padStart(5, '0') + '|' +
               this.columnDepth(1).padStart(5, '0') + '|' +
               this.columnDepth(2).padStart(5, '0') + '|' +
               this.columnDepth(3).padStart(5, '0') + '|' +
               this.columnDepth(4).padStart(5, '0') + '|' +
               this.columnDepth(5).padStart(5, '0') + '|' +
               this.columnDepth(6).padStart(5, '0');
    }

    columnDepth(column: number) {
        let result = 0;
        for (; this.height-result > 0 && (this.grid[this.height-result] & Math.pow(2,column)) === 0; result++) {} // find the first 
        return result.toString();
    }

    process(line: string) {
        this.wind = line;
    }

    tick(waitTime: number) {
        if (waitTime) { let waitTill = new Date(new Date().getTime() + waitTime); while (waitTill > new Date()) {}; }
        this.blow();
        if (waitTime) { let waitTill = new Date(new Date().getTime() + waitTime); while (waitTill > new Date()) {}; }
        return this.drop();
    }

    blow() {
        if (this.wind.substring(this.windInd, this.windInd+1) === '<') this.currentShape.moveLeft();
        else                                                           this.currentShape.moveRight();
        this.windInd++;
        this.windInd %= this.wind.length;
    }

    drop() {
        return this.currentShape.moveDown();
    }

    newPiece() {
        if (this.pieceCount % 5 === 0) this.currentShape = new S1(this.grid, this.height+3, 2);
        if (this.pieceCount % 5 === 1) this.currentShape = new S2(this.grid, this.height+3, 2);
        if (this.pieceCount % 5 === 2) this.currentShape = new S3(this.grid, this.height+3, 2);
        if (this.pieceCount % 5 === 3) this.currentShape = new S4(this.grid, this.height+3, 2);
        if (this.pieceCount % 5 === 4) this.currentShape = new S5(this.grid, this.height+3, 2);
        this.currentShape.add();
    }

    updateHeight() {
        while (this.grid[this.height]>0) { this.height++; }
    }

    getResult() {
        while ((this.pieceCount + this.skipPieceCount) < this.maxPieceCount) {
            this.newPiece();
            while (this.tick(0*1000)) { }
            this.currentShape.stop();
            this.pieceCount++;
            this.updateHeight();
            // record height
            if (this.skipPieceCount === 0) {
                let key = this.makeKey();
                if (this.lastSeen.has(key)) {
                    let [lastHeight, lastPieceCount] = this.lastSeen.get(key)!;
                    let cycleLength = this.pieceCount - lastPieceCount;
                    let repititions = Math.floor((this.maxPieceCount - this.pieceCount)/cycleLength);
                    console.log();
                    console.log(`We've seen ${key} before: lastPieceCount=${lastPieceCount}, lastHeight=${lastHeight}, cycleLength=${cycleLength}, addedHeight=${this.height-lastHeight}`);
                    this.skipPieceCount = repititions * cycleLength;
                    this.skipHeightCount = repititions * (this.height - lastHeight);
                    console.log(`skipping ${this.skipPieceCount} pieces and adding ${this.skipHeightCount} height`);
                    console.log();
                }
                this.lastSeen.set(key, [this.height, this.pieceCount]);
            }
            this.debug();
        }

        console.log();
        return this.height + this.skipHeightCount;
    }

    debug() {
        //*
        console.log(`[${this.pieceCount+this.skipPieceCount}] ${this.height+this.skipHeightCount}`);
        return;
    }
}

let c = new C();

let fn = process.argv[2];
const rl = createInterface({ input: createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log(`Result: ${c.getResult()}`);
});