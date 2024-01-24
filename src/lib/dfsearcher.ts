export class DFS_State<T=string> {
    constructor(public at: T) {}
    cost = 0;
    visited = new Set<T>();

    clone() {
        let newState = new DFS_State(this.at);
        newState.cost = this.cost;
        newState.visited = new Set(this.visited);

        return newState;
    }

    toString(): string {
        return `[${this.at.toString()}] cost=${this.cost} (${Array.from(this.visited.keys()).join(' / ')})`
    }
};

export class DFS<T=string> {
    constructor(
        private getNeighbors: (state: DFS_State<T>) => Map<T, number>,
        private keepFinalState: (state: DFS_State<T>) => boolean = (state:DFS_State<T>) => { return true; }
    ) {};

    getPathsBetweenNodes(startNode: T, endNode: T, stopOnFirst=false): Array<DFS_State<T>> {
        let states = new Array<DFS_State<T>>(new DFS_State(startNode));
        //let toProcess = new Deque<DFS_State<T>>(states[0]);
        let toProcess = new Array<DFS_State<T>>(states[0]);

        while (toProcess.length) {
            let state = toProcess.pop();
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
                    toProcess.push(newState);
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

    getPathsFrom(startState: DFS_State<T>, shouldStop: (state: DFS_State<T>) => boolean = _ => false): Array<DFS_State<T>> {
        let states = new Array<DFS_State<T>>(startState);
        let toProcess = new Array<DFS_State<T>>(startState);

        while (toProcess.length) {
            let state = toProcess.pop();
            if (shouldStop(state)) break;
            state.visited.add(state.at);

            let neighbors = this.getNeighbors(state);

            let canVisit = Array.from(neighbors.keys()).filter(n => !state.visited.has(n));

            if (canVisit.length > 0) {
                canVisit.forEach(n => {
                    let newState = state.clone();
                    newState.at = n;
                    newState.cost += neighbors.get(n);
                    toProcess.push(newState);
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