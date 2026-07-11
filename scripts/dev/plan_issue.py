# /// script
# dependencies = [
#   "structlog",
# ]
# ///
import sys
import json
import re
import os
import subprocess
import structlog

structlog.configure(
    processors=[structlog.dev.ConsoleRenderer(colors=True)]
)

logger = structlog.get_logger()

def run_cmd(cmd, check=True, capture_output=True):
    return subprocess.run(cmd, check=check, text=True, capture_output=capture_output)

def fetch_issue_metadata(issue_num):
    logger.info("Fetching metadata", issue=issue_num)
    try:
        result = run_cmd(["gh", "issue", "view", issue_num, "--json", "title,state"])
        return json.loads(result.stdout)
    except subprocess.CalledProcessError:
        logger.error("Could not fetch issue. Does it exist?", issue=issue_num)
        sys.exit(1)

def trust_workspace(worktree_path):
    settings_path = os.path.expanduser("~/.gemini/antigravity-cli/settings.json")
    if not os.path.exists(settings_path):
        return
        
    abs_worktree_path = os.path.abspath(worktree_path)
    try:
        with open(settings_path, "r") as f:
            settings = json.load(f)
            
        trusted = settings.get("trustedWorkspaces", [])
        if abs_worktree_path not in trusted:
            logger.info("Auto-trusting workspace for agy", worktree=abs_worktree_path)
            trusted.append(abs_worktree_path)
            settings["trustedWorkspaces"] = trusted
            
            with open(settings_path, "w") as f:
                json.dump(settings, f, indent=2)
    except Exception as e:
        logger.error("Failed to auto-trust workspace", error=str(e))

def format_clean_title(raw_title):
    title = re.sub(r'^\[.*?\]\s*', '', raw_title).lower()
    title = re.sub(r'[^a-z0-9]+', ' ', title).strip()
    words = title.split()[:3]
    return '-'.join(words) or "issue"

def setup_worktree(issue_num, branch_name, worktree_name, worktree_path):
    trust_workspace(worktree_path)
    
    if os.path.exists(worktree_path):
        logger.info("Worktree already exists. Skipping creation.", worktree=worktree_name)
        return

    logger.info("Creating worktree", branch=branch_name, worktree=worktree_name)
    try:
        subprocess.run(
            ["make", "worktree", f"name={worktree_name}", f"branch={branch_name}", f"PORT_OFFSET={issue_num}"],
            check=True
        )
        logger.info("Installing dependencies in the background...")
        subprocess.Popen(
            ["make", "install"], 
            cwd=worktree_path, 
            stdout=subprocess.DEVNULL, 
            stderr=subprocess.DEVNULL
        )
    except subprocess.CalledProcessError:
        logger.error("Failed to create worktree.")
        sys.exit(1)

def orchestrate_tmux(issue_num, raw_title, state, worktree_path):
    session_name = os.path.basename(os.path.abspath(os.getcwd()))
    has_session = subprocess.run(["tmux", "has-session", "-t", session_name], capture_output=True).returncode == 0

    if not has_session:
        logger.info("Creating new tmux session", session=session_name)
        subprocess.run(["tmux", "new-session", "-d", "-s", session_name], check=True)

    tab_title = f"[{state}] #{issue_num} {raw_title}"[:40]

    logger.info("Spawning agy session in tmux...")
    subprocess.run(["tmux", "new-window", "-t", session_name, "-n", tab_title], check=True)
    subprocess.run(
        ["tmux", "send-keys", "-t", session_name, f"cd {worktree_path} && agy -i '/plan #{issue_num}'", "C-m"], 
        check=True
    )

    if os.environ.get("TMUX") is None:
        logger.info("Done! Attach with tmux", command=f"tmux -CC attach-session -t {session_name}")
    else:
        logger.info("Tab created successfully in your current session!")

def main():
    if len(sys.argv) < 2:
        logger.error("Issue number is required.")
        sys.exit(1)

    issue_num = sys.argv[1].strip()
    data = fetch_issue_metadata(issue_num)
    
    raw_title = data.get("title", "")
    state = data.get("state", "OPEN")
    clean_title = format_clean_title(raw_title)
    
    branch_name = f"issue-{issue_num}/{clean_title}"
    worktree_name = f"issue-{issue_num}-{clean_title}"
    worktree_path = f"_worktrees/{worktree_name}"

    setup_worktree(issue_num, branch_name, worktree_name, worktree_path)
    orchestrate_tmux(issue_num, raw_title, state, worktree_path)

if __name__ == "__main__":
    main()
