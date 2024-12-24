import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202424 extends AoCPuzzle {
    wires = new Map<string, number>();
    cached = new Map<string, number>();
    toCompute = new Map<string, [string, string, string]>();
    usedIn = new Map<string, string[]>();
    outputWires: string[] = [];
    value = 0n;
    maxz = 0;
    x = 0n;
    y = 0n;

    sampleMode(): void { };

    _loadData(lines: string[]) {
        let mode = 0;
        for (let line of lines) {
            if (line === '') {mode = 1; continue;}
            switch (mode) {
                case 0:
                    let [wire, value] = line.split(': ');
                    this.wires.set(wire, Number(value));
                    break;
                case 1:
                    let arr = line.split(' ');
                    this.toCompute.set(arr[4], [arr[0], arr[1], arr[2]]);
                    let usedArr: string[];
                    usedArr = this.usedIn.get(arr[0]);
                    if (!usedArr) { usedArr = []; this.usedIn.set(arr[0], usedArr)};
                    usedArr.push(arr[4]);
                    usedArr = this.usedIn.get(arr[2]);
                    if (!usedArr) { usedArr = []; this.usedIn.set(arr[2], usedArr)};
                    usedArr.push(arr[4]);
                    this.outputWires.push(arr[4]);
                    if (arr[4][0] === 'z') this.maxz = Math.max(this.maxz, Number(arr[4].slice(1)));
                    break;
            };
        }

        for (let index=0; index<=this.maxz; index++) {
            let wire = `x${index.toString().padStart(2,'0')}`;
            let x = this.wires.get(wire)??0;
            this.x += (BigInt(x)<<BigInt(index));

            wire = `y${index.toString().padStart(2,'0')}`;
            let y = this.wires.get(wire)??0;
            this.y += (BigInt(y)<<BigInt(index));
        }

        this.log(this.x,this.y);
    }

    compute(wire: string): number {
        let value = this.wires.get(wire)??this.cached.get(wire);
        if (value === undefined) {
            let [w1, op, w2] = this.toCompute.get(wire);
            let v1 = this.compute(w1);
            let v2 = this.compute(w2);
            switch (op) {
                case 'AND':
                    value = v1 & v2;
                    break;
                case 'XOR':
                    value = v1 ^ v2;
                    break;
                case 'OR':
                    value = v1 | v2;
                    break;
            }
        }
        this.cached.set(wire, value);

        return value;
    }

    invalidateIndex(i: number) {
        let outputs: string[] = [this.outputWires[i]];
        //this.log(`Invalidating ${i} - ${outputs}`);
        outputs.forEach(output => this.cached.delete(output));

        while (outputs.length) {
            let newOutputs: string[] = [];
            //this.log(`--- CLEARING ${outputs}`);
            for (let output of outputs) {
                for (let usedIn of this.usedIn.get(output)??[]) {
                    //this.log(`------ Invalidating ${output}=>${usedIn}`);
                    newOutputs.push(usedIn);
                }
            }
            outputs = newOutputs;
        }
    }

    hasCycle(): boolean {
        for (let i=0; i < this.outputWires.length; i++) {
            // build set of everything seen from this outputwire
            let output = this.outputWires[i];
            let seen = new Set<string>([output]);
            let expand = [output];
            while (expand.length) {
                let newExpand: string[] = [];
                for (let o of expand) {
                    seen.add(o);
                    let arr = this.toCompute.get(o);
                    if (arr) {
                        if (seen.has(arr[0]) || seen.has(arr[2])) {
                            return true;
                        }
                        newExpand.push(arr[0], arr[2]);
                    }
                }
                expand = [...new Set(newExpand)];
            }
        }
        return false;
    }

    _runStep(): boolean {
        // reset everything
        let now = Date.now();
        let moreToDo = false;
        let percent = 0n;
        this.log(`${percent}%`);
        let output = '';
        OUTER: for (let a=0; a < this.outputWires.length-3; a++) {
            this.log(`${((Date.now()-now)/1000).toString().padStart(5)}`, {a});
            let aStr = this.outputWires[a];
            let aArr = this.toCompute.get(aStr);
            for (let b=a+1; b < this.outputWires.length-2; b++) {
                this.log(`${((Date.now()-now)/1000).toString().padStart(5)}`, {a, b});
                let bStr = this.outputWires[b];
                let bArr = this.toCompute.get(bStr);
                // invalidate the cache for aStr & bStr
                this.invalidateIndex(a);
                this.invalidateIndex(b);

                // have to check if we created a cycle!
                this.toCompute.set(aStr, bArr);
                this.toCompute.set(bStr, aArr);

                if (!this.hasCycle()) {
                    for (let c=b+1; c < this.outputWires.length-1; c++) {
                        let cStr = this.outputWires[c];
                        let cArr = this.toCompute.get(cStr);
                        for (let d=c+1; d < this.outputWires.length; d++) {
                            let dStr = this.outputWires[d];
                            let dArr = this.toCompute.get(dStr);
                            this.invalidateIndex(c);
                            this.invalidateIndex(d);
                            this.toCompute.set(cStr, dArr);
                            this.toCompute.set(dStr, cArr);
                            this.log(`${((Date.now()-now)/1000).toString().padStart(5)}`, {a, b, c, d});
                            let zvalue = 0n;
                            if (!this.hasCycle()) {
                                //this.cached = new Map<string, number>(); // we should only invalidate things involved in the a,b,c,d swap

                                for (let index=0; index<=this.maxz; index++) {
                                    let wire = `z${index.toString().padStart(2,'0')}`;
                                    let value = this.compute(wire);
                                    //this.log(`${wire}: ${value}`);
                                    zvalue += (BigInt(value)<<BigInt(index));
                                }

                                if (zvalue = this.x + this.y) {
                                    output = [aArr[0], aArr[2], bArr[0], bArr[2], cArr[0], cArr[2], dArr[0], dArr[2]].sort().join(',');
                                    break OUTER;
                                }
                            }

                            this.toCompute.set(cStr, cArr);
                            this.toCompute.set(dStr, dArr);
                        }
                    }
                }
                this.toCompute.set(aStr, aArr);
                this.toCompute.set(bStr, bArr);
            }
        }

        if (!moreToDo) {
            this.result = output;
        }
        return moreToDo;
    }
}