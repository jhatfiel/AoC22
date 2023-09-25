import { Puzzle } from "../../lib/puzzle.js";

let password='';
password='abcde';
password='abcdefgh'

let target = 'fbgdceah'
let letters = password.split('');

let p = new Puzzle(process.argv[2]);
let puzzleLines = new Array<string>();
p.onLine = (line) => puzzleLines.push(line);

let tryArr = p.permute(letters);
console.log(`Combinations to try: ${tryArr.length}`);

p.onClose = () => {
    tryArr.some((original) => {
        password = original;

        puzzleLines.forEach((line) => {
            //debug(`puzzleLines: ${line}`);
            const arr = line.split(' ');
            if (line.startsWith('swap position')) {
                password = swap(password, Number(arr[2]), Number(arr[5]));
            } else if (line.startsWith('swap letter')) {
                let let1 = arr[2];
                let let2 = arr[5];
                let pos1 = 0;
                let pos2 = 0;
                for (let i=0; i<password.length; i++) { if (password[i] === let1) { pos1 = i; } if (password[i] === let2) { pos2 = i; }}
                password = swap(password, pos1, pos2);
            } else if (line.startsWith('rotate based on position of letter')) {
                let let1 = arr[6];
                let steps = 0;
                for (let i=0; i<password.length; i++) { if (password[i] === let1) { steps = i; } }
                if (steps >= 4) steps++;
                steps++;
                steps = -1*steps + password.length;
                let newPassword = '';
                for (let i=0; i<password.length; i++) newPassword += password[(i+steps+password.length)%password.length];
                password = newPassword;
            } else if (line.startsWith('rotate')) {
                let dir = arr[1];
                let steps = Number(arr[2]);
                if (dir === 'right') steps = -1*steps + password.length;
                let newPassword = '';
                for (let i=0; i<password.length; i++) newPassword += password[(i+steps+password.length)%password.length];
                password = newPassword;
            } else if (line.startsWith('reverse positions')) {
                let pos1 = Math.min(Number(arr[2]), Number(arr[4]));
                let pos2 = Math.max(Number(arr[2]), Number(arr[4]));
                password = password.slice(0, pos1) + password.slice(pos1, pos2+1).split('').reverse().join('') + password.slice(pos2+1);
            } else if (line.startsWith('move position')) {
                let fromPos = Number(arr[2]);
                let toPos = Number(arr[5]);
                let let1 = password.slice(fromPos, fromPos+1);
                password = password.split(let1).join('');
                password = password.slice(0, toPos) + let1 + password.slice(toPos);
            }
            debug(password);
        })

        if (password === target) console.log(`Original: ${original}`);
        // efghdabc is wrong
        debugState();

    })
}

p.run();

function swap(str: string, pos1: number, pos2: number): string {
    let p1 = Math.min(pos1, pos2);
    let p2 = Math.max(pos1, pos2);
    return str.slice(0,p1) + str.slice(p2, p2+1) + str.slice(p1+1, p2) + str.slice(p1, p1+1) + str.slice(p2+1);
}

function debug(line='') {
    //console.log(line);
}

function debugState() {
}
