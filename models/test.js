'use strict';

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


let intArr = [10, 11, 12];
let initValue = 1000;
let reduced = intArr.reduce(callback, initValue);
let reduced2 = intArr.reduce(callback2);

console.log(reduced, reduced2);