import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Factors } from '../../lib/numberTheory.js';

export class a202502 extends AoCPuzzle {
    factors: number[][] = [];
    getFactors(n: number): number[] {
        let result = this.factors[n];
        if (!result) {
            result = Factors(n).filter(f => f !== n);
            this.factors[n] = result;
        }
        return result;
    }

    _runStep(): boolean {
        let sumA = 0;
        let sumB = 0;
        for (const pair of this.lines[0].split(',')) {
            const [a, b] = pair.split('-').map(Number);
            console.log(`Processing range: ${a}-${b}`);
            for (let i=a; i<=b; i++) {
                const str = i.toString();
                const len = str.length;
                let matched = false;
                const factors = this.getFactors(len);
                factors.forEach(width => {
                    const times = len / width;
                    if (times > 2 && matched) return;
                    const pattern = str.substring(0, width);
                    if (str === pattern.repeat(times)) {
                        if (!matched) {
                            //console.log(`Found B match: ${i} = ${pattern} x ${times}`);
                            sumB += i;
                        }
                        matched = true;
                        if (times === 2) {
                            //console.log(`Found A match: ${i} = ${pattern} x ${times}`);
                            sumA += i;
                        }
                    }
                });
            }
        }
        this.result = `Sum A: ${sumA} / Sum B: ${sumB}`;
        return false;
    }
}