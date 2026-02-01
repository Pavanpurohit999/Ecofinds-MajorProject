// src/services/RecommendationService.js
import apiClient from "../api/axios.js";

const PEXELS_FALLBACK =
  "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1200";

function pickImage(item) {
  if (!item) return PEXELS_FALLBACK;
  // many possible keys from backend permutations
  if (Array.isArray(item.imageUrls) && item.imageUrls.length)
    return item.imageUrls[0];
  if (item.image || item.img) return item.image || item.img;
  if (item.imagePreview) return item.imagePreview;
  if (item.imageUrl) return item.imageUrl;
  if (Array.isArray(item.imageDetails) && item.imageDetails.length) {
    const primary = item.imageDetails.find((d) => d && d.isPrimary && d.url);
    if (primary) return primary.url;
    if (item.imageDetails[0].url) return item.imageDetails[0].url;
  }
  // fallback
  return PEXELS_FALLBACK;
}

function normalizeItem(raw) {
  if (!raw) return null;
  // backend sometimes sends _id, sometimes id; sometimes productTitle, sometimes title
  const id = raw.id || raw._id || (raw._id && String(raw._id)) || null;
  const title = raw.title || raw.productTitle || raw.name || "Untitled product";
  const price =
    typeof raw.price === "number" ? raw.price : Number(raw.price) || 0;
  const image = pickImage(raw);
  const description = raw.productDescription || raw.description || "";
  // keep raw in case UI needs extra fields
  return {
    id,
    _id: id,
    title,
    productTitle: raw.productTitle || title,
    price,
    image,
    img: image,
    imagePreview: raw.imagePreview || image,
    description,
    raw,
  };
}

const recommendationService = {
  async getSimilar(productId) {
    const path = `/recommendations/similar/${productId}`;
    const res = await apiClient.get(path);
    const arr = res.data?.data ?? [];
    return arr.map(normalizeItem).filter(Boolean);
  },

  async getFrequentlyBoughtTogether(productId) {
    const path = `/recommendations/frequently-bought-together/${productId}`;
    const res = await apiClient.get(path);
    const arr = res.data?.data ?? [];
    return arr.map(normalizeItem).filter(Boolean);
  },

  async getForUser(userId) {
    const path = `/recommendations/user/${userId}`;
    const res = await apiClient.get(path);
    const arr = res.data?.data ?? [];
    return arr.map(normalizeItem).filter(Boolean);
  },
};

export default recommendationService;
