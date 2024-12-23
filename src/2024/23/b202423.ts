import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b202423 extends AoCPuzzle {
    con = new Map<string, Set<string>>();
    com: string[] = [];
    count = 0;
    cliques: {maxIndex: number, nodes: string[], nodeSetArr: Set<string>[]}[] = [];

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
        this.cliques = [];
        for (let i=0; i<this.com.length; i++) {
            let name = this.com[i];
            this.cliques.push({maxIndex: i, nodes: [name], nodeSetArr: [this.con.get(name)]});
        }
    }

    _runStep(): boolean {
        let newCliques: {maxIndex: number, nodes: string[], nodeSetArr: Set<string>[]}[] = [];
        for (let clique of this.cliques) {
            for (let i=clique.maxIndex+1; i<this.com.length; i++) {
                let nextName = this.com[i];
                if (clique.nodeSetArr.every(nodeSet=>nodeSet.has(nextName))) {
                    //this.log(`Found new! ${size+1}`);
                    newCliques.push({maxIndex: i, nodes: [...clique.nodes, nextName], nodeSetArr: [...clique.nodeSetArr, this.con.get(nextName)]});
                }
            }
        }

        let moreToDo = newCliques.length > 0;

        this.log(`${this.stepNumber}: ${newCliques.length}`);

        if (!moreToDo) {
            this.result = this.cliques[0].nodes.join(',');
        }
        this.cliques = newCliques;
        return moreToDo;
    }
}