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

// Initial zoom (animates to 15 on load)
const zoom = ref(12)

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
      return '#d2a679' // Light brown/tan
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

// Get placeholder image per type (can be replaced with real thumbnails later)
function getTypeImage(_type: MonumentType): string {
  // Using a shared placeholder for now; swap by type when assets are ready
  return '/hero.webp'
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
        <div style="display: flex; align-items: center; gap: 8px; max-width: 240px; min-width: 150px;">
          <img src="${getTypeImage(monument.type)}" alt="" style="width: 48px; height: 36px; object-fit: cover; border-radius: 6px; filter: sepia(0.35) contrast(1.05); flex-shrink: 0;" />
          <strong style="flex: 1; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow-wrap: break-word; hyphens: auto; min-width: 0;">${monument.shortName || monument.name}</strong>
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
        <div class="popup-content">
          <img src="${getTypeImage(monument.type)}" alt="${monument.name.replace(/"/g, '&quot;')}" class="popup-image" />
          <h3 class="popup-title">${monument.name}</h3>
          <div class="popup-details">
            <p class="popup-text">
              <strong>Typ:</strong> ${monument.type}
            </p>
            <p class="popup-text">
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
            <p class="popup-text popup-distance">
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
            <div class="space-y-1">
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
      <div class="absolute bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto bg-[#f7f4ef]/90 backdrop-blur-sm md:rounded-xl border border-[#c4a46e]/60 shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-[1000] md:max-w-[260px] overflow-hidden">
        <!-- Filter Header - Clickable on all sizes -->
        <button
          class="w-full p-4 flex items-center justify-between"
          @click="toggleFilterDropdown"
        >
          <h4 class="font-bold text-sm text-[#2b1e17] flex items-center gap-2">
            <span class="inline-block w-5 h-5 rounded-full bg-[#d4af37]/30 border border-[#c4a46e]/60" />
            Filtr typů památek
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
              v-for="type in Object.values(MonumentType)"
              :key="type"
              class="type-chip"
              :class="{ 'is-active': selectedTypes.has(type) }"
              @click="toggleType(type)"
            >
              <span class="color-dot" :style="{ backgroundColor: getMarkerColor(type) }" />
              <span class="icon">{{ getIconSymbol(type) }}</span>
              <span class="label">{{ getTypeLabel(type) }}</span>
            </button>
          </div>
          <div class="px-4 pb-4 pt-2 border-t border-[#c4a46e]/40 text-xs text-[#2b1e17]/70 text-center">
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

/* Custom tooltip styling - parchment */
.custom-tooltip {
  background: #f7f4ef !important;
  border: 1px solid #c4a46e !important;
  border-radius: 8px !important;
  color: #2b1e17 !important;
  padding: 8px 12px !important;
  font-size: 13px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  white-space: normal !important;
}

.custom-tooltip::before {
  border-top-color: #f7f4ef !important;
}

/* Filter chips */
.type-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(247, 244, 239, 0.8);
  border: 1px solid rgba(196, 164, 110, 0.5);
  color: #2b1e17;
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
  background: #f7f4ef;
  border-color: #c4a46e;
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
</style>
