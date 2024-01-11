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
    constructor(public grid: Array<Array<string>>, public row: number, public column: number) { }

    drawShape(char: string) {
        this.pointOffsets().forEach((p) => {
            this.grid[this.row+p[0]][this.column+p[1]] = char;
        })
    }

    abstract pointOffsets(): Array<Array<number>>;

    add() { this.drawShape('@'); }
    remove() { this.drawShape('.'); }
    moveRight() {
        if (this.pointOffsets().every((p) => this.isClear(this.row+p[0], this.column+1+p[1]))) {
            this.remove(); this.column++; this.add();
        }
    }
    moveLeft() {
        if (this.pointOffsets().every((p) => this.isClear(this.row+p[0], this.column-1+p[1]))) {
            this.remove(); this.column--; this.add();
        }
    }
    moveDown() {
        let couldDrop = false;
        if (this.pointOffsets().every((p) => this.isClear(this.row-1+p[0],this.column+p[1]))) {
            couldDrop = true;
            this.remove(); this.row--; this.add();
        }
        return couldDrop;
    }
    isClear(row: number, column: number) {
        let isClear = true;
        if (column < 0 || column > 6 || row < 0 ||
            this.grid[row][column] === '█') isClear = false;
        return isClear;
    }
    stop() { this.drawShape('█'); }
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
    constructor() {
        for (let i=0; i<4000; i++) {
            this.grid.push(new Array(7).fill('.'));
        }
    }

    cycle = 0;
    grid = new Array<Array<string>>();
    wind = '';
    windInd = 0;
    height = 0;
    currentShape = new S1(this.grid, 0, 0);
    pieceCount = 0;
    maxPieceCount = 2022;

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
        this.debug();
    }

    updateHeight() {
        while (this.grid[this.height].some((c) => c !== '.')) { this.height++; }
    }

    getResult() {
        while (this.pieceCount < this.maxPieceCount) {
            this.newPiece();
            while (this.tick(0*1000)) { this.debug(); }
            this.currentShape.stop();
            this.pieceCount++;
            this.updateHeight();
            this.debug();
        }

        this.debug(false);

        return this.height;
    }

    debug(clear=true) {
        return;
        console.log(`[${this.pieceCount}] ${this.height} ${this.wind.substring(this.windInd, this.windInd+1)} ------------------`);
        let top = this.height+6
        let bottom = this.height - 20;
        if (this.height < 20) {
            top = 26;
            bottom = 0;
        }
        for (let row=top; row>=bottom; row--) {
            console.log(this.grid[row].join(''));
        }
        if (clear) process.stdout.moveCursor(0, -1*(28));
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