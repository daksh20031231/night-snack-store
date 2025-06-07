import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/Product"
import User from "@/models/User"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const hostel = searchParams.get("hostel")
    const sellerId = searchParams.get("sellerId")

    const query: any = { isActive: true }

    if (hostel) {
      query.hostel = hostel
    }

    if (sellerId) {
      query.sellerId = sellerId
    }

    const products = await Product.find(query).sort({ createdAt: -1 })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const user = await User.findOne({ email: session.user.email })

    if (user.role !== "seller") {
      return NextResponse.json({ error: "Only sellers can create products" }, { status: 403 })
    }

    const body = await request.json()
    const product = await Product.create({
      ...body,
      sellerId: user._id,
      sellerName: user.name,
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
