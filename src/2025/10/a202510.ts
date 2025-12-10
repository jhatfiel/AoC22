import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

interface Machine {
    target: number;
    button: number[][];
    size: number;
}

interface Plan {
    pressed: number[];
    result: number;
}

export class a202510 extends AoCPuzzle {
    machine: Machine[];
    pushes = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.machine = lines.map(l => {
            console.log(l);
            let target = 0;
            let button = [];
            let matches = l.match(/\[([.#]+)\]/);
            const size = matches[1].length;
            const pattern = matches[1].split('').map(ch => ch==='#'?true:false);
            target = pattern.reverse().reduce((val, set, place) => val + (set?2**place:0), 0);
            //console.log(target);

            matches = l.match(/\([^)]+\)/g);
            button = matches.map(m => m.match(/\d+/g).map(Number))
            return {target, button, size};
        })
    }
    debugState(state: number, width: number): string {
        return state.toString(2).padStart(width, '0').replaceAll('0','.').replaceAll('1','#');
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.machine.length;
        const {button, target, size} = this.machine[this.stepNumber-1];
        console.log('machine', JSON.stringify({targetStr:this.debugState(target, size), button, size}));
        let pushCnt = 0;
        let seen = new Set<number>();
        let trial: Plan[] = [{pressed: [], result: 0}]

        OUTER: while (trial.length) {
            const {pressed, result} = trial.shift()
            if (seen.has(result)) continue;
            seen.add(result);
            //console.log(`Pressed=${pressed}, state=${this.debugState(result, size)}`);
            for (let i=0; i<button.length; i++) {
                const btn = button[i];
                let newResult = result;
                for (const n of btn) {
                    newResult = newResult ^ (2**(size-n-1));
                }
                if (!seen.has(newResult)) {
                    //console.log(`${this.debugState(result, size)} pressing ${btn.toString().padStart(10)} would result in ${this.debugState(newResult, size)}`);
                    trial.push({pressed: [...pressed, i], result: newResult});
                }
                if (newResult === target) {
                    console.log(`Found result!!! ${pressed},${i}`);
                    pushCnt = pressed.length+1;
                    break OUTER;
                }
            }
        }

        this.pushes += pushCnt;

        if (!moreToDo) {
            this.result = this.pushes.toString();
        }
        return moreToDo;
    }
}