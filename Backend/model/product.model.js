import mongoose, { mongo } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    image: {
      type: Array,
      default: [],
    },
    category: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "category",
      },
    ],
    subCategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "subCategory",
      },
    ],
    unit: {
      type: String,
      default: null,
    },
    stock: {
      type: Number,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
    discout: {
      type: Number,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    more_details: {
      type: Object,
      default: {},
    },
    publish: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


const ProductModel = mongoose.model('product',productSchema)

export default ProductModel;