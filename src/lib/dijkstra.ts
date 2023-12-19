/*
This is actually more like a Bellman-Ford algorithm...
*/

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
        //this.nodes.forEach((n) => distanceTo.set(n, Infinity));
        this.nodes.forEach((n) => parent.set(n, ''));
        this.nodes.forEach((n) => fromCache.set(n, new Array<string>()));

        distanceTo.set(from, 0);
        unvisited.reverse();
        //unvisited.sort((a, b) => { return distanceTo.get(b)! - distanceTo.get(a)! })
        let lastDistance = 0;

        let prevNdx = unvisited.length;
        while (unvisited.length) {
            // get the closest unvisited node
            if (unvisited.length % 1000 === 0) console.log(`unvisited: ${unvisited.length}, lastDistance=${lastDistance}`);
            let nearestUnvisited: string|undefined = unvisited.pop();
            if (!nearestUnvisited) break;

            let nearestDistance = distanceTo.get(nearestUnvisited) ?? Infinity;
            lastDistance = nearestDistance;
            //console.log(`Working with ${nearestUnvisited}[${nearestDistance}]`);

            // set the distance for all its neighbors
            this.getNeighbors(nearestUnvisited).forEach((d, n) => {
                let currentDistance = distanceTo.get(n) ?? Infinity;
                let newDistance = nearestDistance+d;
                if (currentDistance !== undefined && currentDistance > newDistance) {
                    //if (currentDistance < Infinity) console.log(`!!!!!!!!!!!!!!!!!!!!!! -------------- Improved ${n} from ${currentDistance} to ${newDistance}`)
                    //console.log(`- We can go from ${nearestUnvisited} to ${n}`);
                    let ndx = unvisited.indexOf(n);
                    if (ndx !== -1) {
                        // find the new correct place for this node (based on placement of last node)
                        let newNdx = prevNdx;
                        if (newNdx > unvisited.length) newNdx = unvisited.length;
                        while (distanceTo.get(unvisited[newNdx-1]) ?? Infinity < newDistance) newNdx--;
                        while (distanceTo.get(unvisited[newNdx+1]) ?? Infinity > newDistance) newNdx++;
                        //if (distanceTo.get(unvisited[newNdx])! > newDistance) { console.log(`@@@@@@@@@@@@@@@@@@@@@@@@@@@ --------------- BAD newNdx`)}
                        if (ndx !== newNdx) {
                            //console.log(`----------------------------------------Moving ${n}[${newDistance}] to ${newNdx}(${ndx}) ${unvisited.filter((n) => Number.isFinite(distanceTo.get(n))).map((n) => `${n}[${distanceTo.get(n)}]`).join(',')}${unvisited.length}`);
                            unvisited.splice(ndx, 1); // remove it from the old location
                            if (ndx < newNdx) newNdx--; // removing the old one changes this one
                            unvisited.splice(newNdx, 0, n); // insert it at the new location
                        }
                        distanceTo.set(n, newDistance);
                        //console.log(`---------------------------------------------------------------------------------------- ${unvisited.filter((n) => Number.isFinite(distanceTo.get(n))).map((n) => `${n}[${distanceTo.get(n)}]`).join(',')}${unvisited.length}`);

                        prevNdx = newNdx;
                        parent.set(n, nearestUnvisited!);
                    }
                }
            })

            if (nearestUnvisited === to) break;
        }

        // store the result
        let result = new Array<string>();
        let trace = parent.get(to);
        while (trace !== undefined && trace !== '') {
            result.push(trace);
            trace = parent.get(trace);
        }
        return result.reverse();
    }
}