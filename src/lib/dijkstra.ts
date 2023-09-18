export class Dijkstra {
    constructor(
        private getNeighbors: (node: string) => Map<string, number>,
        private canVisit: (node: string) => boolean = (node) => { return true; }
    ) {};
    nodes = new Set<string>();
    // turns out, caching dijkstra speeds things up . . . like... a lot (duh).
    cache = new Map<string, Map<string, Array<string>>>();

    addNode(node: string) {
        this.nodes.add(node);
    }

    getShortestPath(from: string, to: string, skipCache=false): Array<string> {
        let fromCache = this.cache.get(from);
        if (fromCache === undefined || skipCache) {
            return this._getShortestPath(from, to);
        } else {
            return fromCache.get(to)!;
        }
    }

    _getShortestPath(from: string, to: string): Array<string> {
        let fromCache = new Map<string, Array<string>>();
        this.cache.set(from, fromCache);

        let unvisited = Array.from(this.nodes);
        let distanceTo = new Map<string, number>();
        let parent = new Map<string, string>();
        this.nodes.forEach((n) => distanceTo.set(n, Infinity));
        this.nodes.forEach((n) => parent.set(n, ''));
        this.nodes.forEach((n) => fromCache.set(n, new Array<string>()));

        distanceTo.set(from, 0);
        unvisited.reverse();
        unvisited.sort((a, b) => { return distanceTo.get(b)! - distanceTo.get(a)! })

        while (unvisited.length) {
            // get the closest unvisited node
            if (unvisited.length % 1000 === 0) console.log(`unvisited: ${unvisited.length}`);
            let nearestUnvisited: string|undefined = unvisited.pop();
            if (!nearestUnvisited) break;

            let nearestDistance = distanceTo.get(nearestUnvisited)!;

            // set the distance for all its neighbors
            this.getNeighbors(nearestUnvisited).forEach((d, n) => {
                let currentDistance = distanceTo.get(n);
                if (currentDistance !== undefined && currentDistance > nearestDistance+d) {
                    let ndx = unvisited.indexOf(n);
                    distanceTo.set(n, nearestDistance+d);
                    let newNdx = unvisited.length-1;
                    while (distanceTo.get(unvisited[newNdx])! < nearestDistance+d) newNdx--;
                    if (ndx !== newNdx) {
                        unvisited.splice(ndx, 1);
                        unvisited.splice(newNdx, 0, n);
                    }

                    parent.set(n, nearestUnvisited!);
                }
            })

            // store the result
            let result = new Array<string>();
            let trace = parent.get(nearestUnvisited);
            while (trace !== undefined && trace !== '') {
                result.push(trace);
                trace = parent.get(trace);
            }
            fromCache.set(nearestUnvisited, result.reverse());
            if (nearestUnvisited === to) break;
        }

        return fromCache.get(to)!;
    }
}