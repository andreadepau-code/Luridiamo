<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Keep address geocoding in the browser-safe geocoding helper, using completed-address lookups, caching and serialized requests; preserve the existing OpenStreetMap map without adding credential-dependent services.
- Use a shared BrandLogo for page branding and mount OpeningLogo once in the root layout so navigation never restarts the introduction; respect reduced-motion preferences and automatically unmount the overlay.
- Load shared public places through a same-origin server function with a publishable, anonymous client and explicit public columns; this avoids browser-to-backend network failures without bypassing RLS. Photo signing failures must not block place reads.
- Reuse the place form for creation and editing; save validated public edits through a same-origin anonymous-RLS server function, leaving photo paths unchanged unless a replacement is uploaded.
- Store weekly schedules by opening weekday and evaluate overnight tails against the previous day; null schedules retain legacy daily hours so existing places remain compatible.
- Keep researched place provenance in a browser-safe catalog keyed by stable place IDs; insert records only once, preserve community edits, and label fallback imagery as illustrative.
