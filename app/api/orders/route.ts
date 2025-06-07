import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"
import Product from "@/models/Product"
import User from "@/models/User"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get("admin") === "true"
    const isSeller = searchParams.get("seller") === "true"

    if (isAdmin) {
      const adminEmail = process.env.ADMIN_EMAIL
      if (!adminEmail || session.user.email !== adminEmail) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const orders = await Order.find({}).populate("buyerId", "name email").sort({ createdAt: -1 })
      return NextResponse.json(orders)
    }

    const user = await User.findOne({ email: session.user.email })

    if (isSeller && user.role === "seller") {
      // Get orders that contain seller's products
      const orders = await Order.find({
        "items.sellerId": user._id,
        status: { $in: ["pending", "confirmed"] },
      })
        .populate("buyerId", "name email")
        .sort({ createdAt: -1 })

      // Mark notifications as read
      await Order.updateMany(
        {
          "items.sellerId": user._id,
          "sellersNotified.sellerId": user._id,
          "sellersNotified.isRead": false,
        },
        {
          $set: { "sellersNotified.$.isRead": true },
        },
      )

      return NextResponse.json(orders)
    }

    // Regular buyer orders
    const orders = await Order.find({ buyerId: user._id }).sort({ createdAt: -1 })
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions)
    if (!authSession?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const user = await User.findOne({ email: authSession.user.email })
    const body = await request.json()

    // Check stock availability first
    for (const item of body.items) {
      const product = await Product.findById(item.productId)

      if (!product) {
        return NextResponse.json({ error: `Product ${item.title} not found` }, { status: 404 })
      }

      if (product.quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${item.title}. Available: ${product.quantity}, Requested: ${item.quantity}`,
          },
          { status: 400 },
        )
      }
    }

    // Update stock quantities
    for (const item of body.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: -item.quantity } })
    }

    // Create order with seller notifications
    const sellersInOrder = [...new Set(body.items.map((item) => item.sellerId))]
    const sellersNotified = sellersInOrder.map((sellerId) => ({
      sellerId,
      isRead: false,
      notifiedAt: new Date(),
    }))

    // Add delivery charge
    const deliveryCharge = 10
    const totalWithDelivery = body.totalAmount + deliveryCharge

    const order = await Order.create({
      ...body,
      deliveryCharge,
      totalAmount: totalWithDelivery,
      buyerId: user._id,
      buyerName: user.name,
      buyerEmail: user.email,
      sellersNotified,
      statusHistory: [
        {
          status: "pending",
          updatedAt: new Date(),
          updatedBy: "system",
        },
      ],
    })

    return NextResponse.json({ success: true, message: "Order placed successfully", order })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to place order",
      },
      { status: 500 },
    )
  }
}
