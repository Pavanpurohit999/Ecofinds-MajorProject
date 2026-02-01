// src/components/RecommendedForYouSection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import RecommendationRow from "./RecommendationRow";
import { useUserRecommendations } from "../../hooks/useRecommendation.js";

const RecommendedForYouSection = ({ userId }) => {
  const navigate = useNavigate();

  const { products, loading, error } = useUserRecommendations(userId);

  // If user is not logged in / no id, don't show anything
  if (!userId) return null;

  return (
    <RecommendationRow
      title="Recommended for you"
      products={products}
      loading={loading}
      error={error}
      onProductClick={(id) => navigate(`/product/${id}`)}
    />
  );
};

export default RecommendedForYouSection;
