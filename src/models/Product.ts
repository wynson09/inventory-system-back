// @ts-nocheck
import { Schema, model } from 'mongoose';
import { IProductDocument } from '../types';

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      uppercase: true,
      trim: true,
      maxlength: [50, 'SKU cannot exceed 50 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: function (value: number) {
          return value >= 0;
        },
        message: 'Price must be a positive number',
      },
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    minStockLevel: {
      type: Number,
      required: [true, 'Minimum stock level is required'],
      min: [0, 'Minimum stock level cannot be negative'],
      default: 5,
    },
    images: [
      {
        type: String,
        validate: {
          validator: function (value: string) {
            // Basic URL validation
            return /^https?:\/\/.+/.test(value);
          },
          message: 'Image must be a valid URL',
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' }); // Text search
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ userId: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ quantity: 1 });

// Virtual for low stock check
productSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.minStockLevel;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
  if (this.quantity === 0) return 'OUT_OF_STOCK';
  if (this.quantity <= this.minStockLevel) return 'LOW_STOCK';
  return 'IN_STOCK';
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });

// Static method to find products by category
productSchema.statics.findByCategory = function (category: string) {
  return this.find({ category, isActive: true });
};

// Static method to find low stock products
productSchema.statics.findLowStock = function (userId?: string) {
  const query: any = { isActive: true };
  if (userId) query.userId = userId;

  return this.aggregate([
    { $match: query },
    { $addFields: { isLowStock: { $lte: ['$quantity', '$minStockLevel'] } } },
    { $match: { isLowStock: true } },
  ]);
};

export const Product = model<IProductDocument>('Product', productSchema);
