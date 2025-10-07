<script setup lang="ts">
const carouselSlides = [
  {
    image: '/horse-1.webp',
    title: 'Historický památník',
    description: 'Objevte bohatou historii našeho regionu prostřednictvím unikátních exponátů a příběhů, které formovaly naši kulturu.',
  },
  {
    image: '/horse-2.webp',
    title: 'Po stopách koně',
    description: 'Vydejte se s námi na fascinující cestu po stopách koní, kteří byli nedílnou součástí našich dějin a tradice.',
  },
  {
    image: '/horse-1.webp',
    title: 'Expozice a sbírky',
    description: 'Prozkoumejte naše rozsáhlé sbírky artefaktů, které dokumentují život a zvyky našich předků od středověku až po moderní dobu.',
  },
]
</script>

<template>
  <!-- Carousel Section -->
  <section class="bg-gradient-to-b from-gray-50 to-white">
    <AppCarousel :slides="carouselSlides" />
  </section>

  <section class="container mx-auto flex flex-col md:flex-row items-center px-8 py-16 gap-8">
    <div class="md:w-1/2">
      <h3 class="text-3xl font-serif mb-4">
        O projektu
      </h3>
      <p class="leading-relaxed">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </div>
    <img src="/horse-1.webp" alt="O muzeu" class="md:w-1/3 grayscale rounded-xl shadow-lg">
  </section>

  <!-- Image + Text -->
  <section class="bg-[#ece7df]">
    <div class="container mx-auto flex flex-col md:flex-row-reverse items-center px-8 py-16 gap-8">
      <div class="md:w-1/2">
        <h3 class="text-3xl font-serif mb-4">
          Po stopách koně
        </h3>
        <p class="leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
      <img src="/horse-2.webp" alt="Expozice" class="md:w-1/3 grayscale rounded-xl shadow-lg">
    </div>
  </section>
</template>
