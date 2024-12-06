import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { GridParser, GridParserMatch, Pair, PairToKey } from '../../lib/gridParser.js';

const DIR='>v<^';
const MOVE: Pair[] = [
    {x: 1, y: 0},
    {x: 0, y: 1},
    {x: -1, y: 0},
    {x: 0, y: -1}
]
function turnRight(dir: number): number { return (dir+1)%DIR.length; }
function move(pos: Pair, dir: number): Pair {
    return {x: pos.x + MOVE[dir].x, y: pos.y + MOVE[dir].y};
}

export class b202406 extends AoCPuzzle {
    gp: GridParser;
    walls: GridParserMatch[];
    pos: Pair;
    dir: number;
    visited = new Set<string>();
    state = new Set<string>();
    loopSpots = new Set<string>();

    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.gp = new GridParser(lines, [/#/g, /[\^>v<]/g]);
        this.log(this.gp.matches.map(match => `${match.typeIndex} @${match.x},${match.y}, ${match.value}`).join('\n'));
        let startMatch = this.gp.matches.filter(match=>match.typeIndex===1)[0];
        this.walls = this.gp.matches.filter(match=>match.typeIndex===0);
        this.pos = {x: startMatch.x, y: startMatch.y};
        this.dir = DIR.indexOf(startMatch.value);
        this.log({pos: this.pos}, this.dir);
    }

    _runStep(): boolean {
        //this.log(`at ${this.pos.x},${this.pos.y}`);
        this.visited.add(PairToKey(this.pos));
        this.state.add(PairToKey(this.pos) + ',' + this.dir);

        let nextPos = move(this.pos, this.dir);
        if (this.walls.some(wall => wall.x === nextPos.x && wall.y === nextPos.y)) {
            this.dir = turnRight(this.dir);
        } else {
            let rightdir = turnRight(this.dir);
            let tryPos = {...nextPos};
            let foundCycle = false;
            let tryState = new Set<string>();
            while (!foundCycle && !this.walls.some(wall => wall.x === tryPos.x && wall.y === tryPos.y) &&
                   tryPos.x >= 0 && tryPos.y >= 0 && tryPos.x < this.gp.width && tryPos.y < this.gp.height) {
                let trykey = PairToKey(tryPos) + ',' + rightdir;
                foundCycle = (this.state.has(trykey) || tryState.has(trykey));
                tryState.add(trykey);
                tryPos = move(tryPos, rightdir);
            }

            if (foundCycle) {
                this.log(`Found loop spot! ${nextPos.x},${nextPos.y}`);
                this.loopSpots.add(PairToKey(nextPos));
            }

            this.pos = nextPos;
        }

        let moreToDo = this.pos.x >=0 && this.pos.y >=0 && this.pos.x < this.gp.width && this.pos.y < this.gp.height;
        if (!moreToDo) {
            this.result = this.loopSpots.size.toString();
            // 540 is too low
        }
        return moreToDo;
    }
}