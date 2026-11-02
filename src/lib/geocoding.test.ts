import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("selezione da indirizzo", () => {
  it("converte l'indirizzo inserito nelle coordinate del punto sulla mappa", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [{ lat: "45.4642", lon: "9.19" }] });
    vi.stubGlobal("fetch", fetchMock);
    const { locateAddress } = await import("./geocoding");
    expect(await locateAddress("Via Torino 1, Milano")).toEqual([45.4642, 9.19]);
    const request = fetchMock.mock.calls[0]?.[0];
    if (typeof request !== "string") throw new Error("Missing address lookup request");
    expect(new URL(request).searchParams.get("q")).toBe("Via Torino 1, Milano");
    await locateAddress("Via Torino 1, Milano");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("non inventa un punto quando l'indirizzo non viene trovato", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    const { locateAddress } = await import("./geocoding");
    expect(await locateAddress("Indirizzo inesistente")).toBeNull();
  });
});
