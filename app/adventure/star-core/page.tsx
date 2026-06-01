import { S4ChapterRunner } from "../../../components/S4ChapterRunner";
import { starCoreAssets } from "../../../lib/starCoreAssets";
import { starCoreContent } from "../../../lib/starCoreContentSource";

export default function StarCorePage() {
  return <S4ChapterRunner assets={starCoreAssets} content={starCoreContent} />;
}
