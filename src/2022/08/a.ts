import { createReadStream } from "fs";
import { createInterface } from "readline";

const arrayRange = (start: number, stop: number, step: number) => Array.from( { length: (stop - start) / step + 1 }, (value, index) => start + index * step);

class C {
    constructor() {};

    tree = Array<Array<number>>();

    process(line: string) {
        this.tree.push(line.split('').map(Number));
    }

    visibleTrees() { 
        var result = 0;

        var maxRows = this.tree.length;
        for (var row=0; row < maxRows; row++) {
            var maxCols = this.tree[row].length;
            for (var col=0; col < maxCols; col++) {
                const height = this.tree[row][col];
                if (col == 0 || row == 0 || col == maxCols-1 || row == maxRows-1) result++
                else {
                    var left = this.tree[row].slice(0, col) // Left range
                    var right = this.tree[row].slice(col+1) // Right range
                    var top = this.tree.slice(0,row).map((r)=>r[col]); // Top range
                    var bottom = this.tree.slice(row+1).map((r)=>r[col]); // Bottom range
                    if (height > Math.max(...left) || height > Math.max(...right) || height > Math.max(...top) || height > Math.max(...bottom)) result++;
                }
            }
        }
        
        return result;
    }

    debug() {
        console.log('-----');
        this.tree.forEach((r) => console.log(r.join('')));
        console.log('-----');
    }
}

var c = new C();

var fn = process.argv[2];
const rl = createInterface({ input: createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
    //c.debug();
})

rl.on('close', () => {
    console.log('Visible trees: ' + c.visibleTrees());
});
