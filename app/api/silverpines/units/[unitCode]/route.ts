import { requireAdmin } from "@/lib/auth/require";
import { jsonError, jsonOk } from "@/lib/http/json";
import { getManagedAssetByCode } from "@/lib/silverpines/data";

export async function GET(
  _req: Request,
  context: { params: Promise<{ unitCode: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { unitCode } = await context.params;
  const decodedUnitCode = decodeURIComponent(unitCode);

  try {
    const asset = await getManagedAssetByCode(decodedUnitCode);

    if (!asset) {
      return jsonError(404, `No SilverPines asset found for ${decodedUnitCode}`);
    }

    return jsonOk({ unit: asset });
  } catch (error) {
    return jsonError(500, "Failed to load SilverPines asset", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}