import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

class Password {
    constructor(p: string) { this.arr = p.split(''); }

    next(): string {
        console.log(`next pw ${this.arr.join('')}`);
        do {
            this.increase();
            this.fixIOL();
            process.stdout.moveCursor(0, -1);
            console.log(`next pw ${this.arr.join('')}`);
        } while (!this.hasIncreasing3() || !this.hasDoubleDouble());

        return this.toString();
    }

    fixIOL() {
        let foundIOL = false;
        // remove first ILO and make the rest be 'a'
        this.arr.forEach((c, ind) => {
            if (foundIOL) this.arr[ind] = 'a';
            else if ('ilo'.indexOf(c) !== -1) {
                foundIOL = true;
                this.arr[ind] = this.nextLetter(this.arr[ind]);
            }
        })
    }

    hasIncreasing3(): boolean {
        for (let i=0; i<6; i++) {
            if (this.arr[i].charCodeAt(0)+1 === this.arr[i+1].charCodeAt(0) &&
                this.arr[i].charCodeAt(0)+2 === this.arr[i+2].charCodeAt(0)) return true;
        }
        return false;
    }

    hasDoubleDouble(): boolean {
        let doubleCount = 0;
        for (let i=0; i<7; i++) {
            if (this.arr[i] === this.arr[i+1]) {
                doubleCount++;
                i++;
            }
        }
        return doubleCount>1;
    }

    nextLetter(c: string): string {
        // hijklmnop
        if (c === 'z') c = 'a';
        else if (c === 'h') c = 'j';
        else if (c === 'k') c = 'm';
        else if (c === 'n') c = 'p';
        else c = String.fromCharCode(c.charCodeAt(0)+1);
        return c;
    }

    increase() {
        for (let i = this.arr.length - 1; i >= 0; i--) {
            this.arr[i] = this.nextLetter(this.arr[i]);
            if (this.arr[i] !== 'a') break; // we didn't wrap around so we're done
        }
    }

    toString() { return this.arr.join(''); }

    arr: Array<string>;
}

p.onLine = (line) => {
    console.log(line);
    let p = new Password(line);
    console.log(`next password is: ${p.next()}`);
    console.log(`next password is: ${p.next()}`);
};

p.onClose = () => {
};

p.run();