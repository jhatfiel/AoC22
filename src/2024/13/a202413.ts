import nerdamer from 'nerdamer';
import 'nerdamer/Solve.js'
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
        this.target = {x: Number(arr[1]), y: Number(arr[2])}
    }

    solve(offset=0): number[] {
        let den = this.b.y * this.a.x - this.a.y * this.b.x;
        if (den === 0) return undefined;
        let bPresses = ((this.target.y+offset)*this.a.x - this.a.y * (this.target.x+offset)) / den;
        let aPresses = (this.target.y+offset - bPresses * this.b.y) / this.a.y;
        return [aPresses, bPresses];
    }

    solveSLOW(offset=0): number[] {
        let vars = {ax: this.a.x, ay: this.a.y,
                    bx: this.b.x, by: this.b.y,
                    tx: offset + this.target.x, ty: offset + this.target.y};
        let eq1 = nerdamer('Na * ax + Nb * bx = tx').evaluate(vars);
        let eq2 = nerdamer('Na * ay + Nb * by = ty').evaluate(vars);
        let exp = nerdamer.solveEquations([eq1.toString(), eq2.toString()]);
        let solutions = new Map<string, number>(exp);
        return [solutions.get('Na'), solutions.get('Nb')];
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

        if (numPresses1 !== undefined && numPresses1.every(n => n !== undefined && Math.round(n) === n)) {
            //this.log(`${this.stepNumber}: ${numPresses1}`);
            this.tokens1 += numPresses1[0] * 3 + numPresses1[1] * 1;
        }

        if (numPresses2 !== undefined && numPresses2.every(n => n !== undefined && Math.round(n) === n)) {
            //this.log(`${this.stepNumber}: ${numPresses2}`);
            this.tokens2 += numPresses2[0] * 3 + numPresses2[1] * 1;
        }

        if (!moreToDo) {
            this.log(`Part 1: ${this.tokens1}`);
            this.result = this.tokens2.toString();
        }
        return moreToDo;
    }
}