import { randomStr } from './utils.js';

function validator(this: { data: any }, fn: (o: any) => string) {
  if (fn(this.data) !== JSON.stringify(this.data))
    throw new Error('A stringifier is invalid!');
}

const valid = () => ({
  data: new Array(5 + Math.round(Math.random() * 3)).fill(0).map(() => ({
    name: randomStr(3),
    pwd: randomStr(10),
    id: new Array(6 + Math.round(Math.random() * 9)).fill(0).map(Math.random),
  })),
  validate: validator,
});

export default Array.from({ length: 500 }, valid);
