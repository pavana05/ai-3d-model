import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory storage (replace with database in production)
const users: Array<{
  id: string
  name: string
  email: string
  password: string
}> = []

// Simple hash function (replace with bcrypt in production)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}

// Simple token generation (replace with JWT in production)
function generateToken(userId: string): string {
  const payload = {
    userId,
    timestamp: Date.now(),
  }
  return btoa(JSON.stringify(payload))
}

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

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email)
    if (existingUser) {
      return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 400 })
    }

    // Create new user
    const userId = Date.now().toString()
    const hashedPassword = simpleHash(password)

    const newUser = {
      id: userId,
      name,
      email,
      password: hashedPassword,
    }

    users.push(newUser)

    // Generate token
    const token = generateToken(userId)

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
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
