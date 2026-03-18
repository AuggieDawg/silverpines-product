import { notFound } from "next/navigation";
import UnitHistoryPage from "@/components/silverpines/UnitHistoryPage";
import { silverPinesUnits } from "@/components/silverpines/mock-data";

export default async function SilverPinesUnitPage({
  params,
}: {
  params: Promise<{ unitCode: string }>;
}) {
  const { unitCode } = await params;
  const decodedUnitCode = decodeURIComponent(unitCode);

  const unit = silverPinesUnits.find((item) => item.unitCode === decodedUnitCode);

  if (!unit) {
    notFound();
  }

  return <UnitHistoryPage unit={unit} />;
}