<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { monuments, MonumentType } from '~/data/monuments'

// Filter out monuments without coordinates
const validMonuments = monuments.filter(m => m.coordinates.lat !== null && m.coordinates.lng !== null)

// Calculate center of Prague (average of all coordinates)
const center = {
  lat: 50.0875,
  lng: 14.4213,
}

const zoom = 15

// Map ref to access the Leaflet instance
const mapRef = ref<any>(null)
const markersAdded = ref(false)

// User's current location
const userLocation = ref<{ lat: number, lng: number } | null>(null)
const locationError = ref<string | null>(null)

// Filter state - all types selected by default
const selectedTypes = ref<Set<MonumentType>>(new Set(Object.values(MonumentType)))

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
function toggleType(type: MonumentType) {
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
function getMarkerColor(type: MonumentType) {
  switch (type) {
    case MonumentType.SOCHA:
      return '#d4af37' // Gold
    case MonumentType.SPORTOVISTE:
      return '#8b4513' // Brown
    case MonumentType.BUDOVA:
      return '#4a5568' // Gray
    case MonumentType.FRESKA:
      return '#e53e3e' // Red
    case MonumentType.RELIEF:
      return '#38a169' // Green
    case MonumentType.MISTO:
      return '#3182ce' // Blue
    default:
      return '#718096' // Default gray
  }
}

// Get icon symbol for different monument types
function getIconSymbol(type: MonumentType) {
  switch (type) {
    case MonumentType.SOCHA:
      return '🐴' // Horse for statues
    case MonumentType.SPORTOVISTE:
      return '🏇' // Horse racing for sports venues
    case MonumentType.BUDOVA:
      return '🏛️' // Classical building
    case MonumentType.FRESKA:
      return '🎨' // Artist palette for frescoes
    case MonumentType.RELIEF:
      return '🗿' // Moai for reliefs
    case MonumentType.MISTO:
      return '📍' // Pin for places
    default:
      return '📌' // Default pin
  }
}

// Create custom icon HTML
function createCustomIcon(type: MonumentType) {
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
    validMonuments.forEach((monument) => {
      const customIcon = L.divIcon({
        html: createCustomIcon(monument.type),
        className: 'custom-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const marker = L.marker([monument.coordinates.lat!, monument.coordinates.lng!], {
        icon: customIcon,
      })

      // Tooltip (hint) that appears on hover
      const tooltipContent = `
        <div class="font-sans">
          <strong>${monument.shortName || monument.name}</strong>
        </div>
      `
      marker.bindTooltip(tooltipContent, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        className: 'custom-tooltip',
      })

      // Popup with detailed information
      let popupContent = `
        <div class="font-sans max-w-xs">
          <h3 class="font-bold text-lg mb-3">${monument.name}</h3>
          <div class="space-y-2">
            <p class="text-sm text-gray-600">
              <strong>Typ:</strong> ${monument.type}
            </p>
            <p class="text-sm text-gray-600">
              <strong>Místo:</strong> ${monument.address || 'Adresa není k dispozici'}
            </p>
      `

      // Add distance if user location is available
      if (userLocation.value) {
        const distance = calculateDistance(
          userLocation.value.lat,
          userLocation.value.lng,
          monument.coordinates.lat!,
          monument.coordinates.lng!,
        )
        popupContent += `
            <p class="text-sm text-blue-600">
              <strong>Vzdálenost:</strong> ${formatDistance(distance)}
            </p>
        `
      }

      popupContent += `
          </div>
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
    })

    markersAdded.value = true
  }
  catch (error) {
    console.error('Error setting up map:', error)
  }
}

// Get Czech label for monument type
function getTypeLabel(type: MonumentType): string {
  switch (type) {
    case MonumentType.SOCHA:
      return 'Socha'
    case MonumentType.SPORTOVISTE:
      return 'Sportoviště'
    case MonumentType.BUDOVA:
      return 'Budova'
    case MonumentType.FRESKA:
      return 'Freska'
    case MonumentType.RELIEF:
      return 'Reliéf'
    case MonumentType.MISTO:
      return 'Místo'
    default:
      return type
  }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a
    = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
      * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
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
        locationError.value = 'Nepodařilo se získat polohu'
      },
    )
  }
  else {
    locationError.value = 'Geolokace není dostupná'
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
    allMarkers.value.forEach((markerData) => {
      const monument = validMonuments.find(m =>
        m.coordinates.lat === markerData.marker.getLatLng().lat
        && m.coordinates.lng === markerData.marker.getLatLng().lng,
      )

      if (monument && userLocation.value) {
        const distance = calculateDistance(
          userLocation.value.lat,
          userLocation.value.lng,
          monument.coordinates.lat!,
          monument.coordinates.lng!,
        )

        const popupContent = `
          <div class="font-sans max-w-xs">
            <h3 class="font-bold text-lg mb-3">${monument.name}</h3>
            <div class="space-y-2">
              <p class="text-sm text-gray-600">
                <strong>Typ:</strong> ${monument.type}
              </p>
              <p class="text-sm text-gray-600">
                <strong>Místo:</strong> ${monument.address || 'Adresa není k dispozici'}
              </p>
              <p class="text-sm text-blue-600">
                <strong>Vzdálenost:</strong> ${formatDistance(distance)}
              </p>
            </div>
          </div>
        `

        markerData.marker.setPopupContent(popupContent)
      }
    })
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
    <div id="map" class="w-full h-[600px] md:h-[700px] relative">
      <LMap
        ref="mapRef"
        :zoom="zoom"
        :center="[center.lat, center.lng]"
        :use-global-leaflet="false"
        class="w-full h-full"
        @ready="onMapReady"
      >
        <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
      </LMap>

      <!-- Filter/Legend - Responsive: Dropdown on mobile, Fixed panel on desktop -->
      <div class="absolute bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto bg-white md:rounded-lg shadow-lg z-[1000] md:max-w-[200px]">
        <!-- Filter Header - Clickable on mobile -->
        <button
          class="w-full p-4 flex items-center justify-between md:cursor-default md:pointer-events-none"
          @click="toggleFilterDropdown"
        >
          <h4 class="font-bold text-sm">
            Filtr typů památek
          </h4>
          <svg
            class="w-5 h-5 transition-transform duration-200 md:hidden"
            :class="{ 'rotate-180': isFilterOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Filter Content - Collapsible on mobile, always visible on desktop -->
        <div
          class="overflow-hidden transition-all duration-300 md:block"
          :class="isFilterOpen ? 'max-h-96' : 'max-h-0 md:max-h-none'"
        >
          <div class="px-4 pb-4 space-y-2">
            <label
              v-for="type in Object.values(MonumentType)"
              :key="type"
              class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
            >
              <input
                type="checkbox"
                :checked="selectedTypes.has(type)"
                class="w-4 h-4 cursor-pointer"
                @change="toggleType(type)"
              >
              <div
                class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs flex-shrink-0"
                :style="{ backgroundColor: getMarkerColor(type) }"
              >
                {{ getIconSymbol(type) }}
              </div>
              <span class="text-xs">{{ getTypeLabel(type) }}</span>
            </label>
          </div>
          <div class="px-4 pb-4 pt-2 border-t text-xs text-gray-500 text-center">
            {{ filteredMonuments.length }} / {{ validMonuments.length }} památek
          </div>
        </div>
      </div>
    </div>
    <template #fallback>
      <div class="w-full h-[600px] md:h-[700px] bg-gray-200 flex items-center justify-center">
        <div class="text-center">
          <p class="text-xl text-gray-600">
            Načítání mapy...
          </p>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<style>
/* Ensure the map container is properly sized */
#map {
  position: relative;
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

/* Custom tooltip styling */
.custom-tooltip {
  background: rgba(0, 0, 0, 0.85) !important;
  border: none !important;
  border-radius: 6px !important;
  color: white !important;
  padding: 6px 12px !important;
  font-size: 13px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.custom-tooltip::before {
  border-top-color: rgba(0, 0, 0, 0.85) !important;
}
</style>
