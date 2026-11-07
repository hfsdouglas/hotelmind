#!/usr/bin/env node

/**
 * Helper script for sync-agent-instructions skill.
 * Detects modified CLAUDE.md files via git status/diff and maps them to
 * potentially affected Antigravity rules, skills, and agents.
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT_DIR = process.cwd()

const SOURCE_TARGET_MAP = {
  'CLAUDE.md': {
    rules: ['architecture.md', 'coding-standards.md', 'git-commits.md'],
    skills: ['crud-development', 'speckit'],
    agents: ['code-reviewer.md', 'software-project-specialist.md'],
  },
  'packages/api/CLAUDE.md': {
    rules: ['architecture.md', 'database.md', 'multi-tenancy.md', 'testing.md'],
    skills: ['api-development', 'database-management', 'crud-development'],
    agents: [
      'fullstack-specialist.md',
      'code-reviewer.md',
      'software-project-specialist.md',
    ],
  },
  'packages/admin/CLAUDE.md': {
    rules: ['architecture.md', 'multi-tenancy.md', 'testing.md'],
    skills: ['frontend-development', 'crud-development'],
    agents: [
      'fullstack-specialist.md',
      'code-reviewer.md',
      'software-project-specialist.md',
    ],
  },
  'packages/web/CLAUDE.md': {
    rules: ['architecture.md', 'multi-tenancy.md', 'testing.md'],
    skills: ['frontend-development', 'crud-development'],
    agents: [
      'fullstack-specialist.md',
      'code-reviewer.md',
      'software-project-specialist.md',
    ],
  },
}

function getChangedFiles() {
  const changed = new Set()

  try {
    const statusOutput = execSync('git status --porcelain', {
      encoding: 'utf-8',
    })
    const lines = statusOutput.split('\n')
    for (const line of lines) {
      if (!line) continue
      const filePath = line.slice(3).trim()
      if (filePath in SOURCE_TARGET_MAP) {
        changed.add(filePath)
      }
    }
  } catch (_err) {
    // Git not available or not in a git repo
  }

  return Array.from(changed)
}

function getDiffForFile(filePath) {
  try {
    return execSync(`git diff HEAD -- "${filePath}"`, { encoding: 'utf-8' })
  } catch {
    try {
      return execSync(`git diff -- "${filePath}"`, { encoding: 'utf-8' })
    } catch {
      return ''
    }
  }
}

function main() {
  const args = process.argv.slice(2)
  let filesToAnalyze = []

  if (args.length > 0) {
    filesToAnalyze = args.filter(f => f in SOURCE_TARGET_MAP)
  } else {
    filesToAnalyze = getChangedFiles()
  }

  // If no files changed via git, check all known CLAUDE.md files existence
  const allKnown = Object.keys(SOURCE_TARGET_MAP).filter(f =>
    fs.existsSync(path.join(ROOT_DIR, f))
  )

  const report = {
    analyzed_sources: filesToAnalyze.length > 0 ? filesToAnalyze : allKnown,
    git_detected_changes: filesToAnalyze,
    affected_targets: {
      rules: new Set(),
      skills: new Set(),
      agents: new Set(),
    },
    diffs: {},
  }

  const sources = filesToAnalyze.length > 0 ? filesToAnalyze : allKnown
  for (const src of sources) {
    const mapping = SOURCE_TARGET_MAP[src]
    if (mapping) {
      for (const r of mapping.rules) report.affected_targets.rules.add(r)
      for (const s of mapping.skills) report.affected_targets.skills.add(s)
      for (const a of mapping.agents) report.affected_targets.agents.add(a)
    }

    if (filesToAnalyze.includes(src)) {
      report.diffs[src] = getDiffForFile(src)
    }
  }

  report.affected_targets.rules = Array.from(report.affected_targets.rules)
  report.affected_targets.skills = Array.from(report.affected_targets.skills)
  report.affected_targets.agents = Array.from(report.affected_targets.agents)

  console.log(JSON.stringify(report, null, 2))
}

main()
