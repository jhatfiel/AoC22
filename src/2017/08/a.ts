import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

let regArr = new Map<string, number>();
let highestEver = -Infinity;
function getOrCreateRegValue(r: string): number {
    if (!regArr.has(r)) regArr.set(r, 0);
    return regArr.get(r);
}

p.onLine = (line) => {
    //console.log(line);
    let arr = line.split(' ');
    let reg = arr[0];
    let op = arr[1];
    let arg = Number(arr[2]);
    let crName = arr[4];
    let crOp = arr[5];
    let crArg = Number(arr[6]);

    let crValue = getOrCreateRegValue(crName);
    if (('<'  === crOp && crValue <  crArg) ||
        ('<=' === crOp && crValue <= crArg) ||
        ('>'  === crOp && crValue >  crArg) ||
        ('>=' === crOp && crValue >= crArg) ||
        ('==' === crOp && crValue == crArg) ||
        ('!=' === crOp && crValue != crArg)) {
        //console.log(`condition passed`);
        let rValue = getOrCreateRegValue(reg);
        if (op === 'inc') regArr.set(reg, rValue + arg);
        else              regArr.set(reg, rValue - arg);
    }
    highestEver = Math.max(highestEver, Array.from(regArr.keys()).reduce((max, reg) => max = Math.max(max, regArr.get(reg)), 0));
}

p.onClose = () => {
    regArr.forEach((value, reg) => console.log(`[${reg}] = ${value}`));
    let largest = Array.from(regArr.keys()).reduce((max, reg) => max = Math.max(max, regArr.get(reg)), 0);
    console.log(`Largest: ${largest}`);
    console.log(`HighestEver: ${highestEver}`);
}

p.run();