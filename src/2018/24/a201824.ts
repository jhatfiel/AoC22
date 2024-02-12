import { AoCPuzzle } from '../../lib/AoCPuzzle';

class UnitGroup {
    size: number;
    hp: number;
    immune: Set<string> = new Set();
    weak: Set<string> = new Set();
    attackType: string;
    ap: number;
    initiative: number;

    constructor(public name: string, line: string, boost: number) {
        // 989 units each with 1274 hit points
        // (immune to fire; weak to bludgeoning, slashing)
        // with an attack that does 25 slashing damage at initiative 3
        let arr = line.split(/[ (;,)]/);
        //console.log(arr);
        this.size = Number(arr[0]);
        this.hp = Number(arr[4]);
        let immuneIndex = arr.indexOf('immune');
        let weakIndex = arr.indexOf('weak')
        let withIndex = arr.lastIndexOf('with')

        if (immuneIndex !== -1) {
            let i = immuneIndex + 2;
            while (i < withIndex-1 && (weakIndex < immuneIndex || i < weakIndex)) {
                this.immune.add(arr[i]);
                i += 2;
            }
        }

        if (weakIndex !== -1) {
            let i = weakIndex + 2;
            while (i < withIndex-1 && (immuneIndex < weakIndex || i < immuneIndex)) {
                this.weak.add(arr[i]);
                i += 2;
            }
        }

        this.ap = Number(arr[withIndex+5]) + boost;
        this.attackType = arr[withIndex+6];
        this.initiative = Number(arr[arr.length-1]);
        //console.log(this.toString());
    }

    effectivePower(): number {
        return this.size * this.ap;
    }

    chooseTarget(defendingGroups: UnitGroup[]): UnitGroup {
        // choose defending group based on immunities & weakness
        // if tie, choose group with largest EP         \_ so, in other words, sort the tied immunity/weakness groups
        // if tie, choose group with highest initiative /
        // defending groups can only be chosen as a target by 1 attacking group.
        let vulnerableScore = 0;
        let target: UnitGroup = null;
        defendingGroups.forEach(dg => {
            let vs = 1;
            if (dg.immune.has(this.attackType)) vs = 0;
            if (dg.weak.has(this.attackType)) vs = 2;

            //console.log(`${this.name} evaluating ${dg.name} ${vs} ${(vs>vulnerableScore)?'BEST YET':''}`);
            if (vs > vulnerableScore) { vulnerableScore = vs; target = dg};
        })
        return target;
    }

    toString(): string {
        return `[${this.name}] ${this.size} @${this.hp} [IMM: ${Array.from(this.immune.keys())}] Weak: ${Array.from(this.weak.keys())}, Attack: ${this.ap} ${this.attackType} at ${this.initiative}`;
    }

    static sort(a: UnitGroup, b: UnitGroup) {
        let aep = a.effectivePower();
        let bep = b.effectivePower();
        if (aep === bep) return b.initiative - a.initiative;
        else return bep - aep;
    }

    static alive(arr: UnitGroup[]): UnitGroup[] {
        return arr.filter(ug => ug.size > 0);
    }
}

export class a201824 extends AoCPuzzle {
    immUnits: UnitGroup[] = [];
    infUnits: UnitGroup[] = [];
    sampleMode(): void { };

    _loadData(lines: string[]) {
        let workingGroup = this.immUnits;
        let name='imm';
        let boost = 29;
        lines.forEach(line => {
            if      (line.startsWith('Immune')) { workingGroup = this.immUnits; name = 'imm'; }
            else if (line.startsWith('Infection')) { workingGroup = this.infUnits; name = 'inf'; boost = 0; }
            else if (line) workingGroup.push(new UnitGroup(`${name}${workingGroup.length+1}`, line, boost));
        })

    }

    _runStep(): boolean {
        let moreToDo = true;
        if (this.stepNumber === 10000) this.debug('START');
        let battles: {attacker: UnitGroup, defender: UnitGroup}[] = [];

        let immA = UnitGroup.alive(this.immUnits).sort(UnitGroup.sort);
        let infA = UnitGroup.alive(this.infUnits).sort(UnitGroup.sort);
        if ((immA.length === 0 || infA.length === 0) || this.stepNumber > 10000) {
            this.debug('FINAL');
            moreToDo = false;
            this.result = immA.reduce((totalSize, ug) => totalSize += ug.size, infA.reduce((totalSize, ug) => totalSize += ug.size, 0)).toString();
        } else {
            this.assignTargets(immA, infA, battles);
            this.assignTargets(infA, immA, battles);

            battles.sort((a,b) => {
                return b.attacker.initiative - a.attacker.initiative;
            }).forEach(b => {
                if (b.attacker.size === 0) {
                    //this.log(`  battle: CANCELLED because he ded ${b.attacker.name}`);
                }
                let ep = b.attacker.effectivePower();
                if (b.defender.immune.has(b.attacker.attackType)) ep = 0;
                else if (b.defender.weak.has(b.attacker.attackType)) ep *= 2;
                let killed = Math.min(b.defender.size, Math.floor(ep/b.defender.hp));
                if (this.stepNumber === 10000-1) this.log(`  battle: {${b.attacker.name}} attacking (${ep} - killing ${killed}) {${b.defender.name}}`);
                b.defender.size -= killed;
            })
            //this.debug('END');
        }

        return moreToDo;
    }

    // arr's should be sorted
    assignTargets(attackerArr: UnitGroup[], defenderArr: UnitGroup[], battles: { attacker: UnitGroup; defender: UnitGroup; }[]) {
        attackerArr.forEach(attacker => {
            let defender = attacker.chooseTarget(defenderArr.filter(d => battles.findIndex(b => b.defender === d) === -1))
            //this.log(`${attacker.name} is choosing target ${defender?.name}`);
            if (defender) battles.push({attacker, defender});
        })
    }

    debug(msg: string) {
        this.log(`Step: ${this.stepNumber} ${msg}`);
        this.log(`Immune:`);
        this.immUnits.forEach(ug => {
            this.log(ug.toString());
        })
        this.log(`Infection:`);
        this.infUnits.forEach(ug => {
            this.log(ug.toString());
        })
    }
}