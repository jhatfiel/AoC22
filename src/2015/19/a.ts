import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

let trans = new Map<string, Array<string>>();

function runReplacement(line: string) {
    let result = new Set<string>();
    trans.forEach((toArr, from) => {
        toArr.forEach((to) => {
            const matches = line.matchAll(new RegExp(from, 'g'));
            for (const match of matches) {
                let str = line.slice(0, match.index) + to + line.slice(match.index! + match[0].length);
                result.add(str);
            }
        });
    });

    console.log(`Replacement count: ${result.size}`);
}

let transDone = false;

p.onLine = (line) => {
    if (transDone) runReplacement(line);
    else {
        if (line.length === 0) {
            transDone = true;
        } else {
            let [from, to] = line.split(' => ');
            console.log(`${from} -> ${to}`);
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