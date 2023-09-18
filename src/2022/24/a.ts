import fs from 'fs';
import readline from 'readline';
import { Dijkstra } from '../../lib/dijkstra';

const WALL = '█';

class Storm {
    constructor(public cr: number, public cc: number, public move: (s: Storm) => void) {};
}

class C {
    constructor() { this.grid[0] = new Array<Array<string>>(); }
    grid = new Array<Array<Array<string>>>();
    height = 0;
    width = 0;
    depth = 1;
    cr = 0;
    cc = 0;
    minute = 0;
    er = 0;
    ec = 0;
    dij = new Dijkstra(this.getNeighbors.bind(this))
    storms = new Array<Storm>();
    path = new Array<string>();
    waitTime = 0*1000;

    makeKey(row: number, col: number, depth: number) { return row+','+col+','+depth; }

    process(line: string) {
        // building map
        if (this.grid[0].length === 0) this.cc = line.indexOf('.');
        if (line.indexOf('###') >= 0) { this.er = this.height; this.ec = line.indexOf('.') }
        let arr = line.split('');
        // record each storm so we can move it for the depth copies of the grid
        for (let i=0; i<arr.length; i++) {
            if (arr[i] === '#') arr[i] = WALL;
            else if (arr[i] === '^') { let s = new Storm(this.height, i, this.moveUp.bind(this)); this.storms.push(s); }
            else if (arr[i] === '>') { let s = new Storm(this.height, i, this.moveRight.bind(this)); this.storms.push(s); }
            else if (arr[i] === 'v') { let s = new Storm(this.height, i, this.moveDown.bind(this)); this.storms.push(s); }
            else if (arr[i] === '<') { let s = new Storm(this.height, i, this.moveLeft.bind(this)); this.storms.push(s); }
        }
        this.grid[0].push(arr);

        this.width = Math.max(this.width, this.grid[0][this.grid[0].length-1].length);
        this.height++;
    }

    moveUp(s: Storm) { 
        s.cr--;
        if (s.cr === 0) s.cr = this.height-2;
        this.placeStorm(s, '^');
    }
    moveRight(s: Storm) {
        s.cc++;
        if (s.cc === this.width-1) s.cc = 1;
        this.placeStorm(s, '>');
    }
    moveDown(s: Storm) {
        s.cr++;
        if (s.cr === this.height-1) s.cr = 1;
        this.placeStorm(s, 'v');
    }
    moveLeft(s: Storm) {
        s.cc--;
        if (s.cc === 0) s.cc = this.width-2;
        this.placeStorm(s, '<');
    }

    placeStorm(s: Storm, char: string) {
        const d = this.minute % this.depth;
        let c = this.grid[d][s.cr][s.cc];
        let n = Number(c);
        if (Number.isNaN(n)) n = 1;
        if (c === '.') this.grid[d][s.cr][s.cc] = char;
        else           this.grid[d][s.cr][s.cc] = (n+1).toString();
    }

    getResult() {
        //this.debug(false);
        this.buildDepth();

        let root = this.makeKey(this.cr, this.cc, 0); // 0,1,0
        let exit = this.makeKey(this.er, this.ec, 0); 
        console.log(`root = ${root}, exit = ${exit}`);

        this.path = this.dij.getShortestPath(root, exit);
        console.log(this.path);
        const pathLen = this.path.length;

        this.minute = 0;
        //this.debug(false);

        this.path.shift();

        // walk the path
        /*
        while (this.path.length) {
            this.minute++;
            const next = this.path.shift();
            const [row,col,depth] = next!.split(',').map(Number);
            if (depth !== this.minute%this.depth) throw new Error(`next doesn't match ${next}`);
            this.cr = row;
            this.cc = col;

            this.debug(false);
        }
        */

        this.cr = this.er;
        this.cc = this.ec;
        //this.debug(false);

        return pathLen;
    }

    getNeighbors(node: string) {
        /*
        fs.writeSync(process.stdout.fd, `getNeighbors ${node}\n`);
        process.stdout.moveCursor(0, -1);
        */
        let result = new Map<string, number>();
        //this.valves.get(node)?.connected.forEach((v) => result.set(v.name, 1));
        // z is the minute offset - used to determine when "depth" layer we are at
        const [row,col,depth] = node.split(',').map(Number);
        let newd = (depth+1)%this.depth;
        // we can go to one of 5 locations.  This location on the next "depth" layer, or N/E/S/W on the next depth layer (assuming not walls)
        result.set(this.makeKey(row,col,newd), 1);
        if (row>0             && this.grid[newd][row-1][col] === '.') result.set(this.makeKey(row-1,col,newd), 1);
        if (col>0             && this.grid[newd][row][col-1] === '.') result.set(this.makeKey(row,col-1,newd), 1);
        if (row<this.height-1 && this.grid[newd][row+1][col] === '.') result.set(this.makeKey(row+1,col,newd), 1);
        if (col<this.width-1  && this.grid[newd][row][col+1] === '.') result.set(this.makeKey(row,col+1,newd), 1);

        // special case for exit cell - we can hit it at any depth
        if (row === this.height-2 && col === this.ec)
            for (let d=0; d<this.depth; d++)
                if (d !== newd) result.set(this.makeKey(row+1,col,d), 1);

        return result;
    }

    buildDepth() {
        const lcm = C.lcm(this.width-2, this.height-2);
        this.depth = lcm;
        console.log(`width = ${this.width-1}, height = ${this.height-1}, depth = ${this.depth}`);
        // need to make $depth copies of the grid
        console.log('Initializing depth grid');
        for (this.minute=1; this.minute<this.depth; this.minute++) {
            process.stdout.moveCursor(0, -1);
            console.log(`Initializing depth grid ${this.minute}/${this.depth-1}`);
            this.grid.push(new Array<Array<string>>());
            this.grid[this.minute].push(this.grid[0][0]);
            for (let row=1; row<this.height-1; row++) {
                let arr = new Array<string>(this.width).fill('.');
                arr[0] = WALL;
                arr[this.width-1] = WALL;
                this.grid[this.minute].push(arr);
            }
            this.grid[this.minute].push(this.grid[0][this.height-1]);
            this.storms.forEach((s) => s.move(s));
        }

        for (let row=0; row<this.height; row++) {
            for (let col=0; col<this.width; col++) {
                for (let z=0; z<this.depth; z++) {
                    if (this.grid[z][row][col] === '.') this.dij.addNode(this.makeKey(row, col, z));
                }
            }
        }

        console.log()
    }

    static gcd(x: number, y: number): number {
        return (y === 0)?x:C.gcd(y, x%y);
    }

    static lcm(x: number, y: number): number {
        return x*(y/C.gcd(x, y));
    }

    debug(clear=true) {
        if (clear) process.stdout.moveCursor(0, -1*(1+this.height));
        console.log(`[${this.minute.toString().padStart(3, ' ')}] --------`);
        for (let row=0; row<this.height; row++) {
            let d = this.minute%this.depth;
            let str = this.grid[d][row].join('');
            if (this.cr === row) {
                str = str.slice(0, this.cc) + 'E' + str.slice(this.cc+1);
            }
            /*
            if (this.er === row) {
                str = str.slice(0, this.ec) + 'X' + str.slice(this.ec+1);
            }
            */
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