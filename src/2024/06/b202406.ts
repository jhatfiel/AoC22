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
        //this.log(this.gp.matches.map(match => `${match.typeIndex} @${match.x},${match.y}, ${match.value}`).join('\n'));
        let startMatch = this.gp.matches.filter(match=>match.typeIndex===1)[0];
        this.walls = this.gp.matches.filter(match=>match.typeIndex===0);
        this.pos = {x: startMatch.x, y: startMatch.y};
        this.dir = DIR.indexOf(startMatch.value);
    }

    _runStep(): boolean {
        //this.log(`at ${this.pos.x},${this.pos.y} state=${[...this.state].slice(0,10).join('/')}`);
        this.visited.add(PairToKey(this.pos));

        let nextPos = move(this.pos, this.dir);
        let dir = turnRight(this.dir);
        if (this.walls.some(wall => wall.x === nextPos.x && wall.y === nextPos.y)) {
            this.dir = dir;
            this.state.add(PairToKey(this.pos) + ',' + this.dir);
        } else {
            // if we've already visited the nextPos, we can't put a rock there, else we wouldn't have gotten here!
            let nextPosKey = PairToKey(nextPos);
            if (!this.visited.has(nextPosKey) && !this.loopSpots.has(nextPosKey) && nextPos.x >= 0 && nextPos.y >= 0 && nextPos.x < this.gp.width && nextPos.y < this.gp.height) {
                let pos = {...this.pos};
                let foundCycle = false;
                let tryState = new Set<string>();
                while (!foundCycle && pos.x >= 0 && pos.y >= 0 && pos.x < this.gp.width && pos.y < this.gp.height) {
                    //this.log(`  -- TRY at ${tryPos.x},${tryPos.y}`);
                    let tryNextPos = move(pos, dir);
                    // if there's a real wall or our trial wall there, turn
                    if (this.walls.some(wall => wall.x === tryNextPos.x && wall.y === tryNextPos.y) || (tryNextPos.x === nextPos.x && tryNextPos.y === nextPos.y)) {
                        tryState.add(PairToKey(pos) + ',' + dir);
                        dir = turnRight(dir);
                    } else {
                        pos = tryNextPos;
                        let tryKey = PairToKey(pos) + ',' + dir;
                        foundCycle = (this.state.has(tryKey) || tryState.has(tryKey));
                    }
                }

                if (foundCycle) {
                    this.log(`Found loop spot! ${nextPos.x},${nextPos.y} (loops at ${pos.x},${pos.y})`);
                    this.loopSpots.add(PairToKey(nextPos));
                }
            }

            this.pos = nextPos;
        }

        let moreToDo = this.pos.x >=0 && this.pos.y >=0 && this.pos.x < this.gp.width && this.pos.y < this.gp.height;
        if (!moreToDo) {
            this.result = this.loopSpots.size.toString();
        }
        return moreToDo;
    }
}