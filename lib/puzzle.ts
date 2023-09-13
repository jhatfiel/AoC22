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