import mongoose from "mongoose"

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  title: String,
  price: Number,
  quantity: Number,
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
})

const OrderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    buyerEmail: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryCharge: {
      type: Number,
      default: 10,
    },
    hostel: {
      type: String,
      enum: ["Himalaya", "Janadhar"],
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "cancelled"],
      default: "pending",
    },
    // Fields for seller notifications
    sellersNotified: [
      {
        sellerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        notifiedAt: {
          type: Date,
          default: Date.now,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
      },
    ],
    statusHistory: [
      {
        status: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        updatedBy: String, // admin email, seller id, or system
      },
    ],
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Order || mongoose.model("Order", OrderSchema)
