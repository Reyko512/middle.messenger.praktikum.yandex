export type Comparator<T> = (left: T, right: T) => number;

function merge<T>(
  left: readonly T[],
  right: readonly T[],
  compare: Comparator<T>,
) {
  const result: T[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (compare(left[leftIndex] as T, right[rightIndex] as T) <= 0) {
      result.push(left[leftIndex] as T);
      leftIndex += 1;
      continue;
    }

    result.push(right[rightIndex] as T);
    rightIndex += 1;
  }

  while (leftIndex < left.length) {
    result.push(left[leftIndex] as T);
    leftIndex += 1;
  }

  while (rightIndex < right.length) {
    result.push(right[rightIndex] as T);
    rightIndex += 1;
  }

  return result;
}

export function mergeSort<T>(
  input: readonly T[],
  compare: Comparator<T>,
): T[] {
  if (input.length < 2) {
    return [...input];
  }

  const middle = Math.floor(input.length / 2);
  const left = mergeSort(input.slice(0, middle), compare);
  const right = mergeSort(input.slice(middle), compare);

  return merge(left, right, compare);
}
