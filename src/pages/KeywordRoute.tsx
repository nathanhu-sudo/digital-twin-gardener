import { useParams } from "react-router-dom";
import NotFound from "./NotFound";
import { KeywordPageView } from "@/components/KeywordPage";
import { getKeywordPage } from "@/lib/keywordPages";

export default function KeywordRoute() {
  const { slug } = useParams();
  const page = getKeywordPage(slug);
  if (!page) return <NotFound />;
  return <KeywordPageView page={page} />;
}
