import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { TBC } from './tbc.js';

export class b202417 extends AoCPuzzle {
    tbc: TBC;
    inputs = [0n];

    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.tbc = new TBC({lines});
        this.log(`Memory: ${this.tbc.mem}`);
        this.log(this.tbc.disassemble().join('\n'));
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.tbc.mem.length;
        let positionFromEnd = -1*this.stepNumber;
        //this.log(`Step: ${this.stepNumber} octetNum=${octetNum} target=${targetNum} at ${targetPos}, ${this.inputs.length} potentials`);
        let found: bigint[] = [];
        let i = 0;
        while (i < 8) {
            for (let baseInput of this.inputs) {
                let input = baseInput + (BigInt(i)<<(3n*BigInt(this.tbc.mem.length - this.stepNumber)));
                this.tbc.ip = 0;
                this.tbc.reg = [input,0n,0n];
                this.tbc.out = [];
                while (!this.tbc.halted()) this.tbc.step();
                //this.log(`(${input.toString(2).padStart(48)}): ${this.tbc.out.length} = ${this.tbc.out}`);
                //this.log(`(${toOct(input, 48)}): ${this.tbc.out.length} = ${this.tbc.out}`);
                if (this.tbc.out.at(positionFromEnd) === this.tbc.mem.at(positionFromEnd)) {
                    found.push(input);
                }
            }
            i++;
        }
        if (found.length > 0) this.inputs = found;
        else throw new Error(`We've run out of potential inputs!`);

        if (!moreToDo) {
            let input = this.inputs.reduce((min,n) => min===undefined||n<min?n:min);
            this.tbc.ip = 0;
            this.tbc.reg = [input,0n,0n];
            this.tbc.out = [];
            while (!this.tbc.halted()) this.tbc.step();
            //this.log(`Final input: ${input}`);
            //this.log(`Memory: ${this.tbc.mem}`);
            this.log(`Output: ${this.tbc.out}`)
            this.result = input.toString();
        }
        return moreToDo;
    }
}