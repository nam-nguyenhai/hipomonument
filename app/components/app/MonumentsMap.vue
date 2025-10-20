<script setup lang="ts">
import { ref } from 'vue'
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
          </div>
        </div>
      `

      marker.bindPopup(popupContent)

      // Add marker directly to the map
      marker.addTo(leafletObject)
    })

    markersAdded.value = true
  }
  catch (error) {
    console.error('Error setting up map:', error)
  }
}
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

      <!-- Legend -->
      <div class="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
        <h4 class="font-bold text-sm mb-3">
          Legenda
        </h4>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs"
              :style="{ backgroundColor: getMarkerColor(MonumentType.SOCHA) }"
            >
              {{ getIconSymbol(MonumentType.SOCHA) }}
            </div>
            <span class="text-xs">Socha</span>
          </div>
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs"
              :style="{ backgroundColor: getMarkerColor(MonumentType.BUDOVA) }"
            >
              {{ getIconSymbol(MonumentType.BUDOVA) }}
            </div>
            <span class="text-xs">Budova</span>
          </div>
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs"
              :style="{ backgroundColor: getMarkerColor(MonumentType.SPORTOVISTE) }"
            >
              {{ getIconSymbol(MonumentType.SPORTOVISTE) }}
            </div>
            <span class="text-xs">Sportoviště</span>
          </div>
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs"
              :style="{ backgroundColor: getMarkerColor(MonumentType.FRESKA) }"
            >
              {{ getIconSymbol(MonumentType.FRESKA) }}
            </div>
            <span class="text-xs">Freska</span>
          </div>
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs"
              :style="{ backgroundColor: getMarkerColor(MonumentType.RELIEF) }"
            >
              {{ getIconSymbol(MonumentType.RELIEF) }}
            </div>
            <span class="text-xs">Reliéf</span>
          </div>
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs"
              :style="{ backgroundColor: getMarkerColor(MonumentType.MISTO) }"
            >
              {{ getIconSymbol(MonumentType.MISTO) }}
            </div>
            <span class="text-xs">Místo</span>
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
