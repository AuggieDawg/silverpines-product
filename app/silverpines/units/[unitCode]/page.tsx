import { notFound } from "next/navigation";
import UnitHistoryPage from "@/components/silverpines/UnitHistoryPage";
import { getManagedAssetByCode } from "@/lib/silverpines/data";

export const dynamic = "force-dynamic";

export default async function SilverPinesUnitPage({
  params,
}: {
  params: Promise<{ unitCode: string }>;
}) {
  const { unitCode } = await params;
  const decodedUnitCode = decodeURIComponent(unitCode);

  const unit = await getManagedAssetByCode(decodedUnitCode);

  if (!unit) {
    notFound();
  }

  return <UnitHistoryPage unit={unit} />;
}