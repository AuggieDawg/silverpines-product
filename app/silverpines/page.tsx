import SilverPinesDashboard from "@/components/silverpines/SilverPinesDashboard";
import { listManagedAssets } from "@/lib/silverpines/data";

export const dynamic = "force-dynamic";

export default async function SilverPinesPage() {
  const initialRows = await listManagedAssets({
    propertyCode: "SILVER",
  });

  return <SilverPinesDashboard initialRows={initialRows} />;
}