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

- All UI data access goes through src/lib/api.ts (mock data now, VITE_API_BASE_URL switches to a real backend) so the backend team can swap in without UI changes.

- Then & Now, saved items and chat sessions live in src/lib/api.ts with browser-storage fallbacks so a backend can replace them without UI changes.
