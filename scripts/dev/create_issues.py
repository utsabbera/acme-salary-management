#!/usr/bin/env python3
"""
create_issues.py — Execute an issues.json plan by creating GitHub issues and linking them to the project.

Usage:
    python scripts/dev/create_issues.py --plan <path/to/issues.json>
    python scripts/dev/create_issues.py --plan <path/to/issues.json> --dry-run
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path


def run(cmd: list[str], dry_run: bool = False) -> str:
    display = " ".join(cmd)
    if dry_run:
        print(f"  [dry-run] {display}")
        return ""
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"ERROR: {display}", file=sys.stderr)
        print(result.stderr.strip(), file=sys.stderr)
        sys.exit(1)
    return result.stdout.strip()


def gh(*args: str, dry_run: bool = False) -> str:
    return run(["gh", *args], dry_run=dry_run)


def link_to_project(issue_url: str, project_number: int, owner: str, dry_run: bool) -> None:
    gh("project", "item-add", str(project_number), "--owner", owner, "--url", issue_url, dry_run=dry_run)


def repo_name() -> str:
    url = subprocess.run(["git", "remote", "get-url", "origin"], capture_output=True, text=True).stdout.strip()
    return url.rstrip(".git").rstrip("/").split("/")[-1]


def main() -> None:
    parser = argparse.ArgumentParser(description="Create GitHub issues from an issues.json plan.")
    parser.add_argument("--plan", required=True, help="Path to issues.json")
    parser.add_argument("--dry-run", action="store_true", help="Preview without making API calls")
    args = parser.parse_args()

    plan_path = Path(args.plan)
    if not plan_path.exists():
        print(f"ERROR: Plan file not found: {plan_path}", file=sys.stderr)
        sys.exit(1)

    with open(plan_path) as f:
        plan = json.load(f)

    dry_run: bool = args.dry_run
    github = plan["github"]
    project_number: int = github["project_number"]
    owner: str = github["owner"]
    epic_config: dict = plan["epic"]
    issues: list[dict] = plan["issues"]

    if dry_run:
        print("── DRY RUN ─────────────────────────────────────────────────")

    epic_number: int | None = epic_config.get("existing_number")

    if epic_number:
        print(f"\n▶ Using existing Epic #{epic_number}")
        epic_url = f"https://github.com/{owner}/{repo_name()}/issues/{epic_number}"
    else:
        print(f"\n▶ Creating Epic: {epic_config['title']}")
        epic_url = gh(
            "issue", "create",
            "--title", epic_config["title"],
            "--label", "epic",
            "--body", epic_config["body"],
            dry_run=dry_run,
        )
        if not dry_run:
            epic_number = int(epic_url.rstrip("/").split("/")[-1])
            print(f"  Created Epic #{epic_number}: {epic_url}")
        else:
            epic_number = 0

        link_to_project(epic_url or f"https://github.com/{owner}/issues/{epic_number}", project_number, owner, dry_run)
        print(f"  Linked to project #{project_number}")

    created: dict[str, int] = {}

    print(f"\n▶ Creating {len(issues)} issue(s)...")

    for issue in issues:
        title: str = issue["title"]
        labels: list[str] = issue.get("labels", ["feature"])
        body: str = issue["body"]
        blocked_by_titles: list[str] = issue.get("blocked_by_titles", [])

        blocked_args: list[str] = []
        for blocker_title in blocked_by_titles:
            blocker_num = created.get(blocker_title)
            if blocker_num:
                blocked_args += ["--blocked-by", str(blocker_num)]
            else:
                print(f"  ⚠ Could not resolve blocker '{blocker_title}' — skipping")

        label_args: list[str] = [arg for label in labels for arg in ("--label", label)]
        parent_args = ["--parent", str(epic_number)] if epic_number else []

        print(f"\n  ▸ {title}")

        issue_url = gh(
            "issue", "create",
            "--title", title,
            "--body", body,
            *label_args,
            *parent_args,
            *blocked_args,
            dry_run=dry_run,
        )

        if not dry_run:
            issue_number = int(issue_url.rstrip("/").split("/")[-1])
            created[title] = issue_number
            print(f"    Created #{issue_number}: {issue_url}")
            link_to_project(issue_url, project_number, owner, dry_run)
            print(f"    Linked to project #{project_number}")
        else:
            print(f"    Labels: {', '.join(labels)}")
            if blocked_by_titles:
                print(f"    Blocked by: {', '.join(blocked_by_titles)}")

    print("\n─────────────────────────────────────────────────")
    if dry_run:
        print(f"Dry run complete. Would create: 1 epic + {len(issues)} issue(s).")
    else:
        print(f"Done. Created: {len(created)} issue(s) under Epic #{epic_number}, linked to project #{project_number}.")


if __name__ == "__main__":
    main()
