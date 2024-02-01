import RandExp from 'randexp';
import { AoCPuzzle } from '../../lib/AoCPuzzle';

export class a201820 extends AoCPuzzle {
    randexp: RandExp;
    possibleRoutes = new Set<string>();
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.randexp = new RandExp(lines[0]);
    }

    _runStep(): boolean {
        // 318 for    1000000
        // 1215+ for  10000000
        const MAX_TRY=10000000;
        let moreToDo = false;
        let route: string;
        let tryCount = 0;
        while ((route=this.randexp.gen()) && this.possibleRoutes.has(route) && tryCount < MAX_TRY) {
            tryCount++;
        }
        if (tryCount < MAX_TRY) {
            this.possibleRoutes.add(route);
            this.log(`${tryCount.toString().padStart(15, ' ')} / ${this.possibleRoutes.size.toString().padStart(3, ' ')}: ${route}`);
            moreToDo = true;
        }

        this.result = this.possibleRoutes.size.toString();
        return moreToDo;
    }
}