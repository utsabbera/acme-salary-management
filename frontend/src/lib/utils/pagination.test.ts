import { describe, expect, it } from "vitest";
import { getNextPrevRouting } from "./pagination";

describe("getNextPrevRouting", () => {
  it("returns nulls when there is only one item and no boundaries", () => {
    const result = getNextPrevRouting({
      currentId: 10,
      items: [{ id: 10 }],
      currentOffset: 0,
      limit: 20,
    });
    expect(result).toEqual({ prevId: null, nextId: null, prevOffset: null, nextOffset: null });
  });

  it("returns next and prev IDs on the same page", () => {
    const result = getNextPrevRouting({
      currentId: 10,
      items: [{ id: 9 }, { id: 10 }, { id: 11 }],
      currentOffset: 0,
      limit: 20,
    });
    expect(result).toEqual({ prevId: 9, nextId: 11, prevOffset: null, nextOffset: null });
  });

  it("handles crossing the previous page boundary", () => {
    // If we are at offset 20, and limit is 20.
    // The Genius Fetch fetched offset=19, limit=22.
    // Index 0 is the last item of page 1.
    // Index 1 is the first item of page 2 (currentId=20).
    const result = getNextPrevRouting({
      currentId: 20,
      items: [{ id: 19 }, { id: 20 }, { id: 21 }],
      currentOffset: 20,
      limit: 20,
    });
    expect(result.prevId).toBe(19);
    expect(result.prevOffset).toBe(0); // Needs to go to previous page
    expect(result.nextId).toBe(21);
    expect(result.nextOffset).toBe(null); // Same page
  });

  it("handles crossing the next page boundary", () => {
    // If we are at offset 0, limit 2.
    // Fetch offset=0, limit=4.
    // items: index 0, index 1 (last of page 1), index 2 (first of page 2)
    const result = getNextPrevRouting({
      currentId: 2,
      items: [{ id: 1 }, { id: 2 }, { id: 3 }],
      currentOffset: 0,
      limit: 2,
    });
    expect(result.prevId).toBe(1);
    expect(result.prevOffset).toBe(null);
    expect(result.nextId).toBe(3);
    expect(result.nextOffset).toBe(2); // Needs to go to next page
  });

  it("returns null for prev when on the absolute first item", () => {
    const result = getNextPrevRouting({
      currentId: 1,
      items: [{ id: 1 }, { id: 2 }],
      currentOffset: 0,
      limit: 20,
    });
    expect(result.prevId).toBe(null);
    expect(result.nextId).toBe(2);
  });

  it("returns null for next when on the absolute last item", () => {
    const result = getNextPrevRouting({
      currentId: 20,
      items: [{ id: 19 }, { id: 20 }],
      currentOffset: 0,
      limit: 20,
    });
    expect(result.prevId).toBe(19);
    expect(result.nextId).toBe(null);
  });
});
