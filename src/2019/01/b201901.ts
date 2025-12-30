import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b201901 extends AoCPuzzle {
    sum = 0;
    sampleMode(): void { };

    _loadData(lines: string[]) {}
    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.lines.length;
        let mass = Number(this.lines[this.stepNumber-1]);
        // minimal difference in speed between recursion with memoization and looped calculations - there are only 100 values in the test set after all...
        let weight = mass;
        let totalFuel = 0;
        //console.log(`Mass of ${mass} needs ...`);
        while (true) {
            let fuel = Math.max(0, Math.floor(weight/3) - 2);
            if (fuel <= 0) break;
            //console.log(`... ${fuel}`);
            totalFuel += fuel;
            weight = fuel;
        }
        //console.log(`- totalFuel=${totalFuel}`)
        this.sum += totalFuel;
        if (!moreToDo) {
            this.result = this.sum.toString();
        }
        return moreToDo;
    }
}