<script setup>
import { data as recipes } from './recipes.data.js'
import { ref, computed } from 'vue'

const selectedTag = ref(null)

// Extract all unique tags from recipes
const allTags = computed(() => {
  const tagSet = new Set()
  recipes.forEach(recipe => {
    recipe.tags.forEach(tag => tagSet.add(tag))
  })
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'de'))
})

// Filter recipes by selected tag
const filteredRecipes = computed(() => {
  if (!selectedTag.value) {
    return recipes
  }
  return recipes.filter(recipe => recipe.tags.includes(selectedTag.value))
})

// Select/deselect tag
function toggleTag(tag) {
  if (selectedTag.value === tag) {
    selectedTag.value = null
  } else {
    selectedTag.value = tag
  }
}

// Tag colors for visual variety
const tagColors = [
  'var(--vp-c-brand-1)',
  'var(--vp-c-brand-2)',
  'var(--vp-c-brand-3)'
]

function getTagColor(index) {
  return tagColors[index % tagColors.length]
}
</script>

<template>
  <div class="tags-layout">
    <div class="tags-header">
      <h1>Alle Rezepte</h1>
      <p class="recipe-count">{{ filteredRecipes.length }} Rezept{{ filteredRecipes.length !== 1 ? 'e' : '' }}</p>
    </div>

    <div class="tags-filter" v-if="allTags.length > 0">
      <h2 class="filter-title">
        <span>Nach Tags filtern</span>

        <button class="clear-filter" :class="{'hidden': !selectedTag}" @click="selectedTag = null">
          Filter zurücksetzen
        </button>
      </h2>

      <div class="tags-list">
        <button
          v-for="(tag, index) in allTags"
          :key="tag"
          class="tag-button"
          :class="{ active: selectedTag === tag }"
          :style="{ '--tag-color': getTagColor(index) }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <div class="recipes-grid">
      <a
        v-for="recipe in filteredRecipes"
        :key="recipe.url"
        :href="recipe.url"
        class="recipe-card"
      >
        <div class="recipe-header">
          <h3>{{ recipe.title }}</h3>
          <span v-if="recipe.hasImages" class="material-symbols-outlined has-images">
            image
          </span>
        </div>

        <p v-if="recipe.description" class="recipe-description">
          {{ recipe.description }}
        </p>

        <div v-if="recipe.portions || recipe.difficulty || recipe.time" class="recipe-meta">
          <span v-if="recipe.difficulty" class="meta-item">
            <span class="material-symbols-outlined">signal_cellular_alt</span>
            {{ recipe.difficulty }}
          </span>
          <span v-if="recipe.time" class="meta-item">
            <span class="material-symbols-outlined">schedule</span>
            {{ recipe.time }}
          </span>
          <span v-if="recipe.portions" class="meta-item">
            <span class="material-symbols-outlined">group</span>
            {{ recipe.portions }}
          </span>
        </div>

        <div v-if="recipe.tags.length > 0" class="recipe-tags">
          <span
            v-for="tag in recipe.tags.slice(0, 5)"
            :key="tag"
            class="recipe-tag"
          >
            {{ tag }}
          </span>
          <span v-if="recipe.tags.length > 5" class="more-tags">
            +{{ recipe.tags.length - 5 }}
          </span>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.hidden{
  visibility: hidden;
}
.tags-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.tags-header {
  margin-bottom: 2rem;
  text-align: center;
}

.tags-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.recipe-count {
  color: var(--vp-c-text-2);
  font-size: 1.1rem;
}

.tags-filter {
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.tags-filter h2 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag-button {
  padding: 0.5rem 1rem;
  border: 2px solid var(--tag-color);
  background: transparent;
  color: var(--vp-c-text-1);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-weight: 500;
}

.tag-button:hover {
  background: var(--tag-color);
  color: white;
  transform: translateY(-2px);
}

.tag-button.active {
  background: var(--tag-color);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.filter-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.clear-filter {
  padding: 0.5rem 1rem;
  border: none;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.clear-filter:hover {
  background: var(--vp-c-bg-elv);
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.recipe-card {
  display: block;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s;
}

.recipe-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.recipe-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.recipe-header h3 {
  font-size: 1.3rem;
  margin: 0;
  flex: 1;
}

.has-images {
  font-size: 1.2rem;
  color: var(--vp-c-brand-1);
  margin-left: 0.5rem;
}

.recipe-description {
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-item .material-symbols-outlined {
  font-size: 1rem;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.recipe-tag {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
}

.more-tags {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .tags-layout {
    padding: 1rem;
  }

  .tags-header h1 {
    font-size: 2rem;
  }

  .recipes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
