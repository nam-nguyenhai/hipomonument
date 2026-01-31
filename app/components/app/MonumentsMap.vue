<script setup lang="ts">
import type { Monument } from '~/types/types'

const { t } = useI18n()
const localePath = useLocalePath()

const { monuments } = defineProps<{
  monuments: Monument[]
}>()

// Filter out monuments without coordinates
const validMonuments = monuments.filter(m => m.latitude !== null && m.longitude !== null)

// Calculate center of Prague (average of all coordinates)
const center = {
  lat: 50.0875,
  lng: 14.4213,
}

// Initial zoom (animates to 15 on load)
const zoom = ref(12)

// Map ref to access the Leaflet instance
const mapRef = ref<any>(null)
const markersAdded = ref(false)

// User's current location
const userLocation = ref<{ lat: number, lng: number } | null>(null)
const locationError = ref<string | null>(null)

// Filter state - all types selected by default
const selectedTypes = ref<Set<Monument['type']>>(new Set(Object.values(['Socha', 'Sportoviště', 'Budova', 'Freska', 'Reliéf'])))

// Mobile dropdown state
const isFilterOpen = ref(false)

// Toggle filter dropdown on mobile
function toggleFilterDropdown() {
  isFilterOpen.value = !isFilterOpen.value
}

// Filtered monuments based on selected types
const filteredMonuments = computed(() => {
  return validMonuments.filter(m => selectedTypes.value.has(m.type))
})

// Store all markers so we can update them when filter changes
const allMarkers = ref<any[]>([])

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
  updateMarkers()
}

// Update markers visibility based on filter
function updateMarkers() {
  allMarkers.value.forEach((markerData) => {
    const shouldShow = selectedTypes.value.has(markerData.type)

    if (shouldShow) {
      markerData.marker.setOpacity(1)
      // Re-enable interactions
      markerData.marker.getElement()?.classList.remove('pointer-events-none')
    }
    else {
      markerData.marker.setOpacity(0)
      // Disable interactions when hidden
      markerData.marker.getElement()?.classList.add('pointer-events-none')
    }
  })
}

// Icon colors for different monument types
function getMarkerColor(type: Monument['type']) {
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
function getIconSymbol(type: Monument['type']) {
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
function createCustomIcon(type: Monument['type']) {
  const color = getMarkerColor(type)
  const icon = getIconSymbol(type)
  return `
    <div style="
      width: 36px;
      height: 36px;
      background-color: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(-50%, -50%);
      font-size: 18px;
    ">
      ${icon}
    </div>
  `
}

// Setup marker clustering when map is ready
async function onMapReady() {
  if (markersAdded.value || !mapRef.value)
    return

  const leafletObject = mapRef.value.leafletObject
  if (!leafletObject) {
    console.error('Leaflet object not available')
    return
  }

  try {
    // Import Leaflet dynamically
    const L = (await import('leaflet')).default

    // Add all monuments as individual markers directly to the map
    for (const monument of validMonuments) {
      const customIcon = L.divIcon({
        html: createCustomIcon(monument.type),
        className: 'custom-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const latitude = Number(monument.latitude)
      const longitude = Number(monument.longitude)

      const marker = L.marker([latitude, longitude], {
        icon: customIcon,
      })

      // Popup with detailed information (shown on click)
      const monumentTypeName = t(`monument.types.${monument.type}`)
      let popupContent = `
        <div class="popup-content">
          <img src="${getStrapiMedia(monument.image?.url || '')}" alt="${monument.title.replace(/"/g, '&quot;')}" class="popup-image" />
          <h3 class="popup-title">${monument.title}</h3>
          <div class="popup-details">
            <p class="popup-text">
              <strong>${t('map.popup.type')}:</strong> ${monumentTypeName}
            </p>
            <p class="popup-text">
              <strong>${t('map.popup.address')}:</strong> ${monument.address || t('map.popup.addressNotAvailable')}
            </p>
      `

      if (monument.description) {
        popupContent += `
          <p class="popup-text">
            ${monument.description}
          </p>
        `
      }

      // Add distance if user location is available
      if (userLocation.value) {
        const distance = await calculateDistance(
          userLocation.value.lat,
          userLocation.value.lng,
          latitude,
          longitude,
        )
        popupContent += `
            <p class="popup-text popup-distance">
              <strong>${t('map.popup.distance')}:</strong> ${formatDistance(distance)}
            </p>
        `
      }

      popupContent += `
          </div>
          ${monument.slug ? `<a href="${localePath('index').replace(/\/$/, '')}/${monument.slug}" class="popup-button">${t('map.popup.viewDetail')} <svg class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></a>` : ''}
        </div>
      `

      marker.bindPopup(popupContent)

      // Add marker directly to the map
      marker.addTo(leafletObject)

      // Store marker for filtering
      allMarkers.value.push({
        marker,
        type: monument.type,
      })
    }

    markersAdded.value = true

    // Initial subtle zoom-in animation to create "discovering" effect
    try {
      leafletObject.setView([center.lat, center.lng], 12, { animate: false })
      setTimeout(() => {
        leafletObject.flyTo([center.lat, center.lng], 15, { duration: 1.4, easeLinearity: 0.25 })
      }, 250)
    }
    catch {}
  }
  catch (error) {
    console.error('Error setting up map:', error)
  }
}

// Calculate distance between two coordinates using Leaflet's built-in method
async function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): Promise<number> {
  const L = (await import('leaflet')).default
  const point1 = L.latLng(lat1, lng1)
  const point2 = L.latLng(lat2, lng2)
  const distanceInMeters = point1.distanceTo(point2)
  return distanceInMeters / 1000 // Convert to kilometers
}

// Format distance for display
function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`
  }
  else {
    return `${distance.toFixed(2)} km`
  }
}

// Get user's current location
function getUserLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        locationError.value = null
        // Re-render markers with distance information if they're already added
        if (markersAdded.value) {
          updateMarkersWithDistance()
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        locationError.value = t('map.location.errorGetting')
      },
    )
  }
  else {
    locationError.value = t('map.location.notAvailable')
  }
}

// Update markers with distance information
async function updateMarkersWithDistance() {
  if (!userLocation.value || !mapRef.value)
    return

  const leafletObject = mapRef.value.leafletObject
  if (!leafletObject)
    return

  try {
    // Update each marker's popup with distance
    for (const markerData of allMarkers.value) {
      const monument = validMonuments.find(m =>
        m.latitude === markerData.marker.getLatLng().lat
        && m.longitude === markerData.marker.getLatLng().lng,
      )

      if (monument && userLocation.value) {
        const distance = await calculateDistance(
          userLocation.value.lat,
          userLocation.value.lng,
          Number(monument.latitude),
          Number(monument.longitude),
        )

        const monumentTypeName = t(`monument.types.${monument.type}`)
        const popupContent = `
          <div class="popup-content">
            <img src="${getStrapiMedia(monument.image?.url || '')}" alt="${monument.title.replace(/"/g, '&quot;')}" class="popup-image" />
            <h3 class="popup-title">${monument.title}</h3>
            <div class="popup-details">
              <p class="popup-text">
                <strong>${t('map.popup.type')}:</strong> ${monumentTypeName}
              </p>
              <p class="popup-text">
                <strong>${t('map.popup.address')}:</strong> ${monument.address || t('map.popup.addressNotAvailable')}
              </p>
              ${monument.description ? `<p class="popup-text">${monument.description}</p>` : ''}
              <p class="popup-text popup-distance">
                <strong>${t('map.popup.distance')}:</strong> ${formatDistance(distance)}
              </p>
            </div>
            ${monument.slug ? `<a href="${localePath('index').replace(/\/$/, '')}/${monument.slug}" class="popup-button">${t('map.popup.viewDetail')} <svg class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></a>` : ''}
          </div>
        `

        markerData.marker.setPopupContent(popupContent)
      }
    }
  }
  catch (error) {
    console.error('Error updating markers with distance:', error)
  }
}

// Initialize geolocation on mount
onMounted(() => {
  getUserLocation()
})
</script>

<template>
  <ClientOnly>
    <div class="w-full h-[600px] md:h-[700px] relative z-10">
      <LMap
        ref="mapRef"
        :zoom="zoom"
        :center="[center.lat, center.lng]"
        :use-global-leaflet="false"
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
              v-for="type in ['Socha', 'Sportoviště', 'Budova', 'Freska', 'Reliéf']"
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
    <template #fallback>
      <div class="w-full h-[600px] md:h-[700px] bg-gray-200 flex items-center justify-center">
        <div class="text-center">
          <p class="text-xl text-gray-600">
            {{ t('map.loading') }}
          </p>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<style>
.leaflet-popup {
  max-width: 330px;
}

/* Custom marker styling */
.custom-marker {
  background: transparent !important;
  border: none !important;
  transition: opacity 0.2s ease;
}

/* Disable pointer events on hidden markers */
.pointer-events-none {
  pointer-events: none !important;
}

/* Filter chips */
.popup-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-gold);
  color: black !important;
  font-weight: 600;
  padding: 16px 32px;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-top: 8px;
  text-decoration: none;
}

.popup-button:hover {
  background-color: var(--color-gold-dark);
  transform: scale(1.05);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

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
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
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
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  outline: 2px solid rgba(212, 175, 55, 0.45);
}

.type-chip .label {
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Popup content responsive styling */
.popup-content {
  font-family: poppins, sans-serif;
  width: 260px !important;
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
  margin: 4px 0px !important;
}

.popup-distance {
  color: #2563eb;
}

.popup-link {
  display: block;
  margin-top: 12px;
  padding: 10px 16px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-tan) 100%);
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 1px solid var(--color-tan);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.popup-link:hover {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-tan) 100%);
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
