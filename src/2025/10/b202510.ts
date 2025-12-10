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
        //console.log('machine', JSON.stringify({targetKey, button}));

        // let's use linear algebra
        // compute array
        const array = Array.from({length: target.length}, (_,ind) => [...Array(len).fill(0), target[ind]]);
        // put in a 1 at each location that a button increments
        button.forEach((btn,btnInd) => btn.reg.forEach(regIndex => array[regIndex][btnInd] = 1));
        //console.log(array.join('\n'));

        const matrix = new Matrix(array);
        matrix.toRREF();
        //console.log('RREF:')
        //console.log(matrix.arr.join('\n'));

        // figure out what the "free" buttons are
        const free = Array(len).fill(true);
        matrix.arr.forEach(row => free[row.findIndex(n=>n!=0)] = false);
        const freeIndices = free.map((v,i)=>v?i:undefined).filter(i=>i!==undefined);
        const pivotIndices = free.map((v,i)=>!v?i:undefined).filter(i=>i!==undefined);
        const rowForPivot = Array.from({length: len}, (_, ind) => free[ind]?null:ind-free.slice(0,ind).filter(v=>v).length);
        //console.log('rowForPivot:', rowForPivot);

        // now we just run a for loop for each of the free variables and stop when something goes negative
        if (freeIndices.length > 0) {
            //console.log(matrix.arr.join('\n'));
            //console.log('free:', freeIndices);
            const solution = Array(len).fill(0);
            const calculatePivot = () => {
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

            let num=0;
            let max=Math.max(...target);
            let minPresses = max*len;
            const iterate = () => {
                solution[0] = -1;
            };

            while (num < 1000000) {
                num++;
                let sum = 0;
                for (let i=0; i<len; i++) {
                    if (free[i]) {
                        solution[i] = Math.floor(Math.random()*((max-sum)+1));
                        sum += solution[i];
                    }
                }
                //console.log(`Consider: ${solution}`)
                calculatePivot();
                if (solution.some(n => n<0 || Math.abs(n-Math.round(n)) > 0.01)) { // no negative presses or decimal presses
                    //console.log(`solution: ${solution}: INVALID`);
                } else {
                    let numPresses = solution.reduce((sum, n) => sum+n, 0);
                    if (numPresses < minPresses) {
                        //console.log(`solution: ${solution}: ${numPresses}`);
                        minPresses = numPresses;
                        num = 0;
                    }
                }
            }
            console.log(`minPresses: ${minPresses}`);
            this.pushes += minPresses;
        } else {
            // if there are no free indices, we straight up have a solution?
            this.pushes += matrix.arr.map(row => row.at(-1)).reduce((sum, n) => sum+n, 0);
        }

        // 18585
        // 18575 too low
        // 18574 too low
        

        /*
        const seen = new Set<string>();
        const trial: Plan[] = [{pressed: [], result: Array(target.length).fill(0)}]

        let count=0;
        let best = Infinity;
        OUTER: while (trial.length) {
            const {pressed, result} = trial.pop()
            if (pressed.length+1 >= best) continue;
            const resultKey = this.stateToString(result);
            if (seen.has(resultKey)) continue;
            seen.add(resultKey);
            // console.log(`[${count.toString().padStart(8)}]: Pressed=${pressed}, state=${resultKey}, trial.length=${trial.length}, best=${best}`);
            const sortedBtns = this.sortButtons(button, target, result);
            //console.log(`Recommended button order: ${JSON.stringify(sortedBtns)}`)
            for (let i=0; i<sortedBtns.length; i++) {
                const btn = sortedBtns[i];
                const newResult = [...result];
                btn.reg.forEach(n => newResult[n]++);
                if (newResult.some((n, i) => n > target[i])) {
                    // we've pushed a register too high, not a valid solution
                    continue;
                }
                const newResultKey = this.stateToString(newResult);
                if (!seen.has(newResultKey)) {
                    // console.log(`${resultKey} pressing ${btn.toString().padStart(10)} would result in ${newResultKey} (target=${target})`);
                    trial.push({pressed: [...pressed, btn.name], result: newResult});
                }
                if (newResultKey === targetKey) {
                    best = pressed.length+1;
                    console.log(`Found result!!! best=${best}, [${pressed},${btn.name}]`);
                    //break OUTER;
                }
            }
            count++;
        }

        console.log(`Pushes: ${best} found in ${Date.now()-now}ms, iterations=${count}`);
        this.pushes += best;
        */

        if (!moreToDo) {
            this.result = this.pushes.toString();
        }
        return moreToDo;
    }
}