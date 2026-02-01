// src/hooks/useRecommendations.js
import { useEffect, useState } from "react";
import recommendationService from "../services/RecommendationService.js";

// ---------- helpers ----------
const initialState = {
  products: [],
  loading: false,
  error: null,
};

const pickImage = (p) => {
  // prefer array first item, then single url, then imageDetails primary, then common alternate fields
  try {
    if (Array.isArray(p.imageUrls) && p.imageUrls.length > 0)
      return p.imageUrls[0];
    if (typeof p.imageUrl === "string" && p.imageUrl) return p.imageUrl;
    if (Array.isArray(p.imageDetails)) {
      const primary = p.imageDetails.find((d) => d.isPrimary);
      if (primary && primary.url) return primary.url;
      if (p.imageDetails.length > 0 && p.imageDetails[0].url)
        return p.imageDetails[0].url;
    }
    // other possible fields used in some seeds
    if (p.img) return p.img;
    if (p.image && typeof p.image === "string") return p.image;
    if (p.images && Array.isArray(p.images) && p.images[0]) return p.images[0];
  } catch (err) {
    console.warn("pickImage error", err, p);
  }
  // fallback placeholder (your app already uses /api/placeholder)
  return "/api/placeholder/600/600";
};

const safeLocationAddress = (location) => {
  if (!location) return "Not specified";
  try {
    if (typeof location === "string") return location;
    if (typeof location.address === "string") return location.address;
    // sometimes seed uses { lat, lng, address: {...} } or nested object
    if (typeof location.address === "object" && location.address !== null) {
      // try common string keys inside
      if (typeof location.address.formatted === "string")
        return location.address.formatted;
      if (typeof location.address.line === "string")
        return location.address.line;
      // fallback to lat,lng
    }
    if (typeof location.lat === "number" && typeof location.lng === "number") {
      return `${location.lat}, ${location.lng}`;
    }
  } catch (err) {
    console.warn("safeLocationAddress error", err, location);
  }
  return "Not specified";
};

const toUiProduct = (p) => {
  return {
    id: p._id ? String(p._id) : p.id || p._id_str || null,
    title:
      p.productTitle ||
      p.title ||
      p.productName ||
      (p.raw && p.raw.productTitle) ||
      "Untitled product",
    price:
      typeof p.price === "number"
        ? p.price
        : parseFloat(p.price) >= 0
        ? parseFloat(p.price)
        : 0,
    img: pickImage(p),
    locationAddress: safeLocationAddress(
      p.location || p.address || p.locationAddress
    ),
    raw: p,
  };
};

function useBaseRecommendations(fetchFn, key, enabled) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (!enabled || !key) return;

    let cancelled = false;

    const run = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const products = await fetchFn(key); // service returns array (may be db docs)

        if (cancelled) return;

        // normalize to ui-friendly shape (defensive)
        const uiProducts = Array.isArray(products)
          ? products.map((p) => toUiProduct(p))
          : [];

        // debug log to confirm structure
        // eslint-disable-next-line no-console
        console.debug("useRecommendations → fetched products:", {
          key,
          count: uiProducts.length,
          sample: uiProducts.slice(0, 4),
        });

        setState({
          products: uiProducts,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (!cancelled) {
          console.error("Recommendation error:", err);
          setState({
            products: [],
            loading: false,
            error:
              err?.response?.data?.message ||
              err?.message ||
              "Failed to load recommendations",
          });
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [fetchFn, key, enabled]);

  return state;
}

// ---------- exported hooks ----------

// For ProductDetailPage → similar items
export const useSimilarProducts = (productId, enabled = true) => {
  return useBaseRecommendations(
    recommendationService.getSimilar,
    productId,
    enabled
  );
};

// For ProductDetailPage → “Frequently bought together”
export const useFrequentlyBoughtTogether = (productId, enabled = true) => {
  return useBaseRecommendations(
    recommendationService.getFrequentlyBoughtTogether,
    productId,
    enabled
  );
};

// For dashboard/home → personalized recs
export const useUserRecommendations = (userId, enabled = true) => {
  return useBaseRecommendations(
    recommendationService.getForUser,
    userId,
    enabled
  );
};
