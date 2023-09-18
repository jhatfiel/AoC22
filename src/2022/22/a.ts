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
    grid = new Array<Array<string>>();
    height = 0;
    width = 0;
    cr = 0;
    cc = 0;
    cf = RIGHT;

    makeKey(row: number, col: number) { return row+','+col; }

    mapFinished = false;

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

    nextRow() {
        let newr = this.cr+1;
        if (newr >= this.height) newr = 0;
        while (this.grid[newr][this.cc] === undefined || this.grid[newr][this.cc] === '' || this.grid[newr][this.cc] === ' ')  {
            newr++;
            if (newr >= this.height) newr = 0;
        }
        return newr;
    }

    prevRow() {
        let newr = this.cr-1;
        if (newr < 0) newr = this.height - 1;
        while (this.grid[newr][this.cc] === undefined || this.grid[newr][this.cc] === '' || this.grid[newr][this.cc] === ' ')  {
            newr--;
            if (newr < 0) newr = this.height - 1;
        }
        return newr;
    }

    nextCol() {
        let newc = this.cc+1;
        if (newc >= this.width) newc = 0;
        while (this.grid[this.cr][newc] === undefined || this.grid[this.cr][newc] === '' || this.grid[this.cr][newc] === ' ')  {
            newc++;
            if (newc >= this.width) newc = 0;
        }
        return newc;
    }

    prevCol() {
        let newc = this.cc-1;
        if (newc < 0) newc = this.width - 1;
        while (this.grid[this.cr][newc] === undefined || this.grid[this.cr][newc] === '' || this.grid[this.cr][newc] === ' ')  {
            newc--;
            if (newc < 0) newc = this.width - 1;
        }
        return newc;
    }

    canWalk(row: number, col: number): boolean {
        return this.grid[row][col] !== WALL;
    }

    waitTime = 0*1000;

    walk(distance: number) {
        while (distance > 0) {
            distance--;
            let nextc = this.cc;
            let nextr = this.cr;
            if (this.cf === RIGHT) nextc = this.nextCol();
            if (this.cf === DOWN)  nextr = this.nextRow();
            if (this.cf === LEFT)  nextc = this.prevCol();
            if (this.cf === UP)    nextr = this.prevRow();

            if (this.canWalk(nextr, nextc)) {
                if (this.cf === RIGHT) this.grid[nextr][nextc] = AR;
                if (this.cf === DOWN)  this.grid[nextr][nextc] = AD;
                if (this.cf === LEFT)  this.grid[nextr][nextc] = AL;
                if (this.cf === UP)    this.grid[nextr][nextc] = AU;
                this.cr = nextr;
                this.cc = nextc;
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