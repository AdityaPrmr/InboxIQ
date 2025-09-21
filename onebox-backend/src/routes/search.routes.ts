import { Router } from "express";
import { elasticClient } from "../config/elastic";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { query, folder, index } = req.query;

    const body: any = {
      query: {
        bool: {
          must: query
            ? [
                {
                  multi_match: {
                    query,
                    fields: ["subject", "body"],
                    fuzziness: "AUTO",
                  },
                },
              ]
            : [{ match_all: {} }],
          filter: [],
        },
      },
      sort: [{ date: { order: "desc" } }],
      size: 10,
    };

    if (folder) {
      body.query.bool.filter.push({ match: { folder } });
    }

    const result = await elasticClient.search({
      index: index,
      body,
    });

    res.json(result.hits.hits.map((hit: any) => hit._source));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
