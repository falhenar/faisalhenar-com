#!/usr/bin/env python3
"""
check-nl-mirrors.py -- flag Dutch mirror pages that have drifted from
the English page they translate.

WHAT THIS DOES NOT DO
  It does not translate anything, and it does not diff text content.
  The Dutch pages (practice/*-nl.html) are edited adaptations, not
  mechanical translations -- they drop, reword, and re-link things on
  purpose. A tool that tried to auto-port text would either mistranslate
  or silently reintroduce content FH deliberately left out.

WHAT IT DOES
  It tracks, per English/Dutch pair, the last commit SHA the Dutch
  mirror was brought up to date with (practice/data/nl-mirrors.json).
  It then checks whether the English source has any commits since that
  SHA. If it does, the pair is stale: something changed on the English
  page that may need porting to the Dutch one, and nobody has confirmed
  either way.

  This is a reminder, not a translator. A stale result can be a false
  alarm (e.g. a typo fix that doesn't apply in Dutch) -- the point is
  that a human looks and decides, instead of drift going unnoticed.

AFTER YOU PORT CHANGES OVER
  Update that pair's "synced_to" in practice/data/nl-mirrors.json to the
  current HEAD sha, in the same commit as the Dutch-side edit. That is
  what clears the staleness.

USAGE
  python3 tools/check-nl-mirrors.py            report findings, exit 1 if any
  python3 tools/check-nl-mirrors.py --diff     also show the diff for each
                                                stale pair's English file
"""

import argparse
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "practice" / "data" / "nl-mirrors.json"


def git(*args):
    result = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    return result.returncode, result.stdout.strip(), result.stderr.strip()


def load_manifest():
    if not MANIFEST.exists():
        print(f"error: manifest not found at {MANIFEST}", file=sys.stderr)
        sys.exit(2)
    with MANIFEST.open(encoding="utf-8") as f:
        data = json.load(f)
    return data.get("pairs", [])


def check_pair(pair, show_diff):
    source = pair["source"]
    mirror = pair["mirror"]
    synced_to = pair["synced_to"]

    if not (ROOT / source).exists():
        return f"  ! source file missing: {source}"
    if not (ROOT / mirror).exists():
        return f"  ! mirror file missing: {mirror}"

    rc, _, err = git("cat-file", "-e", synced_to)
    if rc != 0:
        return f"  ! synced_to sha {synced_to} not found in this repo ({err})"

    rc, log, _ = git(
        "log", "--oneline", f"{synced_to}..HEAD", "--", source
    )
    if rc != 0:
        return f"  ! git log failed for {source}"

    if not log:
        return None  # up to date

    lines = [
        f"STALE  {source} -> {mirror}",
        f"       commits on {source} since last sync ({synced_to[:7]}):",
    ]
    for line in log.splitlines():
        lines.append(f"         {line}")

    if show_diff:
        _, diff, _ = git("diff", synced_to, "HEAD", "--", source)
        if diff:
            lines.append("       diff:")
            for line in diff.splitlines():
                lines.append(f"         {line}")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--diff", action="store_true",
        help="show the git diff for each stale pair's English source"
    )
    args = parser.parse_args()

    pairs = load_manifest()
    if not pairs:
        print("No mirror pairs listed in the manifest.")
        return 0

    stale_reports = []
    problems = []

    for pair in pairs:
        result = check_pair(pair, args.diff)
        if result is None:
            continue
        if result.startswith("STALE"):
            stale_reports.append(result)
        else:
            problems.append(result)

    if problems:
        print("Problems checking mirror pairs:")
        for p in problems:
            print(p)
        print()

    if stale_reports:
        print(f"{len(stale_reports)} of {len(pairs)} Dutch mirror(s) may be out of date:\n")
        for r in stale_reports:
            print(r)
            print()
        print(
            "Review each English change above. Port to the Dutch page what\n"
            "applies, then update that pair's \"synced_to\" in\n"
            f"{MANIFEST.relative_to(ROOT)} to the current HEAD sha, in the\n"
            "same commit as the Dutch-side edit."
        )
        return 1

    if problems:
        return 2

    print(f"All {len(pairs)} Dutch mirror(s) are in sync with their English source.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
