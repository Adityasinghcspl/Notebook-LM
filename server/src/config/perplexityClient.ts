import OpenAI from 'openai';
import 'dotenv/config';

const perplexityClient = new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: "https://api.perplexity.ai"
});

export default perplexityClient;



// resp = client.chat.completions.create(
//     model="sonar-pro",
//     messages=[
//         {"role": "user", "content": "Hello!"}
//     ]
// )
// print(resp.choices[0].message.content)