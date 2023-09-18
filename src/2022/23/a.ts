import fs from 'fs';
import readline from 'readline';

class Elf {
    constructor(public row: number, public col: number) {}
    pr?: number;
    pc?: number;
}

class C {
    constructor() {
        for (let row=0; row<this.offset*2; row++)
            this.grid[row] = new Array<string>(this.offset*2).fill('.');
    }
    grid = new Array<Array<string>>();
    waitTime = 0*1000;
    offset = 2000;
    first = this.offset;
    left = this.offset;
    right = this.offset;
    last = this.offset;
    elves = new Array<Elf>();
    toMove = new Array<Elf>();
    roundNdx = 0;
    dirCheck = [[[-1, -1], [-1, 0], [-1, 1]],
                 [[1, -1], [1, 0], [1, 1]],
                 [[-1, -1], [0, -1], [1, -1]],
                 [[-1, 1], [0, 1], [1, 1]]]

    process(line: string) {
        // building map
        const arr = line.split('') 
        arr.forEach((v, ind) => {
            if (v === '#') {
                this.grid[this.last][this.offset+ind] = '#';
                this.elves.push(new Elf(this.last, this.offset+ind));
            }
        })
        this.right = this.offset+line.length-1;
        this.last++;
    }

    makeKey(row: number, col: number): string { return row+','+col; }

    startProcess() {
        this.toMove = new Array<Elf>();
        this.elves.forEach((e) => { this.toMove.push(e); });
    }

    runProcess() {
        // reserve a spot for each elfe that wants to move
        // iterate through reservations, move everyone who isn't conflicting
        let moved = false;
        let reservation = new Map<string, Elf>();
        while (this.toMove.length) {
            let e = this.toMove.pop()!;
            //console.log(`Looking at elf: ${this.makeKey(e.row, e.col)}`);
            // we don't move if there's nobody around us
            if (this.canMove(e, this.dirCheck[0]) && this.canMove(e, this.dirCheck[1]) &&
                this.canMove(e, this.dirCheck[2]) && this.canMove(e, this.dirCheck[3])) {
                // do nothing
                //console.log(`Don't need to move ${e.row-this.offset},${e.col-this.offset}`);
            } else {
                for (let ndx=0; ndx<4; ndx++) {
                    let arr = this.dirCheck[(this.roundNdx+ndx) % 4];
                    if (this.canMove(e, arr)) {
                        const key = this.makeKey(e.row+arr[1][0], e.col+arr[1][1]);
                        if (reservation.has(key)) {
                            //console.log(`Conflict for ${e.row-this.offset},${e.col-this.offset} at ${key}`);
                            reservation.get(key)!.pc = undefined; // to keep track of who actually gets to move
                            reservation.get(key)!.pr = undefined;
                        } else {
                            e.pr = e.row+arr[1][0]; e.pc = e.col+arr[1][1];
                            reservation.set(key, e);
                            //console.log(`Propose moving elf ${this.makeKey(e.row, e.col)} to ${key}`);
                        }
                        break;
                    }
                }
            }
        }

        reservation.forEach((e, k) => {
            if (e.pc && e.pr) {
                //console.log(`Moving ${e.row-this.offset},${e.col-this.offset} to ${e.pr-this.offset},${e.pc-this.offset}`);
                this.grid[e.row][e.col] = '.';
                e.row = e.pr;
                e.col = e.pc;
                this.grid[e.row][e.col] = '#';
                this.first = Math.min(this.first, e.row);
                this.last = Math.max(this.last, e.row);
                this.left = Math.min(this.left, e.col);
                this.right = Math.max(this.right, e.col);
                moved = true;
            }
        })

        return moved;
    }

    canMove(e: Elf, arr: Array<Array<number>>): boolean {
        return this.grid[e.row+arr[0][0]][e.col+arr[0][1]] !== '#' && 
               this.grid[e.row+arr[1][0]][e.col+arr[1][1]] !== '#' && 
               this.grid[e.row+arr[2][0]][e.col+arr[2][1]] !== '#';
    }

    getResult() {
        /*
        this.first = 1999;
        this.last = 2009;
        this.left = 1998;
        this.right = 2010;
        */

        console.log(`Initial state`);
        this.debug(false);
        let keepGoing = true;

        while (keepGoing) {
            this.startProcess();

            //console.log(`During round: ${this.roundNdx}`);
            keepGoing = this.runProcess();
            //this.debug(false);

            this.roundNdx++;
            console.log(`After round: ${this.roundNdx}`);
            this.debug();
        }

        console.log(`Final`);
        this.debug(false);

        console.log(`Finished`);

        return (this.last-this.first+1) * (this.right-this.left+1) - this.elves.length;
    }

    debug(clear=true) {
        return;
        if (clear) process.stdout.moveCursor(0, -1*(4+(this.last+1-this.first-1)));
        let toMoveStr = '(' + 
            this.toMove.map((e) => (e.row-this.first+1) + ',' + (e.col-this.left+1)).join(' / ') +
            ')';
        console.log(`RoundNdx [${this.roundNdx.toString().padStart(3, ' ')}] ${toMoveStr} --------       `);
        for (let row=this.first-1; row<this.last+1; row++) {
            let str = this.grid[row].slice(this.left-1, this.right+2).join('');
            console.log(str + '                       ');
        }
        console.log('--------------------------');
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