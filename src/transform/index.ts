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

export const parseJsonLikeData = (content) => {
  if (content.startsWith("data: ")) {
    const dataString = content.substring(6).trim();
    if (dataString === "[DONE]") {
      return {
        done: true,
      };
    }
    try {
      return JSON.parse(dataString);
    } catch (error) {
      console.error("JSON parsing error:", error);
    }
  }
  return null;
};

/**
 * 大模型映射列表
 */
export const LLMTypes = [
  {
    label: "模拟数据模型",
    modelName: "standard",
  },
] as const;

export type TransformStreamModelTypes = (typeof LLMTypes)[number]["modelName"];

/**
 * 用于处理不同类型流的值转换器
 */
export const transformStreamValue: Record<
  TransformStreamModelTypes,
  TransformFunction
> = {
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
