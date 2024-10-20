<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import MarkdownInstance from "./plugins/markdown";
import { transformStreamValue } from "./transform";

interface Props {
  reader: ReadableStreamDefaultReader<Uint8Array> | null | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  reader: null,
});

let typingAnimationFrame: number | null = null;
const displayText = ref("");
const textBuffer = ref("");
const renderedMarkdown = computed(() => {
  return MarkdownInstance.render(displayText.value);
});

const renderedContent = computed(() => {
  return `${renderedMarkdown.value}`;
});
const readIsOver = ref(false);

/**
 * 读取 buffer 内容，逐字追加到 displayText
 */
const runReadBuffer = (readCallback = () => {}, endCallback = () => {}) => {
  if (textBuffer.value.length > 0) {
    const nextChunk = textBuffer.value.substring(0, 20);
    displayText.value += nextChunk;
    textBuffer.value = textBuffer.value.substring(20);
    readCallback();
  } else {
    endCallback();
  }
};
const showText = () => {
  // 若 reader 还没结束，则保持打字行为
  if (!readIsOver.value) {
    runReadBuffer();
    typingAnimationFrame = requestAnimationFrame(showText);
  } else {
    // 读取剩余的 buffer
    runReadBuffer(
      () => {
        typingAnimationFrame = requestAnimationFrame(showText);
      },
      () => {
        alert("finished!!!");
        nextTick(() => {
          readIsOver.value = false;
        });
        typingAnimationFrame = null;
      }
    );
  }
};

const readTextStream = async () => {
  if (!props.reader) return;

  const textDecoder = new TextDecoder("utf-8");

  while (true) {
    try {
      if (!props.reader) {
        readIsOver.value = true;
        break;
      }
      const { value, done } = await props.reader.read();
      if (!props.reader) {
        readIsOver.value = true;
        break;
      }
      if (done) {
        readIsOver.value = true;
        break;
      }

      const transformer = transformStreamValue["standard"];
      if (!transformer) {
        break;
      }

      const stream = transformer.call(transformStreamValue, value, textDecoder);
      if (stream.done) {
        readIsOver.value = true;
        break;
      }
      textBuffer.value += stream.content;

      if (typingAnimationFrame === null) {
        showText();
      }
    } catch (error) {
      readIsOver.value = true;
      break;
    } finally {
    }
  }
};

watch(
  () => props.reader,
  () => {
    if (props.reader) {
      readTextStream();
    }
  },
  {
    immediate: true,
    deep: true,
  }
);
</script>

<template>
  <div v-html="renderedContent"></div>
</template>

<style scoped></style>
