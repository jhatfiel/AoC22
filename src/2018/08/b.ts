import { Puzzle } from '../../lib/puzzle.js';

class TreeNode {
    children = new Array<TreeNode>();
    data = new Array<number>();

    getValue(): number {
        let result: number;
        if (this.children.length) {
            result = this.data.reduce((acc, d) => acc + (this.children[d-1]?.getValue()??0), 0);
        } else {
            result = this.data.reduce((acc, d) => acc + d, 0);
        }

        return result;
    }

    debug() {
        console.log(`Node, numChildren=${this.children.length}, data=${this.data}`)
    }
}

function consume(arr: Array<number>, indent=''): TreeNode {
    let tn = new TreeNode();
    let cc = arr.shift();
    let mc = arr.shift();

    console.log(`${indent}consume: ${cc}/${mc}`)
    for (let i=0; i<cc; i++) {
        tn.children.push(consume(arr, indent+'  '));
    }
    for (let i=0; i<mc; i++) {
        tn.data.push(arr.shift());
        console.log(`${indent}value=${tn.data[tn.data.length-1]}`)
    }
    return tn;
}

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach((line) => {
            let arr = line.split(' ').map(Number);
            let root = consume(arr);
            console.log(`Final value: ${root.getValue()}`)
        })
    });