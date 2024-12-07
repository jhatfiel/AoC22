import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

interface Eq {total: number, terms: number[]};

export class a202407 extends AoCPuzzle {
    sampleMode(): void { };
    eqs: Eq[];
    sum1 = 0;
    sum2 = 0;

    _loadData(lines: string[]) {
        this.eqs = lines.map(line=>line.split(': '))
                         .map(line=>({total: Number(line[0]), terms: line[1].split(' ').map(Number)}));
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        let eq = this.eqs[this.stepNumber-1];
        let terms = [...eq.terms];
        let part2 = false;

        // DFS through ops that could be between terms
        function trial(total: number, terms: number[]): boolean {
            if (terms.length === 1) return total === terms[0];
            let remainingTerms = [...terms];
            let nextTerm = remainingTerms.pop();
            return trial(total-nextTerm, remainingTerms) || 
                        (total % nextTerm === 0 && trial(total/nextTerm, remainingTerms)) ||
                        (part2 && total.toString().endsWith(nextTerm.toString()) && trial(Number(total.toString().slice(0,total.toString().length-nextTerm.toString().length)), remainingTerms));
        }

        let matched = trial(eq.total, terms);
        if (matched) {
            //this.log(`[${this.stepNumber}]: MATCHED1!`);
            this.sum1 += eq.total;
            this.sum2 += eq.total;
        }
        part2 = true;
        if (!matched && trial(eq.total, terms)) {
            //this.log(`[${this.stepNumber}]: MATCHED2!`);
            this.sum2 += eq.total;
        }

        if (!moreToDo) {
            this.result = this.sum1.toString();
            this.log(`Part 2: ${this.sum2}`);
        }
        return moreToDo;
    }
}