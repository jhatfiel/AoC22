import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Pair } from '../../lib/gridParser.js';
import { Matrix } from '../../lib/matrix.js';

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
        this.target = {x: Number(arr[1]), y: Number(arr[2])}
    }

    solve(offset=0): number[] {
        let den = this.b.y * this.a.x - this.a.y * this.b.x;
        if (den === 0) return undefined;
        let bPresses = ((this.target.y+offset)*this.a.x - this.a.y*(this.target.x+offset)) / den;
        let aPresses = (this.target.y+offset - bPresses * this.b.y) / this.a.y;
        return [aPresses, bPresses];
    }

    solveM(offset=0): number[] {
        let mat = new Matrix([[this.a.x, this.b.x, this.target.x+offset],
                              [this.a.y, this.b.y, this.target.y+offset]]);
        mat.solve();
        mat.debug();
        let [aPresses, bPresses] = [mat.getSolution(0,4), mat.getSolution(1, 4)];
        //console.log({aPresses, bPresses});
        return [aPresses, bPresses];
    }
}

export class a202413 extends AoCPuzzle {
    tokens1 = 0;
    tokens2 = 0;
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

        let numPresses1 = cm.solve();
        let numPresses2 = cm.solve(10000000000000);
        let mnumPresses1 = cm.solveM();
        let mnumPresses2 = cm.solveM(10000000000000);

        if (numPresses1 !== undefined && numPresses1.every(n => n !== undefined && Math.round(n) === n)) {
            this.log(`${this.stepNumber}: ${numPresses1} ${mnumPresses1}`);
            this.tokens1 += numPresses1[0] * 3 + numPresses1[1] * 1;
        }

        if (numPresses2 !== undefined && numPresses2.every(n => n !== undefined && Math.round(n) === n)) {
            this.log(`${this.stepNumber}: ${numPresses2} ${mnumPresses2}`);
            this.tokens2 += numPresses2[0] * 3 + numPresses2[1] * 1;
        }

        if (!moreToDo) {
            this.log(`Part 1: ${this.tokens1}`);
            this.result = this.tokens2.toString();
        }
        return moreToDo;
    }
}