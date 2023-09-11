export function Header ({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{ fontSize: '27px', fontWeight: '700', marginBottom: '1rem' }}>
      {children}
    </h1>
  )
}
