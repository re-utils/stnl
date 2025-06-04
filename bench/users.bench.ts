import { bench, do_not_optimize, run, summary } from 'mitata';
import users from './data/users.json';

summary(() => {
  const setup = (label: string, matcher: (o: any) => boolean) => {
    // @ts-ignore
    for (const user of users) do_not_optimize(matcher(user));

    bench(label, () => {
      // @ts-ignore
      for (let i = 0; i < users.length; i++) do_not_optimize(matcher(users[i]));
    });
  };

  setup(
    'fast inlining',
    (o: any) =>
      Array.isArray(o.friends) &&
      o.friends.every(
        (o: any) =>
          (o.type === 0 || o.type === 1 || o.type === 2) &&
          Number.isInteger(o.id),
      ),
  );

  {
    const subMatch = (o: any) =>
      (o.type === 0 || o.type === 1 || o.type === 2) && Number.isInteger(o.id);

    setup(
      'partial inlining',
      (o: any) => Array.isArray(o.friends) && o.friends.every(subMatch),
    );
  }
});

run();
