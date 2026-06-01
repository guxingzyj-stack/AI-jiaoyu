import { S4ChapterRunner } from "../../../components/S4ChapterRunner";
import { geometryMountainAssets } from "../../../lib/geometryMountainAssets";
import { geometryMountainContent } from "../../../lib/geometryMountainContentSource";

export default function GeometryMountainPage() {
  return <S4ChapterRunner assets={geometryMountainAssets} content={geometryMountainContent} />;
}
