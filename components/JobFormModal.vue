<script setup>
// defineProps declares what data this component accepts from the parent
const props = defineProps({
  // the job object to edit — has all fields pre-filled
  modelValue: {
    type: Object,
    required: true,
  },
  // controls whether the modal is visible
  show: {
    type: Boolean,
    required: true,
  },
  // changes the title depending on add vs edit
  title: {
    type: String,
    default: "New Application",
  },
});

// defineEmits declares what events this component can send back to the parent
const emit = defineEmits(["update:modelValue", "submit", "close"]);

// when an input changes, emit the updated object back to the parent
// this is how v-model works on custom components
function update(field, value) {
  emit("update:modelValue", { ...props.modelValue, [field]: value });
}

watch(() => props.modelValue.dateApplied, (val) => {
  console.log("dateApplied in modal:", val, typeof val);
});
</script>

<template>
  <!-- backdrop — clicking outside closes the modal -->
  <div
    v-if="show"
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    @click.self="emit('close')"
  >
    <div class="bg-gray-900 rounded-xl p-8 w-full max-w-2xl flex flex-col gap-4">
      <h2 class="text-lg font-semibold">{{ title }}</h2>

      <!-- row 1 -->
      <div class="flex gap-4">
        <input
          :value="modelValue.company"
          @input="update('company', $event.target.value)"
          placeholder="Company"
          class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          :value="modelValue.role"
          @input="update('role', $event.target.value)"
          placeholder="Role"
          class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- row 2 -->
      <div class="flex gap-4">
        <input
          :value="modelValue.location"
          @input="update('location', $event.target.value)"
          placeholder="Location"
          class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          :value="modelValue.salary"
          @input="update('salary', $event.target.value)"
          placeholder="Salary"
          class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- row 3 -->
      <div class="flex gap-4">
        <input
          :value="modelValue.url"
          @input="update('url', $event.target.value)"
          placeholder="Job URL"
          class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          :value="modelValue.status"
          @change="update('status', $event.target.value)"
          class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Applied</option>
          <option>Phone Screen</option>
          <option>Assessment</option>
          <option>Interview</option>
          <option>Technical Interview</option>
          <option>Offered</option>
          <option>Rejection</option>
          <option>Ghosted</option>
        </select>
      </div>

      <!-- date picker -->
      <div>
        <VueDatePicker
          :model-value="modelValue.dateApplied instanceof Date ? modelValue.dateApplied : modelValue.dateApplied ? new Date(`${modelValue.dateApplied}T12:00:00`) : null"
          @update:model-value="update('dateApplied', $event)"
          dark
          :enable-time-picker="false"
          input-class-name="bg-gray-800 rounded-lg px-4 py-2 text-sm w-full"
        />    
      </div>

      <!-- description -->
      <textarea
        :value="modelValue.description"
        @input="update('description', $event.target.value)"
        placeholder="Description"
        rows="3"
        class="w-full bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      <!-- notes -->
      <textarea
        :value="modelValue.notes"
        @input="update('notes', $event.target.value)"
        placeholder="Notes"
        rows="3"
        class="w-full bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      <!-- actions -->
      <div class="flex justify-end gap-3 mt-2">
        <button
          @click="emit('close')"
          class="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          @click="emit('submit')"
          class="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>