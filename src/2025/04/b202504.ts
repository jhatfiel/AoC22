import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { GridParser, Pair } from '../../lib/gridParser.js';

export class b202504 extends AoCPuzzle {
    gp: GridParser;
    rolls: Pair[] = [];
    grid: string[][] = [];
    count=0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.gp = new GridParser(lines, [/@/g]);
        this.rolls = this.gp.matches.map(m => ({x: m.x, y: m.y}));
        this.grid = this.gp.grid;
    }

    _runStep(): boolean {
        const pos = this.rolls.pop();
        let moreToDo = this.rolls.length>0;
        if (this.grid[pos.y][pos.x] === '@') {
            const adj = this.gp.gridAdjacentCells(pos);
            if (adj.filter(([_, s]) => s==='@').length < 4) {
                //console.log(`Can remove ${pos.x},${pos.y}`);
                this.grid[pos.y][pos.x] = '.'
                adj.filter(([_, s]) => s==='@').forEach(([p]) => this.rolls.push(p));
                this.count++;
            }
        }
        if (!moreToDo) {
            this.result = this.count.toString();
        }
        return moreToDo;
    }
}