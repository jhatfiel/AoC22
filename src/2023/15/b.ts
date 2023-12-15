import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

let boxes = new Map<number, Array<string>>();

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            for (let n=0; n<256; n++) {
                boxes.set(n, new Array<string>());
            }
            line.split(',').forEach(piece => {
                let arr = piece.split(/[-=]/);
                let label = arr[0];
                let value = Number(arr[1]);
                let boxNum = getHash(label);
                //console.log(`\nlabel [${label}] value=${value} is box #${boxNum}`)
                if (value) {
                    let indexOfLabel = boxes.get(boxNum).findIndex(lens => lens.startsWith(label));
                    //console.debug(`Found him at ${indexOfLabel}`)
                    if (indexOfLabel === -1) {
                        boxes.get(boxNum).push(`${label} ${value}`)
                    } else {
                        boxes.get(boxNum)[indexOfLabel] = `${label} ${value}`;
                    }

                } else {
                    boxes.set(boxNum, boxes.get(boxNum).filter(lens => lens.startsWith(label) === false));
                }
                //debugBoxes();
            })

            // process the boxes
            let total = 0;
            for (let n=0; n<256; n++) {
                let box = boxes.get(n);
                let num1 = n+1;
                for (let slotNum=0; slotNum < box.length; slotNum++) {
                    let num2 = slotNum+1;
                    let num3 = Number(box[slotNum].split(' ')[1]);
                    console.debug(`Box ${n} Slot ${slotNum} is [${box[slotNum]}]: ${num1} * ${num2} * ${num3} = ${num1*num2*num3}`)
                    total += num1*num2*num3
                }
            }

            console.log(`Final: ${total}`)
        });
    });

function debugBoxes() {
    for (let n=0; n<10; n++) {
        console.debug(`Box ${n}: [${boxes.get(n).join('] [')}]`)
    }

}

function getHash(str: string) {
    let result = 0;
    str.split('').forEach(c => {
        let asciiCode = c.charCodeAt(0);
        result += asciiCode;
        result *= 17
        result = result % 256;
    });
    return result;
}