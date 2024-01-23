import { AoCPuzzle } from "../../lib/AoCPuzzle";
import { Dijkstra } from "../../lib/dijkstraBetter";
import { GridParser, Pair, PairFromKey, PairToKey } from "../../lib/gridParser";

const elfNames = ['Aymer', 'Beluar', 'Connak', 'Dyffros', 'Eldrin', 'Folen', 'Gaelin', 'Haladavar', 'Illitran', 'Jhaan', 'Khyrmin', 'Lhoris', 'Myriil', 'Nesterin', 'Omazeiros', 'Pirphal', 'Qican', 'Rydel', 'Saleh', 'Taeral', 'Urihorn', 'Vesryn', 'Wralen', 'Xeshest', 'Yhendorn', 'Zumdithas'];
const goblinNames = ['Abbas', 'Bumbub', 'Crothu', 'Drikdarok', 'Egharod', 'Fodagog', 'Gholug', 'Hugmug', 'Igmut', 'Jughog', 'Khadba', 'Lob', 'Mabub', 'Nehrakgu', 'Oghuglat', 'Piggu', 'Quordud', 'Romarod', 'Sahgigoth', 'Tuggug', 'Ulam', 'Vukgilug', 'Wumkbanok', 'Xurek', 'Yashnarz', 'Zumhug'];

export abstract class Character {
    constructor(public name: string, public pos: Pair) {}
    plannedMoves: Pair[] = [];
    attacking: Character;
    hp = 200;
    ap = 3;
    public abstract getEnemies(): Character[];
    public isAlive(): boolean { return this.hp > 0; }
    static sort(a: Character, b: Character): number {
        if (a.pos.y !== b.pos.y) return a.pos.y - b.pos.y;
        return a.pos.x - b.pos.x;
    }
    static sortByHealth(a: Character, b: Character): number {
        if (a.hp === b.hp) return Character.sort(a, b);
        return a.hp - b.hp;
    }
}

class Elf extends Character {
    ap = 34;
    static enemies: Character[];
    public getEnemies(): Character[] { return Elf.enemies.filter(c => c.isAlive()); }
    public toString() { return `Elf ${this.name}[${this.hp}]`; }
}

class Goblin extends Character {
    static enemies: Character[];
    public getEnemies(): Character[] { return Goblin.enemies.filter(c => c.isAlive()); }
    public toString() { return `Goblin ${this.name}[${this.hp}]`; }
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
        this.log(`Number elves: ${this.elves.length}`);
    }

    livingCharacters() { return [...this.elves, ...this.goblins].filter(c => c.isAlive()); }

    _runStep(): boolean {
        //this.log(`Step: ${this.stepNumber}`);
        let moreToDo = true;
        let stoppedEarly = false;
        this.livingCharacters().sort(Character.sort).forEach(c => {
            if (c.hp <= 0) return;
            if (!moreToDo) { stoppedEarly = true; return }
            c.plannedMoves = [];
            c.attacking = null;
            // characters only move if there is no enemy adjacent
            let t = this.getAttackTarget(c);
            if (t) {
                //this.log(`${c.toString()} is at ${c.pos.x},${c.pos.y} (target is ${t.toString()})`);
            } else {
                // find target, if available, and start moving to it
                // get all squares around all enemies
                let inRange = this.getEnemySquares(c);
                if (inRange.size) {
                    //this.log(`${c.toString()} is at ${c.pos.x},${c.pos.y} (MOVING) (inRange = ${Array.from(inRange.keys()).join(' / ')})`);
                    let dij = new Dijkstra(this.getNeighbors.bind(this));

                    let cPosKey = PairToKey(c.pos);
                    let targetSquare: string;
                    dij.compute(cPosKey, (node: string, distance: number) => {
                        if (inRange.has(node)) {
                            //this.log(`${c.toString()} can get to ${node} in ${distance} steps`);
                            targetSquare = node;
                            return true;
                        }
                        return false;
                    });
                    if (targetSquare) {
                        let paths = dij.pathTo(cPosKey, targetSquare, false);
                        let path = paths[0]
                        //this.log(`${c.toString()} moving to ${targetSquare} paths are ${paths.map(p => p.join(' / ')).join(' -OR- ')}`);
                        let newPos = PairFromKey(path[1]);
                        c.pos.x = newPos.x;
                        c.pos.y = newPos.y;
                        c.plannedMoves = path.slice(1).map(PairFromKey);
                    }

                    // after moving, try to get the attack target
                    t = this.getAttackTarget(c);
                } else {
                    //this.log(`${c.toString()} is at ${c.pos.x},${c.pos.y} (NO ENEMY SQUARES)`);
                }
            }

            // attack lowest health edjacent enemy (if any)
            // attack t here
            if (t) {
                t.hp = Math.max(0, t.hp - c.ap);
                c.attacking = t;
            }

            // return true if we have eliminated one or the other side
            moreToDo = this.numElves() > 0 && this.numGoblins() > 0;
        })

        if (!moreToDo) {
            // calculate result
            let totalHealth = this.livingCharacters().reduce((sum, c) => sum += c.hp, 0);
            this.result = (totalHealth * (this.stepNumber-(stoppedEarly?1:0))).toString();
            this.log(`Step: ${this.stepNumber} done (stoppedEarly=${stoppedEarly}), total = ${totalHealth}`);
            this.livingCharacters().forEach(c => {
                this.log(`${c.toString()} is at ${c.pos.x},${c.pos.y}`);
            })
            //this.debug();
            // part b 
            // 60080 too low 40*1502
            // 60200 is incorrect (no hints) 40*1505
            // 61582 is wrong (41*1502)
            // 40*1499=59960 wrong
        }
        return moreToDo;
    }

    debug() {
        this.gp.grid.forEach((row, y) => {
            let line = '';
            let end: string[] = [];
            row.forEach((c, x) => {
                if (c === '#') line += c;
                else {
                    let lc = this.livingCharacters();
                    let cIndex = lc.findIndex(c => c.pos.x === x && c.pos.y === y);
                    if (cIndex === -1) line += '.';
                    else {
                        let char = lc[cIndex];
                        let type = char.toString().substring(0,1);
                        line += type;
                        end.push(`${type}(${char.hp})`);
                    }
                }
            })
            this.log(line + ' ' + end.join(','));
        })
    }

    numElves(): number { return this.elves.filter(c => c.isAlive()).length; }
    numGoblins(): number { return this.goblins.filter(c => c.isAlive()).length; }

    getNeighbors(node: string): Map<string, number> {
        let result = new Map<string, number>();
        let pos = PairFromKey(node);
        [{x: pos.x, y: pos.y-1},
         {x: pos.x-1, y: pos.y},
         {x: pos.x+1, y: pos.y},
         {x: pos.x, y: pos.y+1}].filter(pos => {
            return this.gp.grid[pos.y][pos.x] === '.' && this.livingCharacters().findIndex(c => c.pos.x === pos.x && c.pos.y === pos.y) === -1;
         }).forEach(p => result.set(PairToKey(p), 1));

        return result;
    }

    getAttackTarget(c: Character): Character {
        let t: Character;
        c.getEnemies().sort(Character.sortByHealth).some(e => {
            if ((e.pos.y === c.pos.y && (e.pos.x === c.pos.x-1 || e.pos.x === c.pos.x+1)) ||
                (e.pos.x === c.pos.x && (e.pos.y === c.pos.y-1 || e.pos.y === c.pos.y+1))) {
                t = e;
                return true;
            }
        });
        return t;
    }

    getEnemySquares(c: Character): Set<string> {
        return new Set<string>(c.getEnemies().flatMap(e => {
            return [{x: e.pos.x, y: e.pos.y-1},
                    {x: e.pos.x-1, y: e.pos.y},
                    {x: e.pos.x+1, y: e.pos.y},
                    {x: e.pos.x, y: e.pos.y+1},
            ];
        }).filter(pos => {
            return this.gp.grid[pos.y][pos.x] === '.' && this.livingCharacters().findIndex(c => c.pos.x === pos.x && c.pos.y === pos.y) === -1;
        }).map(PairToKey));
    }
}