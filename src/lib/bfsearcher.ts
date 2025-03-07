import { Deque } from "./deque.js";

export class BFS_State<T=string> {
    constructor(public at: T) {}
    cost = 0;
    visited = new Set<T>();

    clone() {
        let newState = new BFS_State(this.at);
        newState.cost = this.cost;
        newState.visited = new Set(this.visited);

        return newState;
    }

    toString(): string {
        return `[${this.at.toString()}] cost=${this.cost} (${Array.from(this.visited.keys()).join(' / ')})`
    }
};

export class BFS<T=string> {
    constructor(
        private getNeighbors: (state: BFS_State<T>) => Map<T, number>,
        private keepFinalState: (state: BFS_State<T>) => boolean = (state:BFS_State<T>) => { return true; }
    ) {};

    getPathsBetweenNodes(startNode: T, endNode: T, stopOnFirst=false): Array<BFS_State<T>> {
        let states = new Array<BFS_State<T>>(new BFS_State(startNode));
        let toProcess = new Deque<BFS_State<T>>(states[0]);

        while (toProcess.length) {
            let state = toProcess.removeFront();
            state.visited.add(state.at);
            if (state.at === endNode && stopOnFirst) {
                return [state];
            }

            let neighbors = this.getNeighbors(state);

            let canVisit = Array.from(neighbors.keys()).filter(n => !state.visited.has(n));

            if (canVisit.length > 0) {
                canVisit.forEach(n => {
                    let newState = state.clone();
                    newState.at = n;
                    newState.cost += neighbors.get(n);
                    toProcess.addBack(newState);
                })
            } else {
                // no new neighbors, see if we need to keep this one
                if (this.keepFinalState(state)) {
                    states.push(state);
                }
            }

        }

        return states;
    }

    getPathsFrom(startNode: T, shouldStop: (state: BFS_State<T>) => boolean = _ => false): Array<BFS_State<T>> {
        let states = new Array<BFS_State<T>>();
        let toProcess = new Deque<BFS_State<T>>(new BFS_State(startNode));

        while (toProcess.length) {
            let state = toProcess.removeFront();
            if (shouldStop(state)) break;
            state.visited.add(state.at);

            let neighbors = this.getNeighbors(state);

            let canVisit = Array.from(neighbors.keys()).filter(n => !state.visited.has(n));

            if (canVisit.length > 0) {
                canVisit.forEach(n => {
                    let newState = state.clone();
                    newState.at = n;
                    newState.cost += neighbors.get(n);
                    toProcess.addBack(newState);
                })
            } else {
                // no new neighbors, see if we need to keep this one
                if (this.keepFinalState(state)) {
                    states.push(state);
                }
            }

        }

        return states;
    }
};

//*
/*
let bfs = new BFS(getNeighbors);
let edges = new Map<string, Map<string, number>>();

edges.set('a', new Map(Object.entries({b: 1})));
edges.set('b', new Map(Object.entries({c: 2, g: 1000})));
edges.set('c', new Map(Object.entries({d: 3, e: 90})));
edges.set('d', new Map(Object.entries({e: 4, c: 50})));
edges.set('e', new Map(Object.entries({f: 5, d: 80})));
edges.set('f', new Map(Object.entries({g: 6, b: 60})));
edges.set('g', new Map(Object.entries({h: 7, c: 30})));
edges.set('h', new Map(Object.entries({})));

function getNeighbors(state: BFS_State): Map<string, number> {
    return edges.get(state.at);
}

let states = bfs.getPathsFrom(new BFS_State('a'));

states.forEach(s => {
    console.debug(s.toString());
})
*/

/*/

let bfs = new BFS<Pair>(getNeighbors);
let edges = new Map<Pair, Map<Pair, number>>();

edges.set({x:0, y:0}, new Map([[{x: 0, y: 1}, 1]]));
edges.set({x:0, y:1}, new Map([[{x: 0, y: 2}, 2], [{x: 0, y: 6}, 1000]]));
edges.set({x:0, y:2}, new Map([[{x: 0, y: 3}, 3], [{x: 0, y: 4}, 90]]));
edges.set({x:0, y:3}, new Map([[{x: 0, y: 4}, 4], [{x: 0, y: 2}, 50]]));
edges.set({x:0, y:4}, new Map([[{x: 0, y: 5}, 5], [{x: 0, y: 3}, 80]]));
edges.set({x:0, y:5}, new Map([[{x: 0, y: 6}, 6], [{x: 0, y: 1}, 60]]));
edges.set({x:0, y:6}, new Map([[{x: 0, y: 7}, 7], [{x: 0, y: 2}, 30]]));
edges.set({x:0, y:7}, new Map([]));

function getNeighbors(node: Pair): Map<Pair, number> {
    return edges.get(Array.from(edges.keys()).filter(p => p.x === node.x && p.y === node.y)[0]);
}

let states = bfs.getPathsFrom(new BFS_State(Array.from(edges.keys())[0]));

states.forEach(s => {
    console.debug(s.toString());
})
// */