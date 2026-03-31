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
  <div class="min-h-screen bg-gray-950 text-white p-8">
    <h1 class="text-3xl font-bold tracking-tight">Job Logger</h1>
    <button @click="showForm = !showForm" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        {{  showForm? "Cancel" : "Add Job" }}
    </button>
    <div class="flex gap-4 mb-6 justify-start">
        <select v-model="filterStatus" class="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none">
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
        <select v-model="filterLocation" class="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none">
            <option value="">All</option>
            <option>Remote</option>
            <option>On-site</option>
            <option>Hybrid</option>
        </select>
        <button @click="filterStatus=''; filterLocation=''" class="bg-red-700 rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Clear
        </button>
    </div>
    <div v-if="showForm" class="bg-gray-900 rounded-xl p-6 mb-8">
        <h2 class="text-lg font-semibold mb-4">New Application</h2>
        <div class="flex gap-4 mb-4">
            <input v-model="form.company" placeholder="Company" class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
            <input v-model="form.role" placeholder="Role" class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
            <select v-model="form.status" placeholder="Status" class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Status</option>
                <option>Applied</option>
                <option>Phone Screen</option>
                <option>Assessment</option>
                <option>Interview</option>
                <option>Technical Interview</option>
                <option>Offered</option>
                <option>Rejection</option>
                <option>Ghosted</option>
            </select>
            <div class="flex-1 px-1">
                <VueDatePicker v-model="form.dateApplied" 
                dark
                :enable-time-picker="false"
                input-class-name="bg-gray-800 rounded-lg px-4 py-2 text-sm w-full"
                />
            </div>
            <input v-model="form.url" placeholder="URL" class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
            <input v-model="form.location" placeholder="Location" class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
            <input v-model="form.salary" placeholder="Salary" class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
            <textarea v-model="form.description" placeholder="Description" class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
            <textarea v-model="form.notes" placeholder="Notes" class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
            <button @click="addJob" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">Add Job</button>
        </div>
    </div>
    <!-- loop over each job and display its details -->
    <div class="flex flex-col gap-3">
        <div v-for="job in filteredJobs" :key="job.id" class="bg-gray-900 rounded-xl px-6 py-4 flex items-center justify-between">
            <p class="font-semibold">{{ job.company }} — {{ job.role }} | {{ job.location }} | {{ job.salary }}</p>
            
             <!-- status badge -->
            <div class="flex items-center gap-4">
                <span
                    class="text-xs font-medium px-3 py-1 rounded-full"
                    :class="{
                    'bg-blue-900 text-blue-300': job.status === 'Applied',
                    'bg-yellow-900 text-yellow-300': job.status === 'Interview',
                    'bg-yellow-900 text-yellow-500': job.status === 'Technical Interview',
                    'bg-green-900 text-green-300': job.status === 'Offer',
                    'bg-red-900 text-red-300': job.status === 'Rejected',
                    }"
                    >
                    {{ job.status }}
                </span>
                <button @click="deleteJob(job.id)" class="text-gray-600 hover:text-red-400 text-sm transition-colors">Delete</button>
            </div>
        </div>
    </div>
</div>
</template>