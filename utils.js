export function arrayIntersection(arr1, arr2) {
  return arr1.filter((val) => arr2.includes(val));
}
