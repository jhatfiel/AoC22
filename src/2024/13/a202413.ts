import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Pair } from '../../lib/gridParser.js';

class ClawMachine {
    a: Pair;
    b: Pair;
    target: Pair;

    constructor(lines: string[]) {
        let arr = lines[0].match(/X\+(\d+), Y\+(\d+)/);
        this.a = {x: Number(arr[1]), y: Number(arr[2])}
        arr = lines[1].match(/X\+(\d+), Y\+(\d+)/);
        this.b = {x: Number(arr[1]), y: Number(arr[2])}
        arr = lines[2].match(/X=(\d+), Y=(\d+)/);
        this.target = {x: 10000000000000+Number(arr[1]), y: 10000000000000+Number(arr[2])}
    }

    solve(): number[] {
        let den = this.b.y * this.a.x - this.a.y * this.b.x;
        if (den === 0) return undefined;
        let bPresses = (this.target.y*this.a.x - this.a.y * this.target.x) / den;
        let aPresses = (this.target.y - bPresses * this.b.y) / this.a.y;
        return [aPresses, bPresses];
    }
}

export class a202413 extends AoCPuzzle {
    tokens = 0;
    sampleMode(): void { };

    clawMachines: ClawMachine[] = [];

    _loadData(lines: string[]) {
        for (let i=0; i<lines.length; i+=4) {
            this.clawMachines.push(new ClawMachine(lines.slice(i, i+3)));
        }
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.clawMachines.length;
        let cm = this.clawMachines[this.stepNumber-1];

        let numPresses = cm.solve();

        if (numPresses !== undefined && numPresses.every(n => Math.round(n) === n)) {
            this.log(`${this.stepNumber}: ${numPresses}`);
            this.tokens += numPresses[0] * 3 + numPresses[1] * 1;
        }

        if (!moreToDo) {
            this.result = this.tokens.toString();
        }
        return moreToDo;
    }
}