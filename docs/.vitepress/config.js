import { defineConfig } from 'vitepress'
import { readdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Funktion zum automatischen Generieren der Rezepte-Liste
function getRecipesSidebar() {
  const recipesDir = join(__dirname, '../recipes')

  try {
    const items = readdirSync(recipesDir, { withFileTypes: true })
    const recipes = []

    for (const item of items) {
      if (item.isFile() && item.name.endsWith('.md') && item.name !== 'index.md') {
        // Datei ohne .md Extension
        const name = item.name.replace('.md', '')
        const title = name
          .replace(/_/g, ' ')
          .replace(/-/g, ' ')
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')

        recipes.push({
          text: title,
          link: `/recipes/${name}`
        })
      } else if (item.isDirectory()) {
        // Ordner (für Rezepte mit Bildern)
        const title = item.name
          .replace(/_/g, ' ')
          .replace(/-/g, ' ')
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')

        recipes.push({
          text: title,
          link: `/recipes/${item.name}/`
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

export default defineConfig({
  title: 'Rezepte',
  description: 'Persönliche Rezeptsammlung',

  // GitHub Pages base path (nur in Production)
  base: process.env.NODE_ENV === 'production' ? '/recipes/' : '/',

  // Theme-Konfiguration
  themeConfig: {
    // Navigation
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Recipes', link: '/recipes/' }
    ],

    // Sidebar - alphabetische Liste
    sidebar: {
      '/recipes/': [
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
      message: 'Persönliche Rezeptsammlung'
    },

    // Disable prev/next links at bottom of pages
    docFooter: false
  },

  // Markdown-Konfiguration
  markdown: {
    lineNumbers: false
  }
})
