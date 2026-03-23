# Changelog Generator Skill

## Overview
Generate well-structured changelogs from git commit history following the Keep a Changelog format and Semantic Versioning (semver). Analyzes git log output, categorizes commits by type, and produces clean markdown changelogs.

## When to Use
- Before releasing a new version
- When asked to generate or update CHANGELOG.md
- Summarizing changes between versions for PRs or release notes

## Changelog Format

Follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.2.0] - 2026-03-23

### Added
- New feature description

### Changed
- Updated behavior description

### Fixed
- Bug fix description

### Removed
- Removed feature description

### Security
- Security fix description

### Deprecated
- Deprecated feature description
```

## Commit Categorization

### Conventional Commits → Changelog Section Mapping
```
feat:     → Added
fix:      → Fixed
perf:     → Changed
refactor: → Changed
docs:     → (omit unless significant)
style:    → (omit)
test:     → (omit)
chore:    → (omit unless dependencies)
build:    → (omit unless breaking)
ci:       → (omit)
BREAKING: → separate "Breaking Changes" section at top
```

### Git Commands to Analyze History

```bash
# Get commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%H|%s|%an|%ad" --date=short

# Get all tags sorted by version
git tag --sort=-version:refname

# Get commits between two tags
git log v1.1.0..v1.2.0 --pretty=format:"%H|%s|%an|%ad" --date=short

# Get commits with full body (for breaking changes)
git log v1.1.0..HEAD --pretty=format:"%H%n%s%n%b%n---"

# Check if CHANGELOG.md exists
test -f CHANGELOG.md && echo "exists" || echo "new"
```

## Generation Process

### Step 1: Determine Scope
```bash
# Find latest tag
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

# If no tags exist, use all commits
if [ -z "$LATEST_TAG" ]; then
  RANGE="HEAD"
else
  RANGE="${LATEST_TAG}..HEAD"
fi
```

### Step 2: Collect and Categorize Commits
Parse commit messages matching patterns:
- `^feat(\(.+\))?!?:` → Added (or Breaking if `!`)
- `^fix(\(.+\))?:` → Fixed
- `^perf(\(.+\))?:` → Changed (Performance)
- `^refactor(\(.+\))?:` → Changed
- `^deps(\(.+\))?:|^chore\(deps\):` → Dependencies section
- `BREAKING CHANGE:` in body → Breaking Changes

### Step 3: Determine Version Bump
```
Breaking changes (!) → MAJOR bump (1.x.x → 2.0.0)
New features (feat)  → MINOR bump (1.1.x → 1.2.0)
Bug fixes only       → PATCH bump (1.1.1 → 1.1.2)
```

### Step 4: Format Output

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Breaking Changes ⚠️
- feat!: description (scope) — only if breaking

### Added
- Feature description (scope if relevant) (#PR if available)

### Changed
- Change description

### Fixed
- Fix description

### Dependencies
- Updated package-name from X.Y.Z to A.B.C
```

## Script Template

```bash
#!/bin/bash
# Generate changelog entries from git log

LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
RANGE="${LATEST_TAG:+$LATEST_TAG..}HEAD"
TODAY=$(date +%Y-%m-%d)

declare -A sections
sections[added]=""
sections[changed]=""
sections[fixed]=""
sections[removed]=""
sections[security]=""
sections[breaking]=""

while IFS='|' read -r hash subject author date; do
  # Extract type and scope
  if [[ $subject =~ ^([a-z]+)(\(([^)]+)\))?(!)?:\ (.+)$ ]]; then
    type="${BASH_REMATCH[1]}"
    scope="${BASH_REMATCH[3]}"
    breaking="${BASH_REMATCH[4]}"
    message="${BASH_REMATCH[5]}"

    entry="- ${message}$([ -n "$scope" ] && echo " ($scope)")"

    case "$type" in
      feat)
        [ -n "$breaking" ] && sections[breaking]+="$entry\n" || sections[added]+="$entry\n" ;;
      fix)      sections[fixed]+="$entry\n" ;;
      perf|refactor) sections[changed]+="$entry\n" ;;
      security) sections[security]+="$entry\n" ;;
    esac
  fi
done < <(git log "$RANGE" --pretty=format:"%H|%s|%an|%ad" --date=short)

# Print formatted sections
echo "## [Unreleased] - $TODAY"
[ -n "${sections[breaking]}" ] && echo -e "\n### Breaking Changes\n${sections[breaking]}"
[ -n "${sections[added]}" ]    && echo -e "\n### Added\n${sections[added]}"
[ -n "${sections[changed]}" ]  && echo -e "\n### Changed\n${sections[changed]}"
[ -n "${sections[fixed]}" ]    && echo -e "\n### Fixed\n${sections[fixed]}"
[ -n "${sections[security]}" ] && echo -e "\n### Security\n${sections[security]}"
```

## Handling Edge Cases

### Non-conventional commits
For commits without conventional format (e.g., "Fix bug in auth"), use heuristics:
- Contains "fix", "bug", "patch", "resolve" → Fixed
- Contains "add", "new", "implement", "feat" → Added
- Contains "update", "change", "refactor", "improve" → Changed
- Contains "remove", "delete", "drop" → Removed
- Otherwise → omit or put in Changed

### Merge commits
Skip merge commits: filter out subjects starting with "Merge ".

### Updating existing CHANGELOG.md
Insert new version section after `## [Unreleased]` or at the top after the header.

## Output Example

```markdown
## [1.3.0] - 2026-03-23

### Added
- User authentication via OAuth2 (auth)
- Dark mode toggle in settings panel
- Export to PDF functionality

### Changed
- Improved search performance by 40% (search)
- Updated dependency axios from 1.4.0 to 1.6.0

### Fixed
- Login redirect loop on token expiry (auth)
- Incorrect date formatting in reports (reports)

### Security
- Patched XSS vulnerability in markdown renderer
```
