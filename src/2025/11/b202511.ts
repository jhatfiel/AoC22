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

    calculateTimesReaches(key: string, destination: string): number {
        if (key === destination) return 1;
        if (key === 'out') return 0;
        let keyMap = this.mapping.get(key);
        if (!keyMap) {
            keyMap = new Map<string, number>();
            this.mapping.set(key, keyMap);
        }
        let result = keyMap.get(destination);
        if (result === undefined) {
            result = this.nodes.get(key).to.reduce((sum, n) => sum += this.calculateTimesReaches(n, destination), 0);
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