import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

import * as parseWorkout from '@lib/parse-workout.js'

const TXT_DIR = path.join(process.cwd(), 'data', 'txt')

export async function GET() {
  const files = fs.readdirSync(TXT_DIR).filter(f => f.endsWith('.txt'))
  return NextResponse.json({ files })
}

export async function POST(req: NextRequest) {
  const { filename } = await req.json()
  if (!filename) return NextResponse.json({ error: 'Missing filename' }, { status: 400 })

  const filePath = path.join(TXT_DIR, filename)
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'File not found' }, { status: 404 })

  const text = fs.readFileSync(filePath, 'utf-8')
  const json = parseWorkout.processFileContent(text)
  return NextResponse.json({ json })
}