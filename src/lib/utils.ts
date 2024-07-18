//Finds common elements in two arrays
export function arrayIntersection<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter((val) => arr2.includes(val));
}
