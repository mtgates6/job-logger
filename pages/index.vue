<script setup>
import { ref, computed } from "vue";
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'; // Import the CSS in the component
// useFetch is Nuxt's built-in composable for making API calls
// it automatically fetches on page load and is SSR-friendly
const { data: jobs, refresh } = await useFetch("/api/jobs");
const form = ref({
    company: "",
    role: "",
    status: "",
    dateApplied: "",
    url: "",
    location: "",
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

async function deleteJob(id){
    await $fetch(`/api/jobs/${id}`, {
        method: "DELETE",
    });
    await refresh();
}

const filterStatus = ref("");
const filterLocation = ref("");
const filteredJobs = computed(() => {
    return (jobs.value ?? []).filter((job) => {
        const matchesStatus = filterStatus.value ? job.status === filterStatus.value : true;
        const matchesLocation = filterLocation.value ? job.location === filterLocation.value : true;
        return matchesStatus && matchesLocation;
    });
});



</script>

<template>
  <div>
    <h1>Job Logger</h1>
    <button @click="showForm = !showForm">
        {{  showForm? "Cancel" : "Add Job" }}
    </button>
    <div>
        <select v-model="filterStatus">
            <option value="">All</option>
            <option>Applied</option>
            <option>Phone Screen</option>
            <option>Assessment</option>
            <option>Interview</option>
            <option>Technical Interview</option>
            <option>Offered</option>
            <option>Rejection</option>
            <option>Ghosted</option>
        </select>
        <select v-model="filterLocation">
            <option value="">All</option>
            <option>Remote</option>
            <option>On-site</option>
            <option>Hybrid</option>
        </select>
        <button @click="filterStatus=''; filterLocation=''">
            Clear
        </button>
    </div>
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
        <VueDatePicker style="display: inline-block; width: 80px" v-model="form.dateApplied" />
        <input v-model="form.url" placeholder="URL"/>
        <input v-model="form.location" placeholder="Location"/>
        <input v-model="form.salary" placeholder="Salary"/>
        <textarea v-model="form.description" placeholder="Description"/>
        <textarea v-model="form.notes" placeholder="Notes"/>
        <button @click="addJob">Add Job</button>
    </div>
    <!-- loop over each job and display its details -->
    <div v-for="job in filteredJobs" :key="job.id">
      <p>{{ job.company }} — {{ job.role }} | {{ job.status }} | {{ job.dateApplied }}
          <button @click="deleteJob(job.id)">Delete</button>
      </p>
    </div>
  </div>
</template>