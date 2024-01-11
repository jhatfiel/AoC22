export {};
//const NUM=5;
const NUM=3001330;

type SLL = {
    next?: SLL;
    value: any;
}

let HEAD = {value: 'HEAD'} as SLL;
let last = HEAD;

for (let i=0; i<NUM; i++) {
    last.next = {value: i+1};
    last = last.next;
}

last.next = HEAD.next;
last = last.next;

console.log(`Starting value: ${last.value}`);
while (last.next !== last) {
    last.next = last.next.next;
    last = last.next;
}
console.log(`Ending value: ${last.value}`);