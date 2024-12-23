import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202423 extends AoCPuzzle {
    con = new Map<string, Set<string>>();
    com: string[] = [];
    count = 0;
    cliques: {maxIndex: number, nodes: string[], nodeSetArr: Set<string>[]}[][] = [];

    sampleMode(): void { };

    _loadData(lines: string[]) {
        for (let line of lines) {
            let [c1, c2] = line.split('-');
            let s = this.con.get(c1);
            if (!s) { s = new Set<string>(); this.con.set(c1, s); }
            s.add(c2);
            s = this.con.get(c2);
            if (!s) { s = new Set<string>(); this.con.set(c2, s); }
            s.add(c1);
        }

        this.com = [...this.con.keys()].sort();
        this.cliques[1] = [];
        for (let i=0; i<this.com.length; i++) {
            let name = this.com[i];
            this.cliques[1].push({maxIndex: i, nodes: [name], nodeSetArr: [this.con.get(name)]});
        }
    }

    expandCliques(size: number) {
        let nextSize = [];
        this.cliques[size+1] = nextSize;
        for (let clique of this.cliques[size]) {
            for (let i=clique.maxIndex+1; i<this.com.length; i++) {
                let nextName = this.com[i];
                if (clique.nodeSetArr.every(nodeSet=>nodeSet.has(nextName))) {
                    //this.log(`Found new! ${size+1}`);
                    nextSize.push({maxIndex: i, nodes: [...clique.nodes, nextName], nodeSetArr: [...clique.nodeSetArr, this.con.get(nextName)]});
                }
            }
        }
    }

    _runStep(): boolean {
        this.expandCliques(this.stepNumber);
        let newSize = this.stepNumber+1;

        let moreToDo = this.cliques[newSize].length > 0;

        this.log(`${this.stepNumber}: ${this.cliques[newSize].length}`);

        if (!moreToDo) {
            this.result = this.cliques[this.stepNumber][0].nodes.join(',');
        }
        return moreToDo;
    }
}