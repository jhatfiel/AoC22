export class TSP {
    /* Use cycle=false if you just want the shortest path
      then remove the fake node from the results
      */
    constructor(public cycle=true) { }

    fakeNode = '__FAKE_NODE__';

    firstNode = '';
    nodes = new Set<string>();
    edges = new Map<string, Map<string, number>>();
    minCost = new Map<number, Map<string, number>>();
    maxCost = new Map<number, Map<string, number>>();

    addNode(node: string) {
        this.nodes.add(node);
    }

    // adds the edge bidirectionally
    addEdge(node1: string, node2: string, cost: number) {
        this.addSingleEdge(node1, node2, cost);
        this.addSingleEdge(node2, node1, cost);
    }

    addSingleEdge(from: string, to: string, cost: number) {
        if (this.firstNode === '') this.firstNode = from;
        if (!this.cycle && !(from === this.fakeNode || to === this.fakeNode)) {
            this.addEdge(this.fakeNode, from, 0);
            this.addEdge(this.fakeNode, to, 0);
        }

        this.nodes.add(from);
        this.nodes.add(to);

        let fEdges = this.edges.get(from);
        if (fEdges === undefined) { fEdges = new Map<string, number>(); this.edges.set(from, fEdges); }
        fEdges.set(to, cost);
    }

    getMinCost(end?:string, set?: Set<string>): number {
        if (end === undefined || set === undefined) {
            // assume they are asking for the minimum cost of the entire cycle
            let minCost = Infinity;
            let newSet = new Set(this.nodes);
            newSet.delete(this.firstNode);
            Array.from(newSet).forEach((n) => {
                let thisCost = this.getMinCost(n, newSet) + (this.edges.get(n)?.get(this.firstNode) ?? Infinity);
                if (thisCost < minCost) minCost = thisCost;
            })
            return minCost;
        } else {
            const mask = this.toMask(set);
            let setMap = this.minCost.get(mask);
            if (setMap === undefined) {
                setMap = new Map<string, number>();
                this.minCost.set(mask, setMap);
            }
            let minCost = setMap.get(end);
            if (minCost === undefined) {
                if (set.size === 1) {
                    minCost = this.edges.get(this.firstNode)!.get(end);
                    if (minCost === undefined) minCost = Infinity;
                    // trivial case - this is just the cost from the first node in our collection to the end node specified
                    setMap.set(end, minCost);
                } else {
                    minCost = Infinity;
                    let newSet = new Set(set);
                    newSet.delete(end);
                    Array.from(newSet).forEach((n) => {
                        let thisCost = this.getMinCost(n, newSet) + (this.edges.get(n)?.get(end) ?? Infinity);
                        if (thisCost < minCost!) minCost = thisCost;
                    });
                    setMap.set(end, minCost);
                }
            }
            return minCost;
        }
    }

    getMinCostPath(): Array<string> {
        let result = new Array<string>(this.firstNode);
        this.getMinCost(); // throwaway, just to make sure cost matrix is populated
        let nextNode = '';
        let lastNode = this.firstNode;
        do {
            // find lowest cost
            nextNode = '';
            let minCost = Infinity;
            let newSet = new Set(this.nodes);
            result.forEach((n) => newSet.delete(n));
            let setMap = this.minCost.get(this.toMask(newSet));
            setMap?.forEach((c, n) => {
                if (c < minCost && this.edges.get(lastNode)?.get(n) !== undefined) { minCost = c; nextNode = n; }
            })
            if (nextNode !== '') result.push(nextNode);
            lastNode = nextNode;
        } while (nextNode !== '');
        return result.reverse();
    }

    getMaxCost(end?:string, set?: Set<string>): number {
        if (end === undefined || set === undefined) {
            // assume they are asking for the maximum cost of the entire cycle
            let maxCost = -Infinity;
            let newSet = new Set(this.nodes);
            newSet.delete(this.firstNode);
            Array.from(newSet).forEach((n) => {
                let thisCost = this.getMaxCost(n, newSet) + (this.edges.get(n)?.get(this.firstNode) ?? -Infinity);
                if (thisCost > maxCost) maxCost = thisCost;
            })
            return maxCost;
        } else {
            const mask = this.toMask(set);
            let setMap = this.maxCost.get(mask);
            if (setMap === undefined) {
                setMap = new Map<string, number>();
                this.maxCost.set(mask, setMap);
            }
            let maxCost = setMap.get(end);
            if (maxCost === undefined) {
                if (set.size === 1) {
                    maxCost = this.edges.get(this.firstNode)!.get(end);
                    if (maxCost === undefined) maxCost = -Infinity;
                    // trivial case - this is just the cost from the first node in our collection to the end node specified
                    setMap.set(end, maxCost);
                } else {
                    maxCost = -Infinity;
                    let newSet = new Set(set);
                    newSet.delete(end);
                    Array.from(newSet).forEach((n) => {
                        let thisCost = this.getMaxCost(n, newSet) + (this.edges.get(n)?.get(end) ?? -Infinity);
                        if (thisCost > maxCost!) maxCost = thisCost;
                    });
                    setMap.set(end, maxCost);
                }
            }
            return maxCost;
        }
    }

    getMaxCostPath(): Array<string> {
        let result = new Array<string>(this.firstNode);
        this.getMaxCost(); // throwaway, just to make sure cost matrix is populated
        let nextNode = '';
        let lastNode = this.firstNode;
        do {
            // find lowest cost
            nextNode = '';
            let maxCost = -Infinity;
            let newSet = new Set(this.nodes);
            result.forEach((n) => newSet.delete(n));
            let setMap = this.maxCost.get(this.toMask(newSet));
            setMap?.forEach((c, n) => {
                if (c > maxCost && this.edges.get(lastNode)?.get(n) !== undefined) { maxCost = c; nextNode = n; }
            })
            if (nextNode !== '') result.push(nextNode);
            lastNode = nextNode;
        } while (nextNode !== '');
        return result.reverse();
    }

    getPathCost(path: Array<string>): number {
        let last = '';
        return path.map((n) => {
                    let cost = 0;
                    if (last !== '') {
                        if (this.edges.get(last) && this.edges.get(last)?.get(n) !== undefined) cost = this.edges.get(last)!.get(n)!;
                        else cost = NaN;
                    }
                    last = n;
                    return cost;
                 })
               .reduce((sum, cost) => sum+cost, 0);
    }

    toMask(set: Set<string>): number {
        return Array.from(this.nodes).map((n, i) => set.has(n)?1<<i:0).reduce((p, v) => p | v, 0);
    }
}