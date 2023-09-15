import fs from 'fs';
import readline from 'readline';

export class Puzzle {
    constructor(private fn: string) { }

    run() {
        const rl = readline.createInterface({ input: fs.createReadStream(this.fn), crlfDelay: Infinity, terminal: false});
        rl.on('line', this.onLine.bind(this));
        rl.on('close', this.onClose.bind(this));
    }

    onLine(line: string) { console.log(`Line: ${line}`); }

    onClose() { console.log(`Closed`); }
    
    toMask(arr: Array<string>, set: Set<string>): number {
        return arr.map((n, i) => set.has(n)?1<<i:0).reduce((p, v) => p | v, 0);
    }

    toSet(arr: Array<string>, mask: number): Set<string> {
        return new Set(arr.filter((v, ind) => 1<<ind & mask));
    }

    maskOr(arr: Array<string>, mask: number, el: string): number {
        return mask | (1<<arr.indexOf(el));
    }

    toMaskN(arr: Array<number>, set: Set<number>): number {
        return arr.map((n, i) => set.has(n)?1<<i:0).reduce((p, v) => p | v, 0);
    }

    toSetN(arr: Array<number>, mask: number): Set<number> {
        return new Set(arr.filter((v, ind) => 1<<ind & mask));
    }
    
    maskOrN(arr: Array<number>, mask: number, el: number): number {
        return mask | (1<<arr.indexOf(el));
    }
    
    gridAround(row: number, col: number, maxRow: number, maxCol: number): Array<{row: number, col: number}> {
        let result = new Array<{row: number, col: number}>();
        if (row > 0 && col > 0)           result.push({row: row-1, col: col-1});
        if (row > 0)                      result.push({row: row-1, col: col});
        if (row > 0 && col < maxCol)      result.push({row: row-1, col: col+1});

        if (col > 0)                      result.push({row: row, col: col-1});
        if (col < maxCol)                 result.push({row: row, col: col+1});

        if (row < maxRow && col > 0)      result.push({row: row+1, col: col-1});
        if (row < maxRow)                 result.push({row: row+1, col: col});
        if (row < maxRow && col < maxCol) result.push({row: row+1, col: col+1});
        return result;
    }

    gridOrthogonal(row: number, col: number, maxRow: number, maxCol: number): Array<{row: number, col: number}> {
        let result = new Array<{row: number, col: number}>();
        if (row > 0)                      result.push({row: row-1, col: col});

        if (col > 0)                      result.push({row: row, col: col-1});
        if (col < maxCol)                 result.push({row: row, col: col+1});

        if (row < maxRow)                 result.push({row: row+1, col: col});
        return result;
    }
}