import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { ArticlePage } from "@/components/ArticlePage";
import { getGuide } from "@/lib/guides";

export default function Guide() {
  const { slug } = useParams();
  const guide = getGuide(slug);

  useEffect(() => {
    if (guide) window.scrollTo(0, 0);
  }, [guide]);

  if (!guide) return <Navigate to="/guides" replace />;
  return <ArticlePage guide={guide} />;
}
