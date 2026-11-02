import fs from 'node:fs'
import path from 'node:path'

function syncRules(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
      continue
    }

    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      syncRules(fullPath)
    } else if (entry.name === 'CLAUDE.md') {
      const agentsPath = path.join(dir, 'AGENTS.md')
      try {
        const stats = fs.lstatSync(agentsPath)
        if (stats.isSymbolicLink()) {
          // Already linked
          continue
        }
      } catch {
        // Does not exist, create symlink
        fs.symlinkSync('CLAUDE.md', agentsPath)
        console.log(`Linked: ${path.relative(process.cwd(), agentsPath)} -> CLAUDE.md`)
      }
    }
  }
}

syncRules(process.cwd())
