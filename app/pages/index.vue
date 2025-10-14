<script setup lang="ts">
const carouselSlides = [
  {
    image: '/background.jpeg',
    title: 'Lokalita 1',
    description: 'Objevte tuto fascinující historickou lokalitu s bohatou minulostí a jedinečnými památkami.',
  },
  {
    image: '/carousel-image-2.jpeg',
    title: 'Lokalita 2',
    description: 'Navštivte místo plné historických příběhů a architektonických skvostů.',
  },
  {
    image: '/carousel-image-3.jpeg',
    title: 'Lokalita 3',
    description: 'Prozkoumejte další z našich doporučených lokalit s unikátními památkami.',
  },
]
</script>

<template>
  <!-- Hero Section with Background Image -->
  <section class="relative h-[600px] md:h-[700px] w-full overflow-hidden">
    <img
      src="/background.jpeg"
      alt="Historické památky"
      class="absolute inset-0 w-full h-full object-cover object-center grayscale"
    >
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30" />

    <!-- Hero Text Content -->
    <div class="relative z-10 h-full flex items-center justify-center">
      <div class="container mx-auto px-8 text-center">
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
          Po stopách koní
        </h1>
        <p class="text-lg md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg mb-8">
          <strong>Po stopách koní</strong> je interaktivní webová mapa a průvodce po historických místech, která spojuje jeden motiv – koně. Objevuj sochy, památníky, jízdárny, závodiště i zapomenutá místa, kde kůň sehrál důležitou roli v dějinách i kultuře.
        </p>
        <a
          href="#map"
          class="inline-block bg-[#d4af37] hover:bg-[#c49d2e] text-black font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
        >
          Zobrazit mapu
        </a>
      </div>
    </div>
  </section>

  <!-- O projektu Section -->
  <section class="container mx-auto flex flex-col md:flex-row items-center justify-center px-8 py-16 gap-8">
    <div class="md:w-1/2">
      <h2 class="text-3xl md:text-4xl font-bold mb-4">
        O projektu
      </h2>
      <p class="text-lg leading-relaxed">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </div>
    <img src="/horse-1.webp" alt="O muzeu" class="md:w-1/3 grayscale rounded-xl shadow-lg">
  </section>

  <!-- Carousel Section - Recommended Locations -->
  <section class="bg-[#ece7df] py-16 from-gray-50 to-white">
    <AppCarousel :slides="carouselSlides" class="2xl:container 2xl:mx-auto" />
  </section>

  <!-- Last Section -->
  <section>
    <div class="container mx-auto flex flex-col md:flex-row-reverse items-center justify-center px-8 py-16 gap-8">
      <div class="md:w-1/2">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          Po stopách koně
        </h2>
        <p class="text-lg leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
      <img src="/horse-2.webp" alt="Expozice" class="md:w-1/3 grayscale rounded-xl shadow-lg">
    </div>
  </section>
</template>
