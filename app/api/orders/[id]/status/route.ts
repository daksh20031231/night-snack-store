import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const adminEmail = process.env.ADMIN_EMAIL
    if (!session?.user?.email || !adminEmail || session.user.email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const { status } = await request.json()

    if (!["pending", "confirmed", "delivered", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      {
        status,
        $push: {
          statusHistory: {
            status,
            updatedAt: new Date(),
            updatedBy: session.user.email,
          },
        },
      },
      { new: true },
    )

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
