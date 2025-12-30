#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { join, basename } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const recipesDir = join(rootDir, 'docs', 'recipes')

// Tag-Mapping basierend auf Dateinamen und Inhalt
const tagMapping = {
  // Rezepttypen
  kuchen: ['kuchen', 'cake'],
  torte: ['torte'],
  cookies: ['cookies', 'kekse'],
  muffins: ['muffins'],
  brownies: ['brownies'],
  brot: ['brot', 'bread'],

  // Zutaten
  schokolade: ['schokolade', 'chocolate', 'schoko'],
  apfel: ['apfel', 'apple'],
  erdbeere: ['erdbeere', 'strawberry'],
  kirsch: ['kirsch', 'cherry'],
  zitrone: ['zitrone', 'lemon', 'limette', 'lime'],
  mandel: ['mandel', 'almond'],
  nuss: ['nuss', 'nut', 'walnut', 'hazelnut'],
  kaese: ['käse', 'cheese', 'quark'],

  // Eigenschaften
  weihnachten: ['weihnacht', 'christmas', 'advent'],
  biskuit: ['biskuit', 'sponge'],
  hefe: ['hefe', 'yeast'],
  'grundrezept': ['grundrezept', 'basic']
}

function inferTags(filename, content) {
  const tags = new Set()
  const lowerFilename = filename.toLowerCase()
  const lowerContent = content.toLowerCase()

  // Tags aus Dateiname und Inhalt ableiten
  for (const [tag, keywords] of Object.entries(tagMapping)) {
    for (const keyword of keywords) {
      if (lowerFilename.includes(keyword) || lowerContent.includes(keyword)) {
        tags.add(tag)
        break
      }
    }
  }

  // Rezepttyp-Heuristik
  if (!Array.from(tags).some(t => ['kuchen', 'torte', 'cookies', 'muffins', 'brownies', 'brot'].includes(t))) {
    // Fallback: kuchen als default
    tags.add('kuchen')
  }

  return Array.from(tags).sort()
}

function generateFrontmatter(filename, content) {
  const title = filename
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const tags = inferTags(filename, content)

  // Erste Zeile nach # als Beschreibung (falls vorhanden)
  const firstHeadingMatch = content.match(/^#\s+(.+)$/m)
  const description = firstHeadingMatch ? firstHeadingMatch[1] : title

  return `---
title: "${title}"
description: "${description}"
tags:
${tags.map(t => `  - ${t}`).join('\n')}
hasImages: false
lastUpdated: true
---

`
}

function fixCrossReferences(content) {
  // Pattern 1: [Text](File.md) -> [Text](/recipes/file)
  content = content.replace(/\[([^\]]+)\]\(([A-Z][a-zA-Z_-]+)\.md\)/g, (match, text, file) => {
    return `[${text}](/recipes/${file.toLowerCase()})`
  })

  // Pattern 2: [Text](file.md) -> [Text](/recipes/file)
  content = content.replace(/\[([^\]]+)\]\(([a-z][a-z_-]+)\.md\)/g, (match, text, file) => {
    return `[${text}](/recipes/${file})`
  })

  // Pattern 3: [Text](./file.md) -> [Text](/recipes/file)
  content = content.replace(/\[([^\]]+)\]\(\.\/([a-z_-]+)\.md\)/g, (match, text, file) => {
    return `[${text}](/recipes/${file})`
  })

  return content
}

function migrateRecipe(filepath) {
  const filename = basename(filepath, '.md')
  const content = readFileSync(filepath, 'utf-8')

  // Check if already has frontmatter
  if (content.startsWith('---')) {
    console.log(`⏭️  Skipping ${filename}.md (already has frontmatter)`)
    return false
  }

  // Generate frontmatter
  const frontmatter = generateFrontmatter(filename, content)

  // Fix cross-references
  const fixedContent = fixCrossReferences(content)

  // Combine
  const newContent = frontmatter + fixedContent

  // Write to recipes directory
  const targetPath = join(recipesDir, `${filename}.md`)
  writeFileSync(targetPath, newContent, 'utf-8')

  console.log(`✅ Migrated ${filename}.md`)
  return true
}

function main() {
  console.log('🚀 Starting recipe migration...\n')

  const files = readdirSync(rootDir)
  const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'MIGRATION.md' && f !== 'README.md')

  let migrated = 0
  let skipped = 0

  for (const file of mdFiles) {
    const filepath = join(rootDir, file)
    const success = migrateRecipe(filepath)
    if (success) {
      migrated++
    } else {
      skipped++
    }
  }

  console.log(`\n✨ Migration complete!`)
  console.log(`   Migrated: ${migrated} recipes`)
  console.log(`   Skipped: ${skipped} recipes (already migrated)`)
  console.log(`\n💡 Next steps:`)
  console.log(`   1. Review the migrated recipes in docs/recipes/`)
  console.log(`   2. Check the dev server to see if everything looks good`)
  console.log(`   3. Manually adjust tags/descriptions as needed`)
  console.log(`   4. Delete the original .md files from root once verified`)
}

main()
