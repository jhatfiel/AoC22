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
        if (fromCache === undefined) {
            return this._getShortestPath(from, to);
        } else {
            return fromCache.get(to)!;
        }
    }

    _getShortestPath(from: string, to: string): Array<string> {
        let fromCache = new Map<string, Array<string>>();
        this.cache.set(from, fromCache);

        let unvisited = new Set<string>(this.nodes);
        let distanceTo = new Map<string, number>();
        let parent = new Map<string, string>();
        this.nodes.forEach((n) => distanceTo.set(n, Infinity));
        this.nodes.forEach((n) => parent.set(n, ''));
        this.nodes.forEach((n) => fromCache.set(n, new Array<string>()));

        distanceTo.set(from, 0);

        while (unvisited.size) {
            // get the closest unvisited node
            let iter = unvisited.entries()
            let nearestUnvisited: string|undefined = undefined;
            let nearestDistance = Infinity;
            for (const pair of iter) {
                const node = pair[0];
                const d = distanceTo.get(node);
                if (d !== undefined && d < nearestDistance) {
                    nearestDistance = d;
                    nearestUnvisited = node
                }
            }
            if (!nearestUnvisited) break;

            // set the distance for all its neighbors
            this.getNeighbors(nearestUnvisited).forEach((d, n) => {
                let currentDistance = distanceTo.get(n);
                if (currentDistance !== undefined && currentDistance > nearestDistance+d) {
                    distanceTo.set(n, nearestDistance+d);
                    parent.set(n, nearestUnvisited!);
                }
            })

            unvisited.delete(nearestUnvisited);

            // store the result
            let result = new Array<string>();
            let trace = parent.get(nearestUnvisited);
            while (trace !== undefined && trace !== '') {
                result.push(trace);
                trace = parent.get(trace);
            }
            fromCache.set(nearestUnvisited, result.reverse());
        }

        return fromCache.get(to)!;
    }
}