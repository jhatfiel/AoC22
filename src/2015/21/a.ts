import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

class Fighter {
    constructor(public name: string, public hp: number, public damage: number, public armor: number) {}

    attack(fighter: Fighter) {
        let damageDone = Math.max(1, this.damage - fighter.armor);
        fighter.hp -= damageDone;
        //console.log(`The ${this.name} deals ${this.damage}-${fighter.armor} = ${damageDone} damage; the ${fighter.name} goes down to ${fighter.hp} hit points.`);
    }
}

type Gear = {name: string, cost: number, damage: number, armor: number};

function attack(weapon: Gear, armor?: Gear, ring1?: Gear, ring2?: Gear): Fighter {
    console.log(`Trying an attack with Weapon: ${weapon.name} (${weapon.cost}), Armor: ${armor?.name??'None'} (${armor?.cost??0}), Rings: ${ring1?.name??'None'} (${ring1?.cost??0}) / ${ring2?.name??'None'} (${ring2?.cost??0})`);
    let pD = weapon.damage + (ring1?.damage??0) + (ring2?.damage??0);
    let pA = armor?.armor??0 + (ring1?.armor??0) + (ring2?.armor??0);
    let fighter = new Fighter('player', pHP, pD, pA);
    let boss    = new Fighter('boss', bHP, bD, bA);

    let fighterTurn = true;

    while (fighter.hp > 0 && boss.hp > 0) {
        if (fighterTurn) {
            fighter.attack(boss);
        } else {
            boss.attack(fighter);
        }

        fighterTurn = !fighterTurn;
    }

    return fighter;
}

let pHP = 0;
let bHP = 0;
let bD = 0;
let bA = 0;
const weaponArr = new Array<Gear>();
weaponArr.push({name: 'Dagger', cost: 8, damage: 4, armor: 0});
weaponArr.push({name: 'Shortsword', cost: 10, damage: 5, armor: 0});
weaponArr.push({name: 'Warhammer', cost: 25, damage: 6, armor: 0});
weaponArr.push({name: 'Longsword', cost: 40, damage: 7, armor: 0});
weaponArr.push({name: 'Greataxe', cost: 74, damage: 8, armor: 0});

const armorArr   = new Array<Gear>();
armorArr.push({name: 'Leather', cost: 13, damage: 0, armor: 1});
armorArr.push({name: 'Chainmail', cost: 31, damage: 0, armor: 2});
armorArr.push({name: 'Splintmail', cost: 53, damage: 0, armor: 3});
armorArr.push({name: 'Bandedmail', cost: 75, damage: 0, armor: 4});
armorArr.push({name: 'Platemail', cost: 102, damage: 0, armor: 5});

const ringArr   = new Array<Gear>();
ringArr.push({name: 'Damage +1', cost: 25, damage: 1, armor: 0});
ringArr.push({name: 'Damage +2', cost: 50, damage: 2, armor: 0});
ringArr.push({name: 'Damage +3', cost: 100, damage: 3, armor: 0});
ringArr.push({name: 'Defense +1', cost: 20, damage: 0, armor: 1});
ringArr.push({name: 'Defense +2', cost: 40, damage: 0, armor: 2});
ringArr.push({name: 'Defense +3', cost: 80, damage: 0, armor: 3});

p.onLine = (line) => {
    const arr = line.split(':');
    if (arr[0] === 'Player Hit Points') pHP = Number(arr[1]);
    if (arr[0] === 'Hit Points') bHP = Number(arr[1]);
    if (arr[0] === 'Damage') bD = Number(arr[1]);
    if (arr[0] === 'Armor') bA = Number(arr[1]);
};

p.onClose = () => {
    console.log(`Player: ${pHP}, Boss: ${bHP} hp, ${bD} damage, ${bA} armor`);
    let minCost = Infinity;

    weaponArr.forEach((weapon) => {
        for (let i=-1; i < armorArr.length; i++) {
            let armor: Gear|undefined;
            if (i >= 0) armor = armorArr[i];
            if (weapon.cost + (armor?.cost??0) > minCost) break;
            for (let j = -1; j < ringArr.length; j++) {
                let ring1: Gear|undefined;
                if (j >= 0) ring1 = ringArr[j];
                if (weapon.cost + (armor?.cost??0) + (ring1?.cost??0) > minCost) break;
                for (let k = -1; k < ringArr.length; k++) {
                    if (k === j) continue;
                    let ring2: Gear|undefined;
                    if (k >= 0) ring2 = ringArr[k];
                    let cost = weapon.cost + (armor?.cost??0) + (ring1?.cost??0) + (ring2?.cost??0);
                    if (cost > minCost) break;
                    let fighter = attack(weapon, armor, ring1, ring2);
                    if (fighter.hp > 0) {
                        console.log(`Fighter won! ${cost}`);
                        minCost = cost;
                    }
                }
            }
        }
    })

};

p.run();