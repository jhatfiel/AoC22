import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Pair } from '../../lib/gridParser.js';

interface Bot {
    loc: Pair;
    vel: Pair;
}

export class b202414 extends AoCPuzzle {
    w=101;
    h=103;
    offset = 40;
    stepSize = 103;

    bots: Bot[] = [];
    interesting = [39,142,245,348,451,554,657,760,863,966];

    sampleMode(): void {
        this.w=11;
        this.h=7;
    };

    _loadData(lines: string[]) {
        lines.forEach(line => {
            let arr = [...line.matchAll(/(-?[\d]+)/g)].map(m=>m[1]).map(Number);
            let bot = {loc: {x: arr[0], y: arr[1]}, vel: {x: arr[2], y: arr[3]}};
            this.bots.push(bot);
        });
        this.move(this.offset);
    }

    show() {
        let str = '';
        for (let y=0; y<this.h; y++) {
            for (let x=0; x<this.w; x++) {
                str += this.bots.some(bot=>bot.loc.x === x && bot.loc.y === y)?'#':'.';
            }
            str += '\n';
        }
        console.log(`Step Number: ${this.stepNumber*this.stepSize+this.offset}`);
        console.log(str);
    }

    move(steps=this.stepSize) {
        for (let bot of this.bots) {
            bot.loc.x = ((bot.loc.x + steps*bot.vel.x)%this.w + this.w)%this.w;
            bot.loc.y = ((bot.loc.y + steps*bot.vel.y)%this.h + this.h)%this.h;
        }
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber*this.stepSize+this.offset-1 < 8279;
        this.move();
        this.show();

        return moreToDo;
    }
}