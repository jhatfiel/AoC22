import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Permutations } from '../../lib/CombiPerm.js';
import { Pair } from '../../lib/gridParser.js';

export class b202421 extends AoCPuzzle {
    sum = 0;
    bestAtLevel: number[];

    sampleMode(): void { };

    _loadData(lines: string[]) { }

    *buildDirectionSequences(code: string, pos: Pair = {x: 2, y: 0}, start=''): Generator<string> {
        //console.error(`bds({${code},(${pos.x},${pos.y}),${start})`)
        //  ^A
        // <v>
        // start at A (top right) which is (2,0)
        // can't ever point at 0,0!!! - so always go down before going left and always go right before going up
        if (code.length === 0) {
            yield start;
            return;
        }
        let loc = new Map<string, Pair>([
                                 ['^', {x: 1, y: 0}], ['A', {x: 2, y: 0}],
            ['<', {x: 0, y: 1}], ['v', {x: 1, y: 1}], ['>', {x: 2, y: 1}],
        ]);
        let des = loc.get(code[0]);
        code = code.slice(1);
        if (pos.x === des.x && pos.y === des.y) {
            yield *this.buildDirectionSequences(code, pos, start+'A');
            return
        }
        let ways: string[] = [];
        if        (pos.x === 1 && pos.y === 0) {
            if      (des.x === 2 && des.y === 0) ways.push('>');
            else if (des.x === 0 && des.y === 1) ways.push('v<');
            else if (des.x === 1 && des.y === 1) ways.push('v');
            else if (des.x === 2 && des.y === 1) ways.push('v>', '>v');
        } else if (pos.x === 2 && pos.y === 0) {
            if      (des.x === 1 && des.y === 0) ways.push('<');
            else if (des.x === 0 && des.y === 1) ways.push('v<<');//, '<v<');
            else if (des.x === 1 && des.y === 1) ways.push('v<');//, '<v');
            else if (des.x === 2 && des.y === 1) ways.push('v');
        } else if (pos.x === 0 && pos.y === 1) {
            if      (des.x === 1 && des.y === 0) ways.push('>^');
            else if (des.x === 2 && des.y === 0) ways.push('>>^');//, '>^>');
            else if (des.x === 1 && des.y === 1) ways.push('>');
            else if (des.x === 2 && des.y === 1) ways.push('>>');
        } else if (pos.x === 1 && pos.y === 1) {
            if      (des.x === 1 && des.y === 0) ways.push('^');
            else if (des.x === 2 && des.y === 0) ways.push('^>');//, '>^');
            else if (des.x === 0 && des.y === 1) ways.push('<');
            else if (des.x === 2 && des.y === 1) ways.push('>');
        } else if (pos.x === 2 && pos.y === 1) {
            if      (des.x === 1 && des.y === 0) ways.push('^<');//, '<^');
            else if (des.x === 2 && des.y === 0) ways.push('^');
            else if (des.x === 0 && des.y === 1) ways.push('<<');
            else if (des.x === 1 && des.y === 1) ways.push('<');
        }

        for (let way of ways) {
            yield *this.buildDirectionSequences(code, des, start+way+'A');
        }
    }

    buildNumpadSequences(code: string): string[] {
        // 789
        // 456
        // 123
        //  0A
        // start at A (bottom right) which is (2,3)
        // can't ever point at 0,3!!! - so always go up before going left and always go right before going down
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

    countMoves(make: string, atLevel: number): number {
        let stack: {make: string, made: string, atLevel: number, generator: Generator<string>}[] = 
          [{make, made: '', atLevel, generator: this.buildDirectionSequences(make)}];

        let min = Infinity;
        while (stack.length) {
            let state = stack.pop();
            if (state.atLevel === 0) {
                // we got a result and we're done with this path
                if (state.make.length < min) {
                    min = state.make.length;
                    //this.log(`------ MADE: ${state.make.length} ${state.make}`);
                }
            } else {
                let next = state.generator.next();
                if (next.done) {
                    // we're done with this state!!
                } else {
                    stack.push(state);
                    stack.push({make: next.value, made: state.made, atLevel: state.atLevel-1, generator: this.buildDirectionSequences(next.value)})
                }
            }
        }
        
        /*
        if (atLevel === 0) return make.length;

        let minResult = Infinity;
        //this.log(`--- ${make} at ${atLevel} got ${seqArr.length} possible`);

        for (let seq of this.buildDirectionSequences(make)) {
            if (seq.length <= this.bestAtLevel[atLevel]) {
                //this.log(`------ new best: ${seq.length}, trying`);
                if (seq.length < this.bestAtLevel[atLevel]) {
                    this.log(`------ new best: ${seq.length}@${atLevel} = ${seq}`);
                }
                this.bestAtLevel[atLevel] = seq.length;
                let result = this.countMoves(seq, atLevel - 1);
                if (result < minResult) {
                    //this.log(`---------- minResult: ${result}`);
                    minResult = result;
                }
            }

        }
        */
        return min;
    }


    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        let code = this.lines[this.stepNumber-1];
        //let seq = this.buildNumpadSequence(code);
        //let seq1 = this.buildDirectionSequence(seq);
        //let seq2 = this.buildDirectionSequence(seq1);
        //this.log(`${this.stepNumber}: ${code} ${seq2.length} ${seq2.length * parseInt(code)} ${seq} ${seq1} ${seq2}`);

        this.bestAtLevel = Array(26).fill(Infinity);
        let seqs = this.buildNumpadSequences(code);
        this.log(`${this.stepNumber}: ${code} ${seqs}`);
        /*
        let min = Infinity;
        for (let i=0; i<25; i++) {
            let newSeqs: string[] = [];
            min = Infinity;
            for (let seq of seqs) {
                let newSeqArr = this.buildDirectionSequences(seq);
                if (min === Infinity) {
                    min = Math.min(...newSeqArr.map(seq=>seq.length));
                } else {
                    newSeqArr = newSeqArr.filter(seq=>seq.length <= min);
                }
                newSeqs.push(...newSeqArr);
            }
            this.log(`${this.stepNumber}/${i.toString().padStart(2)}: ${code} ${newSeqs.map(seq=>seq)}`);
            seqs = newSeqs;
        }
        */

        let min = Infinity;
        for (let seq of seqs) {
            // these will all be the same length so we need to try them all
            //this.log(`--Trying ${seq}`);
            let num = this.countMoves(seq, 25);
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