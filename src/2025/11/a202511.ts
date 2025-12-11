import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202511 extends AoCPuzzle {
    mapping: Map<string, {from: string, to: string[], timesReachesOut: number}> = new Map();
    sampleMode(): void { };

    _loadData(lines: string[]) {
        lines.forEach(line => {
            const [from, rest] = line.split(': ');
            const to = rest.split(' ');
            // console.log({from, to})
            this.mapping.set(from, {from, to, timesReachesOut: -1});
        })
    }

    calculateTimesReachesOut(key: string): number {
        if (key === 'out') return 1;
        const node = this.mapping.get(key);
        if (node.timesReachesOut === -1) {
            let result = 0;
            for (const n of node.to) {
                result += this.calculateTimesReachesOut(n);
            }
            node.timesReachesOut = result;
        }

        return node.timesReachesOut;
    }

    _runStep(): boolean {
        let moreToDo = false;
        // let sum = 0;
        // for (let key of this.mapping.keys()) {
        //     let tro = this.calculateTimesReachesOut(key);
        //     console.log({key, tro});
        //     sum += tro;
        // }
        if (!moreToDo) {
            this.result = this.calculateTimesReachesOut('you').toString();
        }
        return moreToDo;
    }
}