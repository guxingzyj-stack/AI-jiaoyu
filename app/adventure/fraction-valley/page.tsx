import { S4ChapterRunner } from "../../../components/S4ChapterRunner";
import { fractionValleyAssets } from "../../../lib/fractionValleyAssets";
import { fractionValleyContent } from "../../../lib/fractionValleyContentSource";

export default function FractionValleyPage() {
  return <S4ChapterRunner assets={fractionValleyAssets} content={fractionValleyContent} />;
}
