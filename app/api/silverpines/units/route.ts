import { requireAdmin } from "@/lib/auth/require";
import { jsonError, jsonOk } from "@/lib/http/json";
import { listManagedAssets } from "@/lib/silverpines/data";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);

  try {
    const items = await listManagedAssets({
      propertyCode: searchParams.get("propertyCode") ?? "SILVER",
      query: searchParams.get("q") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      garageIndicator: searchParams.get("garageIndicator") ?? undefined,
      unitKind: searchParams.get("unitKind") ?? undefined,
    });

    return jsonOk({
      items,
      total: items.length,
    });
  } catch (error) {
    return jsonError(500, "Failed to load SilverPines units", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}