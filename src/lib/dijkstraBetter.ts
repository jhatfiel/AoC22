import { PriorityHeap } from "./priorityHeap.js";

export class Dijkstra {
    constructor(
        private getNeighbors: (node: string) => Map<string, number>
    ) {};
    // keep track of the best way to get to each node based on where we are starting from
    // from: to: parent
    parent = new Map<string, Map<string, Set<string>>>();

    // from: to: [shortest path1, shortest path2, ...] where paths are [n1, n2, ...]
    paths = new Map<string, Map<string, Array<Array<string>>>>();

    distanceTo = new Map<string, Map<string, number>>();

    compute(from: string, shouldStop: (node: string, distance: number) => boolean = _ => false): Dijkstra {
        let parent = new Map<string, Set<string>>();
        this.parent.set(from, parent);
        let distanceTo = new Map<string, number>();
        this.distanceTo.set(from, distanceTo);

        let unvisited = new PriorityHeap<string>((a, b) => distanceTo.get(b) <= distanceTo.get(a));

        distanceTo.set(from, 0);
        let lastDistance = 0;
        unvisited.enqueue(from);

        while (unvisited.size()) {
            // get the closest unvisited node
            //unvisited.debugArray();
            let nearestUnvisited = unvisited.dequeue();
            let nearestDistance = distanceTo.get(nearestUnvisited);
            lastDistance = nearestDistance;
            //console.debug(`Working with ${nearestUnvisited}[${nearestDistance}] (${unvisited.size()} unvisited)`);

            // set the distance for all its neighbors
            this.getNeighbors(nearestUnvisited)?.forEach((d, n) => {
                let currentDistance = distanceTo.get(n);
                let newDistance = nearestDistance + d;
                //console.debug(`- We can go from ${nearestUnvisited} to ${n}, newDistance=${newDistance} vs currentDistance=${currentDistance}`);
                if (currentDistance === undefined) {
                    //console.debug(`- First time finding ${n}`);
                    distanceTo.set(n, newDistance);
                    unvisited.enqueue(n);
                    parent.set(n, new Set([nearestUnvisited]));
                } else if (newDistance < currentDistance) {
                    //console.debug(`- BETTER!!!!`);
                    distanceTo.set(n, newDistance);
                    unvisited.reorder(n);
                    parent.set(n, new Set([nearestUnvisited]));
                } else if (newDistance === currentDistance) {
                    //console.debug(`- tied`);
                    parent.get(n).add(nearestUnvisited);
                    // no need to enqueue anything
                } else {
                    //console.debug(`- not better`);
                }
            })
            if (shouldStop(nearestUnvisited, nearestDistance)) break;
        }
        return this;
    }

    pathTo(from: string, to: string, keepAllPaths = true): Array<Array<string>> {
        if (!this.parent.has(from) || !this.parent.get(from).has(to)) this.compute(from, node => node === to);
        let parent = this.parent.get(from);
        let nearestUnvisitedPaths = [[to]];
        let parentSearch = nearestUnvisitedPaths.map(p => parent.get(p[p.length-1])); // get the parents of the latest step on each path

        while (parentSearch?.some(parentToExpand => parentToExpand !== undefined)) {
            //console.debug(`Finishing ${nearestUnvisited}, parentSearch = ${parentSearch.map(s => Array.from(s??[])).join(' / ')}`);
            parentSearch.forEach((parentToExpand, ind) => {
                //console.debug(`-Processing parentToExpand=${Array.from(parentToExpand??[]).join(' / ')}`);
                if (parentToExpand?.size) {
                    if (keepAllPaths) {
                        Array.from(parentToExpand).slice(1).forEach(parent => {
                            let newPath = [...nearestUnvisitedPaths[ind], parent];
                            nearestUnvisitedPaths.push(newPath);
                        })
                    }
                    nearestUnvisitedPaths[ind].push(Array.from(parentToExpand)[0]);
                }
            })
            parentSearch = nearestUnvisitedPaths.map(p => parent.get(p[p.length-1])); // get the parents of the latest step on each path
        }
        return nearestUnvisitedPaths.map(p => p.reverse());
    }

    pathToAny(from: string, toFunc: (node: string) => boolean, keepAllPaths = true): Map<string, Array<Array<string>>> {
        if (!this.parent.has(from)) this.compute(from, toFunc);
        let pathCache = this.paths.get(from);
        if (pathCache === undefined) {
            pathCache = new Map<string, Array<Array<string>>>();
        }
        let parent = this.parent.get(from);
        parent.forEach((parents, to) => {
            if (toFunc(to)) {
                pathCache.set(to, this.pathTo(from, to, keepAllPaths));
            }
        })
        return pathCache;
    }

    distance(from: string, to: string): number {
        if (!this.distanceTo.has(from) || !this.distanceTo.get(from).has(to)) this.compute(from, node => node === to);
        return this.distanceTo.get(from).get(to);
    }

    distanceAny(from: string, toFunc: (node: string) => boolean = _ => true): Map<string, number> {
        if (!this.distanceTo.has(from)) this.compute(from);
        let result = new Map<string, number>();
        this.distanceTo.get(from).forEach((distance, to) => { if (toFunc(to)) result.set(to, distance); });
        return result;
    }
}

/*
let edges = new Map<string, Map<string, number>>();

edges.set('0', new Map(Object.entries({'4': 100, '3': 30, '1': 10})));
edges.set('1', new Map(Object.entries({'2': 50})));
edges.set('2', new Map(Object.entries({'4': 10})));
edges.set('3', new Map(Object.entries({'2': 20, '4': 60})));

function getNeighbors(node: string): Map<string, number> {
    return edges.get(node);
}

let dij = new Dijkstra(getNeighbors);

let paths = dij.getShortestPaths('0');

paths.forEach(p => {
    console.debug(p.join(' / '));

})
*/