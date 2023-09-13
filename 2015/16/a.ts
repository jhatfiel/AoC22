import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

let rules = new Map<string, number>();
rules.set('children', 3);
rules.set('cats', 7);
rules.set('samoyeds', 2);
rules.set('pomeranians', 3);
rules.set('akitas', 0);
rules.set('vizslas', 0);
rules.set('goldfish', 5);
rules.set('trees', 3);
rules.set('cars', 2);
rules.set('perfumes', 1);

p.onLine = (line) => {
    const arr = line.split(/[ :\.,]+/);
    //console.log(arr);
    let num = arr[1];
    let ind = 2;
    let pass = true;
    while (ind < arr.length) {
        let thing = arr[ind];
        ind++;
        let quantity = Number(arr[ind]);
        ind++;
        if (rules.get(thing) !== quantity) pass = false;
    }
    if (pass) {
        console.log(line);
    }
};

p.onClose = () => { };

p.run();