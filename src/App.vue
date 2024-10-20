<script setup lang="ts">
import { ref } from "vue";
import * as FilesTool from "./utils";
import MarkdownPreview from "./MarkdownPreview.vue";

const outputTextReader = ref<ReadableStreamDefaultReader | null | undefined>();

async function createAssistantWriterStylized(): Promise<{
  error: number;
  reader: ReadableStreamDefaultReader<string> | null;
}> {
  return {
    error: 0,
    reader: FilesTool.createMockReader(),
  };
}

const handleCreateStylized = async () => {
  const { reader } = await createAssistantWriterStylized();

  if (reader) {
    outputTextReader.value = reader;
  }
};
</script>

<template>
  <button @click="handleCreateStylized">click here</button>
  <div class="p16">
    <MarkdownPreview
      w-full
      h-full
      overflow-y-auto
      v-model:reader="outputTextReader"
    />
  </div>
</template>

<style scoped></style>
