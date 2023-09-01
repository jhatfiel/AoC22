import fs from 'fs';
import readline from 'readline';

const WALL = '█';
const AR = '→';
const AD = '↓';
const AL = '←';
const AU = '↑';
const UR = '↗';
const DR = '↘';
const DL = '↙';
const UL = '↖';
const RIGHT = 0, DOWN = 1, LEFT = 2, UP = 3;

class C {
    constructor() {
        const length = 4;

        for (let row=0; row<5*length; row++) {
            this.nextRowWrap[row] = new Array(5*length);
            this.prevRowWrap[row] = new Array(5*length);
            this.nextColWrap[row] = new Array(5*length);
            this.prevColWrap[row] = new Array(5*length);
        }

        for (let i=0; i<length; i++) {
            //   A
            // BCD
            //   EF
            
            // B.nextRow-E
            // E.nextRow-B
            this.nextRowWrap[2*length-1][0+i] = [3*length-1, 3*length-1-i, UP];
            this.nextRowWrap[3*length-1][3*length-1-i] = [2*length-1, 0+i, UP];

            // C.nextRow-E
            // E.prevCol-C
            this.nextRowWrap[2*length-1][length+i] = [3*length-1-i, 2*length, RIGHT];
            this.prevColWrap[3*length-1-i][2*length] = [2*length-1, length+i, UP];

            // F.nextRow-B
            // B.prevCol-F
            this.nextRowWrap[3*length-1][3*length+i] = [2*length-1-i, 0, RIGHT];
            this.prevColWrap[2*length-1-i][0] = [3*length-1, 3*length+i, LEFT];

            // B.prevRow-A
            // A.prevRow-B
            this.prevRowWrap[length][0+i] = [0, 3*length-1-i, DOWN];
            this.prevRowWrap[0][3*length-1-i] = [length, 0+i, DOWN];

            // C.prevRow-A
            // A.prevCol-C
            this.prevRowWrap[length][length+i] = [0+i, 2*length, RIGHT];
            this.prevColWrap[0+i][2*length] = [length, length+i, DOWN];

            // F.prevRow-D
            // D.nextCol-F
            this.prevRowWrap[2*length][3*length+i] = [2*length-1-i, 3*length-1, LEFT];
            this.nextColWrap[2*length-1-i][3*length-1] = [2*length, 3*length+i, DOWN];

            // A.nextCol-F
            // F.nextCol-A
            this.nextColWrap[0+i][3*length-1] = [3*length-1-i, 4*length-1, LEFT];
            this.nextColWrap[3*length-1-i][4*length-1] = [0+i, 3*length-1, RIGHT];
        }
    }

    grid = new Array<Array<string>>();
    height = 0;
    width = 0;
    cr = 0;
    cc = 0;
    cf = RIGHT;
    waitTime = 500;

    makeKey(row: number, col: number) { return row+','+col; }

    mapFinished = false;

    nextRowWrap = new Array<Array<Array<number>>>();
    prevRowWrap = new Array<Array<Array<number>>>();
    nextColWrap = new Array<Array<Array<number>>>();
    prevColWrap = new Array<Array<Array<number>>>();

    process(line: string) {
        if (!line.length) {
            this.mapFinished = true;
        } else if (!this.mapFinished) {
            // building map
            if (this.grid.length === 0) {
                this.cc = line.indexOf('.');
                line = line.replace('.', AR);
            }
            this.grid.push(line.replace(/#/g, WALL).split('')); 
            this.width = Math.max(this.width, this.grid[this.grid.length-1].length);
        } else {
            // process movement
            // movement line is ##L##R##R##....L## (always starts and ends with number, never repeats turns)
            this.height = this.grid.length;
            console.log(`Path line: ${line}`);
            this.debug(false);
            let ind = 0;
            while (ind < line.length) {
                // get current path length
                let n = 0;
                let nextL = line.indexOf('R', ind);
                let nextR = line.indexOf('L', ind);
                if (nextL === -1) nextL = Infinity;
                if (nextR === -1) nextR = Infinity;
                if (nextL < nextR) { n = Number(line.substring(ind, nextL)); ind = nextL; }
                else               { n = Number(line.substring(ind, nextR)); ind = nextR; }
                this.walk(n);
                // get next turn direction
                if (line.slice(ind, ind+1) === 'R') {
                    if      (this.cf === RIGHT) { this.cf = DOWN;  this.grid[this.cr][this.cc] = DR; }
                    else if (this.cf === DOWN)  { this.cf = LEFT;  this.grid[this.cr][this.cc] = DL; }
                    else if (this.cf === LEFT)  { this.cf = UP;    this.grid[this.cr][this.cc] = UL; }
                    else if (this.cf === UP)    { this.cf = RIGHT; this.grid[this.cr][this.cc] = UR; }
                } else if (line.slice(ind, ind+1) === 'L') {
                    if     (this.cf === RIGHT) { this.cf = UP;    this.grid[this.cr][this.cc] = UR; }
                    else if (this.cf === DOWN)  { this.cf = RIGHT; this.grid[this.cr][this.cc] = DR; }
                    else if (this.cf === LEFT)  { this.cf = DOWN;  this.grid[this.cr][this.cc] = DL; }
                    else if (this.cf === UP)    { this.cf = LEFT;  this.grid[this.cr][this.cc] = UL; }
                }
                ind++;
                this.debug();
            }
        }
    }

    nextRow(): Array<number> {
        return this.nextRowWrap[this.cr][this.cc] ?? [this.cr + 1, this.cc, this.cf];
    }

    prevRow(): Array<number> {
        return this.prevRowWrap[this.cr][this.cc] ?? [this.cr - 1, this.cc, this.cf];
    }

    nextCol(): Array<number> {
        return this.nextColWrap[this.cr][this.cc] ?? [this.cr, this.cc + 1, this.cf];
    }

    prevCol(): Array<number> {
        return this.prevColWrap[this.cr][this.cc] ?? [this.cr, this.cc - 1, this.cf];
    }

    canWalk(row: number, col: number): boolean {
        return this.grid[row][col] !== WALL;
    }

    walk(distance: number) {
        while (distance > 0) {
            distance--;
            let nextc = this.cc;
            let nextr = this.cr;
            let nextf = this.cf;
            if (this.cf === RIGHT) { [nextr, nextc, nextf] = this.nextCol(); }
            if (this.cf === DOWN)  { [nextr, nextc, nextf] = this.nextRow(); }
            if (this.cf === LEFT)  { [nextr, nextc, nextf] = this.prevCol(); }
            if (this.cf === UP)    { [nextr, nextc, nextf] = this.prevRow(); }

            if (this.canWalk(nextr, nextc)) {
                this.cr = nextr;
                this.cc = nextc;
                this.cf = nextf;
                if (this.cf === RIGHT) this.grid[nextr][nextc] = AR;
                if (this.cf === DOWN)  this.grid[nextr][nextc] = AD;
                if (this.cf === LEFT)  this.grid[nextr][nextc] = AL;
                if (this.cf === UP)    this.grid[nextr][nextc] = AU;
            } else {
                distance = 0;
            }
        }
    }

    getResult() {
        this.debug(false);

        console.log(`Row: ${this.cr} Col: ${this.cc} Face: ${this.cf}`);

        return 1000*(this.cr+1) + 4*(this.cc+1) + this.cf;
    }

    debug(clear=true) {
        if (clear) process.stdout.moveCursor(0, -1*(1+this.height));
        console.log();
        for (let row=0; row<this.height; row++) {
            let str = this.grid[row].join('');
            //if (row === this.cr) str = str.slice(0, this.cc) + 'o' + str.slice(this.cc+1);
            console.log(str);
        }
        if (this.waitTime) { let waitTill = new Date(new Date().getTime() + this.waitTime); while (waitTill > new Date()) {}; }
    }

}

let c = new C();

let fn = process.argv[2];
const rl = readline.createInterface({ input: fs.createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log(`Result: ${c.getResult()}`);
});