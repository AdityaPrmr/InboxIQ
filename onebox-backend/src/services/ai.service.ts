import axios from "axios";

interface Email {
  subject: string;
  body: string;
  sender: string;
  date: Date;
  folder: string;
  account: string;
}


export async function categorizeEmail(email: Email): Promise<string> {
  const text = (email.subject + ' ' + email.body).toLowerCase();
  const HUGGING_FACE_TOKEN = process.env.HF_API_TOKEN;
  const API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";
  const labels = ["Interested", "Meeting Booked", "Not Interested", "Spam", "Out of Office"];
   try {
    const response = await axios.post(
      API_URL,
      { inputs: text, parameters: { candidate_labels: labels } },
      { headers: { Authorization: `Bearer ${HUGGING_FACE_TOKEN}` } }
    );

    return response.data.labels[0]; 
  } catch (err) {
    console.error("Hugging Face API error:", err.message);
    return "Unknown";
  }
}
