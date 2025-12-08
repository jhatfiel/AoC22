import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

interface Point {
    x: number
    y: number
    z: number
}

export class b202508 extends AoCPuzzle {
    boxes: Point[];
    distance: {a: number, b: number, d: number}[] = [];
    boxInCircuit: number[];
    circuit: number[][];
    now: number;
    numGroups: number;

    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.now = Date.now();
        this.boxes = lines.map(l => l.split(',').map(Number)).map(([x,y,z]) => ({x,y,z}));
        this.boxInCircuit = Array.from({length: this.boxes.length}, (_,ind) => ind);
        this.circuit = Array.from({length: this.boxes.length}, (_, ind) => [ind]);

        for (let a=0; a<this.boxes.length; a++) {
            const b1 = this.boxes[a];
            for (let b=a+1; b<this.boxes.length; b++) {
                const b2 = this.boxes[b];
                const d = (b1.x-b2.x)**2 + (b1.y-b2.y)**2 + (b1.z-b2.z)**2;
                this.distance.push({a, b, d});
            }
        }
        this.distance.sort((a,b) => b.d-a.d);
        console.log(`[${(Date.now()-this.now).toString().padStart(5)}ms] Loaded ${this.boxes.length} boxes and ${this.distance.length} distances`);
        this.numGroups = this.boxes.length;
    }

    _runStep(): boolean {
        const {a, b, d} = this.distance.pop();

        const ba = this.boxes[a];
        const bb = this.boxes[b];
        //console.log(`[${this.numGroups}] Connecting ${a}(${JSON.stringify(ba)}) to ${b}(${JSON.stringify(bb)}) at distance=${d}`);

        const ca = this.boxInCircuit[a];
        const cb = this.boxInCircuit[b];
        if (ca !== cb) {
            // join circuits
            const mc = Math.min(ca, cb);
            const xc = Math.max(ca, cb);
            const caNodes = this.circuit[ca];
            const cbNodes = this.circuit[cb];
            // console.log(` JOINING ${mc}[${this.circuit[mc]}] + ${xc}[${this.circuit[xc]}]`)
            if (caNodes.length === 0 || cbNodes.length === 0) {
                throw Error(`Also shouldn't happen!`)
            }
            // this.boxInCircuit[a] = mc;
            // this.boxInCircuit[b] = mc;

            // move everybody from circuit[xc] to circuit[mc];
            this.circuit[xc].forEach(i => this.boxInCircuit[i] = mc)

            this.circuit[mc].push(...this.circuit[xc]);
            // console.log(` RESULT  ${mc}[${this.circuit[mc]}]`);
            this.circuit[xc] = [];
            this.numGroups--;

            // console.log(` Now, ${a} is in circuit ${this.boxInCircuit[a]}`);
            // console.log(` Now, ${b} is in circuit ${this.boxInCircuit[b]}`);
        } else {
            // console.log(` SAME CIRCUIT!!`);
        }
        // for (let i=0; i<this.circuit.length; i++) {
        //     console.log(` Circuit: ${i}: len: ${this.circuit[i].length}: [${this.circuit[i].join(',')}] `)
        // }
        //let moreToDo = this.circuit.filter(a => a.length > 0).length > 1;
        let moreToDo = this.numGroups > 1;

        if (!moreToDo) {
            console.log(`[${(Date.now()-this.now).toString().padStart(5)}ms] Finished (distances remaining: ${this.distance.length})`);
            this.result = (ba.x*bb.x).toString();
        }
        return moreToDo;
    }
}