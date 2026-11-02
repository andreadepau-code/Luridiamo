/** Editorial provenance, not community reviews or live opening guarantees. */
export const researchedPlaces: Record<
  string,
  { checkedAt: string; sources: { label: string; url: string }[]; note: string }
> = {
  "24ed8218-ecf7-41f4-b453-69063a680031": {
    checkedAt: "22 ottobre 2026",
    sources: [
      {
        label: "Orari e indirizzo · TuttaMilano",
        url: "https://www.tuttamilano.it/maradona-milano-4932",
      },
      {
        label: "Guida ai paninari notturni · BeBorghi",
        url: "https://beborghi.com/milano-10-posti-dove-andare-a-mangiare-di-notte/",
      },
    ],
    note: "Orari riportati dalle guide pubbliche, non confermati direttamente dal gestore. Controlla prima di partire: festività e stagione possono modificarli.",
  },
  "24ed8218-ecf7-41f4-b453-69063a680032": {
    checkedAt: "22 ottobre 2026",
    sources: [
      {
        label: "Orari e indirizzo · TuttaMilano",
        url: "https://www.tuttamilano.it/poldo-street-food-milano-2264",
      },
      {
        label: "Scheda del chiosco · Restaurant Guru",
        url: "https://restaurantguru.it/Poldo-Milan",
      },
    ],
    note: "Le schede pubbliche indicano apertura 24 ore su 24; non è una conferma diretta del gestore. Il numero civico non è indicato: il punto sulla mappa corrisponde alla posizione pubblicata.",
  },
  "24ed8218-ecf7-41f4-b453-69063a680033": {
    checkedAt: "22 ottobre 2026",
    sources: [
      {
        label: "Orari e posizione · TuttaMilano",
        url: "https://www.tuttamilano.it/sergio-ed-efisio-chiosco-bar-milano-5741",
      },
      {
        label: "Pagina del gestore · Facebook",
        url: "https://www.facebook.com/p/Sergio-Efisio-100079028203092/",
      },
    ],
    note: "Qui è riportato il servizio serale. La scheda indica anche 11:30–15:00 dal martedì al venerdì. Il civico è riportato come 30 da TuttaMilano e 32 da altre guide: segui il punto del chiosco sulla mappa. Orari da ricontrollare prima di partire.",
  },
};
