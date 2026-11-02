import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { getPublicPlaces } from "./places.functions";
import { placesQuery } from "./places";

vi.mock("./places.functions", () => ({ getPublicPlaces: vi.fn() }));

describe("public places loading", () => {
  it("uses the same-origin function and preserves returned rows", async () => {
    vi.mocked(getPublicPlaces).mockResolvedValue([]);
    const client = new QueryClient();
    await expect(client.fetchQuery(placesQuery)).resolves.toEqual([]);
    expect(getPublicPlaces).toHaveBeenCalled();
  });

  it("does not turn network failures into a successful empty list", async () => {
    vi.mocked(getPublicPlaces).mockRejectedValue(new Error("Connection unavailable"));
    const client = new QueryClient();
    await expect(client.fetchQuery({ ...placesQuery, retry: false })).rejects.toThrow(
      "Connection unavailable",
    );
    expect(client.getQueryData(["places"])).toBeUndefined();
  });
});
