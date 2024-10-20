type ContentResult = {
  content: string;
  done?: never;
};

type DoneResult = {
  done: true;
  content?: never;
};

type TransformResult = ContentResult | DoneResult;
type TransformFunction<T = any> = (
  rawValue: T,
  ...args: any
) => TransformResult;

/**
 * 用于处理不同类型流的值转换器
 */
export const transformStreamValue: Record<string, TransformFunction> = {
  standard(readValue: Uint8Array, textDecoder: TextDecoder) {
    let content = "";
    if (readValue instanceof Uint8Array) {
      content = textDecoder.decode(readValue, {
        stream: true,
      });
    } else {
      content = readValue;
    }
    return {
      content,
    };
  },
};

export const splitStream = () => {
  let buffer = "";
  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk;

      controller.enqueue(chunk);
      buffer = "";
    },
    flush(controller) {
      if (buffer.trim() !== "") {
        controller.enqueue(buffer);
      }
    },
  });
};
