export {};
let LINE=['..^^.', '.^^.^.^^^^', '^^.^..^.....^..^..^^...^^.^....^^^.^.^^....^.^^^...^^^^.^^^^.^..^^^^.^^.^.^.^.^.^^...^^..^^^..^.^^^^'][2];

const LENGTH = 400000;
let room = Array.from({length: LENGTH}, () => '');

room[0] = LINE;

function debug() {
    room.forEach((l) => console.log(l));
}

room.slice(1).forEach((l, ind) => {
    for (let i=0; i<LINE.length; i++) {
        let lTrap = false;
        let cTrap = false;
        let rTrap = false;
        if (i>=0) lTrap = LINE[i-1] === '^';
        cTrap = LINE[i] === '^';
        if (i<LINE.length-1) rTrap = LINE[i+1] === '^';
        let isTrap = false;
        if (lTrap && cTrap && !rTrap) isTrap = true;
        if (cTrap && rTrap && !lTrap) isTrap = true;
        if (lTrap && !cTrap && !rTrap) isTrap = true;
        if (rTrap && !cTrap && !lTrap) isTrap = true;
        l += (isTrap)?'^':'.';
    }
    room[ind+1] = l
    LINE = l;
})
//debug();

let numSafe = room.reduce((acc, l) => acc+l.split('').reduce((lArr, c) => lArr+((c==='.')?1:0), 0), 0);
console.log(`Number of safe tiles = ${numSafe}`)
// 4940 is too high