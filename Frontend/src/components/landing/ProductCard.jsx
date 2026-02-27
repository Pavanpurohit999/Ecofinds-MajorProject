import React, { useState, useEffect, useMemo } from "react";
import {
  EyeIcon,
  TagIcon,
  MapPinIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import PlaceholderImage from "../common/PlaceholderImage";

/**
 * ProductCard — Vite-safe + normalized image handling
 * - Uses import.meta.env.VITE_API_BASE_URL (with local default)
 * - Normalizes many DB image shapes including `image` (string)
 * - Preloads image, sets imgSrc for the <img> element, and falls back on error
 */

// Vite: use import.meta.env.VITE_API_BASE_URL, fallback to localhost for dev
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:5001";

const ProductCard = ({ product, onViewDetails }) => {
  const [imageStatus, setImageStatus] = useState("pending"); // pending | loaded | failed
  const [lastTestedSrc, setLastTestedSrc] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);

  // destructure safely
  const {
    id,
    _id,
    title,
    productTitle,
    description,
    price,
    productCategory,
    condition,
    location,
    yearOfManufacture,
    brand,
    imageDetails,
    imageUrls,
    imageUrl,
    image, // <-- important: many DBs return `image`
    images,
    photo,
    soldCount,
    viewCount,
  } = product || {};

  useEffect(() => {
    console.info("ProductCard render - product:", product);
  }, [product]);

  // Normalize a single candidate (string or object) to a usable URL or null
  const normalizeSingle = (candidate) => {
    if (!candidate) return null;

    // string candidate
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (!trimmed) return null;
      // full url or data url -> return as-is
      if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed))
        return trimmed;
      // relative path (strip leading slashes and prepend base)
      const rel = trimmed.replace(/^\/+/, "");
      return `${API_BASE_URL}/${rel}`;
    }

    // object candidate: try common fields
    if (typeof candidate === "object") {
      const url =
        candidate.url || candidate.src || candidate.path || candidate.filename;
      if (typeof url === "string" && url.trim()) return normalizeSingle(url);
      // nested structures (CMS)
      if (candidate?.fields?.file?.url)
        return normalizeSingle(candidate.fields.file.url);
    }

    return null;
  };

  // Choose best image from all known shapes (including `image` string)
  const normalizeImageSrc = () => {
    // 1. imageDetails array (preferred primary)
    if (Array.isArray(imageDetails) && imageDetails.length) {
      const primary = imageDetails.find(
        (i) => i?.isPrimary && (i?.url || i?.path || i?.src),
      );
      if (primary) {
        const s = normalizeSingle(
          primary.url ?? primary.path ?? primary.src ?? primary,
        );
        if (s) return s;
      }
      for (const it of imageDetails) {
        const s = normalizeSingle(it?.url ?? it?.path ?? it?.src ?? it);
        if (s) return s;
      }
    }

    // 2. imageUrls array
    if (Array.isArray(imageUrls) && imageUrls.length) {
      for (const it of imageUrls) {
        const s = normalizeSingle(it);
        if (s) return s;
      }
    }

    // 3. imageUrl (string/object)
    if (imageUrl) {
      const s = normalizeSingle(imageUrl);
      if (s) return s;
    }

    // 4. direct 'image' field (string) — your logs show images there
    if (image) {
      const s = normalizeSingle(image);
      if (s) return s;
    }

    // 5. generic images array (common)
    if (Array.isArray(images) && images.length) {
      for (const it of images) {
        const s = normalizeSingle(it);
        if (s) return s;
      }
    }

    // 6. other fallbacks
    if (photo) {
      const s = normalizeSingle(photo);
      if (s) return s;
    }

    return null;
  };

  const primaryImage = useMemo(
    () => normalizeImageSrc(),
    [
      imageDetails,
      imageUrls,
      imageUrl,
      image,
      images,
      photo,
      product?.id,
      product?._id,
    ],
  );

  const fallbackPlaceholder = useMemo(() => {
    const seed = (productCategory || "product")
      .replace(/\s+/g, "_")
      .toLowerCase();
    return `https://picsum.photos/seed/${seed}_fallback/800/600`;
  }, [productCategory]);

  // Preload and set imgSrc accordingly
  useEffect(() => {
    setImageStatus("pending");
    const srcToTest = primaryImage || fallbackPlaceholder;
    setLastTestedSrc(srcToTest);

    if (!srcToTest) {
      setImageStatus("failed");
      setImgSrc(fallbackPlaceholder);
      console.warn(
        "[ProductCard] no image src available for product:",
        product?.id ?? product?._id,
      );
      return;
    }

    console.log("[ProductCard] testing image src:", srcToTest);

    let mounted = true;
    const img = new Image();
    try {
      img.crossOrigin = "anonymous";
    } catch (err) {
      // ignore if not supported
    }

    img.onload = () => {
      if (!mounted) return;
      setImageStatus("loaded");
      setImgSrc(srcToTest);
      console.log("[ProductCard] image loaded OK:", srcToTest);
    };

    img.onerror = (err) => {
      if (!mounted) return;
      setImageStatus("failed");
      setImgSrc(fallbackPlaceholder);
      console.warn("[ProductCard] image failed to load:", srcToTest, err);
    };

    img.src = srcToTest;

    return () => {
      mounted = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [primaryImage, fallbackPlaceholder, product?.id, product?._id]);

  const titleText =
    productTitle || title || product?.name || "Untitled product";

  // Normalize location (many possible shapes)
  let locationText = "Unknown location";
  if (product?.location) {
    if (typeof product.location === "string") locationText = product.location;
    else
      locationText =
        product.location.address ??
        product.locationAddr ??
        product.location.addressLine ??
        locationText;
  }
  locationText =
    locationText || product?.address || product?.loc || "Unknown location";

  // Normalize seller name
  const sellerName =
    product?.sellerName ??
    product?.seller ??
    product?.userName ??
    (product?.userId && typeof product.userId === "object"
      ? (product.userId.name ?? product.userId.username ?? product.userId.$oid)
      : null) ??
    (typeof product.userId === "string" ? product.userId : null) ??
    "Unknown seller";

  const conditionClasses =
    condition === "New"
      ? "bg-green-100 text-green-800"
      : condition === "Used"
        ? "bg-yellow-100 text-yellow-800"
        : condition === "Refurbished"
          ? "bg-blue-100 text-blue-800"
          : "bg-gray-100 text-gray-800";

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 relative">
      {/* IMAGE AREA */}
      <div className="relative overflow-hidden bg-gray-50 border-b border-gray-100">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={titleText}
            decoding="async"
            loading="lazy"
            crossOrigin="anonymous"
            className="w-full h-52 md:h-60 object-contain transition-transform duration-500 group-hover:scale-105 min-h-[160px] bg-white mix-blend-multiply"
            style={{ display: "block" }}
            onError={(e) => {
              console.warn("IMG element onError for", e?.target?.src);
              e.currentTarget.onerror = null;
              setImgSrc(fallbackPlaceholder);
              setImageStatus("failed");
            }}
          />
        ) : (
          <div className="w-full h-48 md:h-56 bg-gray-100 flex items-center justify-center">
            {PlaceholderImage ? (
              <PlaceholderImage
                className="w-full h-full object-cover"
                category={productCategory}
              />
            ) : (
              <img
                src={fallbackPlaceholder}
                alt="placeholder"
                className="w-full h-52 md:h-60 object-cover"
                decoding="async"
                loading="lazy"
              />
            )}
          </div>
        )}

        {/* STATUS BADGE */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${imageStatus === "loaded"
                ? "bg-green-600 text-white"
                : imageStatus === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-red-600 text-white"
              }`}
          >
            {imageStatus === "loaded"
              ? "Image OK"
              : imageStatus === "pending"
                ? "Loading..."
                : "Image Failed"}
          </span>
        </div>

        {/* QUICK VIEW */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button
            onClick={() => onViewDetails?.(product)}
            className="bg-white/90 backdrop-blur-sm text-[#782355] p-2 rounded-full hover:bg-white transition-colors duration-200"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Condition Badge */}
        {condition && (
          <div className="absolute bottom-3 left-3 z-20">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${conditionClasses}`}
            >
              {condition}
            </span>
          </div>
        )}

        {/* DEBUG OVERLAY */}
        <div className="absolute bottom-3 right-3 z-20 text-xs text-white/90">
          <div className="bg-black/50 px-2 py-1 rounded-md">
            <div className="flex items-center gap-2">
              <a
                href={lastTestedSrc || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-white text-[11px] max-w-[160px] truncate block"
                title={lastTestedSrc}
              >
                Open image
              </a>
              <span className="text-[10px] text-gray-200/90">
                {imageStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center">
            <TagIcon className="h-3 w-3 mr-1" />
            {productCategory}
          </div>
          <div className="flex items-center max-w-[50%] truncate">
            <MapPinIcon className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2 line-clamp-2 group-hover:text-[#782355] transition-colors duration-200">
          {titleText}
        </h3>

        {(brand || yearOfManufacture) && (
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            {brand && <span>{brand}</span>}
            {yearOfManufacture && (
              <span className="flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {yearOfManufacture}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-bold text-[#782355]">
              ₹{Number(price || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {(soldCount || viewCount) && (
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-3">
            <span>{soldCount ?? 0} sold</span>
            <span>{viewCount ?? 0} views</span>
          </div>
        )}

        <div className="text-xs text-gray-500 mb-3">
          Sold by: <span className="font-medium">{sellerName}</span>
        </div>

        <button
          onClick={() => onViewDetails?.(product)}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 md:py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg transform active:scale-[0.98]"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
