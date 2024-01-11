import { createReadStream } from "fs";
import { createInterface } from "readline";

class DirEntry {
    constructor(public name: string, public parent?: Directory, private size=0) { };
    getSize() { return this.size; }
    getType() { return 'file'; }
    print(offset='') { console.log(offset + ' - ' + this.name + ' (' + this.getType() + ', size=' + this.getSize() + ')'); }
}

class Directory extends DirEntry {
    contents: Array<DirEntry> = new Array();
    getSize() { return this.contents.reduce((size, e) => size + e.getSize(), 0); }
    getType() { return 'dir'; }
    print(offset='') {
        super.print(offset);
        this.contents.forEach((e) => {
            e.print(offset+'  ');
        });
    }
    filter(criteria: (dirEntry: DirEntry) => boolean): Array<DirEntry> {
        var result = Array<DirEntry>();
        if (criteria(this)) result.push(this);
        this.contents.forEach((e) => {
            if (e instanceof Directory) {
                result = result.concat(e.filter(criteria));
            }
        });
        return result;
    }
}

class C {
    constructor() {};

    cScore = 0;
    root = new Directory('/'); // the root directory
    currentD = this.root;

    processCommand(line: string) {
        line = line.substring(2);
        if (line.substring(0, 2) == 'cd') {
            // change to directory
            var name = line.split(' ')[1];
            if (name === '..') {
                this.currentD = this.currentD.parent ?? this.root
            } else if (name === '/') {
                this.currentD = this.root;
            } else {
                var newD = this.currentD.contents.find((e) => e.name == name);
                if (newD && newD instanceof Directory) {
                    this.currentD = newD;
                } else {
                    console.error('Tried to change to non-existent directory:', name);
                }
            }
            //console.log('Current directory is now ' + this.currentD.name);
        } else {
            // only other choice is ls
            // that's the only type of output that will be procesed, so no need to set state
        }
    }

    processOutput(line: string) {
        var [size, name] = line.split(' ');
        var newE: DirEntry;
        if (size !== 'dir') {
            newE = new DirEntry(name, this.currentD, Number(size));
        } else {
            newE = new Directory(name, this.currentD);
        }
        this.currentD.contents.push(newE);
    }

    debug() {
        console.log('-----------------');
        this.root.print();
        console.log('-----------------');
    }
}

var c = new C();

var fn = process.argv[2];
const rl = createInterface({ input: createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    // if line starts with $, it's a command
    // otherwise it is the output from a directory listing
    if (line.charAt(0) === '$') c.processCommand(line);
    else                        c.processOutput(line);
    //c.debug();
})

rl.on('close', () => {
    const totalSpace = 70000000;
    const requiredSpace = 30000000;
    const availSpace = totalSpace - c.root.getSize();

    console.log('Available space = ' + availSpace);

    const needSpace = requiredSpace - availSpace;

    console.log('Needed space = ' + needSpace);

    var bestMatch = c.root;

    var matchDirectories = c.root.filter((e) => {
        console.log('Current best match is ' + bestMatch.name + ', now looking at ' + e.name + ' (' + e.getSize() + ')');
        if (e instanceof Directory && e.getSize() >= needSpace && e.getSize() < bestMatch.getSize()) bestMatch = e;
        return true;
    });

    console.log('Final best match is ' + bestMatch.name + ' (' + bestMatch.getSize() + ')');

});
