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
        const {a, b} = this.distance.pop();

        const ca = this.boxInCircuit[a];
        const cb = this.boxInCircuit[b];
        if (ca !== cb) {
            // join circuits
            const caNodes = this.circuit[ca];
            const cbNodes = this.circuit[cb];
            const [mc, xc] = (caNodes.length>cbNodes.length)?[ca,cb]:[cb,ca];

            // move everybody from circuit[xc] to circuit[mc];
            this.circuit[xc].forEach(i => this.boxInCircuit[i] = mc)
            this.circuit[mc].push(...this.circuit[xc]);
            this.circuit[xc] = [];
            this.numGroups--;
        }

        if (this.numGroups === 1) {
            console.log(`[${(Date.now()-this.now).toString().padStart(5)}ms] Finished (distances remaining: ${this.distance.length})`);
            this.result = (this.boxes[a].x*this.boxes[b].x).toString();
            return false
        }
        return true;
    }
}