/*
amazing what happens when you misread just one small part of the problem description.

I thought the effects only applied on the start turn of the fighter who was affected by them, so I stored them on the fighter
had to rework it quite a bit to make it apply on both turn starts
*/
import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

class Fighter {
    constructor(public name: string, public hp: number, public damage: number, public mana: number) {}
    armor = 0;
    effects = new Array<Effect>();

    turnStart() {
        this.effects.forEach((e) => {
            e.turnEffect?.(this);
            e.duration && e.duration--;
            if (e.duration === 0) e.endEffect?.(this);
            console.log(`${e.name} timer = ${e.duration}`);
        })

        this.effects = this.effects.filter((e) => e.duration);
    }

    attack(opponent: Fighter) {
        let damageDone = Math.max(1, this.damage - opponent.armor);
        console.log(`${this.name} attacks for ${damageDone} damage.`);
        opponent.hp -= damageDone;
    }

    cast(spell: Spell, opponent: Fighter) {
        console.log(`${this.name} casts ${spell.name}.`);
        this.mana -= spell.manaCost;
        if (spell.selfEffect) {
            if (spell.selfEffect.startEffect) spell.selfEffect.startEffect(this);
            if (spell.selfEffect.duration) this.effects.push(spell.selfEffect);
        }

        if (spell.oppEffect) {
            if (spell.oppEffect.startEffect) spell.oppEffect.startEffect(opponent);
            if (spell.oppEffect.duration) opponent.effects.push(spell.oppEffect);
        }
    }

    clone(): Fighter {
        let f = new Fighter(this.name, this.hp, this.damage, this.mana);
        f.armor = this.armor;
        this.effects.forEach((e) => f.effects.push(structuredClone(e)));
        return f;
    }
}

function tryBattle(player: Fighter, boss: Fighter) {
    let canAfford = new Array<Spell>();

    if (canAfford.length === 0) {
        console.log(`Player loses because they are out of mana (${player.mana})`);
    }

    canAfford.forEach((s) => {
        let newPlayer = player.clone();
        let newBoss = boss.clone();
        tryBattle(player, boss);
    })
}

type Effect = {
    name: string,
    duration?: number,
    startEffect?: (f: Fighter) => void,
    turnEffect?: (f: Fighter) => void,
    endEffect?: (f: Fighter) => void
}

type Spell = {
    name: string,
    manaCost: number,
    selfEffect?: Effect;
    oppEffect?: Effect;
};

let spellArr = new Array<Spell>();
spellArr.push({
    name: 'Magic Missile',
    manaCost: 53,
    oppEffect: { name: 'Magic Missile', startEffect: (f: Fighter) => { console.log(`Magic Missile reduces hp ${f.hp}`); f.hp -= 4; } }
}, {
    name: 'Drain',
    manaCost: 73,
    selfEffect: { name: 'Drain', startEffect: (f: Fighter) => { console.log(`Drain increases hp ${f.hp}`); f.hp += 2; } },
    oppEffect: { name: 'Drain', startEffect: (f: Fighter) => { console.log(`Drain reduces hp ${f.hp}`); f.hp -= 2; } }
}, {
    name: 'Shield',
    manaCost: 113,
    selfEffect: { name: 'Shield', duration: 6, startEffect: (f: Fighter) => { console.log(`Shield increases armor`); f.armor = 6; }, endEffect: (f: Fighter) => { console.log(`shield ends`); f.armor = 0; } }
}, {
    name: 'Poison',
    manaCost: 173,
    oppEffect: { name: 'Poison', duration: 6, turnEffect: (f: Fighter) => { console.log(`Poison deals 3 damage; timer is reduced`); f.hp -= 3; } }
}, {
    name: 'Recharge',
    manaCost: 229,
    selfEffect: { name: 'Recharge', duration: 5, turnEffect: (f: Fighter) => { console.log(`Recharge reduces hp ${f.mana}`); f.mana += 101; } }
},
);
const MISSILE  = spellArr[0];
const DRAIN    = spellArr[1];
const SHIELD   = spellArr[2];
const POISON   = spellArr[3];
const RECHARGE = spellArr[4];

let pHP = 0;
let pM = 0;
let bHP = 0;
let bD = 0;
let minMana = Infinity;

p.onLine = (line) => {
    const arr = line.split(':');
    if (arr[0] === 'Player Hit Points') pHP = Number(arr[1]);
    if (arr[0] === 'Player Mana') pM = Number(arr[1]);
    if (arr[0] === 'Hit Points') bHP = Number(arr[1]);
    if (arr[0] === 'Damage') bD = Number(arr[1]);
};

p.onClose = () => {
    console.log(`Player: ${pHP} hp, ${pM} mana / Boss: ${bHP} hp, ${bD} damage`);
    let player = new Fighter('Player', pHP, 0, pM);
    let boss   = new Fighter('Boss', bHP, bD, 0);
    let effects = new Array<Effect>();

    //tryBattle(player, boss);
    console.log(``);
    console.log(`-- Player turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    player.turnStart();
    player.cast(POISON, boss);

    console.log(``);
    console.log(`-- Boss turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    boss.turnStart();
    boss.attack(player);

    console.log(``);
    console.log(`-- Player turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    player.turnStart();
    player.cast(MISSILE, boss);

    console.log(``);
    console.log(`-- Boss turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    boss.turnStart();
    console.assert(boss.hp <= 0, `Boss should be dead (hp=${boss.hp})`);
    boss.attack(player);

    console.log(`Min mana spent: ${minMana}`);
};

p.run();