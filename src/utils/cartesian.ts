/** https://github.com/fasiha/cartesian-product-generator/issues/3 */
export function* cartesian<T>(...arrs: T[][]): Generator<T[]> {
  const lenarr = arrs.map((v) => v.length);
  const idx = lenarr.map(() => 0);
  let carry = 0;
  while (!carry) {
    yield idx.map((inner, outer) => arrs[outer][inner]);
    carry = 1;
    for (let i = 0; i < lenarr.length; i += 1) {
      idx[i] += carry;
      if (idx[i] >= lenarr[i]) {
        idx[i] = 0;
        carry = 1;
      } else {
        carry = 0;
        break;
      }
    }
  }
}

export function cartesianLength(...arrs: any[][]) {
  return arrs.reduce((n, o) => n * o.length, 1);
}

export function cartesianWithLength<T>(...arrs: T[][]) {
  return [cartesian(...arrs), cartesianLength(...arrs)] as const;
}
