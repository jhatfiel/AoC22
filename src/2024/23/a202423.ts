import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202423 extends AoCPuzzle {
    con = new Map<string, Set<string>>();
    com: string[] = [];
    count = 0;

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
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.com.length;
        let c1 = this.com[this.stepNumber-1];
        let s1 = this.con.get(c1);

        for (let i=this.stepNumber; i<this.com.length-1; i++) {
            let c2 = this.com[i];
            if (!s1.has(c2)) continue;
            let s2 = this.con.get(c2);
            for (let j=i+1; j<this.com.length; j++) {
                let c3 = this.com[j];
                if (!s1.has(c3)) continue;
                if (!s2.has(c3)) continue;
                //this.log(`${c1},${c2},${c3}`);
                if (c1[0] === 't' || c2[0] === 't' || c3[0] === 't') this.count++;
            }
        }

        if (!moreToDo) {
            this.result = this.count.toString();
        }
        return moreToDo;
    }
}