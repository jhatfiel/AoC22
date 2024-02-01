import { AoCPuzzle } from '../../lib/AoCPuzzle';

export class b201820 extends AoCPuzzle {
    matchLines: string[];
    matchProcessed = new Set<string>();
    roomPaths = new Set<string>();
    //innerRE = /\(([^()]*)\)/;
    sampleMode(): void { };

    _loadData(lines: string[]) {
        this.matchLines = ['(' + lines[0].substring(1, lines[0].length-1) + ')'];
        this.matchProcessed.add(this.matchLines[0]);
        this.log(`${this.stepNumber.toString().padStart(10, ' ')}: ${this.matchLines[0]}`);
    }

    minLen = Infinity;
    maxLen = -Infinity;
    _runStep(): boolean {
        this.expand();
        this.minLen = Math.min(this.minLen, this.matchLines.length);
        this.maxLen = Math.max(this.maxLen, this.matchLines.length);
        if (this.stepNumber%1000 === 0) {
            this.log(`${this.stepNumber.toString().padStart(10, ' ')}: ${this.matchProcessed.size} ${this.roomPaths.size} ${this.minLen}-${this.maxLen}`);
            //this.log(`${this.stepNumber.toString().padStart(10, ' ')}: ${this.matchLines.join(' / ')}`);
            this.minLen = Infinity;
            this.maxLen = -Infinity;
        }
        let moreToDo = this.matchLines.length > 0;
        if (!moreToDo) {
            this.log(`DONE!!!`);
            this.roomPaths.forEach(path => this.log(path));
            this.result = Array.from(this.roomPaths.keys()).filter(path => path.length > 1000).length.toString();
        }
        return this.matchLines.length > 0;
    }

    expand() {
        let line = this.matchLines.pop();
        //this.log(`Processing ${line}`);
        // innerRE = /\(([^()]*)\)/;
        let firstCInd = line.indexOf(')');
        if (firstCInd !== -1) {
            let firstOInd = line.substring(0, firstCInd).lastIndexOf('(');
            // match is between firstOInd & firstCInd
            // if any match choice is blank we need to take half of each part as our replacement and end it there, then replace it with empty string and continue
            let match = line.substring(firstOInd, firstCInd+1);
            let inner = match.substring(1, match.length-1);
            let arr = inner.split('|');
            let lineStart = line.substring(0, firstOInd);
            let lineEnd = line.substring(firstCInd+1);
            if (arr.some(e => e.length === 0)) {
                let numOpen = lineStart.split('').reduce((acc, c) => acc+=(c==='(')?1:0, 0);
                let closeEnd = ''.padStart(numOpen, ')');
                arr.filter(e => e.length > 0).forEach(e => {
                    if (e.length % 2 !== 0) throw new Error(`replacement with null is not even?`);
                    let newLine = lineStart+e.substring(0, e.length/2)+closeEnd;
                    //if (!this.matchProcessed.has(newLine)) {
                        this.matchLines.push(newLine);
                        //this.matchProcessed.add(newLine);
                    //} else {
                        //this.log(`AAA Skipping ${newLine.length}`);
                    //}
                })
                let newLine = lineStart+lineEnd;
                //if (!this.matchProcessed.has(newLine)) {
                    //this.matchProcessed.add(newLine);
                    this.matchLines.push(newLine)
                    //} else {
                        //this.log(`BBB Skipping ${newLine.length}`);
                //}
            } else {
                // back up to the previous | or ( and append all choices to the parent choice
                let ind = lineStart.lastIndexOf('(');
                let prevP = lineStart.lastIndexOf('|');
                if (prevP > ind) ind = prevP;
                let prevPart = lineStart.substring(ind+1);
                lineStart = lineStart.substring(0, ind+1);
                let newLine = lineStart + arr.map(e => prevPart+e).join('|')+lineEnd;
                this.matchLines.push(newLine);
                /*
                arr.forEach(e => {
                    let newLine = lineStart+e+lineEnd;
                    if (!this.matchProcessed.has(newLine)) {
                        this.matchProcessed.add(newLine);
                        this.matchLines.push(newLine);
                    } else {
                        this.log(`CCC Skipping ${newLine}`);
                    }
                })
                */
            }
        } else {
            line.split('|').forEach(piece => {
                //this.log(`Found final string: ${piece}`);
                for (let i=piece.length; i>1000; i--) {
                    let subline = piece.substring(0, i);
                    if (this.roomPaths.has(subline)) break;
                    this.roomPaths.add(subline);
                }
            })
        }

        /*
        let reArr = this.innerRE.exec(line);
        if (reArr) {
            //this.log(`Looking at: ${reArr[0]}`);
            // if any match choice is blank we need to take half of each part as our replacement and end it there, then replace it with empty string and continue
            let arr = reArr[1].split('|');
            let lineStart = line.substring(0, reArr.index);
            let lineEnd = line.substring(reArr.index+reArr[0].length);
            if (arr.some(e => e.length === 0)) {
                let numOpen = lineStart.split('').reduce((acc, c) => acc+=(c==='(')?1:0, 0);
                let closeEnd = ''.padStart(numOpen, ')');
                arr.filter(e => e.length > 0).forEach(e => {
                    if (e.length % 2 !== 0) throw new Error(`replacement with null is not even?`);
                    let newLine = lineStart+e.substring(0, e.length/2)+closeEnd;
                    if (!this.matchProcessed.has(newLine)) {
                        this.matchLines.push(newLine);
                        this.matchProcessed.add(newLine);
                    }
                })
                let newLine = lineStart+lineEnd;
                if (!this.matchProcessed.has(newLine)) {
                    this.matchProcessed.add(newLine);
                    this.matchLines.push(newLine)
                }
            } else {
                arr.forEach(e => {
                    let newLine = lineStart+e+lineEnd;
                    if (!this.matchProcessed.has(newLine)) {
                        this.matchProcessed.add(newLine);
                        this.matchLines.push(newLine);
                    }
                })
            }
        } else {
            //this.log(`Found final string: ${line}`);
            for (let i=line.length; i>1000; i--) {
                let subline = line.substring(0, i);
                if (this.roomPaths.has(subline)) break;
                this.roomPaths.add(subline);
            }
        }
        */
    }
}