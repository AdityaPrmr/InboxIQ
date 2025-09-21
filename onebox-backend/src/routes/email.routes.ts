import { Router } from "express";
import { elasticClient } from "../config/elastic";


const router = Router();

router.post("/all", async (req, res) => {
  try {
        const { index } = req.body;
        if (!index) {
          return res.status(400).json({ error: "Missing 'index' in request body" });
        }
      const result = await elasticClient.search({
        index: index,
        size: 1000
        ,sort: [
          { "date": { order: "desc" } } 
        ]
      });
      res.json(result.hits.hits.map((hit: any) => hit._source));
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: String(err) });
    }
  }
});

export default router;
