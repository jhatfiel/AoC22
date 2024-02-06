import { AoCPuzzle } from '../../lib/AoCPuzzle';
import { Dijkstra } from '../../lib/dijkstraBetter';

type Pos = {x: number, y: number};
enum RType {
    ROCKY,
    WET,
    NARROW
};

export class a201822 extends AoCPuzzle {
    modulo = 20183;
    xmult = 16807;
    ymult = 48271;
    depth = 0;
    target = {x: 0, y: 0};
    elLookup = new Map<string, number>();
    equippedValidRType = new Map<string, Map<RType, boolean>>();

    sampleMode(): void { };

    _loadData(lines: string[]) { 
        this.depth = Number(lines[0].split(' ')[1]);
        let arr = lines[1].split(' ')[1].split(',').map(Number);
        this.target.x = arr[0];
        this.target.y = arr[1];

        this.equippedValidRType.set('T', new Map([[RType.ROCKY,  true], [RType.WET, false], [RType.NARROW,  true]]));
        this.equippedValidRType.set('C', new Map([[RType.ROCKY,  true], [RType.WET,  true], [RType.NARROW, false]]));
        this.equippedValidRType.set('N', new Map([[RType.ROCKY, false], [RType.WET,  true], [RType.NARROW,  true]]));
    }

    _runStep(): boolean {
        let moreToDo = false;
        /*
        [
            {x: 0, y: 0},
            {x: 1, y: 0},
            {x: 0, y: 1},
            {x: 1, y: 1},
            {x: 10, y: 10},
        ].forEach(p => {
            let el = this.getEL(p);
            this.log(`${JSON.stringify(p)}: ${RType[el%3]}`);
        })
        */
        let totalRisk = 0;
        for (let x=0; x<=this.target.x; x++) {
            for (let y=0; y<=this.target.y; y++) {
                totalRisk += this.getEL({x,y})%3;
            }
        }
        this.log(`Total Risk (Part 1): ${totalRisk.toString()}`);

        // torch equipped (can go to NARROW(0) or ROCKY(1) regions)
        // climbing equipped (can go to WET(2) or ROCKY(1) regions)
        // neither (can go to WET(2) or NARROW(0))
        // string will represent x,y,e where e=equipped (T,C,N)
        let start = '0,0,T';
        // target is this.target, and we don't care what's equipped

        let dij = new Dijkstra(this.getNeighbors.bind(this));
        dij.compute(start, (node: string, distance: number) => node.startsWith(`${this.target.x},${this.target.y}`));
        let res = dij.distanceAny(start, (node: string) => node.startsWith(`${this.target.x},${this.target.y}`));
        this.log(`${res.get(`${this.target.x},${this.target.y},T`)}`);
        this.log(`${res.get(`${this.target.x},${this.target.y},C`)}`);
        this.log(`${res.get(`${this.target.x},${this.target.y},N`)}`);
        /*
        res.forEach((v, k) => {
            this.log(`${k}=${v}`);
        })
        */

        this.result = 'Result'
        return moreToDo;
    }

    getNeighbors(node: string): Map<string, number> {
        let result = new Map<string, number>();
        let arr = node.split(',');
        let x = Number(arr[0]);
        let y = Number(arr[1]);
        let equipped = arr[2];
        let rtype = this.getEL({x,y})%3;

        ['T', 'C', 'N']
            .filter(e => e !== equipped)
            .filter(e => this.equippedValidRType.get(e).get(rtype))
            .forEach(e => result.set(`${x},${y},${e}`, 7));

        [{x: x-1, y: y},
         {x: x  , y: y-1},
         {x: x+1, y: y},
         {x: x  , y: y+1}].filter(p => p.x >= 0 && p.y >= 0)
         .forEach(p => {
            let pt = this.getEL(p)%3;
            if (this.equippedValidRType.get(equipped).get(pt)) result.set(`${p.x},${p.y},${equipped}`, 1);
        });

        return result;
    }

    getEL(pos: Pos): number {
        let key = `${pos.x},${pos.y}`;
        if (this.elLookup.has(key)) return this.elLookup.get(key);
        let gi = 0;
        if (pos.x === 0 && pos.y === 0) gi = 0;
        else if (pos.x === this.target.x && pos.y === this.target.y) gi = 0;
        else if (pos.y === 0) gi = pos.x * this.xmult;
        else if (pos.x === 0) gi = pos.y * this.ymult;
        else gi = this.getEL({x: pos.x-1, y: pos.y}) * this.getEL({x: pos.x, y: pos.y-1});

        gi = (gi + this.depth) % this.modulo;
        this.elLookup.set(key, gi);
        return gi;
    }
}