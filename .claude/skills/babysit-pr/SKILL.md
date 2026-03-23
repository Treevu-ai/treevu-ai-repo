# Babysit PR Skill

## Overview
Monitor pull requests by checking CI/CD status, identifying failing tests, suggesting fixes, resolving merge conflicts, and nudging reviewers. Use this skill to actively manage a PR until it's ready to merge.

## When to Use
- Waiting for CI to pass on a PR
- PR has failing tests or checks that need investigation
- PR has merge conflicts to resolve
- PR needs reviewer attention or has review feedback to address
- Used with `/loop` to periodically check PR status

## Core Commands

### Check PR Status
```bash
# View PR details and CI status
gh pr view <PR_NUMBER> --json number,title,state,statusCheckRollup,mergeable,mergeStateStatus,reviews,commits

# Check CI checks specifically
gh pr checks <PR_NUMBER>

# View recent commits on the PR branch
gh pr view <PR_NUMBER> --json headRefName | jq -r '.headRefName' | xargs -I{} git log origin/{}..HEAD --oneline 2>/dev/null || \
  gh api repos/:owner/:repo/commits?sha=$(gh pr view <PR_NUMBER> --json headRefName -q .headRefName) --jq '.[0:5][] | .commit.message'
```

### Check for Merge Conflicts
```bash
gh pr view <PR_NUMBER> --json mergeable,mergeStateStatus -q '{mergeable: .mergeable, status: .mergeStateStatus}'
```

### View CI Failures
```bash
# Get failed checks with links
gh pr checks <PR_NUMBER> --json name,state,detailsUrl | jq '.[] | select(.state == "FAILURE" or .state == "ERROR")'

# View workflow run logs for failed job
gh run list --branch $(gh pr view <PR_NUMBER> --json headRefName -q .headRefName) --limit 5
gh run view <RUN_ID> --log-failed
```

### Check Reviews
```bash
gh pr view <PR_NUMBER> --json reviews --jq '.reviews[] | {author: .author.login, state: .state, body: .body}'
```

## Monitoring Loop

When babysitting a PR, check in this order:

1. **Is PR still open?**
   ```bash
   gh pr view <PR_NUMBER> --json state -q .state
   # If "MERGED" or "CLOSED" → done
   ```

2. **Are all checks passing?**
   ```bash
   gh pr checks <PR_NUMBER>
   # Look for FAIL/ERROR states
   ```

3. **Are there merge conflicts?**
   ```bash
   gh pr view <PR_NUMBER> --json mergeable -q .mergeable
   # "CONFLICTING" → needs resolution
   ```

4. **Are there blocking review requests?**
   ```bash
   gh pr view <PR_NUMBER> --json reviewDecision -q .reviewDecision
   # "CHANGES_REQUESTED" → address feedback
   ```

5. **Is it ready to merge?**
   ```bash
   gh pr view <PR_NUMBER> --json mergeable,reviewDecision,statusCheckRollup \
     -q 'if .mergeable == "MERGEABLE" and .reviewDecision == "APPROVED" then "READY TO MERGE" else "NOT READY" end'
   ```

## Fixing Common CI Failures

### Failed Linting
```bash
# Check what linter is used
cat package.json | jq '.scripts | keys'
# Run locally to see errors
npm run lint 2>&1 | head -50
# Auto-fix if possible
npm run lint -- --fix
```

### Failed Tests
```bash
# View test output from CI logs
gh run view <RUN_ID> --log-failed | grep -A 20 "FAIL\|Error\|●"

# Run tests locally matching the failing pattern
npm test -- --testPathPattern="<failing-test-file>" 2>&1 | tail -50
```

### Failed Type Checks
```bash
npx tsc --noEmit 2>&1 | head -30
```

### Build Failures
```bash
gh run view <RUN_ID> --log-failed | grep -B 5 "error\|Error" | head -50
```

## Resolving Merge Conflicts

```bash
# 1. Fetch latest base branch
git fetch origin main

# 2. Check out the PR branch
gh pr checkout <PR_NUMBER>

# 3. Merge/rebase onto base
git merge origin/main
# OR
git rebase origin/main

# 4. Identify conflicting files
git status | grep "both modified"

# 5. For each conflicting file, review and resolve
git diff --diff-filter=U  # Show conflict markers

# 6. After resolving
git add <resolved-files>
git commit -m "chore: resolve merge conflicts with main"
# OR if rebasing:
git rebase --continue

# 7. Push
git push origin HEAD --force-with-lease
```

## Nudging Reviewers

```bash
# See who was requested
gh pr view <PR_NUMBER> --json reviewRequests --jq '.reviewRequests[].login'

# Add a comment nudging reviewers
gh pr comment <PR_NUMBER> --body "Friendly ping — CI is green and this is ready for review! 🟢"

# Request review from specific person
gh pr edit <PR_NUMBER> --add-reviewer <username>
```

## Status Report Format

When reporting PR status, use this format:

```
PR #<N>: <title>
Status: <OPEN|MERGED|CLOSED>

CI Checks:
  ✅ test (2m 34s)
  ✅ lint (45s)
  ❌ build — FAILED (see: <url>)

Mergeable: <YES|NO - conflicts>
Reviews: <APPROVED|CHANGES_REQUESTED|PENDING>

Next action: <what needs to happen>
```

## Auto-merge When Ready

```bash
# Enable auto-merge (merges automatically when conditions are met)
gh pr merge <PR_NUMBER> --auto --squash

# Or merge immediately if ready
gh pr merge <PR_NUMBER> --squash --delete-branch
```

## Usage with /loop

To babysit a PR every 5 minutes:
```
/loop 5m check PR #123 status using babysit-pr
```

The skill will:
1. Check CI status
2. Report failures with actionable next steps
3. Notify when ready to merge or if action needed
