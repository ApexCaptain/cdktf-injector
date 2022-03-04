export interface Auxiliary {
  dictionary: Array<string>;
  build: () => Promise<void>;
}
