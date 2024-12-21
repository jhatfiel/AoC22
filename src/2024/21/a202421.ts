import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Permutations } from '../../lib/CombiPerm.js';
import { Pair } from '../../lib/gridParser.js';

export class a202421 extends AoCPuzzle {
    sum = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        
    }

    buildDirectionSequence(code: string): string {
        //  ^A
        // <v>
        // start at A (top right) which is (2,0)
        // can't ever point at 0,0!!! - so always go down before going left and always go right before going up
        let loc = new Map<string, Pair>([
                                 ['^', {x: 1, y: 0}], ['A', {x: 2, y: 0}],
            ['<', {x: 0, y: 1}], ['v', {x: 1, y: 1}], ['>', {x: 2, y: 1}],
        ]);
        let seq = '';
        let pos: Pair = {x: 2, y: 0};
        for (let i=0; i<code.length; i++) {
            let des = loc.get(code[i]);
            if (des.y > pos.y) seq += 'v'.repeat(des.y-pos.y);
            if (des.x < pos.x) seq += '<'.repeat(pos.x-des.x);
            if (des.x > pos.x) seq += '>'.repeat(des.x-pos.x);
            if (des.y < pos.y) seq += '^'.repeat(pos.y-des.y);
            pos = des;
            seq += 'A';
        }
        return seq;
    }

    buildDirectionSequences(code: string): string[] {
        let results: string[] = [''];
        let loc = new Map<string, Pair>([
                                 ['^', {x: 1, y: 0}], ['A', {x: 2, y: 0}],
            ['<', {x: 0, y: 1}], ['v', {x: 1, y: 1}], ['>', {x: 2, y: 1}],
        ]);
        let pos: Pair = {x: 2, y: 0};
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
                    if (pos.y === 0) {
                        if (pos.x === 1 && way.startsWith('<')) continue;
                        if (pos.x === 2 && way.startsWith('<<')) continue;
                    }
                    if (des.y === 0) {
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

    buildNumpadSequences(code: string): string[] {
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

    buildNumpadSequence(code: string): string {
        // 789
        // 456
        // 123
        //  0A
        // start at A (bottom right) which is (2,3)
        // can't ever point at 0,3!!! - so always go up before going left and always go right before going down
        let loc = new Map<string, Pair>([
            ['7', {x: 0, y: 0}], ['8', {x: 1, y: 0}], ['9', {x: 2, y: 0}],
            ['4', {x: 0, y: 1}], ['5', {x: 1, y: 1}], ['6', {x: 2, y: 1}],
            ['1', {x: 0, y: 2}], ['2', {x: 1, y: 2}], ['3', {x: 2, y: 2}],
                                 ['0', {x: 1, y: 3}], ['A', {x: 2, y: 3}],
        ]);
        let seq = '';
        let pos: Pair = {x: 2, y: 3};
        for (let i=0; i<code.length; i++) {
            let des = loc.get(code[i]);
            if (des.y === 3 || pos.y === 3) {
                if (des.y < pos.y) seq += '^'.repeat(pos.y-des.y);
                if (des.x < pos.x) seq += '<'.repeat(pos.x-des.x);
                if (des.x > pos.x) seq += '>'.repeat(des.x-pos.x);
                if (des.y > pos.y) seq += 'v'.repeat(des.y-pos.y);
            } else {
                if (des.x < pos.x) seq += '<'.repeat(pos.x-des.x);
                if (des.y > pos.y) seq += 'v'.repeat(des.y-pos.y);
                if (des.y < pos.y) seq += '^'.repeat(pos.y-des.y);
                if (des.x > pos.x) seq += '>'.repeat(des.x-pos.x);
            }
            pos = des;
            seq += 'A';
        }
        return seq;
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        let code = this.lines[this.stepNumber-1];
        //let seq = this.buildNumpadSequence(code);
        //let seq1 = this.buildDirectionSequence(seq);
        //let seq2 = this.buildDirectionSequence(seq1);
        //this.log(`${this.stepNumber}: ${code} ${seq2.length} ${seq2.length * parseInt(code)} ${seq} ${seq1} ${seq2}`);

        let seqs = this.buildNumpadSequences(code);
        this.log(`${this.stepNumber}: ${code} ${seqs.map(seq=>seq)}`);

        let seqs1: string[] = [];
        for (let seq of seqs) {
            seqs1.push(...this.buildDirectionSequences(seq));
        }
        let min = Math.min(...seqs1.map(seq=>seq.length));
        seqs1 = seqs1.filter(seq=>seq.length === min);
        this.log(`${this.stepNumber}: ${code} ${seqs1.map(seq=>seq.length)}`);

        let seqs2: string[] = [];
        for (let seq of seqs1) {
            seqs2.push(...this.buildDirectionSequences(seq));
        }
        min = Math.min(...seqs2.map(seq=>seq.length));
        seqs2 = seqs2.filter(seq=>seq.length === min);
        this.log(`${this.stepNumber}: ${code} ${seqs2.map(seq=>seq.length)}`);

        this.sum += min * parseInt(code);
        if (!moreToDo) {
            // 133050 too high
            this.result = this.sum.toString();
        }
        return moreToDo;
    }
}