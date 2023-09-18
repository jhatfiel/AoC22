import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

class Fighter {
    constructor(public name: string, public hp: number, public damage: number, public mana: number) {}
    armor = 0;
    spentMana = 0;

    attack(opponent: Fighter) {
        let damageDone = Math.max(1, this.damage - opponent.armor);
        //console.log(`${this.name} attacks for ${damageDone} damage.`);
        opponent.hp -= damageDone;
    }

    cast(spell: Spell, opponent: Fighter, effects: Array<Spell>) {
        //console.log(`${this.name} casts ${spell.name}.`);
        this.mana -= spell.manaCost;
        this.spentMana += spell.manaCost;
        spell.selfStartEffect?.(this);
        spell.bossStartEffect?.(opponent);

        if (spell.duration) effects.push({...spell});
    }

    clone(): Fighter {
        let f = new Fighter(this.name, this.hp, this.damage, this.mana);
        f.armor = this.armor;
        f.spentMana = this.spentMana;
        return f;
    }
}

type Spell = {
    name: string,
    manaCost: number,
    duration?: number,
    selfStartEffect?: (f: Fighter) => void,
    selfTurnEffect?: (f: Fighter) => void,
    selfEndEffect?: (f: Fighter) => void
    bossStartEffect?: (f: Fighter) => void,
    bossTurnEffect?: (f: Fighter) => void,
    bossEndEffect?: (f: Fighter) => void
};

let spellArr = new Array<Spell>();
spellArr.push({
    name: 'Magic Missile',
    manaCost: 53,
    bossStartEffect: (f: Fighter) => { f.hp -= 4; }
}, {
    name: 'Drain',
    manaCost: 73,
    selfStartEffect: (f: Fighter) => { f.hp += 2; },
    bossStartEffect: (f: Fighter) => { f.hp -= 2; }
}, {
    name: 'Shield',
    manaCost: 113,
    duration: 6,
    selfStartEffect: (f: Fighter) => { f.armor = 7; },
    selfEndEffect: (f: Fighter) => { f.armor = 0; }
}, {
    name: 'Poison',
    manaCost: 173,
    duration: 6,
    bossTurnEffect: (f: Fighter) => { f.hp -= 3; }
}, {
    name: 'Recharge',
    manaCost: 229,
    duration: 5,
    selfTurnEffect: (f: Fighter) => { f.mana += 101; }
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

function turnStart(player: Fighter, boss: Fighter, effects: Array<Spell>): Array<Spell> {
    effects.forEach((e) => {
        e.selfTurnEffect?.(player);
        e.bossTurnEffect?.(boss);
        e.duration && e.duration--;
        if (e.duration === 0) { e.selfEndEffect?.(player); e.bossEndEffect?.(boss); }
        //console.log(`${e.name} timer = ${e.duration}`);
    })

    return effects.filter((e) => e.duration);
}

function tryBattle(player: Fighter, boss: Fighter, effects: Array<Spell>, castSpells = new Array<string>()) {
    let canAfford = spellArr.filter((s) => player.spentMana + s.manaCost < minMana && s.manaCost <= player.mana && !effects.some((e) => e.name === s.name));

    if (canAfford.length === 0) {
        //console.log(`Player loses because they are out of mana (${player.mana})`);
    }

    canAfford.forEach((s) => {
        //console.log(`[${castSpells.length.toString().padStart(3, ' ')}]: trying to cast ${s.name}`);
        let newPlayer = player.clone();
        let newBoss = boss.clone();

        let newEffects = turnStart(newPlayer, newBoss, effects.map((e) => { return {...e}; }));

        let newCastSpells = [...castSpells, s.name]; 
        newPlayer.cast(s, newBoss, newEffects);

        if (newBoss.hp <= 0) {
            if (newPlayer.spentMana < minMana) {
                minMana = newPlayer.spentMana;
                console.log(`+++ Spell killed the boss,   mana spent = ${newPlayer.spentMana}, cast spells: ${newCastSpells}`);
            }
        } else {
            newEffects = turnStart(newPlayer, newBoss, newEffects);
            if (newBoss.hp <= 0) {
                if (newPlayer.spentMana < minMana) {
                    minMana = newPlayer.spentMana;
                    console.log(`+++ Boss died on turn start, mana spent = ${newPlayer.spentMana}, cast spells: ${newCastSpells}`);
                }
            } else {
                newBoss.attack(newPlayer);

                if (newPlayer.hp <= 0) {
                    //console.log(`Player died from boss attack`);
                } else {
                    tryBattle(newPlayer, newBoss, newEffects, newCastSpells);
                }
            }
        }
    })
}

p.onClose = () => {
    console.log(`Player: ${pHP} hp, ${pM} mana / Boss: ${bHP} hp, ${bD} damage`);
    let player = new Fighter('Player', pHP, 0, pM);
    let boss   = new Fighter('Boss', bHP, bD, 0);

    tryBattle(player, boss, new Array<Spell>());

    /*
    // sample
    let effects = new Array<Spell>();
    console.log(``);
    console.log(`-- Player turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    effects = turnStart(player, boss, effects);
    player.cast(POISON, boss, effects);

    console.log(``);
    console.log(`-- Boss turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    effects = turnStart(player, boss, effects);
    boss.attack(player);

    console.log(``);
    console.log(`-- Player turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    effects = turnStart(player, boss, effects);
    player.cast(MISSILE, boss, effects);

    console.log(``);
    console.log(`-- Boss turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    effects = turnStart(player, boss, effects);
    console.assert(boss.hp <= 0, `Boss should be dead (hp=${boss.hp})`);
    */

    /*
    // sample2
    let effects = new Array<Spell>();
    console.log(``);
    console.log(`-- Player turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    effects = turnStart(player, boss, effects);
    player.cast(RECHARGE, boss, effects);

    console.log(``);
    console.log(`-- Boss turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    effects = turnStart(player, boss, effects);
    boss.attack(player);

    console.log(``);
    console.log(`-- Player turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    effects = turnStart(player, boss, effects);
    player.cast(SHIELD, boss, effects);

    console.log(``);
    console.log(`-- Boss turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    effects = turnStart(player, boss, effects);
    boss.attack(player);

    console.log(``);
    console.log(`-- Player turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    effects = turnStart(player, boss, effects);
    player.cast(DRAIN, boss, effects);

    console.log(``);
    console.log(`-- Boss turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    effects = turnStart(player, boss, effects);
    boss.attack(player);

    console.log(``);
    console.log(`-- Player turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    effects = turnStart(player, boss, effects);
    player.cast(POISON, boss, effects);

    console.log(``);
    console.log(`-- Boss turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    effects = turnStart(player, boss, effects);
    boss.attack(player);

    console.log(``);
    console.log(`-- Player turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    effects = turnStart(player, boss, effects);
    player.cast(MISSILE, boss, effects);

    console.log(``);
    console.log(`-- Boss turn --`);
    console.log(`- Player has ${player.hp} hit points, ${player.armor} armor, ${player.mana} mana`);
    console.log(`- Boss has ${boss.hp} hit points`);
    effects = turnStart(player, boss, effects);

    console.assert(boss.hp <= 0, `Boss should be dead (hp=${boss.hp})`);
    */
    console.log(`Min mana spent: ${minMana}`);
};

p.run();