<script setup lang="ts">
import type { Monument } from '~/types/types'
import L from 'leaflet'
import 'leaflet.markercluster'

const { monuments } = defineProps<{
  monuments: Monument[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()

// Map ref for accessing leaflet object
const mapRef = ref<any>(null)
const mapReady = ref(false)

// Store the current marker cluster group for cleanup
let currentClusterGroup: any = null

// Filter out monuments without coordinates
const validMonuments = computed(() =>
  monuments.filter(m => m.latitude !== null && m.longitude !== null),
)

// Calculate center of Prague
const center = {
  lat: 50.0875,
  lng: 14.4213,
}

// Initial zoom
const zoom = ref(12)

// Filter state - all types selected by default
const selectedTypes = ref<Set<Monument['type']>>(new Set(['Socha', 'Sportoviště', 'Budova', 'Freska', 'Reliéf']))

// Mobile dropdown state
const isFilterOpen = ref(false)

// Toggle filter dropdown on mobile
function toggleFilterDropdown() {
  isFilterOpen.value = !isFilterOpen.value
}

// Filtered monuments based on selected types
const filteredMonuments = computed(() => {
  return validMonuments.value.filter(m => selectedTypes.value.has(m.type))
})

// Toggle a monument type filter
function toggleType(type: Monument['type']) {
  if (selectedTypes.value.has(type)) {
    selectedTypes.value.delete(type)
  }
  else {
    selectedTypes.value.add(type)
  }
  // Trigger reactivity
  selectedTypes.value = new Set(selectedTypes.value)
}

// Icon colors for different monument types
function getMarkerColor(type: Monument['type']): string {
  switch (type) {
    case 'Socha':
      return '#d4af37' // Gold
    case 'Sportoviště':
      return '#d2a679' // Light brown/tan
    case 'Budova':
      return '#4a5568' // Gray
    case 'Freska':
      return '#e53e3e' // Red
    case 'Reliéf':
      return '#38a169' // Green
    default:
      return '#718096' // Default gray
  }
}

// Get icon symbol for different monument types
function getIconSymbol(type: Monument['type']): string {
  switch (type) {
    case 'Socha':
      return '🐴' // Horse for statues
    case 'Sportoviště':
      return '🏇' // Horse racing for sports venues
    case 'Budova':
      return '🏛️' // Classical building
    case 'Freska':
      return '🎨' // Artist palette for frescoes
    case 'Reliéf':
      return '🗿' // Moai for reliefs
    default:
      return '📌' // Default pin
  }
}

// Create custom icon HTML
function createCustomIconHtml(type: Monument['type']): string {
  const color = getMarkerColor(type)
  const icon = getIconSymbol(type)
  return `
    <div class="marker-icon" style="
      width: 36px;
      height: 36px;
      background-color: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    ">
      ${icon}
    </div>
  `
}

// Get detail page URL for monument
function getDetailUrl(slug: string | undefined): string {
  if (!slug)
    return ''
  return `${localePath('index').replace(/\/$/, '')}/${slug}`
}

// Create popup HTML for a monument
function createPopupHtml(monument: Monument): string {
  const imageUrl = monument.image?.url ? getStrapiMedia(monument.image.url) : null
  const monumentTypeName = t(`monument.types.${monument.type}`)
  const typeLabel = t('map.popup.type')
  const addressLabel = t('map.popup.address')
  const addressNotAvailable = t('map.popup.addressNotAvailable')
  const viewDetailLabel = t('map.popup.viewDetail')

  let html = `<div class="popup-content">`

  if (imageUrl) {
    html += `<img src="${imageUrl}" alt="${monument.title.replace(/"/g, '&quot;')}" class="popup-image" />`
  }

  html += `
    <h3 class="popup-title">${monument.title}</h3>
    <div class="popup-details">
      <p class="popup-text"><strong>${typeLabel}:</strong> ${monumentTypeName}</p>
      <p class="popup-text"><strong>${addressLabel}:</strong> ${monument.address || addressNotAvailable}</p>
  `

  if (monument.description && !monument.description.includes('<')) {
    html += `<p class="popup-text">${monument.description}</p>`
  }

  html += `</div>`

  if (monument.slug) {
    const detailUrl = getDetailUrl(monument.slug)
    html += `
      <a href="${detailUrl}" class="popup-button">
        ${viewDetailLabel}
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </a>
    `
  }

  html += `</div>`
  return html
}

// Transform monuments to marker format for useLMarkerCluster
function createMarkersData(monumentsList: Monument[]) {
  // TODO: Remove deduplication after fix at BE
  // Deduplicate by coordinates to avoid duplicate markers at same location
  const seen = new Set<string>()
  const uniqueMonuments = monumentsList.filter((monument) => {
    const key = `${monument.latitude},${monument.longitude}`
    if (seen.has(key)) {
      console.warn(`Duplicate monument at coordinates ${key}:`, monument.title)
      return false
    }
    seen.add(key)
    return true
  })

  return uniqueMonuments.map(monument => ({
    lat: Number(monument.latitude),
    lng: Number(monument.longitude),
    name: monument.title,
    popup: createPopupHtml(monument),
    options: {
      icon: L.divIcon({
        html: createCustomIconHtml(monument.type),
        className: 'custom-marker-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      }),
    },
  }))
}

// Create or update marker cluster
async function updateCluster() {
  if (!mapReady.value || !mapRef.value?.leafletObject)
    return

  const leafletMap = mapRef.value.leafletObject

  // Remove existing cluster group if it exists
  if (currentClusterGroup) {
    leafletMap.removeLayer(currentClusterGroup)
    currentClusterGroup = null
  }

  // Create new cluster with filtered monuments
  const markersData = createMarkersData(filteredMonuments.value)

  const result = await useLMarkerCluster({
    leafletObject: leafletMap,
    markers: markersData,
    options: {
      disableClusteringAtZoom: 18, // Show individual markers at zoom 18+
      spiderfyOnMaxZoom: false, // Don't spiderfy at max zoom
      maxClusterRadius: 40, // Smaller cluster radius for less aggressive clustering
    },
  })

  currentClusterGroup = result.markerCluster
}

// When the map is ready
async function onMapReady() {
  mapReady.value = true
  await updateCluster()
}

// Watch for filter changes and update clusters
watch(selectedTypes, () => {
  updateCluster()
}, { deep: true })
</script>

<template>
  <div class="w-full h-[600px] md:h-[700px] relative z-10">
    <LMap
      ref="mapRef"
      :zoom="zoom"
      :center="[center.lat, center.lng]"
      :use-global-leaflet="true"
      class="w-full h-full"
      @ready="onMapReady"
    >
      <LTileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
        :max-zoom="19"
      />
    </LMap>

    <!-- Filter/Legend - Responsive parchment panel -->
    <div class="absolute bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto bg-cream/90 backdrop-blur-sm md:rounded-xl border border-tan/60 shadow-softer z-[1000] md:max-w-[260px] overflow-hidden">
      <!-- Filter Header - Clickable on all sizes -->
      <button
        class="w-full p-4 flex items-center justify-between"
        @click="toggleFilterDropdown"
      >
        <h4 class="font-bold text-sm text-brown-dark flex items-center gap-2">
          <span class="inline-block w-5 h-5 rounded-full bg-gold/30 border border-tan/60" />
          {{ t('map.filterTitle') }}
        </h4>
        <svg
          class="w-5 h-5 transition-transform duration-200"
          :class="{ 'rotate-180': isFilterOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Filter Content - Collapsible on mobile, toggle on desktop too -->
      <div
        class="overflow-hidden transition-all duration-300"
        :class="isFilterOpen ? 'max-h-96' : 'max-h-0'"
      >
        <div class="p-4 grid grid-cols-1 gap-2">
          <button
            v-for="type in (['Socha', 'Sportoviště', 'Budova', 'Freska', 'Reliéf'] as const)"
            :key="type"
            class="type-chip"
            :class="{ 'is-active': selectedTypes.has(type) }"
            @click="toggleType(type)"
          >
            <span class="color-dot" :style="{ backgroundColor: getMarkerColor(type) }" />
            <span class="icon">{{ getIconSymbol(type) }}</span>
            <span class="label">{{ t(`monument.types.${type}`) }}</span>
          </button>
        </div>
        <div class="px-4 pb-4 pt-2 border-t border-tan/40 text-xs text-brown-dark/70 text-center">
          {{ filteredMonuments.length }} / {{ validMonuments.length }} {{ t('map.monumentsCount') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.leaflet-popup {
  max-width: 330px;
}

/* Custom marker icon styling */
.custom-marker-icon {
  background: transparent !important;
  border: none !important;
}

.marker-icon {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.marker-icon:hover {
  transform: scale(1.1);
}

/* Cluster styling */
.marker-cluster-small,
.marker-cluster-medium,
.marker-cluster-large {
  background-color: rgba(212, 175, 55, 0.6) !important;
}

.marker-cluster-small div,
.marker-cluster-medium div,
.marker-cluster-large div {
  background-color: rgba(212, 175, 55, 0.9) !important;
  color: #1a1a1a !important;
  font-weight: 700 !important;
  font-family: poppins, sans-serif !important;
}

/* Filter chip styles */
.type-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(247, 244, 239, 0.8);
  border: 1px solid rgba(196, 164, 110, 0.5);
  color: var(--color-brown-dark);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.type-chip .color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.type-chip .icon {
  font-size: 14px;
}

.type-chip:hover {
  background: rgba(247, 244, 239, 1);
  transform: translateY(-1px);
  outline: 1px solid rgba(196, 164, 110, 0.6);
}

.type-chip.is-active {
  background: var(--color-cream);
  border-color: var(--color-tan);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  outline: 2px solid rgba(212, 175, 55, 0.45);
}

.type-chip .label {
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Popup content styling */
.popup-content {
  font-family: poppins, sans-serif;
  width: 260px;
}

.popup-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
  filter: sepia(0.4) contrast(1.1);
}

.popup-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
  line-height: 1.3;
}

.popup-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.popup-text {
  font-size: 13px;
  color: #4b5563;
  margin: 4px 0 !important;
}

.popup-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-gold);
  color: black !important;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-top: 12px;
  text-decoration: none;
}

.popup-button:hover {
  background-color: var(--color-gold-dark);
  transform: scale(1.02);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* MarkerCluster styles (inlined to avoid SSR issues) */
.marker-cluster-small,
.marker-cluster-medium,
.marker-cluster-large {
  background-color: rgba(212, 175, 55, 0.6);
  border-radius: 50%;
}

.marker-cluster-small div,
.marker-cluster-medium div,
.marker-cluster-large div {
  width: 30px;
  height: 30px;
  margin-left: 5px;
  margin-top: 5px;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  background-color: rgba(212, 175, 55, 0.9);
  color: #1a1a1a;
  font-weight: 700;
  font-family: poppins, sans-serif;
  line-height: 30px;
}

.marker-cluster {
  background-clip: padding-box;
}

.marker-cluster-small {
  width: 40px;
  height: 40px;
}

.marker-cluster-medium {
  width: 50px;
  height: 50px;
}

.marker-cluster-medium div {
  width: 40px;
  height: 40px;
  margin-left: 5px;
  margin-top: 5px;
  line-height: 40px;
}

.marker-cluster-large {
  width: 60px;
  height: 60px;
}

.marker-cluster-large div {
  width: 50px;
  height: 50px;
  margin-left: 5px;
  margin-top: 5px;
  line-height: 50px;
  font-size: 14px;
}
</style>
