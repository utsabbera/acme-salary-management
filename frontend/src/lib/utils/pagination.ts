interface PaginationRoutingParams {
  currentId: number;
  items: { id: number }[];
  currentOffset: number;
  limit: number;
}

interface PaginationRoutingResult {
  prevId: number | null;
  nextId: number | null;
  prevOffset: number | null;
  nextOffset: number | null;
}

export function getNextPrevRouting({
  currentId,
  items,
  currentOffset,
  limit,
}: PaginationRoutingParams): PaginationRoutingResult {
  const currentIndex = items.findIndex((item) => item.id === currentId);

  if (currentIndex === -1) {
    return { prevId: null, nextId: null, prevOffset: null, nextOffset: null };
  }

  let prevId: number | null = null;
  let nextId: number | null = null;
  let prevOffset: number | null = null;
  let nextOffset: number | null = null;

  if (currentIndex > 0) {
    prevId = items[currentIndex - 1]?.id ?? null;

    if (currentOffset > 0 && currentIndex === 1) {
      prevOffset = Math.max(0, currentOffset - limit);
    }
  }

  if (currentIndex < items.length - 1) {
    nextId = items[currentIndex + 1]?.id ?? null;

    const offsetInFetchedArray = currentOffset > 0 ? 1 : 0;
    const isNextItemOnNextPage = currentIndex >= offsetInFetchedArray + limit - 1;

    if (isNextItemOnNextPage) {
      nextOffset = currentOffset + limit;
    }
  }

  return {
    prevId,
    nextId,
    prevOffset,
    nextOffset,
  };
}
