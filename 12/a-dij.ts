import fs from 'fs';
import readline from 'readline';

class C {
    grid = new Array<Array<string>>();
    distance = new Map<string, number>();
    unvisited = new Set<string>();

    start = '';
    exit = '';
    height = 0;
    width = 0;

    curLength = 0;

    makeKey(row: number, col: number) { return row+','+col; }

    process(line: string) {
        this.width = line.length;
        if (line.indexOf('E') > -1) this.exit = this.makeKey(this.height, line.indexOf('E'));

        let thisLineArr = line.replace('E', '{').split('');
        this.grid.push(thisLineArr);

        if (thisLineArr[0] == 'S') this.start = this.makeKey(this.height, 0);

        this.height++;
    }

    getResult() {
        let shortest = Infinity;
        // initialize unvisited
        for (let row=0; row<this.height; row++) {
            for (let col=0; col< this.width; col++) {
                const key = row + ',' + col;
                this.unvisited.add(key);
                this.distance.set(key, Infinity);
            }
        }

        this.distance.set(this.start, 0);

        while (this.unvisited.size) {
            this.debug();
            // find the unvisited node with the lowest distance
            let iter = this.unvisited.entries();
            let nearestUnvisited: string|undefined = undefined;
            let distance = Infinity;
            for (const pair of iter) {
                const key = pair[0];
                const d = this.distance.get(key);
                if (d !== undefined && d < distance) {
                    distance = d;
                    nearestUnvisited = key;
                }
            }
            if (!nearestUnvisited) break;

            const [row, col] = nearestUnvisited.split(',').map(Number);
            let alt = this.grid[row][col];
            if (alt == 'S') alt = 'a';
            let canStep = String.fromCharCode(alt.charCodeAt(0)+1);

            // check neighbor nodes, if "reachable" from nearestUnvisited and this path is shorter, assign distance
            this.try(canStep, distance+1, row, col+1);
            this.try(canStep, distance+1, row+1, col);
            this.try(canStep, distance+1, row, col-1);
            this.try(canStep, distance+1, row-1, col);

            // remove this node from unvisited
            this.unvisited.delete(nearestUnvisited);
        }

        return this.distance.get(this.exit);
    }

    try(canStep: string, distance: number, row: number, col: number) {
        if (row < 0 || col < 0) return;
        if (row >= this.height || col >= this.width) return;
        const key = row + ',' + col;
        if (!this.unvisited.has(key)) return;
        if (this.grid[row][col] <= canStep && this.distance.get(key)! > distance) {
            this.distance.set(key, distance);
        }
    }

    debug(clear=true) {
        if (clear) process.stdout.moveCursor(0, -1*(2+this.height));
        console.log();
        for (let row=0; row<this.height; row++) {
            let line = "";
            for (let col=0; col<this.width; col++) {
                const key = row + ',' + col;
                line += this.distance.get(key)?.toString().padStart(3).substring(0,3);

            }
            console.log(line);
        }
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