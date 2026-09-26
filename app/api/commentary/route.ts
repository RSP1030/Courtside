import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { event, team, homeScore, awayScore, quarter, secondsLeft } = body

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`

  const prompt = `You are an energetic live basketball commentator. Take Mike Breen as inspiration and Generate ONE short, exciting commentary sentence (max 20 words) for this event. You should be the absoulte best in the business.:
Event: ${event} by ${team} team
Score: Home ${homeScore} - Away ${awayScore}
Quarter: Q${quarter}, Time left: ${timeStr}
Be dramatic and specific to the situation. /no_think`

 const response = await fetch(
  "https://api.groq.com/openai/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
     model: "qwen/qwen3.8-27b",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    }),
  }
)

const data = await response.json()
console.log("Groq response:", JSON.stringify(data))
const commentary = data.choices?.[0]?.message?.content || "What a play!"
  
  return NextResponse.json({ commentary })
}