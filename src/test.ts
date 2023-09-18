import { SparkMD5 } from 'spark-md5';
let message: string = 'Hello World2';
console.log(message);

let hexHash = SparkMD5.hash('Hi there');
console.log(hexHash);