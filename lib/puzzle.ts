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
}