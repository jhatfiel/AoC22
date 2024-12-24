import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202424 extends AoCPuzzle {
    wires = new Map<string, number>();
    toCompute = new Map<string, [string, string, string]>();
    value = 0n;

    sampleMode(): void { };

    _loadData(lines: string[]) {
        let mode = 0;
        for (let line of lines) {
            if (line === '') {mode = 1;}
            switch (mode) {
                case 0:
                    let [wire, value] = line.split(': ');
                    this.wires.set(wire, Number(value));
                    break;
                case 1:
                    let arr = line.split(' ');
                    this.toCompute.set(arr[4], [arr[0], arr[1], arr[2]]);
                    break;
            };
        }
    }

    compute(wire: string): number {
        let value = this.wires.get(wire);
        if (value !== undefined) return value;

        let [w1, op, w2] = this.toCompute.get(wire);
        switch (op) {
            case 'AND':
                value = this.compute(w1) & this.compute(w2);
                break;
            case 'XOR':
                value = this.compute(w1) ^ this.compute(w2);
                break;
            case 'OR':
                value = this.compute(w1) | this.compute(w2);
                break;
        }
        this.wires.set(wire, value);
        return value;
    }

    _runStep(): boolean {
        let index = this.stepNumber-1;
        let wireToCalculate = `z${index.toString().padStart(2,'0')}`;
        let moreToDo = this.toCompute.has(wireToCalculate);
        if (moreToDo) {
            let value = this.compute(wireToCalculate);
            this.log(`${wireToCalculate}: ${value}`);
            this.value += (BigInt(value)<<BigInt(index));
        } else {
            // 438440766
            this.result = this.value.toString();
        }
        return moreToDo;
    }
}