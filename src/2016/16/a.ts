/*
const SIZE = 20;
const STATE='10000';
/*/
//const SIZE = 272;
const SIZE = 35651584;
const STATE='01111010110010011';
//*/

let state = STATE;

while (state.length < SIZE) {
    let b = '';
    for (let i=state.length-1; i>=0; i--) b += (state[i]==='1')?'0':'1';
    state = state+'0'+b;
}

state = state.substring(0, SIZE);
//console.log(`State is: ${state.length} / ${state}`);

let checksum = state;
while (checksum.length % 2 === 0) {
    let newChecksum = '';
    for (let i=0; i<checksum.length; i+=2) newChecksum += (checksum[i]===checksum[i+1])?'1':'0';
    checksum = newChecksum;
    //console.log(`Checksum is: ${checksum.length} / ${checksum}`);
    // 01111010110010011 is too "high"??
}
console.log(`Checksum is: ${checksum.length} / ${checksum}`);