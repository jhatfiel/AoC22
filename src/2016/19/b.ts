//const NUM=5;
const NUM=3001330;

type SLL = {
    next?: SLL;
    value: any;
}

// This is still just a "delete somebody" type of problem.
// It is just a little more complicated to figure out who to delete...
// Ah, but it's not.  We just need TWO pointers.
// And we need to keep track of the total number left (which just goes down by 1 each time we steal)

// With 12345
// 1 steals from 3    stealer=1, loserPrev=2 => loserPrev.next = loserPrev.next.next; loserPrev = loserPrev.next; stealer=stealer.next
// 2 steals from 5    stealer=2, loserPrev=4 => loserPrev.next = loserPrev.next.next; stealer=stealer.next; // on odd remaining, don't "increment" loser
// 4 steals from 1    stealer=4, loserPrev=4 => loserPrev.next = loserPrev.next.next; loserPrev = loserPrev.next; stealer=stealer.next; stealer=stealer.next;
// 2 steals from 4
// leaving only 4

/*
   1 <--- stealer
 5   2
  4(3)

   1 
(5)  2 <--- stealer
   4  

   (1)
     2
 4 <--- stealer
*/

let HEAD = {value: 'HEAD'} as SLL;
let stealer = HEAD;
let loserPrev = HEAD;

for (let i=0; i<NUM; i++) {
    stealer.next = {value: i+1};
    stealer = stealer.next;
    if (i%2 === 1) loserPrev = loserPrev.next;
}

stealer.next = HEAD.next;
stealer = stealer.next;

console.log(`Stealer: ${stealer.value}, loserPrev: ${loserPrev.value}, loser: ${loserPrev.next.value}`);
let remain = NUM;

while (remain > 1) {
    loserPrev.next = loserPrev.next.next;
    remain--;
    if (remain%2 === 0) {
        loserPrev = loserPrev.next;
    }
    stealer = stealer.next;
    //console.log(`Stealer: ${stealer.value}, loserPrev: ${loserPrev.value}, loser: ${loserPrev.next.value}`);
}

console.log(`Last man standing: ${stealer.value}`);