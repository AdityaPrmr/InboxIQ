import { Client } from "@elastic/elasticsearch";
import type { IndicesCreateRequest } from "@elastic/elasticsearch/lib/api/types";

export const elasticClient = new Client({
  node: process.env.ELASTIC_URL || "http://elasticsearch:9200",
});

async function waitForElastic() {
  let connected = false;
  while (!connected) {
    try {
      await elasticClient.ping();
      connected = true;
      console.log("✅ Elasticsearch is ready");
    } catch (err) {
      console.log("⏳ Waiting for Elasticsearch...");
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

export async function initElastic() {
  await waitForElastic();
  const indices: string[] = [
    "emails_parmar2100m21@gmail.com",
    "emails_adityaparmar2003official@gmail.com"
  ];

  for (let i: number = 0; i < indices.length; i++) {
    const indexName = indices[i];

    const exists = await elasticClient.indices.exists({ index: indexName });

    if (!exists) {
      const params: IndicesCreateRequest = {
        index: indexName,
        mappings: {
          properties: {
            subject: { type: "text" },
            sender: { type: "keyword" },
            body: { type: "text" },
            date: { type: "date" },
            folder: { type: "keyword" },
            account: { type: "keyword" }
          }
        }
      };

      await elasticClient.indices.create(params);
      console.log("✅ Elasticsearch index created: " + indexName);
    }
  }
}
