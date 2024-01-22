import { AoCPuzzle } from "../../lib/AoCPuzzle";
import { Dijkstra } from "../../lib/dijkstraBetter";

export class a202325 extends AoCPuzzle {
    graph = new Map<string, Set<string>>();
    edgeCount = new Map<string, number>();
    edges = new Array<Array<string>>();
    toProcess = new Array<string>();
    nodes = new Array<string>();

    _loadData(lines: Array<string>) {
        lines.forEach(line => {
            let arr = line.split(': ');
            let node = arr[0];
            let connected = arr[1].split(' ');
            let nodeSet = this.graph.get(node);
            if (nodeSet === undefined) {
                nodeSet = new Set<string>();
                this.graph.set(node, nodeSet);
            }

            connected.forEach(n2 => {
                let n2Set = this.graph.get(n2);
                if (n2Set === undefined) {
                    n2Set = new Set<string>();
                    this.graph.set(n2, n2Set);
                }
                nodeSet!.add(n2);
                n2Set.add(node);
            });
        });
        this.nodes = Array.from(this.graph.keys());
        this.log(`Number of nodes: ${this.graph.size}`);

        this.edges = Array.from(this.graph.keys()).flatMap(n => Array.from(this.graph.get(n)!).map(c => [n,c]));
        this.log(`Number of edges: ${this.edges.length}`);
        //this.log(`edges: ${edges.map(([a1,a2])=>`${a1}-${a2}`).join('/')}`);
        //this.log(`hfx connected: ${Array.from(graph.get('hfx'))}`)
        this.edges.forEach(([a,b]) => {
            this.edgeCount.set(`${a}.${b}`, 0);
        })

        this.toProcess = Array.from(this.graph.keys());
        this.generateEdotorCode();
    }

    _runStep() {
        let from = this.toProcess.pop();

        if (from) {
            let dij = new Dijkstra(this.getNeighbors.bind(this));
            dij.compute(from);
            // record path from this node to all nodes that are left
            this.toProcess.forEach(to => {
                let paths = dij.pathTo(from!, to, false);
                let weight = paths.length;
                paths.forEach(path => {
                    let prevNode = path[0];

                    path.slice(1).forEach(n => {
                        let edge = `${prevNode}.${n}`;
                        this.edgeCount.set(edge, this.edgeCount.get(edge)!+1/weight);
                        edge = `${n}.${prevNode}`;
                        this.edgeCount.set(edge, this.edgeCount.get(edge)!+1/weight);
                        prevNode = n;
                    })
                })
            });
            this.log(`Processed: ${from} (${this.stepNumber} / ${this.nodes.length})`);
            return true;
        } else {
            // all nodes have been processed, all shortest path edges counted, process results
            let edges = Array.from(this.edgeCount.keys()).filter(edge => {
                let [n1, n2] = edge.split('.');
                return n1.localeCompare(n2) < 0;
            }).sort((a, b) => (this.edgeCount.get(a) === this.edgeCount.get(b))?0:((this.edgeCount.get(a)! > this.edgeCount.get(b)!)?-1:1)).slice(0,3);
            edges.forEach(edge => {
                this.log(`Cutting edge: ${edge} (${this.edgeCount.get(edge)})`);
                let [n1, n2] = edge.split('.');
                this.graph.get(n1)!.delete(n2);
                this.graph.get(n2)!.delete(n1);
            })

            Array.from(this.edgeCount.keys())
                     .sort((a, b) => (this.edgeCount.get(a) === this.edgeCount.get(b))?0:((this.edgeCount.get(a)! > this.edgeCount.get(b)!)?-1:1)).slice(0, 10).forEach(edge => {
                this.log(`Edge: ${edge} count=${this.edgeCount.get(edge)}`)
            });

            let groups = this.getGroups(this.graph);
            this.log(`Group sizes: ${groups.map(s => s.size)}`);

            this.result = groups.map(s => s.size).reduce((acc, s) => acc *= s, 1).toString();
            this.log(`Finished: Cutting: ${edges.join(' / ')}`);
            return false;
        }
    }

    getNeighbors(node: string): Map<string, number> {
        let result = new Map<string, number>();
        this.graph.get(node)!.forEach((_, n) => result.set(n, 1));
        return result;
    }

    getGroups(graph: Map<string, Set<string>>): Array<Set<string>> {
        let sets = new Array<Set<string>>();
        graph.forEach((connectedSet, node) => {
            //this.log(`Processing ${node}: ${Array.from(connectedSet)}`);
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
                last!.forEach(n => first.add(n));
                sets = sets.filter(s => s !== last);
            }
            let destinationSet = found[0];

            if (destinationSet === undefined) {
                //this.log(`Need new set for ${node}`)
                destinationSet = new Set<string>();
                sets.push(destinationSet);
            }
            destinationSet.add(node);
            connectedSet.forEach(connectedNode => destinationSet.add(connectedNode));
        
            //this.log(`After processing ${node}, there are ${sets.length} sets`);
            /*
            sets.forEach(s => {
                    this.log(`     ${Array.from(s)}`);
            })
            */
        })
        return sets;
    }

    generateEdotorLink() {
        /**
         * Generate input for https://edotor.net/
         */
        let link = 'https://edotor.net';
        this.log(`Generating input for ${link}`);
        link += '/?engine=dot#graph%7B%7B'
        link += '%7D';
        this.graph.forEach((connections, node) => {
            connections.forEach(connectedNode => {
                if (node < connectedNode) link += `${node}--${connectedNode};`
            })
        });
        link += '%7D'
        this.log(link);
    }

    generateEdotorCode() {
        /**
         * Generate input for https://edotor.net/
         * http://magjac.com/graphviz-visual-editor/ handled the massive graph better
         * https://dreampuf.github.io/GraphvizOnline/ another graph site
         */
        let link = 'https://edotor.net';
        this.log(`Generating input for ${link}`);
        let code = 'graph {\n';
        this.graph.forEach((connections, node) => {
            connections.forEach(connectedNode => {
                if (node < connectedNode) code += `    ${node}--${connectedNode}\n`;
            })
        });
        code += '}'
        this.log(code);
    }
}