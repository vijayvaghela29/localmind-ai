import {
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  completion,
  unloadModel,
} from "@qvac/sdk";

console.log("StudyMate starting...");
console.log("Loading local AI model...");

let modelId;

try {
  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
  });

  console.log("Model loaded successfully!");

  const result = completion({
    modelId,
    history: [
      {
        role: "user",
        content: "Explain photosynthesis in simple words.",
      },
    ],
    stream: true,
  });

  console.log("\nAI Answer:\n");

  for await (const token of result.tokenStream) {
    process.stdout.write(token);
  }

  console.log("\n");
} catch (error) {
  console.error("Error:", error);
} finally {
  if (modelId) {
    await unloadModel({ modelId });
  }
}