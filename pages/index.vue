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

// today's date as YYYY-MM-DD string
const today = new Date().toISOString().split("T")[0];
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

// count how many jobs were applied today
const todayCount = computed(() => {
  return (jobs.value ?? []).filter((job) => job.dateApplied === today).length;
});
// goal is 5 applications per day
const dailyGoal = 5;

// percentage for the progress bar — cap at 100
const todayProgress = computed(() => {
  return Math.min((todayCount.value / dailyGoal) * 100, 100);
});

// build the last 7 days as YYYY-MM-DD strings
const last7Days = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
});

// for each of the last 7 days, count how many jobs were applied
const weekStreak = computed(() => {
  return last7Days.value.map((date) => ({
    date,
    count: (jobs.value ?? []).filter((job) => job.dateApplied === date).length,
    // a day is "complete" if they hit the goal
    complete: (jobs.value ?? []).filter((job) => job.dateApplied === date).length >= dailyGoal,
    // short label like "Mon", "Tue" etc.
    label: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
  }));
});

// streak = how many consecutive days ending today hit the goal
const currentStreak = computed(() => {
  let streak = 0;
  // iterate backwards from today
  for (let i = weekStreak.value.length - 1; i >= 0; i--) {
    if (weekStreak.value[i].complete) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
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
        <!-- daily goal + streak tracker -->
    <div class="bg-gray-900 rounded-xl px-6 py-5 mb-6">
        <div class="flex items-center justify-between mb-3">
            <div>
            <p class="text-sm font-medium text-gray-300">
                Today's Progress
                <span class="text-white font-bold ml-1">{{ todayCount }} / {{ dailyGoal }}</span>
            </p>
            <p class="text-xs text-gray-500 mt-0.5">
                {{ todayCount >= dailyGoal ? '🎉 Goal reached!' : `${dailyGoal - todayCount} more to go` }}
            </p>
            </div>
            <div class="text-right">
            <p class="text-sm font-medium text-gray-300">
                🔥 Streak
                <span class="text-white font-bold ml-1">{{ currentStreak }} day{{ currentStreak !== 1 ? 's' : '' }}</span>
            </p>
            </div>
        </div>

        <!-- progress bar -->
        <div class="w-full bg-gray-800 rounded-full h-2 mb-4">
            <div
            class="h-2 rounded-full transition-all duration-500"
            :class="todayCount >= dailyGoal ? 'bg-green-500' : 'bg-blue-500'"
            :style="{ width: todayProgress + '%' }"
            />
        </div>

        <!-- 7 day streak row -->
        <div class="flex justify-between gap-2">
            <div
            v-for="day in weekStreak"
            :key="day.date"
            class="flex-1 flex flex-col items-center gap-1"
            >
            <!-- dot — green if goal met, blue if partial, gray if nothing -->
            <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                :class="{
                'bg-green-500 text-white': day.complete,
                'bg-blue-900 text-blue-300': !day.complete && day.count > 0,
                'bg-gray-800 text-gray-600': day.count === 0,
                }"
            >
                {{ day.count }}
            </div>
            <!-- day label -->
            <p class="text-xs text-gray-500">{{ day.label }}</p>
            </div>
        </div>
        </div>
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
                    <select v-model="job.status" @change="updateJob(job.id, { ...job, status: $event.target.value})"  class="text-xs font-medium px-3 py-1 rounded-full cursor-pointer outline-none"
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