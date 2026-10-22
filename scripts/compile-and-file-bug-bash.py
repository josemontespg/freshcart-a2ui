#!/usr/bin/env python3
"""Compiles and sequentially files A2UI v1.0 Bug Bash issues to google/A2UI.

Usage:
  python3 scripts/compile-and-file-bug-bash.py compile
  python3 scripts/compile-and-file-bug-bash.py file [--sleep 2.5] [--limit N]
"""

import argparse
import glob
import os
import re
import subprocess
import sys
import tempfile
import time

REPO_ROOT = "/usr/local/google/home/josemontesp/freshcart-a2ui"
SHARD_DIR = os.path.join(REPO_ROOT, "docs", "bug-bash-shards")
MASTER_DOC = os.path.join(REPO_ROOT, "docs", "A2UI_V1_BUG_BASH_ISSUES.md")
TARGET_GITHUB_REPO = "google/A2UI"
ISSUE_LABEL = "v1-bug-bash"

SHARD_ISSUE_PATTERN = re.compile(
    r"## \[(?P<id>ISSUE-\d+-\d+)\]\s*(?P<header_title>[^\n]+)\n"
    r"(?P<meta>.*?)"
    r"<!-- ISSUE_BODY_START -->\s*\n(?P<body>.*?)\n\s*<!-- ISSUE_BODY_END -->",
    re.DOTALL,
)


def parse_shards():
    files = sorted(glob.glob(os.path.join(SHARD_DIR, "*.md")))
    issues_by_id = {}
    ordered_ids = []

    for fpath in files:
        txt = open(fpath, encoding="utf-8").read()
        for m in SHARD_ISSUE_PATTERN.finditer(txt):
            iid = m.group("id").strip()
            meta = m.group("meta")
            body = m.group("body").strip()
            t_m = re.search(r"- \*\*Type\*\*:\s*`([^\n`]+)`", meta)
            fa_m = re.search(r"- \*\*Feature Area\*\*:\s*`([^\n`]+)`", meta)
            ti_m = re.search(r"- \*\*Title\*\*:\s*`(.*)`\s*$", meta, re.MULTILINE)
            itype = t_m.group(1).strip() if t_m else "Bug"
            farea = fa_m.group(1).strip() if fa_m else "A2UI v1.0"
            raw_title = (
                ti_m.group(1).strip() if ti_m else m.group("header_title").strip()
            )
            clean_title = raw_title.replace("`", "")
            issues_by_id[iid] = {
                "id": iid,
                "type": itype,
                "area": farea,
                "title": clean_title,
                "body": body,
                "status": "[ ] PENDING",
                "url": "_Not created yet_",
            }
            ordered_ids.append(iid)

    # Merge exact duplicate ISSUE-02-11 into ISSUE-01-03
    if "ISSUE-02-11" in issues_by_id and "ISSUE-01-03" in issues_by_id:
        issues_by_id["ISSUE-01-03"]["body"] += (
            "\n\n---\n\n### Additional Onboarding Evidence (`package.json#exports` Audit)\n\n"
            + issues_by_id["ISSUE-02-11"]["body"]
        )
        del issues_by_id["ISSUE-02-11"]
        ordered_ids.remove("ISSUE-02-11")

    # Merge exact duplicate ISSUE-10-09 into ISSUE-02-16
    if "ISSUE-10-09" in issues_by_id and "ISSUE-02-16" in issues_by_id:
        issues_by_id["ISSUE-02-16"]["body"] += (
            "\n\n---\n\n### Additional Adapter Inspection (`V1Point0Adapter.extractOperationsFromObject`)\n\n"
            + issues_by_id["ISSUE-10-09"]["body"]
        )
        del issues_by_id["ISSUE-10-09"]
        ordered_ids.remove("ISSUE-10-09")

    return ordered_ids, issues_by_id


def parse_existing_master():
    """Reads existing CREATED statuses/URLs from MASTER_DOC if present so compile/file is resumable."""
    status_map = {}
    if not os.path.exists(MASTER_DOC):
        return status_map
    txt = open(MASTER_DOC, encoding="utf-8").read()
    for m in SHARD_ISSUE_PATTERN.finditer(txt):
        iid = m.group("id").strip()
        meta = m.group("meta")
        st_m = re.search(r"- \*\*Status\*\*:\s*`([^`]+)`", meta)
        url_m = re.search(r"- \*\*GitHub Issue\*\*:\s*([^\n]+)", meta)
        if st_m and "CREATED" in st_m.group(1):
            status_map[iid] = {
                "status": st_m.group(1).strip(),
                "url": url_m.group(1).strip() if url_m else "_Created_",
            }
    return status_map


def render_master_doc(ordered_ids, issues_by_id):
    bugs_count = sum(1 for k in ordered_ids if issues_by_id[k]["type"] == "Bug")
    docs_count = sum(1 for k in ordered_ids if issues_by_id[k]["type"] != "Bug")
    created_count = sum(
        1 for k in ordered_ids if "CREATED" in issues_by_id[k]["status"]
    )

    out_lines = [
        "# A2UI v1.0 Bug Bash — Self-Contained GitHub Issues Specification & Tracker",
        "",
        f"- **Target Repository**: [`https://github.com/{TARGET_GITHUB_REPO}`](https://github.com/{TARGET_GITHUB_REPO}) (`commit e9dbcc3`)",
        f"- **GitHub Issue Label**: `{ISSUE_LABEL}`",
        f"- **Total Deduplicated Issues**: **{len(ordered_ids)}** (**{bugs_count} Bugs** + **{docs_count} Documentation Gaps**)",
        f"- **Filing Progress**: **{created_count} / {len(ordered_ids)} Created**",
        "",
        "---",
        "",
        "## Master Progress Tracker Table",
        "",
        "| # | Issue ID | Type | Feature Area | Title | Status | GitHub Issue |",
        "|---|---|---|---|---|---|---|",
    ]

    for idx, iid in enumerate(ordered_ids, 1):
        item = issues_by_id[iid]
        safe_title = item["title"].replace("|", "\\|")
        safe_area = item["area"].replace("|", "\\|")
        itype = item["type"]
        istatus = item["status"]
        iurl = item["url"]
        out_lines.append(
            f"| {idx} | `{iid}` | `{itype}` | {safe_area} | {safe_title} | `{istatus}` | {iurl} |"
        )

    out_lines.append("")
    out_lines.append("---")
    out_lines.append("")

    for iid in ordered_ids:
        item = issues_by_id[iid]
        ititle = item["title"]
        istatus = item["status"]
        iurl = item["url"]
        itype = item["type"]
        iarea = item["area"]
        ibody = item["body"]
        out_lines.extend(
            [
                f"## [{iid}] {ititle}",
                f"- **Status**: `{istatus}`",
                f"- **GitHub Issue**: {iurl}",
                f"- **Label**: `{ISSUE_LABEL}`",
                f"- **Type**: `{itype}`",
                f"- **Feature Area**: `{iarea}`",
                f"- **Title**: `{ititle}`",
                "",
                "<!-- ISSUE_BODY_START -->",
                ibody,
                "<!-- ISSUE_BODY_END -->",
                "",
                "---",
                "",
            ]
        )

    with open(MASTER_DOC, "w", encoding="utf-8") as f:
        f.write("\n".join(out_lines))


def cmd_compile():
    existing = parse_existing_master()
    ordered_ids, issues_by_id = parse_shards()
    for iid, state in existing.items():
        if iid in issues_by_id:
            issues_by_id[iid]["status"] = state["status"]
            issues_by_id[iid]["url"] = state["url"]
    render_master_doc(ordered_ids, issues_by_id)
    bugs_count = sum(1 for k in ordered_ids if issues_by_id[k]["type"] == "Bug")
    docs_count = sum(1 for k in ordered_ids if issues_by_id[k]["type"] != "Bug")
    print(
        f"Compiled {len(ordered_ids)} issues ({bugs_count} Bugs, {docs_count} Documentation Gaps) to {MASTER_DOC}"
    )


def cmd_file(sleep_sec: float, limit: int):
    existing = parse_existing_master()
    ordered_ids, issues_by_id = parse_shards()
    for iid, state in existing.items():
        if iid in issues_by_id:
            issues_by_id[iid]["status"] = state["status"]
            issues_by_id[iid]["url"] = state["url"]

    pending_ids = [
        iid for iid in ordered_ids if "CREATED" not in issues_by_id[iid]["status"]
    ]
    print(
        f"Found {len(pending_ids)} PENDING issues out of {len(ordered_ids)} total."
    )

    filed_this_run = 0
    for idx, iid in enumerate(pending_ids, 1):
        if limit > 0 and filed_this_run >= limit:
            break
        item = issues_by_id[iid]
        title = item["title"]
        body = item["body"]

        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".md", delete=False, encoding="utf-8"
        ) as tf:
            tf.write(body)
            tmp_path = tf.name

        try:
            attempt = 0
            issue_url = None
            while attempt < 3:
                attempt += 1
                proc = subprocess.run(
                    [
                        "gh",
                        "issue",
                        "create",
                        "--repo",
                        TARGET_GITHUB_REPO,
                        "--title",
                        title,
                        "--label",
                        ISSUE_LABEL,
                        "--body-file",
                        tmp_path,
                    ],
                    capture_output=True,
                    text=True,
                    timeout=45,
                )
                if proc.returncode == 0:
                    out_lines = [
                        line.strip()
                        for line in proc.stdout.splitlines()
                        if line.strip().startswith("https://github.com/")
                    ]
                    issue_url = out_lines[-1] if out_lines else proc.stdout.strip()
                    break
                else:
                    err_msg = proc.stderr.strip()
                    print(
                        f"  [Attempt {attempt}/3] Error creating {iid}: {err_msg}",
                        flush=True,
                    )
                    if "rate limit" in err_msg.lower() or "abuse" in err_msg.lower() or "secondary" in err_msg.lower():
                        wait_backoff = 30 * attempt
                        print(f"  Rate limit detected; sleeping {wait_backoff}s...", flush=True)
                        time.sleep(wait_backoff)
                    else:
                        time.sleep(5 * attempt)

            if not issue_url:
                print(
                    f"FAILED to create {iid} after 3 attempts. Progress saved in {MASTER_DOC}. Exiting.",
                    flush=True,
                )
                sys.exit(1)

            issue_num = issue_url.rstrip("/").split("/")[-1]
            issues_by_id[iid]["status"] = "[x] CREATED"
            issues_by_id[iid]["url"] = f"[#{issue_num}]({issue_url})"

            # Immediately persist updated MASTER_DOC on disk after each issue!
            render_master_doc(ordered_ids, issues_by_id)
            filed_this_run += 1
            total_created = sum(
                1 for k in ordered_ids if "CREATED" in issues_by_id[k]["status"]
            )
            print(
                f"[{total_created}/{len(ordered_ids)}] Created {iid} -> {issue_url}",
                flush=True,
            )

            if idx < len(pending_ids):
                time.sleep(sleep_sec)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    print(f"Completed run. Filed {filed_this_run} issues in this run.", flush=True)


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("compile")
    p_file = sub.add_parser("file")
    p_file.add_argument("--sleep", type=float, default=2.5)
    p_file.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    if args.cmd == "compile":
        cmd_compile()
    elif args.cmd == "file":
        cmd_file(args.sleep, args.limit)


if __name__ == "__main__":
    main()
