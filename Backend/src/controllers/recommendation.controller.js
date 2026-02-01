// recommendation.controller.js
const mongoose = require("mongoose");
const Product = require("../models/Product.model.js");
const Order = require("../models/Order.model.js");
const AsyncHandler = require("../utils/AsyncHandler.js");
const ApiError = require("../utils/ApiError.js");

/* -------------------------
   Scoring helpers (kept from your logic)
   ------------------------- */
function scoreSimilarProduct(baseProduct, candidate) {
  let score = 0;

  if (candidate.productCategory === baseProduct.productCategory) score += 2;

  if (
    baseProduct.brand &&
    candidate.brand &&
    baseProduct.brand.toLowerCase() === candidate.brand.toLowerCase()
  ) {
    score += 3;
  }

  if (candidate.condition === baseProduct.condition) score += 1;

  if (
    typeof baseProduct.price === "number" &&
    typeof candidate.price === "number"
  ) {
    const basePrice = baseProduct.price || 1;
    const diffRatio = Math.abs(candidate.price - basePrice) / basePrice;
    if (diffRatio <= 0.1) score += 3;
    else if (diffRatio <= 0.25) score += 2;
    else if (diffRatio <= 0.5) score += 1;
  }

  const baseAddr = (baseProduct.location && baseProduct.location.address) || "";
  const candAddr = (candidate.location && candidate.location.address) || "";
  if (baseAddr && candAddr) {
    const baseCityToken = String(baseAddr).split(",")[0].trim().toLowerCase();
    const candCityToken = String(candAddr).split(",")[0].trim().toLowerCase();
    if (baseCityToken && candCityToken && baseCityToken === candCityToken) {
      score += 2;
    }
  }

  if (candidate.soldCount) score += Math.min(candidate.soldCount, 10) * 0.3;
  if (candidate.viewCount) score += Math.min(candidate.viewCount, 200) * 0.02;
  if (candidate.isFeatured) score += 2;

  return score;
}

function scoreUserRecommendation(userProfile, product) {
  let score = 0;
  const { categoryWeights, brandWeights, avgPrice } = userProfile || {};
  const catWeight =
    (categoryWeights && categoryWeights[product.productCategory]) || 0;
  score += catWeight * 2;

  if (product.brand) {
    const brandKey = product.brand.toLowerCase();
    const brandWeight = (brandWeights && brandWeights[brandKey]) || 0;
    score += brandWeight * 3;
  }

  if (avgPrice && product.price) {
    const diffRatio = Math.abs(product.price - avgPrice) / avgPrice;
    if (diffRatio <= 0.25) score += 4;
    else if (diffRatio <= 0.5) score += 2;
  }

  if (product.soldCount) score += Math.min(product.soldCount, 20) * 0.3;
  if (product.viewCount) score += Math.min(product.viewCount, 300) * 0.02;
  if (product.isFeatured) score += 2;

  return score;
}

/* -------------------------
   Utilities: image picker and location normalizer
   ------------------------- */
const PEXELS_PLACEHOLDER =
  "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1200";

function pickImagePreview(p) {
  try {
    if (!p) return PEXELS_PLACEHOLDER;
    if (Array.isArray(p.imageUrls) && p.imageUrls.length && p.imageUrls[0])
      return p.imageUrls[0];
    if (p.imageUrl) return p.imageUrl;
    if (Array.isArray(p.imageDetails) && p.imageDetails.length) {
      const primary = p.imageDetails.find((d) => d && d.isPrimary);
      if (primary && primary.url) return primary.url;
      if (p.imageDetails[0] && p.imageDetails[0].url)
        return p.imageDetails[0].url;
    }
  } catch (e) {
    // fallback
  }
  return PEXELS_PLACEHOLDER;
}

function normalizeLocation(location) {
  if (!location) return null;
  const normalized = {
    lat:
      typeof location.lat === "number"
        ? location.lat
        : location.lat
          ? Number(location.lat) || null
          : null,
    lng:
      typeof location.lng === "number"
        ? location.lng
        : location.lng
          ? Number(location.lng) || null
          : null,
    address: "",
  };

  if (typeof location.address === "string") {
    normalized.address = location.address;
  } else if (
    typeof location.address === "object" &&
    location.address !== null
  ) {
    if (typeof location.address.address === "string")
      normalized.address = location.address.address;
    else if (typeof location.address.formatted === "string")
      normalized.address = location.address.formatted;
    else {
      try {
        const s = JSON.stringify(location.address);
        normalized.address = s.length > 0 ? s : "";
      } catch (e) {
        normalized.address = "";
      }
    }
  } else if (location.address != null) {
    normalized.address = String(location.address);
  } else {
    normalized.address = "";
  }

  return normalized;
}

/* -------------------------
   Normalize product object for frontend (important: include fields UI expects)
   - returns object with: id, _id, title, productTitle, price, image, img, imagePreview, description, location, etc.
   ------------------------- */
function sanitizeProductForResponse(p) {
  if (!p) return null;

  const imagePreview = pickImagePreview(p);
  const loc = normalizeLocation(p.location);
  const productTitle =
    p.productTitle ||
    p.title ||
    (p.productName && String(p.productName)) ||
    "Untitled product";
  const description = p.productDescription || p.description || "";

  const canonical = {
    _id: p._id,
    id: String(p._id),
    productTitle,
    title: productTitle, // frontend expects `title`
    description, // frontend may show description
    price: typeof p.price === "number" ? p.price : Number(p.price) || 0,
    // provide both `image` and `img` and `imagePreview`—frontends often use different keys
    image: imagePreview,
    img: imagePreview,
    imagePreview,
    imageUrl: imagePreview, // legacy
    imageUrls: Array.isArray(p.imageUrls)
      ? p.imageUrls
      : p.imageUrls
        ? [p.imageUrls]
        : [],
    imageDetails: Array.isArray(p.imageDetails)
      ? p.imageDetails
      : p.imageDetails
        ? [p.imageDetails]
        : [],
    productCategory: p.productCategory || null,
    brand: p.brand || null,
    condition: p.condition || null,
    quantity:
      typeof p.quantity === "number" ? p.quantity : Number(p.quantity) || 0,
    location: loc,
    user: p.userId || p.user || null,
    soldCount: p.soldCount || 0,
    viewCount: p.viewCount || 0,
    isFeatured: !!p.isFeatured,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    raw: p,
  };

  return canonical;
}

/* ============================
   Controller: getSimilarProducts
   ============================ */
exports.getSimilarProducts = AsyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const baseProduct = await Product.findById(productId).lean();

  if (!baseProduct || !baseProduct.isActive || baseProduct.quantity <= 0) {
    throw new ApiError(404, "Base product not found or inactive");
  }

  const baseFilter = {
    _id: { $ne: baseProduct._id },
    isActive: true,
    quantity: { $gt: 0 },
    productCategory: baseProduct.productCategory,
  };

  const candidates = await Product.find(baseFilter)
    .select(
      "productTitle productCategory price brand condition imageUrl imageUrls imageDetails productDescription location isFeatured soldCount viewCount quantity userId createdAt updatedAt"
    )
    .populate("userId", "name")
    .limit(80)
    .lean();

  if (!candidates.length) {
    return res.status(200).json({
      success: true,
      data: [],
      message: "No similar products found",
    });
  }

  const scored = candidates
    .map((p) => ({
      ...p,
      _similarityScore: scoreSimilarProduct(baseProduct, p),
    }))
    .sort((a, b) => b._similarityScore - a._similarityScore);

  const top = scored.slice(0, 12).map((p) => sanitizeProductForResponse(p));

  // debug
  try {
    console.log("SIMILAR - baseProduct:", {
      id: String(baseProduct._id),
      title: baseProduct.productTitle || baseProduct.title || "NO_TITLE",
      price: baseProduct.price,
      imagePreview:
        (Array.isArray(baseProduct.imageUrls) && baseProduct.imageUrls[0]) ||
        baseProduct.imageUrl ||
        (baseProduct.imageDetails &&
          baseProduct.imageDetails[0] &&
          baseProduct.imageDetails[0].url) ||
        null,
    });
    console.log(
      "SIMILAR - returning top ids:",
      top.map((t) => t.id)
    );
  } catch (e) {
    console.warn("SIMILAR debug log error:", e);
  }

  return res.status(200).json({
    success: true,
    data: top,
  });
});

/* ============================
   Controller: getUserRecommendations
   ============================ */
exports.getUserRecommendations = AsyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const orders = await Order.find({
    buyerId: userId,
    status: { $in: ["completed", "delivered", "Delivered"] },
  })
    .select("productId items totalPrice createdAt")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  if (!orders.length) {
    const fallback = await Product.find({
      isActive: true,
      quantity: { $gt: 0 },
    })
      .sort({ isFeatured: -1, soldCount: -1, viewCount: -1, createdAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      data: fallback.map((p) => sanitizeProductForResponse(p)),
      message: "No order history found, returning trending products",
    });
  }

  const productIdSet = new Set();

  for (const order of orders) {
    if (order.productId) productIdSet.add(String(order.productId));
    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item.productId) productIdSet.add(String(item.productId));
      }
    }
  }

  const purchasedProductIds = Array.from(productIdSet).map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  const purchasedProducts = await Product.find({
    _id: { $in: purchasedProductIds },
  })
    .select(
      "productCategory brand price isActive quantity soldCount viewCount isFeatured"
    )
    .lean();

  if (!purchasedProducts.length) {
    const fallback = await Product.find({
      isActive: true,
      quantity: { $gt: 0 },
    })
      .sort({ isFeatured: -1, soldCount: -1, viewCount: -1, createdAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      data: fallback.map((p) => sanitizeProductForResponse(p)),
      message: "No purchased products found, returning trending products",
    });
  }

  const categoryWeights = {};
  const brandWeights = {};
  let totalPrice = 0;
  let priceCount = 0;

  for (const p of purchasedProducts) {
    if (p.productCategory)
      categoryWeights[p.productCategory] =
        (categoryWeights[p.productCategory] || 0) + 1;
    if (p.brand)
      brandWeights[p.brand.toLowerCase()] =
        (brandWeights[p.brand.toLowerCase()] || 0) + 1;
    if (typeof p.price === "number") {
      totalPrice += p.price;
      priceCount++;
    }
  }

  const avgPrice = priceCount > 0 ? totalPrice / priceCount : null;

  const topCategories = Object.entries(categoryWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat]) => cat);
  const topBrands = Object.entries(brandWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([brand]) => brand);

  const candidateFilter = {
    isActive: true,
    quantity: { $gt: 0 },
    _id: { $nin: purchasedProductIds },
  };

  if (topCategories.length || topBrands.length) {
    candidateFilter.$or = [];
    if (topCategories.length)
      candidateFilter.$or.push({ productCategory: { $in: topCategories } });
    if (topBrands.length)
      candidateFilter.$or.push({
        brand: { $in: topBrands.map((b) => new RegExp(`^${b}$`, "i")) },
      });
  }

  const candidates = await Product.find(candidateFilter)
    .select(
      "productTitle productCategory brand price condition imageUrl imageUrls imageDetails productDescription location isFeatured soldCount viewCount quantity userId createdAt updatedAt"
    )
    .populate("userId", "name")
    .limit(120)
    .lean();

  if (!candidates.length) {
    const fallback = await Product.find({
      isActive: true,
      quantity: { $gt: 0 },
      _id: { $nin: purchasedProductIds },
    })
      .sort({ isFeatured: -1, soldCount: -1, viewCount: -1, createdAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      data: fallback.map((p) => sanitizeProductForResponse(p)),
      message: "No personalized candidates found, returning popular products",
    });
  }

  const userProfile = { categoryWeights, brandWeights, avgPrice };

  const scored = candidates
    .map((p) => ({
      ...p,
      _recommendationScore: scoreUserRecommendation(userProfile, p),
    }))
    .sort((a, b) => {
      if (b._recommendationScore !== a._recommendationScore)
        return b._recommendationScore - a._recommendationScore;
      const aPop = (a.soldCount || 0) * 2 + (a.viewCount || 0);
      const bPop = (b.soldCount || 0) * 2 + (b.viewCount || 0);
      return bPop - aPop;
    });

  const top = scored.slice(0, 20).map((p) => sanitizeProductForResponse(p));

  return res.status(200).json({
    success: true,
    data: top,
  });
});

/* ============================
   Controller: getFrequentlyBoughtTogether
   ============================ */
exports.getFrequentlyBoughtTogether = AsyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const pid = new mongoose.Types.ObjectId(productId);

  const coPurchase = await Order.aggregate([
    {
      $match: {
        status: {
          $in: [
            "completed",
            "delivered",
            "Delivered",
            "Completed",
            "Shipped",
            "shipped",
          ],
        },
        $or: [{ productId: pid }, { "items.productId": pid }],
      },
    },
    { $unwind: "$items" },
    { $match: { "items.productId": { $ne: pid } } },
    { $group: { _id: "$items.productId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 12 },
  ]);

  if (!coPurchase.length) {
    return res.status(200).json({
      success: true,
      data: [],
      message: "No frequently bought together products found",
    });
  }

  const relatedIds = coPurchase.map((d) => d._id);
  const products = await Product.find({
    _id: { $in: relatedIds },
    isActive: true,
    quantity: { $gt: 0 },
  })
    .select(
      "productTitle productCategory price brand condition imageUrl imageUrls imageDetails productDescription location isFeatured soldCount viewCount quantity userId createdAt updatedAt"
    )
    .populate("userId", "name")
    .lean();

  const scoreMap = coPurchase.reduce((acc, doc) => {
    acc[doc._id.toString()] = doc.count;
    return acc;
  }, {});

  const productsMap = products.reduce((acc, p) => {
    acc[p._id.toString()] = p;
    return acc;
  }, {});

  const ordered = relatedIds
    .map((rid) => productsMap[rid.toString()])
    .filter(Boolean)
    .map((p) => {
      const sanitized = sanitizeProductForResponse(p);
      sanitized.coPurchaseCount = scoreMap[p._id.toString()] || 0;
      return sanitized;
    });

  // debug log sample
  try {
    console.log(
      "FBT - returning products:",
      ordered
        .slice(0, 8)
        .map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          image: p.image,
        }))
    );
  } catch (e) {
    console.warn("FBT debug error:", e);
  }

  return res.status(200).json({
    success: true,
    data: ordered,
  });
});
