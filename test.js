'use strict';

const envObj = process.env;
for (let prop in envObj) {
  console.log(prop + ": " + envObj[prop]);
}
//console.log(prop + " <== for availability test"); // NB! prop is NOT available outside of for/in loop!!!
//dtVar = new Date();
//console.log('====================================' + " " + dtVar.getSeconds() + "." + dtVar.getMilliseconds());

/**
 * 
 * @param {*} prevValue 
 * @param {*} currentValue 
 * @param {*} currIndex 
 * @param {*} arrRef 
 */

function callback(prevValue, currentValue, currIndex, arrRef) {
  // initially prevValue = initValue and starts from first array element 
  // or prevVale is first element value if initValue is not used, and starts from second array element.
  return prevValue + currentValue;
}

const callback2 = (prevValue, currentValue, currIndex, arrRef) => {
  // initially prevValue = initValue and starts from first array element 
  // or prevVale is first element value if initValue is not used, and starts from second array element.
  return prevValue + currentValue;
}

/*
let intArr = [10, 11, 12];
let initValue = 1000;
let reduced = intArr.reduce(callback, initValue);
let reduced2 = intArr.reduce(callback2);

console.log(reduced, reduced2);
*/

let author = true;
var dayOfBirth, dayOfDeath, dbf, ddf;
if (author) {
  dayOfBirth = new Date();
  dayOfDeath = new Date();
}
dbf = dayOfBirth.getFullYear() + `-` + (dayOfBirth.getMonth()+1) + `-` + dayOfBirth.getDate()
console.log(dbf);
console.log(`end of program`);