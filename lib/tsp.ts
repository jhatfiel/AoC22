export class TSP {
    nodes = new Set<string>();
    edges = new Map<string, Map<string, number>>();
    shortest = Infinity;
    longest = 0;

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
        if (distance < this.shortest) this.shortest = distance-1;
        if (distance > this.longest) this.longest = distance+1;

        // shortestCycle initialization
        const mask = this.toMask(new Set([from, to]));
        let map = this.shortestCycle.get(mask);
        if (map === undefined) {
            map = new Map<string, Array<string>>();
            this.shortestCycle.set(mask, map);
            this.longestCycle.set(mask, map);
        }
        map.set(to, [from, to]);
    }

    getPathCost(path: Array<string>): number {
        return this.getShortestPathCost(path);
    }

    getShortestPathCost(path: Array<string>): number {
        let last = '';
        return path.map((n) => {
                    let cost = 0;
                    if (last !== '') {
                        if (this.edges.get(last) && this.edges.get(last)?.get(n) !== undefined) cost = this.edges.get(last)!.get(n)!;
                        else cost = this.shortest*this.longest;
                    }
                    last = n;
                    return cost;
                 })
               .reduce((sum, cost) => sum+cost, 0);
    }

    getLongestPathCost(path: Array<string>): number {
        let last = '';
        return path.map((n) => {
                    let cost = 0
                    if (last !== '') {
                        if (this.edges.get(last) && this.edges.get(last)?.get(n) !== undefined) cost = this.edges.get(last)!.get(n)!;
                        else cost = -1*(this.shortest*this.longest);
                    }
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
            if (newCycle) {
                let newCost = this.getShortestPathCost(newCycle);
                if (newCost < shortestCost) {
                    shortestCost = newCost;
                    result = newCycle;
                }
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
            if (newCycle) {
                let newCost = this.getLongestPathCost(newCycle);
                if (newCost > longestCost) {
                    longestCost = newCost;
                    result = newCycle;
                }
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
                    let cycle = this.shortestCycle.get(newMask)!.get(to);
                    if (cycle?.length) {
                        let newShortestCycle = [n, ...cycle];
                        let newShortestCost = this.getShortestPathCost(newShortestCycle);
                        if (newShortestCost < shortestCost) {
                            shortestCost = newShortestCost;
                            shortestCycle = newShortestCycle;
                        }
                    }

                    cycle = this.longestCycle.get(newMask)!.get(to);
                    if (cycle?.length) {
                        let newLongestCycle = [n, ...cycle];
                        let newLongestCost = this.getLongestPathCost(newLongestCycle);
                        if (newLongestCost > longestCost) {
                            longestCost = newLongestCost;
                            longestCycle = newLongestCycle;
                        }
                    }
                }
            });
            sc.set(to, shortestCycle);
            lc!.set(to, longestCycle);
        }
    }

    toMask(set: Set<string>): number {
        return Array.from(this.nodes).map((n, i) => set.has(n)?1<<i:0).reduce((p, v) => p | v, 0);
    }
}