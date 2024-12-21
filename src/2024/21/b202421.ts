import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Permutations } from '../../lib/CombiPerm.js';
import { Pair } from '../../lib/gridParser.js';

export class b202421 extends AoCPuzzle {
    sum = 0;
    bestAtLevel: number[];

    sampleMode(): void { };

    _loadData(lines: string[]) { }

    buildNumpadSequences(code: string): string[] {
        // 789
        // 456
        // 123
        //  0A
        // start at A (bottom right) which is (2,3)
        // can't ever point at 0,3!!!
        let results: string[] = [''];
        let loc = new Map<string, Pair>([
            ['7', {x: 0, y: 0}], ['8', {x: 1, y: 0}], ['9', {x: 2, y: 0}],
            ['4', {x: 0, y: 1}], ['5', {x: 1, y: 1}], ['6', {x: 2, y: 1}],
            ['1', {x: 0, y: 2}], ['2', {x: 1, y: 2}], ['3', {x: 2, y: 2}],
                                 ['0', {x: 1, y: 3}], ['A', {x: 2, y: 3}],
        ]);
        let pos: Pair = {x: 2, y: 3};
        let ways: string[] = [];
        for (let i=0; i<code.length; i++) {
            let des = loc.get(code[i]);
            let needed = '';
            if (des.x < pos.x) needed += '<'.repeat(pos.x-des.x);
            if (des.y > pos.y) needed += 'v'.repeat(des.y-pos.y);
            if (des.y < pos.y) needed += '^'.repeat(pos.y-des.y);
            if (des.x > pos.x) needed += '>'.repeat(des.x-pos.x);

            ways = [...Permutations(needed.split(''))].map(way => way.join(''));
            let newResults: string[] = [];
            for (let res of results) {
                let tried = new Set<string>();
                for (let way of ways) {
                    if (tried.has(way)) continue;
                    tried.add(way);
                    if (pos.y === 3) {
                        if (pos.x === 1 && way.startsWith('<')) continue;
                        if (pos.x === 2 && way.startsWith('<<')) continue;
                    }
                    if (des.y === 3) {
                        if (des.x === 1 && way.endsWith('>')) continue;
                        if (des.x === 2 && way.endsWith('>>')) continue;
                    }
                    if (pos.y - des.y === 3 && way.indexOf('^^^') === -1) continue;
                    if (des.y - pos.y === 3 && way.indexOf('vvv') === -1) continue;
                    if (pos.y - des.y === 2 && way.indexOf('^^') === -1) continue;
                    if (des.y - pos.y === 2 && way.indexOf('vv') === -1) continue;
                    if (pos.x - des.x === 2 && way.indexOf('<<') === -1) continue;
                    if (des.x - pos.x === 2 && way.indexOf('>>') === -1) continue;
                    newResults.push(res + way + 'A');
                }
            }
            pos = des;
            results = newResults;
        }
        return results;
    }

    cache: Map<string, number>[] = [];
    countPresses(seq: string, atLevel: number): number {
        //  ^A
        // <v>
        // start at A (top right) which is (2,0)
        // can't ever point at 0,0!!!
        let map = this.cache[atLevel];
        if (!map) {
            map = new Map<string, number>();
            this.cache[atLevel] = map;
        }
        if (atLevel === 0) return seq.length; // human just presses buttons
        atLevel--;
        if (map.has(seq)) return map.get(seq);
        let count = 0;
        let loc = new Map<string, Pair>([
                                 ['^', {x: 1, y: 0}], ['A', {x: 2, y: 0}],
            ['<', {x: 0, y: 1}], ['v', {x: 1, y: 1}], ['>', {x: 2, y: 1}],
        ]);
        let pos = {x: 2, y: 0};

        for (let i=0; i<seq.length; i++) {
            let des = loc.get(seq[i]);
            if (pos.x !== des.x || pos.y !== des.y) {
                if        (pos.x === 1 && pos.y === 0) {
                    if      (des.x === 2 && des.y === 0) count += this.countPresses('>A', atLevel);
                    else if (des.x === 0 && des.y === 1) count += this.countPresses('v<A', atLevel);
                    else if (des.x === 1 && des.y === 1) count += this.countPresses('vA', atLevel);
                    else if (des.x === 2 && des.y === 1) count += Math.min(...['v>A','>vA'].map(s=>this.countPresses(s, atLevel)));
                } else if (pos.x === 2 && pos.y === 0) {
                    if      (des.x === 1 && des.y === 0) count += this.countPresses('<A', atLevel);
                    else if (des.x === 0 && des.y === 1) count += Math.min(...['v<<A','<v<A'].map(s=>this.countPresses(s, atLevel)));
                    else if (des.x === 1 && des.y === 1) count += Math.min(...['v<A','<vA'].map(s=>this.countPresses(s, atLevel)));
                    else if (des.x === 2 && des.y === 1) count += this.countPresses('vA', atLevel);
                } else if (pos.x === 0 && pos.y === 1) {
                    if      (des.x === 1 && des.y === 0) count += this.countPresses('>^A', atLevel);
                    else if (des.x === 2 && des.y === 0) count += Math.min(...['>>^A', '>^>A'].map(s=>this.countPresses(s, atLevel)));
                    else if (des.x === 1 && des.y === 1) count += this.countPresses('>A', atLevel);
                    else if (des.x === 2 && des.y === 1) count += this.countPresses('>>A', atLevel);
                } else if (pos.x === 1 && pos.y === 1) {
                    if      (des.x === 1 && des.y === 0) count += this.countPresses('^A', atLevel);
                    else if (des.x === 2 && des.y === 0) count += Math.min(...['^>A', '>^A'].map(s=>this.countPresses(s, atLevel)));
                    else if (des.x === 0 && des.y === 1) count += this.countPresses('<A', atLevel);
                    else if (des.x === 2 && des.y === 1) count += this.countPresses('>A', atLevel);
                } else if (pos.x === 2 && pos.y === 1) {
                    if      (des.x === 1 && des.y === 0) count += Math.min(...['^<A', '<^A'].map(s=>this.countPresses(s, atLevel)));
                    else if (des.x === 2 && des.y === 0) count += this.countPresses('^A', atLevel);
                    else if (des.x === 0 && des.y === 1) count += this.countPresses('<<A', atLevel);
                    else if (des.x === 1 && des.y === 1) count += this.countPresses('<A', atLevel);
                }
            } else {
                count += this.countPresses('A', atLevel);
            }
            pos = des;
        }
        map.set(seq, count);
        return count;
    }


    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        let code = this.lines[this.stepNumber-1];

        this.bestAtLevel = Array(26).fill(Infinity);
        let seqs = this.buildNumpadSequences(code);
        this.log(`${this.stepNumber}: ${code}`);

        let min = Infinity;
        for (let seq of seqs) {
            this.log(`--Trying ${seq}`);
            let num = this.countPresses(seq, 25);
            if (num < min) min = num;
        }

        this.log(`${this.stepNumber}/__: ${code} ${min} ${seqs.map(seq=>seq)}`);
        this.sum += min * parseInt(code);

        if (!moreToDo) {
            this.result = this.sum.toString();
        }
        return moreToDo;
    }
}