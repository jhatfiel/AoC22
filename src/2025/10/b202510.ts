import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Matrix } from '../../lib/matrix.js';

interface Button {
    name: string;
    reg: number[];
}
interface Machine {
    target: number[];
    button: Button[];
}

interface Plan {
    pressed: string[];
    result: number[];
}

export class b202510 extends AoCPuzzle {
    machine: Machine[];
    pushes = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.machine = lines.map(l => {
            //console.log(l);
            let matches = l.match(/{([\d,]+)}/);
            //console.log(matches);
            const target = matches[1].split(',').map(Number);
            //console.log(target);

            matches = l.match(/\([^)]+\)/g);
            //const button = matches.map(m => m.match(/\d+/g).map(Number)).map((reg, i) => ({name: String.fromCharCode('A'.charCodeAt(0)+i), reg}))
            const button = matches.map(m => m.match(/\d+/g).map(Number)).map((reg, i) => ({name: i.toString(), reg}))
            //console.log(JSON.stringify({target, button}));
            return {target, button};
        })
    }

    stateToString(state: number[]): string {
        return state.map(n=>n.toString()).join(',');
    }

    sortButtons(buttons: Button[], target: number[], state: number[]): Button[] {
        const indices = Array.from({length: buttons.length}, (_,ind)=>ind);
        const scores = buttons.map(btn => {
            let sum = 0;
            btn.reg.forEach(n => {
                const remain=target[n]-state[n];
                if (remain === 0) sum = -Infinity;
                else sum += remain/target[n];
            })
            return sum;
        });
        return indices.filter(i=>scores[i]!==-Infinity).sort((a,b)=>scores[a]-scores[b]).map(i=>buttons[i]);
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.machine.length;
        const {button, target} = this.machine[this.stepNumber-1];
        const len = button.length;
        const targetKey = this.stateToString(target);
        const now = Date.now();
        console.log('machine', JSON.stringify({targetKey, button}));

        // let's use linear algebra
        // compute array
        const array = Array.from({length: target.length}, (_,ind) => [...Array(len).fill(0), target[ind]]);
        // put in a 1 at each location that a button increments
        button.forEach((btn,btnInd) => btn.reg.forEach(regIndex => array[regIndex][btnInd] = 1));

        //console.log(array.join('\n'));
        const matrix = new Matrix(array);
        //matrix.toRREF();
        matrix.toRationalRREF();
        //console.log('**RATIONAL** RREF:')
        //console.log(matrix.arr.join('\n'));

        // figure out what the "free" buttons are
        const free = Array(len).fill(true);
        matrix.arr.forEach(row => free[row.findIndex(n=>n!=0)] = false);
        const freeIndices = free.map((v,i)=>v?i:undefined).filter(i=>i!==undefined);
        const rowForPivot = Array.from({length: len}, (_, ind) => free[ind]?null:ind-free.slice(0,ind).filter(v=>v).length);
        let max=Math.max(...target)+1;
        const runPlan = (solution: number[]): number[] => {
            const registers = Array(target.length).fill(0);
            solution.forEach((presses, btnIndex) => {
                button[btnIndex].reg.forEach(regIndex => registers[regIndex] += presses);
            })
            return registers;
        }

        // now we just run a for loop for each of the free variables and stop when something goes negative
        if (freeIndices.length > 0) {
            const solution = Array(len).fill(0);

            //console.log(matrix.arr.join('\n'));
            console.log('free:', free.filter(v=>v).length, JSON.stringify(free));

            let freeIndexIndex = freeIndices.length-1;
            const iterate = () => {
                let carry = false;
                solution[freeIndices[freeIndexIndex]]++;
                while (solution[freeIndices[freeIndexIndex]] === max+1) {
                    carry = true;
                    solution[freeIndices[freeIndexIndex]] = 0;
                    freeIndexIndex--;
                    if (freeIndexIndex < 0) break;
                    solution[freeIndices[freeIndexIndex]]++;
                }
                if (carry && freeIndexIndex >= 0) freeIndexIndex = freeIndices.length-1;
            }

            const calculateSolution = () => {
                for (let buttonInd=0; buttonInd<len; buttonInd++) {
                    if (!free[buttonInd]) {
                        const rowNum = rowForPivot[buttonInd];
                        const row = matrix.arr[rowNum];
                        let result = row.at(-1);
                        for (let i=0; i<len; i++) {
                            if (free[i]) result += -1*row[i]*solution[i];
                        }
                        solution[buttonInd] = result;
                    }
                }
            }

            let minPresses = max*len;

            while (freeIndexIndex >= 0) {
                calculateSolution();
                // console.log(`${freeIndexIndex} Consider: ${solution}`)

                if (solution.some(n => n<0 || Math.abs(n-Math.round(n)) > 0.2)) { // no negative presses or decimal presses
                    // we could check here to see if we HAVE had a solution at this index
                    // and if so, then we know any increment will also fail, so we could immediately set this index to max?
                    // but it's fast enough
                    //console.log(`   solution: ${solution}: INVALID`);
                } else {
                    let numPresses = Math.round(solution.reduce((sum, n) => sum+n, 0));
                    if (numPresses < minPresses) {
                        console.log(`   plan: ${solution}: ${numPresses}`);
                        const result = runPlan(solution);
                        if (result.some((n, ind) => Math.abs(target[ind] - n) > matrix.EPS)) {
                            console.log(` registers: ${result}`);
                            throw Error(`Solution didn't match target!`)
                        }
                        minPresses = numPresses;
                    }
                }

                iterate();
            }
            console.log(`CALCULATE: minPresses: ${minPresses}`);
            this.pushes += minPresses;
        } else {
            // if there are no free indices, we straight up have a solution
            const plan = matrix.arr.map(row => row.at(-1)).slice(0, button.length)
            console.log('plan:', plan);
            const result = runPlan(plan);
            if (result.some((n, ind) => Math.abs(target[ind] - n) > matrix.EPS)) {
                console.log(`   plan result: ${result}`);
                throw Error(`Solution didn't match target!`)
            }
            const minPresses = matrix.arr.map(row => row.at(-1)).reduce((sum, n) => sum+n, 0);
            console.log(`SIMPLE: minPresses: ${minPresses}`);
            if (minPresses == 1) console.log('\n'.repeat(50))
            this.pushes += minPresses;
            
        }

        // 19297 too high
        // 19293 CORRECT!  I wonder what is wrong with my matrix code...
        // 18575 too low
        // 18574 too low

        if (!moreToDo) {
            this.result = this.pushes.toString();
        }
        return moreToDo;
    }
}