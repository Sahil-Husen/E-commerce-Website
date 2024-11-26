import mongoose from "mongoose";

const orederSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    oderId: {
      type: String,
      required: [true, "Provide OderID"],
      unique: true,
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "product",
    },
    product_Details: {
      name: String,
      image: Array,
    },
    paymentId: {
      type: string,
      default: "",
    },
    payment_status: {
      type: String,
      default: "",
    },
    delivery_address: {
      type: mongoose.Schema.ObjectId,
      ref: "address",
    },
    subTotalAmt: {
      type: Number,
      default: 0,
    },
    totalAmt: {
      type: Number,
      default: 0,
    },
    invoice_receipt: {
      type: String,
      defualt: "",
    },
  },
  { timestamps: true }
);


const OrderModel = mongoose.model('order',orederSchema);
export default OrderModel;