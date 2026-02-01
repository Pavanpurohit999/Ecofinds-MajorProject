// src/components/RecommendationRow.jsx
import React from "react";
import ProductCard from "./ProductCard";

/**
 * Robust mapper — accepts multiple shapes the API may return.
 * Ensures `image`, `title`, `_id`, `sellerName` and `location.address`
 * are present where possible.
 */
const mapProductToCardShape = (p) => {
  if (!p) return {};

  // extract id either from id or _id (and support Mongo extended JSON)
  const rawId = p._id ?? p.id ?? null;
  const id =
    rawId && typeof rawId === "object" ? rawId.$oid ?? rawId.toString() : rawId;

  // find image from many possible fields
  const primaryImage =
    // common preview field used by recommendation endpoints
    p.img ??
    p.imagePreview ??
    // schema fields
    (Array.isArray(p.imageUrls) && p.imageUrls[0]) ??
    p.imageUrl ??
    // older shape
    p.image ??
    // imageDetails primary
    (Array.isArray(p.imageDetails) &&
      (p.imageDetails.find((i) => i.isPrimary)?.url ||
        p.imageDetails[0]?.url)) ??
    null;

  // title from various names
  const title =
    p.title ??
    p.productTitle ??
    p.name ??
    p.product_name ??
    p.heading ??
    "Untitled product";

  // location fallback: try nested object, or top-level address string
  let locationAddress = "Unknown location";
  if (p.location) {
    if (typeof p.location === "string") locationAddress = p.location;
    else if (typeof p.location === "object")
      locationAddress = p.location.address ?? p.locationAddr ?? locationAddress;
  } else {
    // other possible fields
    locationAddress =
      p.address ?? p.locationAddress ?? p.loc ?? locationAddress;
  }

  // seller fallback: populated user object, username fields, or raw userId
  let sellerName = "Unknown seller";
  if (p.sellerName) sellerName = p.sellerName;
  else if (p.userName) sellerName = p.userName;
  else if (p.user) {
    // if backend returned a nested user object
    if (typeof p.user === "object")
      sellerName = p.user.name ?? p.user.username ?? sellerName;
    else sellerName = String(p.user);
  } else if (p.userId) {
    if (typeof p.userId === "object") {
      sellerName =
        p.userId.name ?? p.userId.username ?? p.userId.$oid ?? sellerName;
    } else if (typeof p.userId === "string") {
      // sometimes it's just the id string — leave as id (but prefer name if available)
      sellerName = sellerName; // keep unknown seller
    }
  } else if (p.seller) {
    sellerName = p.seller;
  }

  return {
    _id: id,
    image: primaryImage || null,
    title,
    description:
      p.productDescription ?? p.description ?? p.shortDescription ?? "",
    price: p.price ?? p.cost ?? p.amount ?? 0,
    originalPrice:
      Math.round((p.price ?? p.cost ?? 0) * 1.2) ||
      Math.round((p.amount ?? 0) * 1.2),
    condition: p.condition ?? p.state ?? null,
    location: { address: locationAddress },
    yearOfManufacture: p.yearOfManufacture ?? p.year ?? null,
    brand: p.brand ?? null,
    rating: p.rating ?? null,
    reviews: p.reviews ?? null,
    category: p.productCategory ?? p.category ?? null,
    isNew:
      (p.createdAt &&
        Date.now() - new Date(p.createdAt).getTime() <
          7 * 24 * 60 * 60 * 1000) ||
      false,
    sellerName,
    userId: p.userId ?? p.user ?? null, // keep original for debugging if needed
  };
};

// Skeleton while loading (unchanged)
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 animate-pulse">
    <div className="w-full h-32 md:h-40 bg-gray-200 rounded-xl mb-4" />
    <div className="h-3 w-1/2 bg-gray-200 rounded mb-2" />
    <div className="h-4 w-3/4 bg-gray-200 rounded mb-3" />
    <div className="h-5 w-1/3 bg-gray-200 rounded mb-4" />
    <div className="h-9 w-full bg-gray-200 rounded-lg" />
  </div>
);

const RecommendationRow = ({
  title,
  products,
  loading,
  error,
  onProductClick,
}) => {
  if (loading) {
    return (
      <section className="my-10">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    const errorText =
      typeof error === "string"
        ? error
        : error?.message ?? "Failed to load recommendations";
    return (
      <section className="my-10">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-red-500">{errorText}</p>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="my-10">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((p, idx) => {
          const cardProduct = mapProductToCardShape(p);
          // ensure a stable unique key
          const key = cardProduct._id ?? cardProduct.title ?? idx;
          return (
            <ProductCard
              key={key}
              product={cardProduct}
              onViewDetails={() => onProductClick?.(cardProduct._id)}
            />
          );
        })}
      </div>
    </section>
  );
};

export default RecommendationRow;
