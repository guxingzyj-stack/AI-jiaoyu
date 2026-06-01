import { S4ChapterRunner } from "../../../components/S4ChapterRunner";
import { timeCityAssets } from "../../../lib/timeCityAssets";
import { timeCityContent } from "../../../lib/timeCityContentSource";

export default function TimeCityPage() {
  return <S4ChapterRunner assets={timeCityAssets} content={timeCityContent} />;
}
