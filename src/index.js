/*
 * @Author: your name
 * @Date: 2020-08-24 17:36:57
 * @LastEditTime: 2020-08-24 17:37:01
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /webpack-dll-demo/src/index.js
 */
import { join } from 'lodash';

function createSpan() {
  const element = document.createElement('span');
  element.innerHTML = join(['Hello', 'DllPlugin'], ' , ');
  return element;
}

document.querySelector('#root').appendChild(createSpan());
