export class Cluster {
    constructor(public nodes: Array<string>, private getNeighbors: (node: string) => Set<string>) {
        // step through the nodes and find all connected that are not clustered
        nodes.forEach((n) => {
            if (!this.inSet.has(n)) {
                let set = new Set([n]);
                // all n's neighbors are in his set
                let addToSet: Set<string>;
                let newNodes = [n];
                do {
                    addToSet = new Set<string>();
                    newNodes.forEach((n) => getNeighbors(n).forEach((nn) => !this.inSet.has(nn) && addToSet.add(nn)));
                    newNodes = new Array<string>();
                    addToSet.forEach((nn) => { this.inSet.set(nn, set); set.add(nn); newNodes.push(nn); });
                } while (addToSet.size)
                this.sets.push(set);
            }
        })
    }
    
    sets = new Array<Set<string>>();
    inSet = new Map<string, Set<string>>();
}