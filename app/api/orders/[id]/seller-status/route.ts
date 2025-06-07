import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"
import User from "@/models/User"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const user = await User.findOne({ email: session.user.email })

    if (user.role !== "seller") {
      return NextResponse.json({ error: "Only sellers can update order status" }, { status: 403 })
    }

    const { status } = await request.json()

    if (!["confirmed", "delivered"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Sellers can only confirm or deliver orders" }, { status: 400 })
    }

    // Check if this seller has items in this order
    const order = await Order.findOne({
      _id: params.id,
      "items.sellerId": user._id,
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found or you don't have items in this order" }, { status: 404 })
    }

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      {
        status,
        $push: {
          statusHistory: {
            status,
            updatedAt: new Date(),
            updatedBy: user._id.toString(),
          },
        },
      },
      { new: true },
    )

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
