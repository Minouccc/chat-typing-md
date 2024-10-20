import { mockEventStreamText } from "./data";
import * as TransformUtils from "./transform";

export const createMockReader = (
  delay = 5
): ReadableStreamDefaultReader<string> => {
  const chunkSize = 10;
  const originData = mockEventStreamText;
  console.log(originData, "o");
  const contentData = originData.repeat(1);
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(contentData);
  let offset = 0;

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (offset < encodedData.length) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        const end = Math.min(offset + chunkSize, encodedData.length); // 确保不超出边界
        controller.enqueue(encodedData.subarray(offset, end));
        offset = end;
      } else {
        controller.close();
      }
    },
  });

  return stream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(TransformUtils.splitStream())
    .getReader();
};
