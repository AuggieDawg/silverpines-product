import { notFound } from "next/navigation";
import MobilePhotoCaptureForm from "@/components/silverpines/MobilePhotoCaptureForm";
import { getManagedAssetByCode } from "@/lib/silverpines/data";

export const dynamic = "force-dynamic";

export default async function SilverPinesCaptureAssetPage({
  params,
}: {
  params: Promise<{ unitCode: string }>;
}) {
  const { unitCode } = await params;
  const assetCode = decodeURIComponent(unitCode).toUpperCase();

  const asset = await getManagedAssetByCode(assetCode);

  if (!asset) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 text-white">
      <MobilePhotoCaptureForm
        assetCode={asset.unitCode}
        propertyName={asset.propertyName}
        unitKind={asset.unitKind}
        inspectionSets={asset.inspectionSets}
      />
    </main>
  );
}