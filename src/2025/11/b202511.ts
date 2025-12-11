import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202511 extends AoCPuzzle {
    mapping: Map<string, Map<string, number>> = new Map();
    nodes: Map<string, {from: string, to: string[]}> = new Map();
    sampleMode(): void { };

    _loadData(lines: string[]) {
        lines.forEach(line => {
            const [from, rest] = line.split(': ');
            const to = rest.split(' ');
            // console.log({from, to})
            this.nodes.set(from, {from, to});
        })
    }

    calculateTimesReaches(key: string, destination: string, seen: Set<string> = new Set<string>()): number {
        //console.log(`calculateTimesReaches: ${key}, ${destination}, ${[...seen]}`)
        if (key === destination) return 1;
        if (key === 'out') return 0;
        let keyMap = this.mapping.get(key);
        if (!keyMap) {
            keyMap = new Map<string, number>();
            this.mapping.set(key, keyMap);
        }
        let result = keyMap.get(destination);
        if (result === undefined) {
            const node = this.nodes.get(key);
            result = 0;
            const newSeen = new Set([...seen]);
            newSeen.add(key);
            for (const n of node.to) {
                if (seen.has(n)) continue;
                result += this.calculateTimesReaches(n, destination, newSeen);
            }
            keyMap.set(destination, result);
        }
        return result;
    }

    _runStep(): boolean {
        let moreToDo = false;

        let svrToDac = this.calculateTimesReaches('svr', 'dac');
        let dacToFft = this.calculateTimesReaches('dac', 'fft');
        let fftToOut = this.calculateTimesReaches('fft', 'out');

        let svrToFft = this.calculateTimesReaches('svr', 'fft');
        let fftToDac = this.calculateTimesReaches('fft', 'dac');
        let dacToOut = this.calculateTimesReaches('dac', 'out');

        console.log({svrToDac, dacToFft, fftToOut});
        console.log({svrToFft, fftToDac, dacToOut});

        if (!moreToDo) {
            this.result = (svrToDac * dacToFft * fftToOut + svrToFft * fftToDac * dacToOut).toString();
        }
        return moreToDo;
    }
}