import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const users: Record<string, { id: string; name: string; email: string; password_hash: string }> = {}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const existingUser = Object.values(users).find((u) => u.email === email)

    if (existingUser) {
      return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 400 })
    }

    const userId = crypto.randomUUID()
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex")

    users[userId] = {
      id: userId,
      name,
      email,
      password_hash: passwordHash,
    }

    // Generate simple token (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify({ userId, email })).toString("base64")

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        name,
        email,
      },
    })
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
