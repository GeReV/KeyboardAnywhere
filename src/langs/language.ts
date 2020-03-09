import Direction from "../direction";

export default interface Language {
  lang: string;
  title: string;
  direction: Direction;
  keys: {
    '': string;
    s: string;
    c: string;
    sc: string;
  };
}
