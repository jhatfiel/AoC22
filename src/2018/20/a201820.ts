import { AoCPuzzle } from '../../lib/AoCPuzzle';

export class a201820 extends AoCPuzzle {
    line = '';
    innerRE = /\(([^()]*)\)/;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.line = lines[0].substring(1, lines[0].length-1);
        this.log(`${this.stepNumber.toString().padStart(4, ' ')}: ${this.line}`);
    }

    _runStep(): boolean {
        let moreToDo = false;
        moreToDo = this.simplify();
        this.log(`${this.stepNumber.toString().padStart(4, ' ')}: ${this.line}`);
        this.result = this.line.length.toString();
        return moreToDo;
    }

    simplify(): boolean {
        let reArr = this.innerRE.exec(this.line);
        if (reArr) {
            let replace = ''; // if any match choice is blank we need to skip this one
            let arr = reArr[1].split('|');
            if (arr.every(e => e.length > 0)) {
                replace = arr.reduce((acc, s) => acc = (acc.length>s.length)?acc:s, '');
            }
            this.line = this.line.substring(0, reArr.index) + replace + this.line.substring(reArr.index+reArr[0].length);
        }

        return reArr !== null;
    }
}