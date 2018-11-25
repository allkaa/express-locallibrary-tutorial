'use strict';

function callback(prevValue, currentValue, currIndex, arr) {
  return prevValue + currentValue;
}

let intArr = [10, 11, 12];
let initValue = 1000;
let reduced = intArr.reduce(callback, initValue);
