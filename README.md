# Truview generates a summary for a movie based on reddit user reviews.

- It relies on serper API to fetch reddit posts and uses Gemini API to summarize the user reviews.
- Support to instruct LLM for providing response under provided word count

### How to install

```bash
npm install truview
```

This will install all the required packages and dependencies.

### Example Usage

```js
import { truview } from "truview";
import dotenv from "dotenv";

// Load environment variables from a .env file
dotenv.config();

const movieToReview = "The Karate Kid";

// Create an options object with your API keys from the .env file
const apiOptions = {
  serperApiKey: process.env.SERPER_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  result_length: 50, // max word length
};

// Run the function and log the result
truview(movieToReview, apiOptions)
  .then((review) => {
    console.log(`\n--- Review for ${movieToReview} ---\n`);
    console.log(review);
  })
  .catch((error) => {
    console.error("\nAn error occurred:", error.message);
  });
```

Optionally, ```truview``` function also supports ```await```, so it can be used with asynchronous functions to return the response fron the LLM.
