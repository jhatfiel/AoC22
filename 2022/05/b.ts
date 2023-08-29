import fs from 'fs';
import readline from 'readline';

class C {
    constructor() {
        for (var i=0; i<9; i++) this.stacks[i] = new Array<String>();
    };

    cScore = 0;
    mode = 0;
    stacks: Array<Array<String>> = [];
    regex = new RegExp('move (\\d+) from (\\d) to (\\d)');

    process(line: string) {
        if (line.charAt(1) === '1' || line.length === 0) { this.mode = 1; return; }
        if (this.mode === 0) {
            // initialize the stacks
            for (var i=0; i<9; i++) {
                var v = line.charAt(1+i*4);
                if (v && v !== ' ') { this.stacks[i].unshift(v); }
            }
        } else {
            // move # from a to b
            console.log(line);
            var arr = this.regex.exec(line);
            if (arr) {
                var [num, from, to] = arr.slice(1,4).map(Number);
                var group: Array<String> = [];
                for (var i=0; i<num; i++) {
                    group.push(this.stacks[from-1].pop()!);
                }
                for (var i=0; i<num; i++) {
                    this.stacks[to-1].push(group.pop()!);
                }
            }
        }
    }

    debug() {
        var maxDepth = this.stacks.reduce((m, s) => { if (s.length > m) return s.length; else return m; }, 0);
        console.log('---------');
        for (var i=0; i<9; i++) {
            if (this.stacks[i].length > maxDepth) maxDepth = this.stacks[i].length;
        }

        for (var j=maxDepth-1; j>=0; j--) {
            var line = ""
            for (var i=0; i<9; i++) {
                if (j < this.stacks[i].length) line += this.stacks[i][j]
                else line += ' '
            }
            console.log(line)
        }
        console.log('123456789');
    }

    tops() {
        return this.stacks.map((s) => s[s.length-1]).join('');
    }

    value(c: string) {
        if ('a' <= c && c <= 'z') return 1+c.charCodeAt(0)-'a'.charCodeAt(0);
        else if ('A' <= c && c <= 'Z') return 27+c.charCodeAt(0)-'A'.charCodeAt(0);
        else return 0;
    }
}

var c = new C();

var fn = process.argv[2];
const rl = readline.createInterface({ input: fs.createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
    c.debug();
})

rl.on('close', () => {
    console.log('Tops: ', c.tops());
});
