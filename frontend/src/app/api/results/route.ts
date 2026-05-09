import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const resultsPath  = path.join(process.cwd(), "..", "backend", "data", "results.json")
    const baselinePath = path.join(process.cwd(), "..", "backend", "data", "baseline.json")

    const results  = JSON.parse(fs.readFileSync(resultsPath,  "utf-8"))
    const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf-8"))

    return NextResponse.json({ results, baseline })
  } catch {
    return NextResponse.json({ results: [], baseline: null }, { status: 200 })
  }
}
