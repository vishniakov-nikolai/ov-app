import InferenceHandlerSingleton, { InferenceHandler } from './inference-handler';

export class LayoutObj {
  layoutStr: string;
  shape: number[];

  constructor(layout: string, shape: number[]) {
    if (layout.length !== shape.length)
      throw new Error('Shape and layout must have equal size');

    this.layoutStr = layout;
    this.shape = shape;
  }

  get(letter) {
    const index = this.layoutStr.indexOf(letter);

    if (index === -1)
      throw new Error(`Layout '${this.layoutStr} doesn't contain '${letter}' component`);

    return this.shape[index];
  }
}

export { InferenceHandlerSingleton };
export type { InferenceHandler };

