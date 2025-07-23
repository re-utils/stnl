import { randomStr, randRemoveProp } from './utils.js';

function trueValidator(this: { data: any }, fn: (o: any) => boolean) {
  // Support validator that throws and not throw
  const res = fn(this.data);
  if (res !== true && res !== undefined)
    throw new Error('A validator is invalid!');
}

function falseValidator(this: { data: any }, fn: (o: any) => boolean) {
  // Support validator that throws and not throw
  try {
    const res = fn(this.data);
    if (res === true || res === undefined)
      throw new Error('A validator is invalid!');
  } catch {}
}

const valid = () => ({
  data: {
    number: Math.random() * 18,
    negNumber: Math.random() * -20,
    maxNumber: Number.MAX_SAFE_INTEGER,
    string: randomStr(2),
    longString: randomStr(8),
    boolean: Math.random() < 0.5,
    deeplyNested: {
      foo: randomStr(2),
      num: Math.random() * 78,
      bool: Math.random() > 0.5,
    },
    items: new Array(3 + Math.round(Math.random() * 9))
      .fill(0)
      .map(Math.random),
  },
  validate: trueValidator,
  benchmark: true,
});

const invalid = () => {
  const data = valid();
  randRemoveProp(data.data);
  data.validate = falseValidator;
  data.benchmark = false;
  return data;
};

const deepInvalid = () => {
  const data = valid();
  randRemoveProp(data.data.deeplyNested);
  data.validate = falseValidator;
  data.benchmark = false;
  return data;
};

export default Array.from({ length: 500 }, (_, i) =>
  i % 50 === 0 ? invalid() : i % 25 === 0 ? deepInvalid() : valid(),
);
