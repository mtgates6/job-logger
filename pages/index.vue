<script setup>
import { ref, computed } from "vue";
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'; // Import the CSS in the component
// useFetch is Nuxt's built-in composable for making API calls
// it automatically fetches on page load and is SSR-friendly
const { data: jobs, refresh } = await useFetch("/api/jobs");
const emptyJob = {
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

const showAddModal = ref(false);
const addForm = ref({...emptyJob});
async function addJob() {
    const formatted = addForm.value.dateApplied ? new Date(addForm.value.dateApplied).toISOString().split("T")[0] : "";

    await $fetch("/api/jobs",{
        method: "POST",
        body: { ...addForm.value, dateApplied: formatted },
    });
    
    await refresh();
    addForm.value = {...emptyJob};
    showAddModal.value = false;
}

const editingJob = ref(null);
function openEdit(job) {
    editingJob.value= {...job};
}

async function saveEdit(){
    await updateJob(editingJob.value.id, editingJob.value);
    await refresh();
    editingJob.value = null;
}

async function deleteJob(id){
    await $fetch(`/api/jobs/${id}`, {
        method: "DELETE",
    });
    await refresh();
}

async function updateJob(id, updatedFields){
    await $fetch(`/api/jobs/${id}`, {
        method: "PUT",
        body: updatedFields,
    });
    const index = jobs.value.findIndex((j) => j.id === id);
    if (index !== -1) {
        jobs.value[index] = { ...jobs.value[index], ...updatedFields };
    }
    await refresh();
}

const expanded = ref({});
function toggleExpanded(id){
    expanded.value[id] = !expanded.value[id];
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
    <button @click="showAddModal = true" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
       +  {{ "Add Job" }}
    </button>
    <JobFormModal 
        :show="showAddModal"
        title="New Application"
        v-model="addForm"
        @submit="addJob"
        @close="showAddModal = false"
        />
    <JobFormModal 
        v-if="editingJob"
        :show="!!editingJob"
        title="Edit Application"
        v-model="editingJob"
        @submit="saveEdit"
        @close="editingJob = null"
        />
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
        <button @click="filterStatus=''; filterLocation=''" class="bg-red-700 rounded-lg px-4 py-2 text-sm text-white-400 hover:text-red-400 transition-colors">
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
    <div class="flex flex-col gap-3 w-full">
        <div v-for="job in filteredJobs" :key="job.id" class="bg-gray-900 rounded-xl px-6 py-4 flex items-center w-full">
            <!-- main -->
            <div class="flex items-center justify-between w-full">
                <!-- left -->
                <div class="flex items-center gap-3">
                    <button @click="toggleExpanded(job.id)" class="text-gray-400 hover:text-white text-sm transition-colors">{{ expanded[job.id] ? '▲' : '▼' }}</button>
                    <p class="font-semibold gap-40">{{ job.company }} — {{ job.role }} — {{ job.location }} — {{ job.salary }}</p>
                </div>
                <div class="flex items-center gap-4">
                    <select :value="job.status" @change="updateJob(job.id, { ...job, status: $event.target.value})"  class="text-xs font-medium px-3 py-1 rounded-full cursor-pointer outline-none"
                        :class="{
                            'bg-blue-900 text-blue-300': job.status === 'Applied',
                            'bg-purple-900 text-purple-300': job.status === 'Phone Screen',
                            'bg-indigo-900 text-indigo-300': job.status === 'Assessment',
                            'bg-yellow-900 text-yellow-300': job.status === 'Interview',
                            'bg-yellow-900 text-yellow-500': job.status === 'Technical Interview',
                            'bg-green-900 text-green-300': job.status === 'Offered',
                            'bg-red-900 text-red-300': job.status === 'Rejection',
                            'bg-gray-800 text-gray-400': job.status === 'Ghosted',
                        }">
                        <option>Applied</option>
                        <option>Phone Screen</option>
                        <option>Assessment</option>
                        <option>Interview</option>
                        <option>Technical Interview</option>
                        <option>Offered</option>
                        <option>Rejection</option>
                        <option>Ghosted</option>
                    </select>
                    <button @click="openEdit(job)" class="bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-2 text-white text-sm transition-colors">
                        Edit
                    </button>
                    <button @click="deleteJob(job.id)" class="bg-red-700 rounded-lg px-4 py-2 text-white-600 hover:text-red-400 text-sm transition-colors gap-40">Delete</button>
                </div>
            </div>
            <!-- expanded details — only visible when toggled -->
            <div v-if="expanded[job.id]" class="mt-4 pt-4 border-t border-gray-800 text-sm text-gray-400 flex flex-col gap-2">
                <p v-if="job.url">
                🔗 <a :href="job.url" target="_blank" class="text-blue-400 hover:underline">Job Posting</a>
                </p>
                <p v-if="job.description">📝 {{ job.description }}</p>
                <p v-if="job.notes">📝 {{ job.notes }}</p>
                <p v-if="!job.url && !job.description" class="italic">No additional details.</p>
            </div>
        </div>
    </div>
</div>
</template>