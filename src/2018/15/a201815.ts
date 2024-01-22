import { AoCPuzzle } from "../../lib/AoCPuzzle";
import { Dijkstra } from "../../lib/dijkstraBetter";
import { GridParser, Pair, PairFromKey, PairToKey } from "../../lib/gridParser";

const elfNames = ['Aymer', 'Beluar', 'Connak', 'Dyffros', 'Eldrin', 'Folen', 'Gaelin', 'Haladavar', 'Illitran', 'Jhaan', 'Khyrmin', 'Lhoris', 'Myriil', 'Nesterin', 'Omazeiros', 'Pirphal', 'Qican', 'Rydel', 'Saleh', 'Taeral', 'Urihorn', 'Vesryn', 'Wralen', 'Xeshest', 'Yhendorn', 'Zumdithas'];
const goblinNames = ['Abbas', 'Bumbub', 'Crothu', 'Drikdarok', 'Egharod', 'Fodagog', 'Gholug', 'Hugmug', 'Igmut', 'Jughog', 'Khadba', 'Lob', 'Mabub', 'Nehrakgu', 'Oghuglat', 'Piggu', 'Quordud', 'Romarod', 'Sahgigoth', 'Tuggug', 'Ulam', 'Vukgilug', 'Wumkbanok', 'Xurek', 'Yashnarz', 'Zumhug'];

export abstract class Character {
    constructor(public name: string, public pos: Pair) {}
    plannedMoves: Pair[] = [];
    hp = 200;
    ap = 3;
    static sort(a: Character, b: Character): number {
        if (a.pos.y !== b.pos.y) return a.pos.y - b.pos.y;
        return a.pos.x - b.pos.x;
    }
    static sortByHealth(a: Character, b: Character): number {
        if (a.hp === b.hp) return Character.sort(a, b);
        return a.hp - b.hp;
    }
    public abstract getEnemies(): Character[];
}

class Elf extends Character {
    static enemies: Character[];
    public getEnemies(): Character[] { return Elf.enemies; }
    public toString() { return `Elf ${this.name}`; }
}

class Goblin extends Character {
    static enemies: Character[];
    public getEnemies(): Character[] { return Goblin.enemies; }
    public toString() { return `Goblin ${this.name}`; }
}

export class a201815 extends AoCPuzzle {
    gp: GridParser;
    elves: Character[] = [];
    goblins: Character[] = [];

    _loadData(lines: string[]) {
        this.gp = new GridParser(lines, [/[EG]/g]);
        this.gp.matches.forEach(m => {
            if (m.value === 'E') this.elves.push(new Elf(elfNames[this.elves.length], {x: m.x, y: m.y}));
            if (m.value === 'G') this.goblins.push(new Goblin(goblinNames[this.goblins.length], {x: m.x, y: m.y}));
            this.gp.grid[m.y][m.x] = '.';
        });
        Elf.enemies = this.goblins;
        Goblin.enemies = this.elves;
    }

    _runStep(): boolean {
        this.log(`Step: ${this.stepNumber}`);
        let moved = false;
        let moreToDo = false;
        [...this.elves, ...this.goblins].filter(c => c.hp > 0).sort(Character.sort).some(c => {
            // characters only move if there is no enemy adjacent
            let t = this.getAttackTarget(c);
            if (!t) {
                //this.log(`${c.toString()} is at ${c.pos.x},${c.pos.y} (target is ${t.toString()})`);
            //} else {
                //this.log(`${c.toString()} is at ${c.pos.x},${c.pos.y} (MOVING)`);
                // find target, if available, and start moving to it
                // get all squares around all enemies
                let inRange = this.getEnemySquares(c);
                //this.log(`Squares that could be attacked: ${inRange.map(r => `${r.x},${r.y}`).join('/')}`);
                let dij = new Dijkstra(this.getNeighbors.bind(this));

                let cPosKey = PairToKey(c.pos);
                let bestDistance = Infinity;
                let targetSquare: string;
                let tPos: Pair;
                let foundCount = 0;
                dij.compute(cPosKey, (node: string, distance: number) => {
                    if (inRange.has(node)) {
                        let nPos = PairFromKey(node);
                        foundCount++;
                        this.log(`${c.toString()} can get to ${node} in ${distance} steps`);
                        let better = distance < bestDistance || 
                                     (distance === bestDistance && 
                                      (nPos.y < tPos.y || (nPos.y === tPos.y && nPos.x < tPos.x)));
                        if (better) {
                            targetSquare = node;
                            bestDistance = distance;
                            tPos = {...nPos};
                        }
                    }
                    return inRange.size === foundCount;;
                });
                if (targetSquare) {
                    let paths = dij.pathTo(cPosKey, targetSquare, true);
                    let path = paths[0]
                    this.log(`${c.toString()} moving to ${targetSquare} paths are ${paths.map(p => p.join(' / ')).join(' -OR- ')}`);
                    let newPos = PairFromKey(path[1]);
                    c.pos.x = newPos.x;
                    c.pos.y = newPos.y;
                    c.plannedMoves = path.slice(1).map(PairFromKey);
                    moved = true;
                } else {
                    c.plannedMoves = [];
                }

                // after moving, try to get the attack target
                t = this.getAttackTarget(c);
            }

            // attack lowest health edjacent enemy (if any)
            // attack t here
            if (t) {
                t.hp = Math.max(0, t.hp - c.ap);
            }

            // return true if we have eliminated one or the other side
            moreToDo = this.numElves() > 0 && this.numGoblins() > 0;
            return !moreToDo;
        })

        if (!moreToDo) {
            // calculate result
            let totalHealth = [...this.elves, ...this.goblins].map(c => c.hp).reduce((sum, hp) => sum += hp, 0);
            this.result = (totalHealth * this.stepNumber).toString();
            this.log(`Step: ${this.stepNumber} done, total = ${totalHealth}`);
        }
        // 203660 is too low
        return moreToDo;
    }

    numElves(): number { return this.elves.filter(c => c.hp > 0).length; }
    numGoblins(): number { return this.goblins.filter(c => c.hp > 0).length; }

    getNeighbors(node: string): Map<string, number> {
        let result = new Map<string, number>();
        let pos = PairFromKey(node);
        [{x: pos.x, y: pos.y-1},
         {x: pos.x-1, y: pos.y},
         {x: pos.x+1, y: pos.y},
         {x: pos.x, y: pos.y+1}].filter(pos => {
            return this.gp.grid[pos.y][pos.x] === '.' && [...this.elves, ...this.goblins].findIndex(c => c.pos.x === pos.x && c.pos.y === pos.y) === -1;
         }).forEach(p => result.set(PairToKey(p), 1));

        return result;
    }

    getAttackTarget(c: Character): Character {
        let t: Character;
        c.getEnemies().filter(c => c.hp > 0).sort(Character.sortByHealth).some(e => {
            if ((e.pos.y === c.pos.y && (e.pos.x === c.pos.x-1 || e.pos.x === c.pos.x+1)) ||
                (e.pos.x === c.pos.x && (e.pos.y === c.pos.y-1 || e.pos.y === c.pos.y+1))) {
                t = e;
                return true;
            }
        });
        return t;
    }

    getEnemySquares(c: Character): Set<string> {
        return new Set<string>(c.getEnemies().filter(c => c.hp > 0).flatMap(e => {
            return [{x: e.pos.x, y: e.pos.y-1},
                    {x: e.pos.x-1, y: e.pos.y},
                    {x: e.pos.x+1, y: e.pos.y},
                    {x: e.pos.x, y: e.pos.y+1},
            ];
        }).filter(pos => {
            return this.gp.grid[pos.y][pos.x] === '.' && [...this.elves, ...this.goblins].findIndex(c => c.pos.x === pos.x && c.pos.y === pos.y) === -1;
        }).map(PairToKey));
    }
}