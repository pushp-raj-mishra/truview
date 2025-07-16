import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { aggregate } from "./aggregator.js";

async function makeRequest(config) {
  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    throw new Error(`Serper API Request Failed: ${errorMessage}`);
  }
}

export async function truview(movie_name, options = {}) {
  const { serperApiKey, geminiApiKey } = options;

  if (!serperApiKey || !geminiApiKey) {
    throw new Error(
      "API keys for Serper and Gemini must be provided in the options object."
    );
  }

  //console.log(`Searching for reviews for "${movie_name}"...`);
  const searchConfig = {
    method: "post",
    url: "https://google.serper.dev/search",
    headers: {
      "X-API-KEY": serperApiKey,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({ q: `reddit reviews about "${movie_name}" movie` }),
  };

  const apiResult = await makeRequest(searchConfig);
  let redditLinks = [];

  if (apiResult && apiResult.organic) {
    const topResults = apiResult.organic.slice(0, 3);
    redditLinks = topResults.map((item) => item.link + ".json");
  } else {
    throw new Error("No organic search results found for the movie.");
  }

  if (redditLinks.length === 0) {
    return "Could not find any Reddit threads to analyze.";
  }

  const aggregatedComments = await aggregate(redditLinks);
  if (!aggregatedComments || aggregatedComments.trim() === "") {
    return "Found Reddit threads, but could not extract any comments to analyze.";
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Based on the following Reddit comments about the movie "${movie_name}", provide a concise, spoiler-free review. Structure your review into three sections: "The Good", "The Bad", and "Who Should Watch It?".\n\n--- REDDIT COMMENTS ---\n${aggregatedComments}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  return text;
}
