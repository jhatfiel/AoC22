import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Dijkstra } from '../../lib/dijkstraBetter.js';
import { GridParser, Pair, PAIR_LEFT, PAIR_RIGHT, PairMove, PairToKey } from '../../lib/gridParser.js';

export class a202416 extends AoCPuzzle {
    gp: GridParser;
    start: Pair;
    end: Pair;

    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.gp = new GridParser(lines, [/S/g, /E/g, /#/g]);
        this.start = this.gp.matches.filter(m=>m.typeIndex===0)[0];
        this.end = this.gp.matches.filter(m=>m.typeIndex===1)[0];
    }

    _runStep(): boolean {
        let moreToDo = false;

        let dij = new Dijkstra((node: string) => {
            let result = new Map<string, number>();
            let [xStr,yStr,d] = node.split(',');
            let [x,y] = [xStr,yStr].map(Number);
            let straight = PairMove({x,y}, d);
            if (this.gp.grid[straight.y][straight.x] !== '#') result.set(`${straight.x},${straight.y},${d}`, 1);
            result.set(`${x},${y},${PAIR_LEFT.get(d)}`, 1000);
            result.set(`${x},${y},${PAIR_RIGHT.get(d)}`, 1000);
            return result;
        });

        let startKey = PairToKey(this.start);
        let endKey = PairToKey(this.end);

        this.log(`Starting at ${startKey}, going to ${endKey}`);
        let result = dij.distanceAny(`${startKey},R`, (node: string) => node.startsWith(endKey));

        let bestEnd = '';
        let bestScore = Infinity;

        for (let dir of 'URDL'.split('')) {
            let end = `${endKey},${dir}`;
            let score = result.get(end);
            if (score && score < bestScore) {
                bestScore = score;
                bestEnd = end;
            }
        }

        this.log(`Cost to reach ${bestEnd}: ${bestScore}`);

        let paths = dij.getPaths(`${startKey},R`, bestEnd, true);
        let seats = new Set<string>();
        paths.forEach(path => path.forEach(node => {
            let [x,y] = node.split(',');
            seats.add(`${x},${y}`);
        }));

        if (!moreToDo) {
            this.result = seats.size.toString();
        }
        return moreToDo;
    }
}