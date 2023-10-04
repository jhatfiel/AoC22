import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
let edges = new Map<number, Map<number, boolean>>();
function getOrCreateNode(n: number): Map<number, boolean> {
    let node = edges.get(n) ?? new Map<number, boolean>();
    if (!edges.has(n)) edges.set(n, node);
    return node;
}

puzzle.onLine = (line) => {
    let [n1, n2] = line.split('/').map(Number);
    getOrCreateNode(n1).set(n2, true);
    getOrCreateNode(n2).set(n1, true);
}

puzzle.onClose = () => {
    let paths = new Array<string>();
    let newPaths = new Array<string>();

    newPaths.push('-0');

    while (newPaths.length > 0) {
        console.log(`Paths: ${paths.length}`);
        let _newPaths = new Array<string>();
        newPaths.forEach(p => {
            let lastNode = Number(p.slice(p.lastIndexOf('-')+1));
            let foundContinuation = false;
            Array.from(getOrCreateNode(lastNode).keys()).forEach(to => {
                if (p.indexOf(`${lastNode}-${to}`) === -1 && p.indexOf(`${to}-${lastNode}`) === -1 && lastNode !== to) {
                    foundContinuation = true;
                    let newPath = `${p}-${to}`;
                    if (getOrCreateNode(to).has(to) && p.indexOf(`${to}-${to}`) === -1) newPath += `-${to}`
                    _newPaths.push(newPath);
                }
            });
            if (!foundContinuation) paths.push(p); // record paths when we reach a dead-end path
        })

        newPaths = _newPaths;
    }
    console.log(`Paths: ${paths.length}`);

    let strongest = -Infinity;
    let longest = -Infinity;
    let strongestLongest = -Infinity;
    paths.forEach(p => {
        let str = pathStrength(p);
        let len = pathLength(p);
        if (str > strongest) {
            strongest = str
            console.log(`${str.toString().padStart(5, ' ')} new strongest ${p}`);
        }
        if (len > longest) { longest = len; strongestLongest = -Infinity; }
        if (str > strongestLongest && len === longest) {
            strongestLongest = str
            console.log(`${str.toString().padStart(5, ' ')} new strongest longest ${p}`);
        }
    })
    console.log(`Strongest bridge: ${strongest}`);
    console.log(`Strongest longest bridge: ${strongestLongest}`);
}
function pathLength(p: string): number {
    return Array.from(p.matchAll(/-/g)).length;
}

function pathStrength(p: string): number {
    let last=0;
    return p.split('-').map(Number).reduce((acc, n) => { acc = acc + n + last; last = n; return acc;}, 0)
}

puzzle.run();