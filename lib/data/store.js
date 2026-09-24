// lib/data/store.js — Phase 3: Prisma + PostgreSQL.
// Saare functions ab real DB queries hain (in-memory store hata diya gaya hai).

import { prisma } from "../prisma.js";

const VISUAL_BY_SLUG = { bag: "bag", shoe: "shoe" };

// ---- Mappers (DB rows -> app ka legacy object shape) ----

function mapProduct(product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category?.slug ?? null,
    price: product.price,
    salePrice: product.salePrice,
    badge: product.badge ?? null,
    description: product.description,
    variants: product.variants ?? [],
    image: product.image ?? null,
    isFeatured: product.isFeatured ?? false,
  };
}

function mapCategory(category) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    bannerTitle: category.bannerTitle ?? category.name.toUpperCase(),
    bannerSubtitle: category.bannerSubtitle ?? "",
    bannerImage: category.imageUrl ?? null,
    visual: category.visual ?? VISUAL_BY_SLUG[category.slug] ?? "bag",
  };
}

function mapOrder(order) {
  return {
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    fullName: order.customerName,
    email: order.email,
    phone: order.phone,
    whatsapp: order.whatsapp ?? null,
    address: order.address,
    city: order.city,
    items: (order.items ?? []).map((item) => ({
      id: item.productId,
      quantity: item.quantity,
      price: item.price,
      color: item.color ?? null,
      size: item.size ?? null,
    })),
    totalPrice: order.totalAmount,
  };
}

function mapContactMessage(message) {
  return {
    id: message.id,
    createdAt: message.createdAt,
    name: message.name,
    email: message.email,
    order: message.order ?? null,
    message: message.message,
  };
}

// ---- Products ----

export async function getAllProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    include: { category: true },
  });
  return products.map(mapProduct);
}

export async function getProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  return product ? mapProduct(product) : null;
}

export async function getProductsByCategory(category) {
  const products = await prisma.product.findMany({
    where: category !== "all" ? { category: { slug: category } } : {},
    orderBy: { createdAt: "asc" },
    include: { category: true },
  });
  return products.map(mapProduct);
}

export async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "asc" },
    include: { category: true },
  });
  return products.map(mapProduct);
}

export async function getProductsByBadge(badge) {
  const products = await prisma.product.findMany({
    where: { badge },
    orderBy: { createdAt: "asc" },
    include: { category: true },
  });
  return products.map(mapProduct);
}

export async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  return product ? mapProduct(product) : null;
}

export async function addProduct(productData) {
  const { category, ...rest } = productData;

  let categoryId = null;
  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (!cat) throw new Error(`Category not found: ${category}`);
    categoryId = cat.id;
  }

  const created = await prisma.product.create({
    data: {
      name: rest.name,
      slug: rest.slug,
      description: rest.description ?? "",
      price: Number(rest.price) || 0,
      salePrice: rest.salePrice ? Number(rest.salePrice) : null,
      badge: rest.badge ?? null,
      image: rest.image ?? null,
      variants: rest.variants ?? [],
      categoryId,
    },
    include: { category: true },
  });
  return mapProduct(created);
}

export async function updateProduct(id, updates) {
  const { category, ...rest } = updates;
  const data = {};

  if (rest.name !== undefined) data.name = rest.name;
  if (rest.slug !== undefined) data.slug = rest.slug;
  if (rest.description !== undefined) data.description = rest.description;
  if (rest.price !== undefined) data.price = Number(rest.price);
  if (rest.salePrice !== undefined) data.salePrice = rest.salePrice ? Number(rest.salePrice) : null;
  if (rest.badge !== undefined) data.badge = rest.badge;
  if (rest.image !== undefined) data.image = rest.image;
  if (rest.variants !== undefined) data.variants = rest.variants;
  if (category !== undefined) {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (!cat) throw new Error(`Category not found: ${category}`);
    data.categoryId = cat.id;
  }

  try {
    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
    return mapProduct(updated);
  } catch (error) {
    if (error?.code === "P2025") return null;
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    await prisma.product.delete({ where: { id } });
    return true;
  } catch (error) {
    if (error?.code === "P2025") return false;
    throw error;
  }
}

// ---- Categories ----

export async function getAllCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
  });
  return categories.map(mapCategory);
}

export async function addCategory(categoryData) {
  const created = await prisma.category.create({
    data: {
      name: categoryData.name,
      slug: categoryData.slug,
      imageUrl: categoryData.bannerImage ?? null,
      bannerTitle: categoryData.bannerTitle ?? null,
      bannerSubtitle: categoryData.bannerSubtitle ?? null,
      visual: categoryData.visual ?? null,
    },
  });
  return mapCategory(created);
}

export async function updateCategory(slug, updates) {
  const data = {};
  if (updates.name !== undefined) data.name = String(updates.name);
  if (updates.bannerImage !== undefined) data.imageUrl = updates.bannerImage;
  if (updates.bannerTitle !== undefined) data.bannerTitle = updates.bannerTitle;
  if (updates.bannerSubtitle !== undefined) data.bannerSubtitle = updates.bannerSubtitle;
  if (updates.visual !== undefined) data.visual = updates.visual;

  try {
    let updated;
    if (Object.keys(data).length === 0) {
      updated = await prisma.category.findUnique({ where: { slug } });
    } else {
      updated = await prisma.category.update({ where: { slug }, data });
    }
    return updated ? mapCategory(updated) : null;
  } catch (error) {
    if (error?.code === "P2025") return null;
    throw error;
  }
}

export async function deleteCategory(slug) {
  try {
    await prisma.category.delete({ where: { slug } });
    return true;
  } catch (error) {
    if (error?.code === "P2025") return false;
    throw error;
  }
}

// ---- Orders ----

export async function getAllOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "asc" },
    include: { items: true },
  });
  return orders.map(mapOrder);
}

export async function addOrder(orderData) {
  // SECURITY: Client-bheja hua price/total kabhi trust nahi karte. Har item
  // ka asal price database se lete hain (getProductById) aur total yahan
  // server par calculate karte hain — client's totalPrice/price ignore hai.
  // Sale semantics storefront jaisi hi: current = min(price, salePrice).
  const resolvedItems = [];
  let totalAmount = 0;

  for (const item of orderData.items ?? []) {
    const product = await getProductById(item.id);
    if (!product) {
      throw new Error(`Product not found: ${item.id}`);
    }
    const quantity = Number(item.quantity) || 1;
    const hasSale = product.salePrice != null;
    const unitPrice = hasSale
      ? Math.min(product.price, product.salePrice)
      : product.price;
    totalAmount += unitPrice * quantity;
    resolvedItems.push({
      productId: item.id,
      quantity: quantity > 0 ? Math.floor(quantity) : 1,
      price: unitPrice,
      color: item.color ?? null,
      size: item.size ?? null,
    });
  }

  const created = await prisma.order.create({
    data: {
      customerName: orderData.fullName,
      phone: orderData.phone ?? "",
      email: orderData.email ?? "",
      whatsapp: orderData.whatsapp ?? null,
      address: orderData.address,
      city: orderData.city,
      totalAmount: Math.round(totalAmount * 100) / 100,
      items: {
        create: resolvedItems,
      },
    },
    include: { items: true },
  });
  return mapOrder(created);
}

export async function updateOrderStatus(id, status) {
  try {
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    return mapOrder(updated);
  } catch (error) {
    if (error?.code === "P2025") return null;
    throw error;
  }
}

// ---- Contact Messages ----

export async function getAllContactMessages() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return messages.map(mapContactMessage);
}

export async function addContactMessage(messageData) {
  const created = await prisma.contactMessage.create({
    data: {
      name: messageData.name,
      email: messageData.email,
      order: messageData.order ?? null,
      message: messageData.message,
    },
  });
  return mapContactMessage(created);
}