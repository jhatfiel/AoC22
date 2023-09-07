export class TSP {
    nodes = new Set<string>();
    edges = new Map<string, Map<string, number>>();

    // shortestCache is from a mask to an endpoint
    shortestCycle = new Map<number, Map<string, Array<string>>>();
    longestCycle = new Map<number, Map<string, Array<string>>>();

    addNode(node: string) {
        this.nodes.add(node);
    }

    // adds the edge bidirectionally
    addEdge(node1: string, node2: string, distance: number) {
        this.addSingleEdge(node1, node2, distance);
        this.addSingleEdge(node2, node1, distance);
    }

    addSingleEdge(from: string, to: string, distance: number) {
        this.nodes.add(from);
        this.nodes.add(to);

        let fEdges = this.edges.get(from);
        if (fEdges === undefined) { fEdges = new Map<string, number>(); this.edges.set(from, fEdges); }
        fEdges.set(to, distance);

        // shortestCycle initialization
        const mask = this.toMask(new Set([from, to]));
        const map = new Map<string, Array<string>>();
        this.shortestCycle.set(mask, map);
        this.longestCycle.set(mask, map);
        // when we have only 2 nodes in the mask, the best route from one to the other is known
        map.set(from, [to, from]);
        map.set(to, [from, to]);
    }

    getPathCost(path: Array<string>): number {
        let last = '';
        return path.map((n) => {
                    let cost = 0;
                    if (last !== undefined && this.edges.get(last)) cost = this.edges.get(last)!.get(n)!;
                    last = n;
                    return cost;
                 })
               .reduce((sum, cost) => sum+cost, 0);
    }

    getShortestPath(): Array<string> {
        let result = new Array<string>();
        let shortestCost = Infinity;
        let mask = this.toMask(this.nodes); // visit every node

        this.nodes.forEach((n) => {
            this.cycle(this.nodes, n);
            let newCycle = this.shortestCycle.get(mask)!.get(n)!;
            let newCost = this.getPathCost(newCycle);
            if (newCost < shortestCost) {
                shortestCost = newCost;
                result = newCycle;
            }
        });

        return result;
    }

    getLongestPath(): Array<string> {
        let result = new Array<string>();
        let longestCost = 0;
        let mask = this.toMask(this.nodes); // visit every node

        this.nodes.forEach((n) => {
            this.cycle(this.nodes, n);
            let newCycle = this.longestCycle.get(mask)!.get(n)!;
            let newCost = this.getPathCost(newCycle);
            if (newCost > longestCost) {
                longestCost = newCost;
                result = newCycle;
            }
        });

        return result;
    }

    cycle(set: Set<string>, to: string) {
        let mask = this.toMask(set);
        let sc = this.shortestCycle.get(mask);
        let lc = this.longestCycle.get(mask);
        if (!sc) {
            sc = new Map<string, Array<string>>();
            lc = new Map<string, Array<string>>();
            this.shortestCycle.set(mask, sc);
            this.longestCycle.set(mask, lc);
        }
        if (!sc.has(to)) {
            // for every node in the mask that isn't "to", remove it and find the new cycle
            // record the lowest/highest cost cycle
            let shortestCost = Infinity;
            let shortestCycle = new Array<string>();
            let longestCost = 0;
            let longestCycle = new Array<string>();
            Array.from(this.nodes).forEach((n, ind) => {
                if (n !== to && set.has(n)) {
                    let newSet = new Set(set);
                    newSet.delete(n);
                    let newMask = this.toMask(newSet);

                    this.cycle(newSet, to);

                    let newShortestCycle = [n, ...this.shortestCycle.get(newMask)!.get(to)!];
                    let newShortestCost = this.getPathCost(newShortestCycle);
                    if (newShortestCost < shortestCost) {
                        shortestCost = newShortestCost;
                        shortestCycle = newShortestCycle;
                    }

                    let newLongestCycle = [n, ...this.longestCycle.get(newMask)!.get(to)!];
                    let newLongestCost = this.getPathCost(newLongestCycle);
                    if (newLongestCost > longestCost) {
                        longestCost = newLongestCost;
                        longestCycle = newLongestCycle;
                    }
                }
            });
            sc.set(to, shortestCycle);
            lc!.set(to, longestCycle);
        }
    }

    getIndex(node: string): number {
        return Array.from(this.nodes).indexOf(node);
    }

    getNode(index: number): string {
        return Array.from(this.nodes)[index];
    }

    toMask(set: Set<string>): number {
        return Array.from(this.nodes).map((n, i) => set.has(n)?1<<i:0).reduce((p, v) => p | v, 0);
    }

    toSet(mask: number): Set<string> {
        return new Set(Array.from(this.nodes).filter((n, i) => mask & 1<<i));
    }
}