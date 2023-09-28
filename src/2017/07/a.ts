import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

type TreeNode = {
    name: string,
    value: number,
    weight?: number,
    parent?: TreeNode, // we can build this up at the end
    children?: Array<string>;
}

let nodes = new Map<string, TreeNode>();

p.onLine = (line) => {
    let match = line.match(/(\w+) \((\d+)\)( -> )?([\w, ]+)*/);
    let name = match[1];
    let value = Number(match[2]);
    let children: Array<string>;
    if (match[3]) {
        children = match[4].split(', ');
    }
    nodes.set(name, {name, value, children});
}

p.onClose = () => {
    nodes.forEach((node) => {
        node.children?.forEach((cName) => nodes.get(cName).parent = node);
    })
    let root: TreeNode;
    nodes.forEach((node, name) => {
        if (node.parent === undefined) root = node;
    });

    console.log(`ROOT: ${root.name}`);

    root.weight = calculateWeight(root);

    console.log(`Total Weight: ${root.weight}`);

    nodes.forEach((node, name) => {
        if (node.children !== undefined) {
            let unbalanced = false;
            let bWeight: number;
            node.children.forEach((c) => { let cn = nodes.get(c); if (bWeight === undefined) bWeight = cn.weight; if (bWeight !== cn.weight) unbalanced = true; })
            if (unbalanced) {
                console.log(`Weights for children of [${name}]/${node.value}/${node.weight}:`);
                node.children.forEach((c) => { let cn = nodes.get(c); console.log(`-- [${c}] ${cn.value}/${cn.weight}`); })
            }
        }
    })
}

function calculateWeight(n: TreeNode): number {
    if (n.weight === undefined) {
        if (n.children) n.weight = n.value + n.children.reduce((acc, c) => acc += calculateWeight(nodes.get(c)), 0);
        else n.weight = n.value;
    }
    return n.weight;
}

p.run();