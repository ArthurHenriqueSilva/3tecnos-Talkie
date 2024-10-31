
import { NextResponse } from 'next/server';

export async function GET() {
  const talkie = "Talkie";
  return NextResponse.json({message: talkie});
}
