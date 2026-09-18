
const http = require("http");
const fs = require("fs");
const path = require("path");

let qvac;
let modelId;

async function startAI() {
  qvac = await import("@qvac/sdk");

  modelId = await qvac.loadModel({
    modelSrc: qvac.LLAMA_3_2_1B_INST_Q4_0,
    onProgress: (progress) => {
      console.log("Model loading:", progress);
    }
  });

  console.log("QVAC AI ready!");
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    const filePath = path.join(__dirname, "public", "index.html");

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading website");
        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/html"
      });

      res.end(data);
    });

    return;
  }

  if (req.method === "POST" && req.url === "/ask") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const { question } = JSON.parse(body);

        const result = qvac.completion({
          modelId,
          history: [
            {
              role: "user",
              content: question
            }
          ],
          stream: true
        });

        let answer = "";

        for await (const token of result.tokenStream) {
          answer += token;
        }

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({ answer }));
      } catch (error) {
        console.error(error);

        res.writeHead(500, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          error: error.message
        }));
      }
    });

    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(3000, async () => {
  console.log("Website running at http://localhost:3000");
  await startAI();
});