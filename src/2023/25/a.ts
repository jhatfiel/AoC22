import { BFS, BFS_State } from "../../lib/bfsearcher.js";
import { Dijkstra } from "../../lib/dijkstraBetter.js";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

let graph = new Map<string, Set<string>>();
let edgeCount = new Map<string, number>();

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            let arr = line.split(': ');
            let node = arr[0];
            let connected = arr[1].split(' ');
            let nodeSet = graph.get(node);
            if (nodeSet === undefined) {
                nodeSet = new Set<string>();
                graph.set(node, nodeSet);
            }

            connected.forEach(n2 => {
                let n2Set = graph.get(n2);
                if (n2Set === undefined) {
                    n2Set = new Set<string>();
                    graph.set(n2, n2Set);
                }
                nodeSet.add(n2);
                n2Set.add(node);
            });
        });

        console.debug(`Number of nodes: ${graph.size}`);
        console.debug(`Number of edges: ${Array.from(graph.keys()).flatMap(n => Array.from(graph.get(n))).length}`);
        let edges = Array.from(graph.keys()).flatMap(n => Array.from(graph.get(n)).map(c => [n,c]));
        //console.debug(`edges: ${edges.map(([a1,a2])=>`${a1}-${a2}`).join('/')}`);
        //console.debug(`hfx connected: ${Array.from(graph.get('hfx'))}`)
        generateEdotorCode(graph);

        let nodes = Array.from(graph.keys());
        edges.forEach(([a,b]) => {
            edgeCount.set(`${a}.${b}`, 0);
        })
        nodes.forEach(node => {
            let dij = new Dijkstra(getNeighbors);
            let pathMaps = dij.getShortestPaths(node);

            Array.from(pathMaps.keys()).forEach(to => {
                let shortestPaths = pathMaps.get(to);
                //console.debug(`Number of paths from ${node} to ${to}: ${shortestPaths.length}`);

                shortestPaths.forEach(path => {
                    let prevNode = path[0];

                    path.slice(1).forEach(n => {
                        let edge = `${prevNode}.${n}`;
                        edgeCount.set(edge, edgeCount.get(edge)+1);
                        edge = `${n}.${prevNode}`;
                        edgeCount.set(edge, edgeCount.get(edge)+1);
                        prevNode = n;
                    })
                })

            });
        })

        Array.from(edgeCount.keys()).sort((a, b) => (edgeCount.get(a) === edgeCount.get(b))?0:((edgeCount.get(a) > edgeCount.get(b))?-1:1)).slice(0,6).forEach(edge => {
            console.debug(`Cutting edge: ${edge}`);
            let [n1, n2] = edge.split('.');
            graph.get(n1).delete(n2);
        })

        let groups = getGroups(graph);
        console.debug(`Num groups: ${groups.map(s => s.size)}`);
        console.log(`Product of group sizes: ${groups.map(s => s.size).reduce((acc, s) => acc *= s, 1)}`);

        // answer here...
        /*
        graph.get('bbp').delete('dvr'); graph.get('dvr').delete('bbp');
        graph.get('jzv').delete('qvq'); graph.get('qvq').delete('jzv');
        graph.get('gtj').delete('tzj'); graph.get('tzj').delete('gtj');
        let groups = getGroups(graph);
        console.debug(`Num groups: ${groups.map(s => s.size)}`);
        */

        // naive solution - try all triplets
        /*
        edges.forEach(([a1, a2], aIndex) => { if (a1 < a2) return;
            //console.debug(`Trying to delete [${a1}], [${a2}]`);
            graph.get(a1).delete(a2); graph.get(a2).delete(a1);
            edges.slice(aIndex+1).forEach(([b1, b2], bIndex, arr) => { if (b1 < b2) return; //if (b1 === a2 && b2 === a1) return;
                //console.debug(`+Trying to delete [${b1}], [${b2}]`);
                graph.get(b1).delete(b2); graph.get(b2).delete(b1);
                arr.slice(bIndex+1).forEach(([c1, c2]) => { if (c1 < c2) return; //if ((c1 === a2 && c2 === a1) || (c1 === b2 && c2 === b1)) return;
                    //console.debug(`++Trying to delete [${c1}], [${c2}]`);
                    //console.debug(`++Number of edges: ${Array.from(graph.keys()).flatMap(n => Array.from(graph.get(n))).length}`);
                    graph.get(c1).delete(c2); graph.get(c2).delete(c1);
                    //console.debug(`++Number of edges: ${Array.from(graph.keys()).flatMap(n => Array.from(graph.get(n))).length}`);
                    //console.debug(`++hfx connected: ${Array.from(graph.get('hfx'))}`)

                    let groups = getGroups(graph);
                    if (groups.length > 1) {
                        console.debug(`Removing (${a1}-${a2}) & (${b1}-${b2}) & (${c1}-${c2})`)
                        console.debug(`YAY: ${groups.map(g => g.size)}`);
                    }
                    graph.get(c1).add(c2); graph.get(c2).add(c1);
                    //console.debug(`++Number of edges: ${Array.from(graph.keys()).flatMap(n => Array.from(graph.get(n))).length}`);
                });
                graph.get(b1).add(b2); graph.get(b2).add(b1);
            });
            graph.get(a1).add(a2); graph.get(a2).add(a1);
        });
        */

        // throw out all edges to nodes with only one edge
        //console.debug(`Single entry nodes: ${Array.from(graph.keys()).filter(n => graph.get(n).size === 1).length}`);

        //let dij = new Dijkstra(getNeighbors);
        //graph.forEach((_, k) => dij.addNode(k));
        //let path = dij.getShortestPath('bvb', 'qnr');
        /*
        let bfs = new BFS(getNeighbors, state => false);

        let nodes = Array.from(graph.keys());
        nodes.forEach((a, aIndex) => {
            nodes.slice(aIndex+1).forEach(b => {
                let [state] = bfs.getPathsBetweenNodes(a, b, true);
                let path = Array.from(state.visited.keys());
                //console.debug(`Paths from ${a} to ${b} = ${path}`)

                let prevNode = path[0];

                path.slice(1).forEach(n => {
                    let edge = `${prevNode}.${n}`;
                    edgeCount.set(edge, edgeCount.get(edge)+1);
                    edge = `${n}.${prevNode}`;
                    edgeCount.set(edge, edgeCount.get(edge)+1);
                    prevNode = n;
                })
            })
        })
        */

        /*
        edgeCount.forEach((count, edge) => {
            console.debug(`Edge: ${edge} has usage: ${count}`);
        })
        */



    });

function getNeighbors(node: string): Map<string, number> {
    let result = new Map<string, number>();
    graph.get(node).forEach((_, n) => result.set(n, 1));
    return result;
}

function getGroups(graph: Map<string, Set<string>>): Array<Set<string>> {
    let sets = new Array<Set<string>>();
    graph.forEach((connectedSet, node) => {
        //console.debug(`Processing ${node}: ${Array.from(connectedSet)}`);
        let found = Array<Set<string>>();
        sets.forEach(set => {
            if (set.has(node) || Array.from(connectedSet.keys()).some(connectedNode => set.has(connectedNode))) {
                found.push(set);
            }
        })

        // collapse the found sets into 1
        while (found.length > 1) {
            let first = found[0];
            let last = found.pop();
            last.forEach(n => first.add(n));
            sets = sets.filter(s => s !== last);
        }
        let destinationSet = found[0];

        if (destinationSet === undefined) {
            //console.debug(`Need new set for ${node}`)
            destinationSet = new Set<string>();
            sets.push(destinationSet);
        }
        destinationSet.add(node);
        connectedSet.forEach(connectedNode => destinationSet.add(connectedNode));
    
        //console.debug(`After processing ${node}, there are ${sets.length} sets`);
        /*
        sets.forEach(s => {
            console.debug(`   ${Array.from(s)}`);
        })
        */
    })
    return sets;
}

function generateEdotorLink(graph: Map<string, Set<string>>) {
    /**
     * Generate input for https://edotor.net/
     */
    let link = 'https://edotor.net';
    console.debug(`Generating input for ${link}`);
    link += '/?engine=dot#graph%7B%7B'
    link += '%7D';
    graph.forEach((connections, node) => {
        connections.forEach(connectedNode => {
            if (node < connectedNode) link += `${node}--${connectedNode};`
        })
    });
    link += '%7D'
    console.debug(link);
}

function generateEdotorCode(graph: Map<string, Set<string>>) {
    /**
     * Generate input for https://edotor.net/
     * http://magjac.com/graphviz-visual-editor/ handled the massive graph better
     */
    let link = 'https://edotor.net';
    console.debug(`Generating input for ${link}`);
    let code = 'graph {\n';
    graph.forEach((connections, node) => {
        connections.forEach(connectedNode => {
            if (node < connectedNode) code += `  ${node}--${connectedNode}\n`;
        })
    });
    code += '}'
    console.debug(code);
}