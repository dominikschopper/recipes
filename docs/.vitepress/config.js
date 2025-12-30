import { defineConfig } from 'vitepress'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Funktion zum automatischen Generieren der Rezepte-Liste
function getRecipesSidebar() {
  const recipesDir = join(__dirname, '../content')

  try {
    const items = readdirSync(recipesDir, { withFileTypes: true })
    const recipes = []

    for (const item of items) {
      if (item.isFile() && item.name.endsWith('.md') && item.name !== 'index.md') {
        // Datei ohne .md Extension
        const name = item.name.replace('.md', '')
        const filePath = join(recipesDir, item.name)

        // Read frontmatter to get title
        let title = name
        try {
          const fileContent = readFileSync(filePath, 'utf-8')
          const { data } = matter(fileContent)
          title = data.title || title
        } catch (err) {
          console.warn(`Could not read frontmatter from ${item.name}:`, err.message)
        }

        recipes.push({
          text: title,
          link: `/content/${name}`
        })
      } else if (item.isDirectory()) {
        // Ordner (für Rezepte mit Bildern)
        const indexPath = join(recipesDir, item.name, 'index.md')

        // Read frontmatter to get title
        let title = item.name
        try {
          const fileContent = readFileSync(indexPath, 'utf-8')
          const { data } = matter(fileContent)
          title = data.title || title
        } catch (err) {
          console.warn(`Could not read frontmatter from ${item.name}/index.md:`, err.message)
        }

        recipes.push({
          text: title,
          link: `/content/${item.name}/`
        })
      }
    }

    // Alphabetisch sortieren
    return recipes.sort((a, b) => a.text.localeCompare(b.text, 'de'))
  } catch (error) {
    console.warn('Could not read recipes directory:', error)
    return []
  }
}

const baseConfig = {
  title: 'Rezepte',
  description: 'Meine gesammelten Rezepte',

  // GitHub Pages base path (nur in Production)
  base: process.env.NODE_ENV === 'production' ? '/recipes/' : '/',
}

export default defineConfig({
  ...baseConfig,

  // Favicon
  head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: `${baseConfig.base}favicon.ico` }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${baseConfig.base}favicon-32x32.png` }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${baseConfig.base}favicon-16x16.png` }]
  ],

  // Theme-Konfiguration
  themeConfig: {
    // Navigation
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Recipes', link: '/content/' }
    ],

    // Sidebar - alphabetische Liste
    sidebar: {
      '/content/': [
        {
          text: 'Alle Rezepte',
          items: getRecipesSidebar()
        }
      ]
    },

    // Suche aktivieren (eingebaut in VitePress)
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Suchen',
                buttonAriaLabel: 'Suchen'
              },
              modal: {
                noResultsText: 'Keine Ergebnisse für',
                resetButtonTitle: 'Zurücksetzen',
                footer: {
                  selectText: 'Auswählen',
                  navigateText: 'Navigieren',
                  closeText: 'Schließen'
                }
              }
            }
          }
        }
      }
    },

    // Social Links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/dominikschopper/recipes' }
    ],

    // Footer
    footer: {
      message: 'Lizenziert unter <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="license noopener noreferrer">CC BY-SA 4.0</a>',
      copyright: 'Copyright © 2025 Dominik Schopper'
    },

  },

  // Markdown-Konfiguration
  markdown: {
    lineNumbers: false
  }
})
