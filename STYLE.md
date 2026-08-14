# Writing style for faisalhenar.com

Read this before editing any copy in this repo.

(Repo-root `CLAUDE.md` is gitignored here, so this file carries the rule
instead. It is committed, which means a session working through the GitHub
web editor sees it too.)

## Punctuation

**No em dashes (—) in visible copy.** Not in body text, headings, page
titles, meta descriptions, alt text, link text, button labels, or any
string a renderer puts on the page. This applies to the character itself,
to the horizontal bar (―), and to the HTML spellings `&mdash;`, `&#8212;`
and `&#x2014;`.

Use instead, depending on what the sentence is doing:

| Instead of a dash | Use | Example |
| --- | --- | --- |
| joining two related statements | full stop, two sentences | `It is quiet here. That is the point.` |
| introducing an explanation or a list | colon | `Three things matter: light, patience, distance.` |
| a parenthetical aside | commas | `The hall, empty by then, held the sound.` |
| separating parts of a page title | ` · ` | `Reading · Practice · Faisal Henar` |

Prefer rewriting the sentence over swapping in the nearest punctuation
mark. A dash is usually a sign that two ideas were stapled together and
would read better apart.

### The exception: verbatim quotation

Quotations are not our copy. If a sutta translation or a printed book uses
an em dash, it stays. Repunctuating a quotation is misquoting it.

The exempt fields are:

- `text` and `source` in `practice/js/quotes-config.js`
- `text` in `practice/js/daily-sutta-config.js`
- `excerpt` in `practice/js/suttas-config.js`

Anything else in those files, including every `note`, is FH's own writing
and follows the rule.

To exempt one other line, put `no-em-dash: allow` in a comment on that
line. Use this sparingly and only for quoted material.

### Comments and code

Em dashes in code comments, CSS comments and HTML comments are fine. No
visitor reads them.

## How this is enforced

`tools/no-em-dash.py` scans the visible copy in every HTML and JS file.

```sh
python3 tools/no-em-dash.py          # report, exits 1 if anything is found
python3 tools/no-em-dash.py --fix    # repair what it can, report the rest
```

`.github/workflows/no-em-dash.yml` runs it on every push to `main`, commits
the repairs, and fails the run if anything is left that needs a decision.

The script is the backstop, not the plan. Write it correctly the first
time. Automatic repair picks a comma every time, and a comma is often not
the right mark.

## Wider writing style

Plain English. Short sentences. No marketing language, no filler adjectives,
no exaggerated claims. Fewer, better pieces over more of them. Write as if
speaking to an intelligent, interested reader.
