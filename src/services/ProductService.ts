import { ProductRepository } from '../repositories/ProductRepository';
import {
  CreateProductRequest,
  UpdateProductRequest,
  ProductQuery,
  IProductDocument,
  PaginatedResponse,
} from '../types';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async createProduct(
    userId: string,
    productData: CreateProductRequest
  ): Promise<IProductDocument> {
    // Check if SKU already exists
    const existingProduct = await this.productRepository.findBySku(productData.sku);
    if (existingProduct) {
      throw new Error('Product with this SKU already exists');
    }

    // Create product
    const product = await this.productRepository.create({
      ...productData,
      userId,
      images: productData.images || [],
    });

    return product;
  }

  async getProductById(productId: string, userId?: string): Promise<IProductDocument | null> {
    const product = await this.productRepository.findById(productId);

    if (!product || !product.isActive) {
      return null;
    }

    // If userId is provided, ensure the product belongs to the user (for user role)
    if (userId && product.userId.toString() !== userId) {
      return null;
    }

    return product;
  }

  async getUserProducts(userId: string): Promise<IProductDocument[]> {
    return await this.productRepository.findByUserId(userId);
  }

  async getAllProducts(query: ProductQuery): Promise<PaginatedResponse<IProductDocument>> {
    return await this.productRepository.searchProducts(query);
  }

  async updateProduct(
    productId: string,
    userId: string,
    updateData: UpdateProductRequest
  ): Promise<IProductDocument | null> {
    // Check if product exists and belongs to user
    const existingProduct = await this.getProductById(productId, userId);
    if (!existingProduct) {
      throw new Error('Product not found or access denied');
    }

    // If SKU is being updated, check for duplicates
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const skuExists = await this.productRepository.findBySku(updateData.sku);
      if (skuExists) {
        throw new Error('Product with this SKU already exists');
      }
    }

    return await this.productRepository.update(productId, updateData);
  }

  async deleteProduct(productId: string, userId: string): Promise<boolean> {
    // Check if product exists and belongs to user
    const existingProduct = await this.getProductById(productId, userId);
    if (!existingProduct) {
      throw new Error('Product not found or access denied');
    }

    // Soft delete by setting isActive to false
    const result = await this.productRepository.update(productId, { isActive: false });
    return result !== null;
  }

  async updateStock(
    productId: string,
    quantity: number,
    userId?: string
  ): Promise<IProductDocument | null> {
    // Validate quantity
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    // Check if product exists
    const existingProduct = await this.getProductById(productId, userId);
    if (!existingProduct) {
      throw new Error('Product not found or access denied');
    }

    return await this.productRepository.updateStock(productId, quantity);
  }

  async getProductsByCategory(category: string): Promise<IProductDocument[]> {
    return await this.productRepository.findByCategory(category);
  }

  async getLowStockProducts(userId?: string): Promise<IProductDocument[]> {
    return await this.productRepository.findLowStock(userId);
  }

  async getCategories(): Promise<string[]> {
    return await this.productRepository.getCategories();
  }

  async getInventoryStats(userId?: string): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  }> {
    const filter: any = { isActive: true };
    if (userId) filter.userId = userId;

    const [totalProducts, totalValue, lowStockProducts] = await Promise.all([
      this.productRepository.count(filter),
      this.productRepository.getTotalValue(userId),
      this.productRepository.findLowStock(userId),
    ]);

    const outOfStockCount = await this.productRepository.count({
      ...filter,
      quantity: 0,
    });

    return {
      totalProducts,
      totalValue,
      lowStockCount: lowStockProducts.length,
      outOfStockCount,
    };
  }

  async searchProducts(query: ProductQuery): Promise<PaginatedResponse<IProductDocument>> {
    return await this.productRepository.searchProducts(query);
  }

  async bulkUpdateStock(
    updates: Array<{ productId: string; quantity: number }>,
    userId?: string
  ): Promise<void> {
    for (const update of updates) {
      await this.updateStock(update.productId, update.quantity, userId);
    }
  }

  async getProductBySku(sku: string): Promise<IProductDocument | null> {
    return await this.productRepository.findBySku(sku);
  }

  async adjustStock(
    productId: string,
    adjustment: number,
    userId?: string
  ): Promise<IProductDocument | null> {
    const product = await this.getProductById(productId, userId);
    if (!product) {
      throw new Error('Product not found or access denied');
    }

    const newQuantity = product.quantity + adjustment;
    if (newQuantity < 0) {
      throw new Error('Insufficient stock for this adjustment');
    }

    return await this.updateStock(productId, newQuantity, userId);
  }
}
