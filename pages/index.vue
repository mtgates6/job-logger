<script setup>
// useFetch is Nuxt's built-in composable for making API calls
// it automatically fetches on page load and is SSR-friendly
const { data: jobs, refresh } = await useFetch("/api/jobs");
const form = ref({
    company: "",
    role: "",
    status: "",
    dateApplied: "",
    url: "",
    lcoation: "",
    salary: "",
    description: "",
    notes: "",
});

const showForm = ref(false);

async function addJob() {
    await $fetch("/api/jobs",{
        method: "POST",
        body: form.value,
    });

    refresh();

    form.value = {
        company: "",
        role: "",
        status: "Applied",
        dateApplied: "",
        url: "",
        location: "",
        salary: "",
        description: "",
        notes: "",
    };
    showForm.value =false;
}
</script>

<template>
  <div>
    <h1>Job Logger</h1>
    <button @click="showForm = !showForm">
        {{  showForm? "Cancel" : "Add Job" }}
    </button>
    <div v-if="showForm">
        <h2>New Application</h2>

        <input v-model="form.company" placeholder="Company"/>
        <input v-model="form.role" placeholder="Role"/>
        <select v-model="form.status">
            <option>Applied</option>
            <option>Phone Screen</option>
            <option>Assessment</option>
            <option>Interview</option>
            <option>Technical Interview</option>
            <option>Offered</option>
            <option>Rejection</option>
            <option>Ghosted</option>
        </select>
        <input v-model="form.dateApplied" placeholder="Date Applied"/>
        <input v-model="form.url" placeholder="URL"/>
        <input v-model="form.location" placeholder="Location"/>
        <input v-model="form.salary" placeholder="Salary"/>
        <textarea v-model="form.description" placeholder="Description"/>
        <textarea v-model="form.notes" placeholder="Notes"/>
        <button @click="addJob">Add Job</button>
    </div>
    <!-- loop over each job and display its details -->
    <div v-for="job in jobs" :key="job.id">
      <p>{{ job.company }} — {{ job.role }} | {{ job.status }} | {{ job.dateApplied }}</p>
    </div>
  </div>
</template>