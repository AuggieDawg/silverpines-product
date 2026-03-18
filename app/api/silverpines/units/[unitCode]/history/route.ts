import { requireAdmin } from "@/lib/auth/require";
import { jsonError, jsonOk } from "@/lib/http/json";
import { getManagedAssetHistoryByCode } from "@/lib/silverpines/data";

export async function GET(
  _req: Request,
  context: { params: Promise<{ unitCode: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { unitCode } = await context.params;
  const decodedUnitCode = decodeURIComponent(unitCode);

  try {
    const history = await getManagedAssetHistoryByCode(decodedUnitCode);

    if (!history) {
      return jsonError(404, `No SilverPines history found for ${decodedUnitCode}`);
    }

    return jsonOk({ history });
  } catch (error) {
    return jsonError(500, "Failed to load SilverPines history", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}