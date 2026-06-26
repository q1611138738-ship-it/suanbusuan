import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // 埋点全量落库（在 Vercel 中可通过应用日志进行收集，或后续接入专门的 DB/监控系统）
    console.log(
      JSON.stringify({
        event: 'infer_time_telemetry',
        timestamp: new Date().toISOString(),
        payload: data
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Infer-time telemetry error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
