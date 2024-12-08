import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { GridParser, Pair, PairToKey } from '../../lib/gridParser.js';

export class a202408 extends AoCPuzzle {
    gp: GridParser;
    antenna = new Map<string, Pair[]>();
    antinodes: Set<string>[] = [new Set<string>(), new Set<string>()];

    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.gp = new GridParser(lines, [/[a-zA-Z0-9]/g]);
        this.gp.matches.forEach(match => {
            let arr = this.antenna.get(match.value);
            if (!arr) {
                arr = [];
                this.antenna.set(match.value, arr);
            }
            arr.push({x: match.x, y: match.y});
        });
    }

    addIfValid(p: Pair, extended = false): boolean {
        let valid = this.gp.valid(p);
        if (valid) {
            let key = PairToKey(p);
            if (!extended) this.antinodes[0].add(key);
            this.antinodes[1].add(key);
        }
        return valid;
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.antenna.size;
        let freq = [...this.antenna.keys()][this.stepNumber-1];
        let arr = this.antenna.get(freq);
        this.log(`[${this.stepNumber}]: freq=${freq}, arr=${arr.map(p=>PairToKey(p)).join('/')}`);
        // for each i,j pair of the frequencies, find positions that are on the line between them
        for (let i=0; i<arr.length-1; i++) {
            let a=arr[i];
            for (let j=i+1; j<arr.length; j++) {
                let b=arr[j];
                this.antinodes[1].add(PairToKey(a));
                this.antinodes[1].add(PairToKey(b));
                let delta: Pair = {x: a.x-b.x, y:a.y-b.y};
                //this.log(`Pair: ${i}=${a.x},${a.y} vs ${j}=${b.x},${b.y} : dx=${delta.x}/dy=${delta.y}`);
                let antinode: Pair = {x: a.x+delta.x, y: a.y+delta.y};
                //this.log(`  ANTINODE: ${maybe.x},${maybe.y}`);
                let valid = this.addIfValid(antinode);
                while (valid) {
                    antinode = {x: antinode.x + delta.x, y: antinode.y + delta.y};
                    valid = this.addIfValid(antinode, true);
                }
                antinode = {x: b.x-delta.x, y: b.y-delta.y};
                valid = this.addIfValid(antinode);
                while (valid) {
                    antinode = {x: antinode.x - delta.x, y: antinode.y - delta.y};
                    valid = this.addIfValid(antinode, true);
                }
                //this.log(`  ANTINODE: ${maybe.x},${maybe.y}`);
            }
        }
        if (!moreToDo) {
            this.result = this.antinodes[0].size.toString();
            this.log(`Extended result (part 2): ${this.antinodes[1].size.toString()}`);
        }
        return moreToDo;
    }
}