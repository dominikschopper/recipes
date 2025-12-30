// VitePress Data Loader für Rezepte
import { createContentLoader } from 'vitepress'

export default createContentLoader('recipes/**/*.md', {
  includeSrc: false,
  render: false,
  excerpt: false,
  transform(rawData) {
    // Filter out the index page
    const recipes = rawData
      .filter(page => !page.url.endsWith('/recipes/'))
      .map(page => ({
        title: page.frontmatter.title || 'Untitled',
        url: page.url,
        description: page.frontmatter.description || '',
        tags: page.frontmatter.tags || [],
        hasImages: page.frontmatter.hasImages || false,
        portions: page.frontmatter.portions || '',
        difficulty: page.frontmatter.difficulty || '',
        time: page.frontmatter.time || ''
      }))

    // Sort alphabetically by title
    return recipes.sort((a, b) =>
      a.title.localeCompare(b.title, 'de')
    )
  }
})
