import { createServerFn } from "@tanstack/react-start";
import type { Place } from "./places";
import { publicPlacesClient } from "./places-client.server";
import { savePlaceSchema, weeklyHoursSchema } from "./place-schedule";

/** Public read only: use anonymous permissions, never an admin client. */
export const getPublicPlaces = createServerFn({ method: "GET" }).handler(
  async (): Promise<Place[]> => {
    const { client: publicClient, url } = publicPlacesClient();

    try {
      const { data, error } = await publicClient
        .from("places")
        .select(
          "id,name,latitude,longitude,address,zone,description,opening_hours,closing_hours,weekly_hours,specialties,image_url,is_active,created_at,reviews(id,place_id,rating,comment,user_name,tags,created_at)",
        )
        .eq("is_active", true)
        .order("created_at");
      if (error) throw error;
      const places: Place[] = (data ?? []).map((p) => ({
        ...p,
        weekly_hours: weeklyHoursSchema.safeParse(p.weekly_hours).data ?? null,
      }));
      const paths = places
        .map((place) => place.image_url)
        .filter((path): path is string => !!path && !path.startsWith("http"));
      if (paths.length) {
        // A photo failure must not prevent the map/list from loading.
        try {
          const { data: signed } = await publicClient.storage
            .from("photos")
            .createSignedUrls(paths, 86400);
          const signedUrls = new Map(signed?.map((photo) => [photo.path, photo.signedUrl]) ?? []);
          const browserUrl = import.meta.env["VITE_SUPABASE_URL"];
          for (const place of places) {
            if (!place.image_url || place.image_url.startsWith("http")) continue;
            const signedUrl = signedUrls.get(place.image_url);
            place.image_url = signedUrl ? signedUrl.replace(url, browserUrl) : null;
          }
        } catch {
          for (const place of places)
            if (place.image_url && !place.image_url.startsWith("http")) place.image_url = null;
        }
      }
      for (const place of places)
        place.reviews.sort((a, b) => b.created_at.localeCompare(a.created_at));
      return places;
    } catch (error) {
      console.error("Public places read failed", error);
      throw new Error("Impossibile caricare i luridi. Controlla la connessione e riprova.");
    }
  },
);

export const savePublicPlace = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => savePlaceSchema.parse(input))
  .handler(async ({ data }) => {
    const { client } = publicPlacesClient();
    const { id, image_url, ...fields } = data;
    const values = {
      ...fields,
      ...(image_url === undefined ? {} : { image_url }),
      opening_hours: fields.weekly_hours.mon.open,
      closing_hours: fields.weekly_hours.mon.close,
    };
    const result = id
      ? await client
          .from("places")
          .update(values)
          .eq("id", id)
          .eq("is_active", true)
          .select("id")
          .single()
      : await client.from("places").insert(values).select("id").single();
    if (result.error || !result.data)
      throw new Error("Non sono riuscito a salvare il lurido. Riprova.");
    return { id: result.data.id };
  });
