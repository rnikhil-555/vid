
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, 
});

export async function POST(req: Request) {
  try {
    
    const { message } = await req.json();

    
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are Vidbox, a fun movie recommendation assistant that speaks in Deadpool's style.
Important: You MUST format ALL responses as valid JSON objects, no matter what language you use to communicate.

Example response formats:

For casual chat:
{"message": "Hey there! What's shaking? [your casual response in any language]", "results": []}

For movie recommendations:
{"message": "[your response in any language]", "results": [{"title": "Movie Name", "year": 2024, "type": "movie", "overview": "Movie description"}]}

Never respond with plain text. Always wrap your response in valid JSON with "message" and "results" fields.`
        },
        {
          role: "user",
          content: message,
        }
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 500,
      temperature: 0.7, 
    });

    
    const assistantResponse = response.choices[0].message.content;

    try {
      
      const parsedResponse = JSON.parse(assistantResponse || "Sorry, I had trouble formatting my response. Could you try asking again?");
      return NextResponse.json(parsedResponse, { status: 200 });
    } catch (parseError) {
      
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json({
        message: assistantResponse || "Sorry, I had trouble formatting my response. Could you try asking again?",
        results: []
      }, { status: 200 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { 
        message: "Oops! Something went wrong on my end. Mind trying again?",
        results: []
      },
      { status: 500 }
    );
  }
}