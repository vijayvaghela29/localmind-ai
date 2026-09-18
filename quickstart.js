import {
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  completion,
  unloadModel,
} from "@qvac/sdk";

try {
  const modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    onProgress: (p) => {
      console.log(`Downloading: ${p.percentage.toFixed(0)}%`);
    },
  });

  const history = [
    {
      role: "user",
      content: "Explain artificial intelligence in simple words.",
    },
  ];

  const result = completion({
    modelId,
    history,
    stream: true,
  });

  for await (const token of result.tokenStream) {
    process.stdout.write(token);
  }

  await unloadModel({ modelId });
} catch (error) {
  console.error("Error:", error);
  process.exit(1);
}