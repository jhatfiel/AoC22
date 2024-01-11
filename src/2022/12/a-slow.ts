
// part 2 is going to ask how many possible routes have the optimal number of steps, isn't it?

import { createReadStream } from "fs";
import { createInterface } from "readline";

class Point { 
    constructor(public row: number, public col: number) {};
    toString() {return `(${this.row},${this.col})`};
    clone() { return new Point(this.row, this.col); };
};

class C {
    grid = new Array<Array<string>>();
    status = new Array<Array<string>>();
    shortest = new Array<Array<number>>();
    curPos = new Point(0, 0);
    exit = new Point(0, 0);
    depth = 0;
    height = 0;
    width = 0;

    process(line: string) {
        this.width = line.length;
        if (line.indexOf('E') > -1) this.exit = new Point(this.height, line.indexOf('E'));
        line = line.replace('E', '{');
        console.log(line);
        let thisLineArr = line.split('');
        if (thisLineArr[0] == 'S') this.curPos = new Point(this.height, 0);
        this.grid.push(thisLineArr);
        this.status.push(Array(this.width).fill('.'));
        this.shortest.push(Array(this.width).fill(Infinity));
        this.height++;
    }

    findSolutions(): Array<Array<Point>> {
        //console.log('----------------- findSolutions() ------------------');
        //let waitTill = new Date(new Date().getTime() + 500);
        //while (waitTill > new Date()) {}
        this.debug();
        let solutions = Array<Array<Point>>();
        let row = this.curPos.row;
        let col = this.curPos.col;

        if (this.grid[row][col] == '{') {
            solutions.push(new Array<Point>());
            this.debug(false);
            this.debug(false);
        } else {
            let v = this.validMoves();
            //console.log(`valid moves from ${this.curPos} are ${v}`);
            let originalPos = this.curPos.clone();
            this.depth++;

            v.forEach((move) => {
                this.curPos = originalPos.clone();
                this.status[row][col] = move;
                switch(move) {
                    case '^': { this.curPos.row--; break; }
                    case 'v': { this.curPos.row++; break; }
                    case '<': { this.curPos.col--; break; }
                    case '>': { this.curPos.col++; break; }
                }
                let shortestToHere = this.shortest[this.curPos.row][this.curPos.col];
                let shortestToExit = this.shortest[this.exit.row][this.exit.col];
                if (this.depth >= shortestToHere || this.depth >= shortestToExit) {
                    // just abort because it's useless to continue down a path where it took us longer to get here.
                } else {
                    this.shortest[this.curPos.row][this.curPos.col] = this.depth;

                    let solutionsFromHere = this.findSolutions();
                    solutionsFromHere.forEach((s) => {
                        solutions.push([originalPos.clone(), ...s])
                    });
                }
            });
            this.status[row][col] = '.';
            this.depth--;
        }

        return solutions;
    }

    validMoves(): Array<string> {
        let valid = Array<string>();
        let row = this.curPos.row;
        let col = this.curPos.col;
        let height = this.grid[row][col];
        if (height == 'S') height = 'a';
        let canStep = String.fromCharCode(height.charCodeAt(0)+1);
        const m = this.height-1;
        const n = this.width-1;
        
        // move is valid if not yet moved to and no more than one step up
        let hasExit = this.computeHasExit();

        // which direction to try first?  If the exit is to the right, go right first.  If the exit is "more" up, go up first.
        let toTry = Array<Array<any>>();
        toTry.push(['>', row, col+1, this.exit.col-col]);
        toTry.push(['v', row+1, col, this.exit.row-row]);
        toTry.push(['<', row, col-1, col-this.exit.col]);
        toTry.push(['^', row-1, col, row-this.exit.row]);

        toTry.sort((a, b) => b[3] - a[3])
            .forEach((t) => {
                row = t[1]; col = t[2];
                if (row >= 0 && row < this.height && col >= 0 && col < this.width && this.grid[row][col] <= canStep && this.status[row][col] == '.' && hasExit[row][col]) valid.push(t[0]);
            });

        return valid;
    }

    computeHasExit() {
        let hasExit = new Array<Array<boolean>>();
        for (let row=0; row<this.height; row++) {
            hasExit.push(Array(this.width).fill(false));
        }
        let inspectSet = new Set<string>();
        inspectSet.add(`${this.exit.row},${this.exit.col}`);

        const m = this.height-1;
        const n = this.width-1;
        while (inspectSet.size) {
            //console.log(`inspectSet.size=${inspectSet.size}: ${Array.from(inspectSet).join(',')}`);
            let next = inspectSet.entries().next().value[0];
            let nextArr = next.split(',');
            let p = new Point(Number(nextArr[0]), Number(nextArr[1]));
            inspectSet.delete(next);
            const row = p.row;
            const col = p.col;
            hasExit[row][col] = true;
            let height = this.grid[row][col];
            if (height == 'S') height = 'a';
            if (height == 'E') height = 'z';
            let canStep = String.fromCharCode(height.charCodeAt(0)-1);

            // can each orthogonal direction get to this location?
            if (row > 0 && this.status[row-1][col] == '.' && !hasExit[row-1][col] && this.grid[row-1][col] >= canStep) inspectSet.add(`${row-1},${col}`);
            if (col > 0 && this.status[row][col-1] == '.' && !hasExit[row][col-1] && this.grid[row][col-1] >= canStep) inspectSet.add(`${row},${col-1}`);
            if (row < m && this.status[row+1][col] == '.' && !hasExit[row+1][col] && this.grid[row+1][col] >= canStep) inspectSet.add(`${row+1},${col}`);
            if (col < n && this.status[row][col+1] == '.' && !hasExit[row][col+1] && this.grid[row][col+1] >= canStep) inspectSet.add(`${row},${col+1}`);
        }
        //this.debugHasExit(hasExit);
        return hasExit;
    }

    getResult() {
        let solutions = this.findSolutions();
        solutions.forEach((s) => {
            console.log(`solution: ${s}`);
        });
        let initialValue = Infinity;
        let shortest = solutions.reduce((best, s) => (s.length < best)?s.length:best, initialValue);
        console.log('best solutions:');
        solutions.forEach((s) => {
            if (s.length == shortest) console.log(`solution: ${s}`);
        });
        return shortest;
    }

    debug(clear=true) {
        if (clear) process.stdout.moveCursor(0, -2+this.height*-1);
        console.log();
        this.status.forEach((r) => {
            console.log(r.join(''));
        });
        console.log(`Path Length: ${this.depth}   Current Height: ${this.grid[this.curPos.row][this.curPos.col]}   `);
    }

    debugHasExit(hasExit: Array<Array<boolean>>) {
        console.log();
        hasExit.forEach((r) => {
            console.log(r.map((v)=>v?'E':'.').join(''));
        });
        process.stdout.moveCursor(0, -1+this.height*-1);
    }
}

let c = new C();

let fn = process.argv[2];
const rl = createInterface({ input: createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    c.debug();
    c.shortest[c.exit.row][c.exit.col] = 383;

    console.log(`Result: ${c.getResult()}`);
});