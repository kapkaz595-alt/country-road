import { ImageResponse } from 'next/og'

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params
  const s = size === '192' ? 192 : 512
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#047857',
          color: '#ffffff',
          fontSize: s * 0.5,
          fontWeight: 700,
        }}
      >
        B
      </div>
    ),
    { width: s, height: s },
  )
}