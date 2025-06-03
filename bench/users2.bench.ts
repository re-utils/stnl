import { bench, do_not_optimize, run, summary } from "mitata";
import users from "./data/users2.json";

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
    "fast inlining",
    (o: any) =>
      typeof o.name === "string" &&
      o.id !== null &&
      typeof o.id === "object" &&
      typeof o.id.verified === "boolean" &&
      typeof o.id.code === "string",
  );

  {
    const subMatch = (o: any) =>
      typeof o === "object" &&
      typeof o.verified === "boolean" &&
      typeof o.code === "string";

    setup(
      "partial inlining",
      (o: any) => typeof o.name === "string" && o.id !== null && subMatch(o.id),
    );
  }
});

run();
