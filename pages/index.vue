<script setup>
// useFetch is Nuxt's built-in composable for making API calls
// it automatically fetches on page load and is SSR-friendly
const { data: jobs, refresh } = await useFetch("/api/jobs");
</script>

<template>
  <div>
    <h1>Job Logger</h1>

    <!-- loop over each job and display its details -->
    <div v-for="job in jobs" :key="job.id">
      <p>{{ job.company }} — {{ job.role }}</p>
      <p>{{ job.status }} | {{ job.dateApplied }}</p>
    </div>
  </div>
</template>