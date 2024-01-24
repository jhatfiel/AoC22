import { AoCPuzzle } from "../../lib/AoCPuzzle";
import { GridParser, Pair, PairFromKey, PairToKey } from "../../lib/gridParser";

const elfNames = ['Aymer', 'Beluar', 'Connak', 'Dyffros', 'Eldrin', 'Folen', 'Gaelin', 'Haladavar', 'Illitran', 'Jhaan', 'Khyrmin', 'Lhoris', 'Myriil', 'Nesterin', 'Omazeiros', 'Pirphal', 'Qican', 'Rydel', 'Saleh', 'Taeral', 'Urihorn', 'Vesryn', 'Wralen', 'Xeshest', 'Yhendorn', 'Zumdithas'];
const goblinNames = ['Abbas', 'Bumbub', 'Crothu', 'Drikdarok', 'Egharod', 'Fodagog', 'Gholug', 'Hugmug', 'Igmut', 'Jughog', 'Khadba', 'Lob', 'Mabub', 'Nehrakgu', 'Oghuglat', 'Piggu', 'Quordud', 'Romarod', 'Sahgigoth', 'Tuggug', 'Ulam', 'Vukgilug', 'Wumkbanok', 'Xurek', 'Yashnarz', 'Zumhug'];

function positionSort(a: Pair, b: Pair): number {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
}

function keySort(a: string, b: string): number {
    return positionSort(PairFromKey(a), PairFromKey(b));
}

export abstract class Character {
    constructor(public name: string, public pos: Pair) {}
    plannedMoves: Pair[] = [];
    attacking: Character;
    hp = 200;
    ap = 3;
    public abstract getEnemies(): Character[];
    public isAlive(): boolean { return this.hp > 0; }
    static sort(a: Character, b: Character): number {
        return positionSort(a.pos, b.pos);
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
        this.livingCharacters().sort(Character.sort).forEach(c => {
            if (c.hp <= 0) return;
            if (c.getEnemies().length === 0) moreToDo = false;
            if (!moreToDo) return;
            c.plannedMoves = [];
            c.attacking = null;
            // characters only move if there is no enemy adjacent
            let attackTarget = this.getAttackTarget(c);
            if (attackTarget) {
                //this.log(`${c.toString()} is at ${c.pos.x},${c.pos.y} (target is ${attackTarget.toString()})`);
            } else {
                // find target, if available, and start moving to it
                // get all squares around all enemies
                let inRange = this.getEnemySquares(c);
                if (inRange.size) {
                    //this.log(`${c.toString()} is at ${c.pos.x},${c.pos.y} (SEARCHING) (inRange = ${Array.from(inRange.keys()).join(' / ')})`);

                    let cPosKey = PairToKey(c.pos);
                    let path: string[];

                    // find the closest set of inRange squares
                    let parent = new Map<string, string>();
                    parent.set(cPosKey, undefined);
                    let frontier = new Array<string>(cPosKey);
                    let found = new Array<string>();
                    while (frontier.length && found.length === 0) {
                        let newFrontier = new Array<string>();
                        frontier.forEach(fn => {
                            let neighbors = this.getNeighbors(fn);
                            Array.from(neighbors.keys()).filter(n => !parent.has(n)).forEach(n => {
                                parent.set(n, fn);
                                newFrontier.push(n);
                                if (inRange.has(n)) found.push(n);
                            });
                        })
                        frontier = newFrontier;
                    }

                    // pick the best one we found and build the path to it
                    if (found.length) {
                        path = [];
                        let target = found.sort(keySort)[0];
                        while (target) { 
                            path.push(target);
                            target = parent.get(target);
                        }
                        path.reverse();
                    }

                    if (path) {
                        //this.log(`${c.toString()} is at ${c.pos.x},${c.pos.y} (MOVING) ${targetSquare}`);
                        c.pos = PairFromKey(path[1]);
                        c.plannedMoves = path.slice(1).map(PairFromKey);
                    }

                    // after moving, try to get the attack target
                    attackTarget = this.getAttackTarget(c);
                } else {
                    //this.log(`${c.toString()} is at ${c.pos.x},${c.pos.y} (NO ENEMY SQUARES)`);
                }
            }

            // attack lowest health edjacent enemy (if any)
            // attack attackTarget here
            if (attackTarget) {
                c.attacking = attackTarget;
                attackTarget.hp = Math.max(0, attackTarget.hp - c.ap);
            }
        })

        if (!moreToDo) {
            // calculate result
            let totalHealth = this.livingCharacters().reduce((sum, c) => sum += c.hp, 0);
            this.result = (totalHealth * (this.stepNumber - 1)).toString();
            this.log(`Step: ${this.stepNumber} done, total = ${totalHealth}`);
            this.livingCharacters().forEach(c => {
                this.log(`${c.toString()} is at ${c.pos.x},${c.pos.y}`);
            })
            // this.debug();
            // part b 
            // 60080 too low 40*1502
            // 60200 is incorrect (no hints) 40*1505
            // 61582 is wrong (41*1502)
            // 40*1499=59960 wrong
            // 62958 41*1499
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
        let enemies = c.getEnemies();
        [{x: c.pos.x, y: c.pos.y-1},
         {x: c.pos.x-1, y: c.pos.y},
         {x: c.pos.x+1, y: c.pos.y},
         {x: c.pos.x, y: c.pos.y+1}].filter(pos => {
            let eIndex = enemies.findIndex(e => e.pos.x === pos.x && e.pos.y === pos.y);
            if (eIndex !== -1 && (!t || t.hp > enemies[eIndex].hp)) {
                t = enemies[eIndex];
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