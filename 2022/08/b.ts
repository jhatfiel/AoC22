import fs from 'fs';
import readline from 'readline';

const arrayRange = (start: number, stop: number, step: number) => Array.from( { length: (stop - start) / step + 1 }, (value, index) => start + index * step);

class C {
    constructor() {};

    tree = Array<Array<number>>();

    process(line: string) {
        this.tree.push(line.split('').map(Number));
    }

    scenicTrees() {
        var bestScore = 0;

        var maxRows = this.tree.length;
        for (var row=0; row < maxRows; row++) {
            var maxCols = this.tree[row].length;
            for (var col=0; col < maxCols; col++) {
                const height = this.tree[row][col];
                var score = 0;
                if (col == 0 || row == 0 || col == maxCols-1 || row == maxRows-1)  {}
                else {
                    var left = this.score(height, this.tree[row].slice(0, col)); // Left range
                    var right = this.score(height, this.tree[row].slice(col+1).reverse()); // Right range
                    var top = this.score(height, this.tree.slice(0,row).map((r)=>r[col])); // Top range
                    var bottom = this.score(height, this.tree.slice(row+1).map((r)=>r[col]).reverse()); // Bottom range
                    score = left * right * top * bottom;
                    //console.log(`Tree ${height} at ${row},${col} left=${left}, right=${right}, top=${top}, bottom=${bottom}, score=${score}`);
                }
                if (score > bestScore) { console.log('New best tree ' + height + ' at ' + row + ',' + col + ' with score = ' + score); bestScore = score; }
            }
        }
        
        return bestScore;
    }

    score(height: number, view: Array<number>) {
        //console.log(`score(${height}, ${view})`);
        var result = 0;
        while (view.length) {
            var current = view.pop();
            result++;
            if (current == undefined || current >= height) break;
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
const rl = readline.createInterface({ input: fs.createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log('Most scenic tree: ' + c.scenicTrees());
});
