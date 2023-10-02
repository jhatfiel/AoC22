import { Puzzle } from "../../lib/puzzle.js";

let order='';
order='abcde';
if (process.argv[2] === 'input') order='abcdefghijklmnop'
let seen = new Map<string, number>();

let p = new Puzzle(process.argv[2]);

function swap(str: string, pos1: number, pos2: number): string {
    let p1 = Math.min(pos1, pos2);
    let p2 = Math.max(pos1, pos2);
    return str.slice(0,p1) + str.slice(p2, p2+1) + str.slice(p1+1, p2) + str.slice(p1, p1+1) + str.slice(p2+1);
}

p.onLine = (line) => {
    const arr = line.split(',');
    const maxRepitions=1000000000;
    let repitionLength = 0;
    let lastI = 0;
    for (let i=0; i<maxRepitions; i++) {
        arr.forEach(op => {
            if (op.startsWith('s')) {
                let steps = -1*Number(op.slice(1));
                let newOrder = '';
                for (let i=0; i<order.length; i++) newOrder += order[(i+steps+order.length)%order.length];
                order = newOrder;
            } else if (op.startsWith('x')) {
                let [pos1, pos2] = op.slice(1).split('/').map(Number);
                order = swap(order, pos1, pos2);
            } else if (op.startsWith('p')) {
                let [let1, let2] = op.slice(1).split('/')
                let pos1 = order.indexOf(let1);
                let pos2 = order.indexOf(let2);
                order = swap(order, pos1, pos2);
            }
        });
        if (i % 1000000 === 0) console.log(`[${i.toString().padStart(10, ' ')}] Final order: ${order}`);
        if (seen.has(order)) {
            console.log(`We've seen this before.... ${seen.get(order)}`);
            repitionLength = i-seen.get(order);
            lastI = i;
            while (i+repitionLength < maxRepitions) i += repitionLength;
        } else {
            seen.set(order, i);
        }
    }
    let repitionsLeft = (maxRepitions-1-lastI);
    let cyclesLeft = Math.floor(repitionsLeft/repitionLength);
    let extraRepitions = repitionsLeft-cyclesLeft*repitionLength;
    console.log(`[END] Final order: ${order}`);
}

function debug(line='') {
    console.log(line);
}

function debugState() {
}

p.onClose = () => {
}

p.run();