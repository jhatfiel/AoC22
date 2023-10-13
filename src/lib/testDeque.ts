import { Deque } from "./deque.js";

let d = new Deque<string>();

d.addFront('A');
d.addFront('B');
d.addFront('C');
d.addFront('D');
d.addFront('E');
d.addFront('F');
d.addFront('G');
d.addFront('H');
d.addFront('I');
d.addFront('J');
d.addFront('K');
d.addFront('L'); console.log(`AddFront 'L': ${Array.from(d)}`);

d.rotate()
console.log(`After rotate: ${Array.from(d)}`);
d.rotate(2)
console.log(`After 2 more rotates: ${Array.from(d)}`);

d.rotate(-4)
console.log(`After rotate(-4): ${Array.from(d)}`);

d.rotate(-75)
console.log(`After rotate(-75): ${Array.from(d)}`);

d.rotate(3952)
console.log(`After rotate(3952): ${Array.from(d)}`);

d.rotate(12); console.log(`After rotate(12): ${Array.from(d)}`);
d.rotate(11); console.log(`After rotate(11): ${Array.from(d)}`);
d.rotate(13); console.log(`After rotate(13): ${Array.from(d)}`);

// expected
/*
AddFront 'L': A,B,C,D,E,F,G,H,I,J,K,L
After rotate: L,A,B,C,D,E,F,G,H,I,J,K
After 2 more rotates: J,K,L,A,B,C,D,E,F,G,H,I
After rotate(-4): B,C,D,E,F,G,H,I,J,K,L,A
After rotate(-75): E,F,G,H,I,J,K,L,A,B,C,D
After rotate(3952): A,B,C,D,E,F,G,H,I,J,K,L
After rotate(12): A,B,C,D,E,F,G,H,I,J,K,L
After rotate(11): B,C,D,E,F,G,H,I,J,K,L,A
After rotate(13): A,B,C,D,E,F,G,H,I,J,K,L
*/