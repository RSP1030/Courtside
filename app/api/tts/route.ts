import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { text, voiceId } = await req.json()

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_flash_v2_5",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  )

  console.log("ElevenLabs status:", response.status)
  console.log("ElevenLabs content-type:", response.headers.get("content-type"))

  if (!response.ok) {
    const error = await response.text()
    console.log("ElevenLabs error:", error)
    return NextResponse.json({ error }, { status: 500 })
  }

  const audioBuffer = await response.arrayBuffer()
  console.log("Audio buffer size:", audioBuffer.byteLength)
  
  return new NextResponse(audioBuffer, {
    headers: { "Content-Type": "audio/mpeg" },
  })
}