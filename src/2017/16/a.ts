import { Puzzle } from "../../lib/puzzle.js";

let order='';
order='abcde';
if (process.argv[2] === 'input') order='abcdefghijklmnop'

let p = new Puzzle(process.argv[2]);

function swap(str: string, pos1: number, pos2: number): string {
    let p1 = Math.min(pos1, pos2);
    let p2 = Math.max(pos1, pos2);
    return str.slice(0,p1) + str.slice(p2, p2+1) + str.slice(p1+1, p2) + str.slice(p1, p1+1) + str.slice(p2+1);
}

p.onLine = (line) => {
    const arr = line.split(',');
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
    console.log(`Final order: ${order}`);
    debugState();
}

function debug(line='') {
    console.log(line);
}

function debugState() {
}

p.onClose = () => {
}

p.run();