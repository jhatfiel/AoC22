import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202424 extends AoCPuzzle {
    mapping = new Map<string, [string, string, string]>();
    usedIn = new Map<string, string[]>();
    value = 0n;
    maxz = 0;

    sampleMode(): void { };

    _loadData(lines: string[]) {
        let mode = 0;
        for (let line of lines) {
            if (line === '') {mode = 1; continue;}
            switch (mode) {
                case 0:
                    break;
                case 1:
                    let arr = line.split(' ');
                    this.mapping.set(arr[4], [arr[0], arr[1], arr[2]]);
                    let usedArr: string[];
                    usedArr = this.usedIn.get(arr[0]);
                    if (!usedArr) { usedArr = []; this.usedIn.set(arr[0], usedArr)};
                    usedArr.push(arr[4]);
                    usedArr = this.usedIn.get(arr[2]);
                    if (!usedArr) { usedArr = []; this.usedIn.set(arr[2], usedArr)};
                    usedArr.push(arr[4]);
                    if (arr[4][0] === 'z') this.maxz = Math.max(this.maxz, Number(arr[4].slice(1)));
                    break;
            };
        }
    }

    formatCache = new Map<string, string>();
    format(node: string): string {
        let result = this.formatCache.get(node);
        if (!result) {
            let arr = this.mapping.get(node);
            if (arr) {
                let nodes = [arr[0], arr[2]].sort();
                let p1 = this.format(nodes[0]);
                let p2 = this.format(nodes[1]);
                let p1Count = (p1.match(/^\(+/)??[[]])[0].length;
                let p2Count = (p2.match(/^\(+/)??[[]])[0].length;
                if (p1Count === p2Count) {
                    if (parseInt(p1.slice(p1Count+1)) < parseInt(p2.slice(p2Count+1))) [p1,p2] = [p2,p1];
                } else {
                    if (p1Count > p2Count) [p1,p2] = [p2,p1];
                }
                result = `(${p1} ${arr[1]} ${p2})`;
            } else {
                result = node;
            }

            this.formatCache.set(node, result);
        }

        return result;
    }

    _runStep(): boolean {
        // reset everything
        let moreToDo = false;

        let swapList = []; //['thm', 'z08', 'wss', 'wrm', 'hwq', 'z22'];//, 'grd', 'bfq'];// , 'gbs', 'rpq'];
        let swap = (out1,out2) => {
            swapList.push(out1,out2);
            let swap = this.mapping.get(out1);
            this.mapping.set(out1, this.mapping.get(out2));
            this.mapping.set(out2, swap);
        }

        /*
        swap('thm', 'z08');
        swap('wss', 'wrm');
        swap('z29', 'gbs');
        */
        swap('hwq', 'z22');

        let changed = true;
        while (changed) {
            this.formatCache = new Map<string, string>();
            changed = false;
            for (let i=0; i<=this.maxz; i++) {
                let padi = i.toString().padStart(2, '0');
                let wire = `z${padi}`;
                let xwire = `x${padi}`;
                let mapStr = this.format(wire);
                this.log(wire, mapStr);

                let arr = mapStr.split(' ');

                let wireMapping = this.mapping.get(wire);
                if (wireMapping[1] !== 'XOR') {
                    this.log(`Case 1: Find somebody else with the same inputs as ${wire}, but XOR'ed`);
                    this.log(wireMapping);
                    let swapWire = this.usedIn.get(wireMapping[0]).filter(w => w!==wire)[0];
                    this.log(`Swapping ${wire} and ${swapWire}`);
                    swap(wire, swapWire);
                    changed = true;
                    break;
                }

                let inputMapping = this.mapping.get(wireMapping[0]);
                if (inputMapping === undefined || (inputMapping[0] !== xwire && inputMapping[2] !== xwire)) inputMapping = this.mapping.get(wireMapping[2]);
                this.log(inputMapping);

                if (inputMapping && inputMapping[1] !== 'XOR') {
                    this.log(`Case 2: the x/y input is not x^y`);
                    let o1 = wireMapping[0];
                    let mapping = this.mapping.get(o1);
                    if (mapping.indexOf(xwire) === -1) {
                        o1 = this.mapping.get(wire)[2];
                        mapping = this.mapping.get(o1);
                    }
                    let swapWire = '';
                    for (let u of this.usedIn.get(xwire)) {
                        if (this.mapping.get(u)[1] === 'XOR') {
                            swapWire = u;
                            break;
                        }
                    }
                    this.log(`Swapping ${o1} and ${swapWire}`);
                    swap(o1, swapWire);
                    changed = true;
                    break;

                }

                continue;

                if (arr.length > 3 && arr[3] !== 'XOR') {
                    this.log(`Case 1: Find somebody else with the same inputs as ${wire}`);
                    let o1 = this.mapping.get(wire)[0];
                    let swapWire = this.usedIn.get(o1).filter(w => w!==wire)[0];
                    this.log(`Swapping ${wire} and ${swapWire}`);
                    swap(wire, swapWire);
                    changed = true;
                    break;
                }
                if (arr[1] !== 'XOR') {
                    this.log(`Case 2: one of the parents has x&y instead of x^y`);
                    let wireMapping = this.mapping.get(wire);
                    this.log(wireMapping);
                    if (wireMapping[0] === xwire || wireMapping[2] === xwire) {
                        let swapWire = this.usedIn.get(xwire).filter(w => w!==wire)[0];
                        this.log(`Swapping ${wire} and ${swapWire}`);

                    } else {
                        let o1 = wireMapping[0];
                        let mapping = this.mapping.get(o1);
                        if (mapping.indexOf(xwire) === -1) {
                            o1 = this.mapping.get(wire)[2];
                            mapping = this.mapping.get(o1);
                        }
                        let swapWire = '';
                        for (let u of this.usedIn.get(xwire)) {
                            if (this.mapping.get(u)[1] === 'XOR') {
                                swapWire = u;
                                break;
                            }
                        }
                        this.log(`Swapping ${o1} and ${swapWire}`);
                        swap(o1, swapWire);
                        changed = true;
                    }
                    break;
                }
            }
        }

        if (!moreToDo) {
            this.result = swapList.sort().join(',');
        }
        return moreToDo;
    }
}