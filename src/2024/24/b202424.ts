import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202424 extends AoCPuzzle {
    toCompute = new Map<string, [string, string, string]>();
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
                    this.toCompute.set(arr[4], [arr[0], arr[1], arr[2]]);
                    if (arr[4][0] === 'z') this.maxz = Math.max(this.maxz, Number(arr[4].slice(1)));
                    break;
            };
        }
    }

    formatCache = new Map<string, string>();
    format(node: string): string {
        let result = this.formatCache.get(node);
        if (!result) {
            let arr = this.toCompute.get(node);
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
            let swap = this.toCompute.get(out1);
            this.toCompute.set(out1, this.toCompute.get(out2));
            this.toCompute.set(out2, swap);
        }

        swap('thm', 'z08');
        swap('wss', 'wrm');
        swap('hwq', 'z22');
        swap('z29', 'gbs');

        for (let i=0; i<=this.maxz; i++) {
            let wire = `z${i.toString().padStart(2,'0')}`;
            this.log(wire, this.format(wire));
        }

        if (!moreToDo) {
            this.result = swapList.sort().join(',');
        }
        return moreToDo;
    }
}