let input = (process.argv[2] === 'sample')?3:303;

let buffer = new Array<number>(2018);
buffer[0] = 0;
let pos = 0;
let length = 1;

//console.log(`${buffer.slice(0, length).join('/').padEnd(30, ' ')} Start`);
while (length < 2018) {
    pos = ((pos + input)%length + 1)%length
    //console.log(`${buffer.slice(0, length).join('/').padEnd(30, ' ')} ${pos}`);
    buffer = [...buffer.slice(0,pos+1), length, ...buffer.slice(pos+1)];
    length++;
    //console.log(`${buffer.slice(0, length).join('/').padEnd(30, ' ')}`);
}
console.log(`Number before last position: ${buffer[pos]}`); pos = (pos+1)%length;
console.log(`Number at last position: ${buffer[pos]}`); pos = (pos+1)%length;
console.log(`Number after last position: ${buffer[pos]}`); pos = (pos+1)%length;