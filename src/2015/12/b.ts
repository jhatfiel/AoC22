import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    console.log(line);

    let obj = JSON.parse(line);
    console.log(obj);
    let result = sum(obj);

    console.log(`sum is ${result}`);
};

function hasRed(obj: any): boolean {
    return (Object.keys(obj).some((k) => obj[k] === 'red'))
}

function sum(obj: any): number {
    let result = 0;
    if (obj instanceof Array) {
        obj.forEach((e) => result += sum(e));
    } else if (obj instanceof Object) {
        if (!hasRed(obj)) Object.keys(obj).forEach((k) => {
            result += sum(obj[k]);
        })
    } else {
        if (Number.isInteger(obj)) result += Number(obj);
    }

    return result;
}

p.onClose = () => {
};

p.run();