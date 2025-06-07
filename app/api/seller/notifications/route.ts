import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"
import User from "@/models/User"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const user = await User.findOne({ email: session.user.email })

    if (user.role !== "seller") {
      return NextResponse.json({ error: "Only sellers can access notifications" }, { status: 403 })
    }

    // Count unread notifications
    const unreadCount = await Order.countDocuments({
      "items.sellerId": user._id,
      "sellersNotified.sellerId": user._id,
      "sellersNotified.isRead": false,
      status: { $in: ["pending", "confirmed"] },
    })

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
