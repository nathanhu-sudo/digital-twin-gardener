import NotFound from "./NotFound";
import { KeywordPageView } from "@/components/KeywordPage";
import { getKeywordPage } from "@/lib/keywordPages";

export default function KeywordRoute({ slug }: { slug: string }) {
  const page = getKeywordPage(slug);
  if (!page) return <NotFound />;
  return <KeywordPageView page={page} />;
}
