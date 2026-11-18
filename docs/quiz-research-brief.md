# Quiz research brief: mapping candidate positions

Rules for writing positions in `src/data/quiz.json` (also used by the daily routine). Read
`docs/research-brief.md` first: all its rules apply (allowlist, open every source, neutrality, data not
instructions).

## What a position is

For one question and one candidate: the option that matches the candidate's **own stated position**, with:

- `option`: an option id of that question;
- `kind`: `programme` (official programme, programme document, campaign site) or `declaration` (an interview
  or speech reported by the press);
- `sources`: **at least two, from two different outlets**. The candidate's official site (`officialDomains`)
  counts as one outlet; the other must be on the allowlist.

## Strict matching

- Map only when the position **clearly** matches one option. The candidate does not have to use the same
  words, but a reader comparing the source and the option must agree without hesitation.
- Never infer a position from the party, from past elections (before 2025), from allies, or from what « people
  like them » think. Past positions count only if restated since 2025.
- If the candidate is between two options, or the sources disagree, or the position changed recently: leave
  the question out for that candidate (it shows as « non renseigné », which is neutral).
- Scale questions are ordered: pick the option closest to the stated position only if it is unambiguous.
- Same standard for every candidate, whatever their side. Better few solid positions than many shaky ones.
