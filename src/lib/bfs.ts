/*
Super simple BFS
*/

export class BFS {
    constructor(private getNeighbors: (node: string) => Set<string>) {};
    cache = new Map<string, Map<string, Array<string>>>();

    getShortestPath(from: string, to: string, skipCache=false): Array<string> {
        let toCache = this.cache.get(to);
        if (toCache === undefined || toCache.get(from) === undefined || skipCache) {
            return this._getShortestPath(from, to);
        } else {
            return toCache.get(from)!;
        }
    }

    _getShortestPath(from: string, to: string): Array<string> {
        let toCache = new Map<string, Array<string>>();
        this.cache.set(to, toCache);

        let parent = new Map<string, string>();
        parent.set(from, '');

        let toVisit = new Set<string>();
        toVisit.add(from);
        let iteration = 0;

        while (toVisit.size) {
            /*
            iteration++;
            if (iteration % 1000 === 0) {
                console.log(`_getShortestPath: toVisit.size=${toVisit.size}    `);
                if (process.stdout.moveCursor) { process.stdout.moveCursor(0, -1);}
            }
            */
            let nextNode = toVisit.entries().next().value[0];
            toVisit.delete(nextNode);
            if (nextNode === to) break;
            this.getNeighbors(nextNode).forEach((n) => {
                if (parent.get(n) === undefined) { // if we haven't found a way here yet, set the parent and go from there
                    toVisit.add(n);
                    parent.set(n, nextNode);
                }
            });
        }
        // store the result
        let result = new Array<string>();
        let trace = parent.get(to);
        while (trace !== undefined && trace !== '') {
            result.push(trace);
            trace = parent.get(trace);
        }
        toCache.set(from, result.reverse());

        //if (process.stdout.clearLine) process.stdout.clearLine(0);
        return toCache.get(from)!;
    }
}