import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

let trans = new Map<string, Array<string>>();
let maxDepth = Infinity;

// this found an answer almost immediately, but kept running for a very long time.
// I'm surprised the answer I got was optimal and I'm not sure that would work with all inputs
function reverseReplacement(toMatch: string, depth=0) {
    if (depth === 0) {
        maxDepth = Infinity;
    }
    if (toMatch === 'e' && depth < maxDepth) {
        maxDepth = depth;
        console.log(`Found replacement at ${depth}`);
        return;
    }

    if (depth > maxDepth) return;

    //console.log(`[${depth.toString().padStart(5, ' ')}] Trying to make ${toMatch}              `);
    //process.stdout.moveCursor(0, -1);

    trans.forEach((toArr, from) => {
        toArr.forEach((to) => {
            const matches = toMatch.matchAll(new RegExp(to, 'g'));
            for (const match of matches) {
                //console.log(`Could be the ${from} -> ${to} replacement at ${match.index}`);
                let unTrans = toMatch.slice(0, match.index) + from + toMatch.slice(match.index! + match[0].length);
                reverseReplacement(unTrans, depth+1);
            }
        })
    })
}

let transDone = false;

p.onLine = (line) => {
    if (transDone) reverseReplacement(line);
    else {
        if (line.length === 0) {
            transDone = true;
        } else {
            let [from, to] = line.split(' => ');
            // console.log(`${from} -> ${to}`);
            let toArr = trans.get(from);
            if (toArr === undefined) {
                toArr = new Array<string>();
                trans.set(from, toArr);
            }
            toArr.push(to);
        }
    }
};

p.onClose = () => { };

p.run();