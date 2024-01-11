import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { Dijkstra } from '../../lib/dijkstraBetter.js';

class C {
    grid = new Array<Array<string>>();
    dij = new Dijkstra(this.getNeighbors.bind(this));

    start = '';
    exit = '';
    height = 0;
    width = 0;

    curLength = 0;

    getNeighbors(node: string) {
        let result = new Map<string, number>();
        const [row, col] = node.split(',').map(Number);
        let alt = this.grid[row][col];
        if (alt == 'S') alt = 'a';
        let canStep = String.fromCharCode(alt.charCodeAt(0)+1);
        if (row > 0 && this.grid[row-1][col] <= canStep) result.set(this.makeKey(row-1, col), 1);
        if (col > 0 && this.grid[row][col-1] <= canStep) result.set(this.makeKey(row, col-1), 1);
        if (row < this.height-1 && this.grid[row+1][col] <= canStep) result.set(this.makeKey(row+1, col), 1);
        if (col < this.width-1 && this.grid[row][col+1] <= canStep) result.set(this.makeKey(row, col+1), 1);

        return result;
    }

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
        return this.dij.distance(this.start, this.exit);
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