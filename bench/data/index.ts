const SIZE = 50000;
let MALFORMED = 250;

const randint = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randpick = <T>(arr: T[]): T => arr[randint(0, arr.length - 1)];
const firstNames = [
  'Alice',
  'Bob',
  'Charlie',
  'Diana',
  'Eve',
  'Frank',
  'Grace',
  'Heidi',
  'Ivan',
  'Judy',
];
const lastNames = [
  'Smith',
  'Jones',
  'Williams',
  'Brown',
  'Davis',
  'Miller',
  'Wilson',
  'Moore',
  'Taylor',
  'Anderson',
];
const randname = () => randpick(firstNames) + ' ' + randpick(lastNames);
const randbool = () => Math.random() > 0.5;

{
  interface User {
    name: string;
    id: number; // integer
    friends: {
      type: 0 | 1 | 2;
      id: number;
    }[];
  }

  const randuser = (): User => ({
    name: randname(),
    id: randint(1, 1000),
    friends: new Array(randint(2, 20)).fill(0).map(() => ({
      type: randint(0, 2) as 0 | 1 | 2,
      id: randint(1, 1000),
    })),
  });

  const malformActions: ((user: User) => void)[] = [
    (user) => {
      // @ts-ignore
      delete user.name;
    },
    (user) => {
      // @ts-ignore
      delete user.id;
    },
    (user) => {
      // @ts-ignore
      delete user.friends;
    },
    (user) => {
      // @ts-ignore
      user.friends = 0;
    },
    (user) => {
      // @ts-ignore
      delete randpick(user.friends).type;
    },
    (user) => {
      // @ts-ignore
      delete randpick(user.friends).id;
    },
  ];

  const dataset = new Array(SIZE).fill(0).map(randuser);
  for (const user of dataset)
    if (Math.random() < 0.5) {
      for (let j = 0, l = randint(1, 3); j < l; j++)
        try {
          randpick(malformActions)(user);
        } catch {}
      if (--MALFORMED <= 0) break;
    }

  Bun.write(import.meta.dir + '/users.json', JSON.stringify(dataset));
}
