/*
This is actually more like a Bellman-Ford algorithm...
*/

import { PriorityHeap } from "./priorityHeap.js";

export class Dijkstra {
    constructor(
        private getNeighbors: (node: string) => Map<string, number>
    ) {};
    // turns out, caching dijkstra speeds things up . . . like... a lot (duh).
    // from: to: [shortest path1, shortest path2, ...] where paths are [n1, n2, ...]
    cache = new Map<string, Map<string, Array<Array<string>>>>();

    // if to is passed, return immediately and don't keep other paths
    getShortestPaths(from: string, keepAllPaths = true, shouldStop: (node: string, distance: number) => boolean = (node, distance) => false, shouldRecord: (node: string) => boolean = _ => true): Map<string, Array<Array<string>>> {
        if (this.cache.has(from)) return this.cache.get(from);
        let fromCache = new Map<string, Array<Array<string>>>();
        this.cache.set(from, fromCache);

        let unvisited = new PriorityHeap<string>((a, b) => distanceTo.get(b) <= distanceTo.get(a));
        let distanceTo = new Map<string, number>();
        let parent = new Map<string, Set<string>>();

        distanceTo.set(from, 0);
        //unvisited.sort((a, b) => { return distanceTo.get(b)! - distanceTo.get(a)! })
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
                } else if (newDistance === currentDistance && keepAllPaths) {
                    //console.debug(`- tied`);
                    parent.get(n).add(nearestUnvisited);
                    // no need to enqueue anything
                } else {
                    //console.debug(`- not better`);
                }
            })

            // process path(s) for nearestUnvisited
            if (shouldRecord(nearestUnvisited)) {
                //console.debug(`Found to!`);
                let nearestUnvisitedPaths = [[nearestUnvisited]];
                let parentSearch = nearestUnvisitedPaths.map(p => parent.get(p[p.length-1])); // get the parents of the latest step on each path

                while (parentSearch?.some(parentToExpand => parentToExpand !== undefined)) {
                    //console.debug(`Finishing ${nearestUnvisited}, parentSearch = ${parentSearch.map(s => Array.from(s??[])).join(' / ')}`);
                    parentSearch.forEach((nextParents, ind) => {
                        //console.debug(`-Processing nextParents=${Array.from(nextParents??[]).join(' / ')}`);
                        if (nextParents?.size) {
                            Array.from(nextParents).slice(1).forEach(parent => {
                                let newPath = [...nearestUnvisitedPaths[ind], parent];
                                nearestUnvisitedPaths.push(newPath);
                            })
                            nearestUnvisitedPaths[ind].push(Array.from(nextParents)[0]);
                        }
                    })
                    parentSearch = nearestUnvisitedPaths.map(p => parent.get(p[p.length-1])); // get the parents of the latest step on each path
                }
                fromCache.set(nearestUnvisited, nearestUnvisitedPaths.map(p => p.reverse()));
            }

            if (shouldStop(nearestUnvisited, nearestDistance)) break;
        }

        // store the result
        /*
        let result = new Array<string>();
        let trace = parent.get(to);
        while (trace !== undefined && trace !== '') {
            result.push(trace);
            trace = parent.get(trace);
        }
        return result.reverse();
        */
       return fromCache;
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