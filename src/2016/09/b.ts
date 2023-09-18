import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

function computeLength(line: string, spacing='') {
    //console.log(`${spacing}Computing length of ${line}`)
    const oInd = line.indexOf('(');
    if (oInd > -1) {
        const xInd = line.indexOf('x');
        const len = Number(line.slice(oInd+1, xInd));
        const cInd = line.indexOf(')');
        let reps = Number(line.slice(xInd+1, cInd));
        let insideCount = computeLength(line.substring(cInd+1, cInd+1+len), '  ');
        let afterCount  = computeLength(line.substring(cInd+1+len));
        //console.log(`${spacing}${oInd} + ${reps}*${insideCount} + ${afterCount}`);
        return oInd + reps*insideCount + afterCount;
    } else {
        return line.length;
    }
}

p.onLine = (line) => {
    console.log(line);
    let computedLength = computeLength(line);
    console.log(`Computed length: ${computedLength}`);
};

p.onClose = () => {
};

p.run();