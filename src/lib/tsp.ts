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
    }

    getPathCost(path: Array<string>): number {
        return this.getShortestPathCost(path);
    }

    getShortestPathCost(path = new Array<string>()): number {
        let last = '';
        if (path.length < 2) return Infinity;
        return path.map((n) => {
                    let cost = 0;
                    if (last !== '') {
                        if (this.edges.get(last) && this.edges.get(last)?.get(n) !== undefined) cost = this.edges.get(last)!.get(n)!;
                        else cost = Infinity;
                    }
                    last = n;
                    return cost;
                 })
               .reduce((sum, cost) => sum+cost, 0);
    }

    getLongestPathCost(path = new Array<string>()): number {
        let last = '';
        if (path.length < 2) return -Infinity;
        return path.map((n) => {
                    let cost = 0
                    if (last !== '') {
                        if (this.edges.get(last) && this.edges.get(last)?.get(n) !== undefined) cost = this.edges.get(last)!.get(n)!;
                        else cost = -Infinity;
                    }
                    last = n;
                    return cost;
                 })
               .reduce((sum, cost) => sum+cost, 0);
    }

    getShortestCycle(): Array<string> {
        let result = new Array<string>();
        let shortestCost = Infinity;

        this.nodes.forEach((n) => {
            let path = [...this.getShortestPathFrom(n), n];
            if (path) {
                let newCost = this.getShortestPathCost(path);
                if (newCost <= shortestCost) {
                    shortestCost = newCost;
                    result = path;
                }
            }
        });

        return result;
    }

    getShortestPathFrom(from: string): Array<string> {
        let result = new Array<string>();
        let shortestCost = Infinity;
        let nodes = Array.from(this.nodes);
        let nodesSet = new Set<string>(nodes);
        let firstMask = this.toMask(nodesSet);

        this.debug(`getShortestPathFrom(${from})`);
        this.shortestCycle = new Map<number, Map<string, Array<string>>>();

        Array.from(this.nodes).filter((n) => n!==from).forEach((n) => {
            this.cycle(from, nodesSet, n);
            let newCycle = this.shortestCycle.get(firstMask)!.get(n)!;
            if (newCycle) {
                let newCost = this.getShortestPathCost(newCycle);
                this.debug(`getShortestPathFrom(${from}) ${n} ${newCost}`);
                if (newCost <= shortestCost) {
                    this.debug('NEW BEST');
                    shortestCost = newCost;
                    result = [...newCycle];
                }
            }
        })
        this.debug(`getShortestPathFrom(${from}) FINAL ANSWER: ${result} ${this.getShortestPathCost(result)}`);
        return result;
    }

    getShortestPath(): Array<string> {
        let result = new Array<string>();
        let shortestCost = Infinity;

        this.nodes.forEach((n) => {
            let path = this.getShortestPathFrom(n);
            if (path) {
                let newCost = this.getShortestPathCost(path);
                this.debug(`getShortestPath ${n} ${path} ${newCost}`);
                if (newCost <= shortestCost) {
                    shortestCost = newCost;
                    result = [...path];
                }
            }
        });

        return result;
    }

    getLongestCycle(): Array<string> {
        let result = new Array<string>();
        let longestCost = -Infinity; 

        this.nodes.forEach((n) => {
            let path = [...this.getLongestPathFrom(n), n];
            if (path) {
                let newCost = this.getLongestPathCost(path);
                if (newCost >= longestCost) {
                    longestCost = newCost;
                    result = path;
                }
            }
        });

        return result;
    }

    getLongestPathFrom(from: string): Array<string> {
        let result = new Array<string>();
        let longestCost = -Infinity;
        let nodes = Array.from(this.nodes);
        let nodesSet = new Set<string>(nodes);
        let firstMask = this.toMask(nodesSet);

        this.shortestCycle = new Map<number, Map<string, Array<string>>>();

        Array.from(this.nodes).filter((n) => n!==from).forEach((n) => {
            this.cycle(from, nodesSet, n);
            let newCycle = this.longestCycle.get(firstMask)!.get(n)!;
            if (newCycle) {
                let newCost = this.getLongestPathCost(newCycle);
                //this.debug(`getLongestPathFrom(${from}) ${n} ${newCost}`);
                if (newCost > longestCost) {
                    //this.debug('BEST');
                    longestCost = newCost;
                    result = [...newCycle];
                }
            }
        })
        return result;
    }

    getLongestPath(): Array<string> {
        let result = new Array<string>();
        let longestCost = -Infinity; 

        this.nodes.forEach((n) => {
            let path = this.getLongestPathFrom(n);
            if (path) {
                let newCost = this.getLongestPathCost(path);
                if (newCost >= longestCost) {
                    longestCost = newCost;
                    result = [...path];
                }
            }
        });

        return result;
    }

    cycle(from: string, set: Set<string>, to: string, debug='  ') {
        this.debug(`${debug}cycle ${from} -> ${to} [${Array.from(set.keys())}]`)
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
            let longestCost = -Infinity;
            let longestCycle = new Array<string>();
            if (set.size === 2) {
                shortestCost = this.getShortestPathCost([from, to]);
                if (shortestCost !== Infinity) shortestCycle = [from, to];
                longestCost = this.getLongestPathCost([from, to]);
                if (longestCost !== Infinity) longestCycle = [from, to];
            } else {
                Array.from(this.nodes).forEach((n, ind) => {
                    if (n !== to && set.has(n) && n !== from) {
                        let newSet = new Set(set);
                        newSet.delete(to);
                        this.debug(`${debug}REMOVING and trying cycle to ${from}->${n} without ${to}/[${Array.from(newSet.keys())}]`);
                        let newMask = this.toMask(newSet);

                        this.cycle(from, newSet, n, debug+'  ');
                        let cycle = this.shortestCycle.get(newMask)!.get(n);
                        if (cycle?.length) {
                            let newShortestCycle = [...cycle, to];
                            let newShortestCost = this.getShortestPathCost(newShortestCycle);
                            this.debug(`${debug}shortest: ${newShortestCycle} ${newShortestCost}`)
                            if (newShortestCost <= shortestCost) {
                                shortestCost = newShortestCost;
                                shortestCycle = newShortestCycle;
                            }
                        }

                        cycle = this.longestCycle.get(newMask)!.get(n);
                        if (cycle?.length) {
                            let newLongestCycle = [...cycle, to];
                            let newLongestCost = this.getLongestPathCost(newLongestCycle);
                            this.debug(`${debug}longest: ${newLongestCycle} ${newLongestCost}`)
                            if (newLongestCost >= longestCost) {
                                longestCost = newLongestCost;
                                longestCycle = newLongestCycle;
                            }
                        }
                    }
                });
            }
            sc.set(to, shortestCycle);
            lc!.set(to, longestCycle);
        } else {
            this.debug(`${debug}CACHED`)
        }

        this.debug(`${debug}cycle ${from} -> ${to} [${Array.from(set.keys())}] SHORTEST is ${sc.get(to)}/${this.getShortestPathCost(sc.get(to))}`)

        /*
        this.debug(`${debug} this.shortestCycle dump`)
        this.shortestCycle.forEach((vMap, key) => {
            if (true || this.toSet(key).size > 2) {
                this.debug(`${debug}${Array.from(this.toSet(key).keys())}`);
                vMap.forEach((v, k) => {
                    this.debug(`${debug}--${k}=[${v}] cost=${this.getShortestPathCost(v)}`);
                })
            }
        });
        this.debug(`${debug} this.shortestCycle dump end`)
        */
        /*
        this.debug(`${debug} this.longestCycle dump`)
        this.longestCycle.forEach((vMap, key) => {
            if (true || this.toSet(key).size > 2) {
                this.debug(`${debug}${Array.from(this.toSet(key).keys())}`);
                vMap.forEach((v, k) => {
                    this.debug(`${debug}--${k}=[${v}] cost=${this.getLongestPathCost(v)}`);
                })
            }
        });
        this.debug(`${debug} this.longestCycle dump end`)
        */
    }

    toMask(set: Set<string>): number {
        return Array.from(this.nodes).map((n, i) => set.has(n)?1<<i:0).reduce((p, v) => p | v, 0);
    }

    toSet(mask: number): Set<string> {
        return Array.from(this.nodes).reduce((acc, n, i) => { if (mask & 1<<i) acc.add(n); return acc;}, new Set<string>());
    }

    debug(m: string) {
        //console.log(m);
    }
}