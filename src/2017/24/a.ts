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
    let longestPaths: Array<string>;

    newPaths.push('-0');

    while (newPaths.length > 0) {
        longestPaths = newPaths; // for part 2
        console.log(`Paths: ${paths.length}`);
        let _newPaths = new Array<string>();
        newPaths.forEach(p => {
            paths.push(p);
            let lastNode = Number(p.slice(p.lastIndexOf('-')+1));
            Array.from(getOrCreateNode(lastNode).keys()).forEach(to => {
                if (p.indexOf(`${lastNode}-${to}`) === -1 && p.indexOf(`${to}-${lastNode}`) === -1) {
                    _newPaths.push(`${p}-${to}`);
                }
            });
        })

        newPaths = _newPaths;
    }
    console.log(`Paths: ${paths.length}`);

    let strongest = -Infinity;
    paths.forEach(p => {
        let str = pathStrength(p);
        if (str > strongest) {
            strongest = str
            console.log(`${str.toString().padStart(5, ' ')} ${p}`);
        }
    })
    console.log(`Strongest bridge: ${strongest}`);

    strongest = -Infinity;
    longestPaths.forEach(p => {
        let str = pathStrength(p);
        if (str > strongest) {
            strongest = str
            console.log(`${str.toString().padStart(5, ' ')} ${p}`);
        }
    })
    console.log(`Strongest longest bridge: ${strongest}`);
}

function pathStrength(p: string): number {
    let last=0;
    return p.split('-').map(Number).reduce((acc, n) => { acc = acc + n + last; last = n; return acc;}, 0)
}

puzzle.run();