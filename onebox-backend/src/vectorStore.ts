import { Matrix } from "faiss-node";
import { cosineSimilarity } from "vector-utils"; // optional helper
import natural from "natural";

interface Reference {
  id: string;
  text: string;
}

export const references: Reference[] = [
  {
    id: "1",
    text: "I am aditya parmar",
  },
  {
    id: "2",
    text: "We offer AI-powered small project sollege level from vit.",
  },
];


const tfidf = new natural.TfIdf();
references.forEach(ref => tfidf.addDocument(ref.text));

export function getMostRelevantReference(query: string): string {
  let bestScore = -Infinity;
  let bestRef = references[0].text;

  references.forEach((ref, i) => {
    const score = tfidf.tfidf(query, i);
    if (score > bestScore) {
      bestScore = score;
      bestRef = ref.text;
    }
  });

  return bestRef;
}
