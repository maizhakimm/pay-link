export default function HomePage() {
  return (
    <main style={page}>
      {/* HEADER */}
      <header style={header}>
        <div style={container}>
          <div style={headerInner}>
            <div style={logoText}>GoBayar</div>

            <div style={nav}>
              <a href="/login" style={navLink}>Login</a>
              <a href="/signup" style={navButton}>Sign Up</a>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={hero}>
        <div style={container}>
          <div style={heroGrid}>
            <div>
              <p style={tag}>Untuk penjual dari rumah</p>
              <h1 style={title}>Mudah Jual. Mudah Bayar.</h1>

              <p style={subtitle}>
                Jual produk tanpa pening urus WhatsApp satu-satu.
                Semua dalam satu link — lebih mudah, lebih tersusun.
              </p>

              <div style={ctaRow}>
                <a href="/signup" style={primaryBtn}>Start Selling</a>
                <a href="/login" style={secondaryBtn}>Login</a>
              </div>
            </div>

            {/* MOCK PHONE */}
            <div style={phoneWrap}>
              <div style={phone}>
                <div style={phoneScreen}>
                  <p style={{ fontWeight: 700 }}>Nasi Lemak Ayam</p>
                  <p>RM8.00</p>
                  <button style={mockBtn}>Order Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={section}>
        <div style={container}>
          <h2 style={sectionTitle}>Jual makin banyak… tapi makin pening?</h2>

          <div style={grid}>
            <Card text="Customer PM satu-satu" />
            <Card text="Susah check payment" />
            <Card text="Order bercampur dalam chat" />
            <Card text="Risau double order" />
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section style={sectionAlt}>
        <div style={container}>
          <h2 style={sectionTitle}>Sekarang semuanya jadi mudah</h2>

          <div style={grid}>
            <Card text="Semua menu dalam 1 link" />
            <Card text="Customer terus boleh bayar" />
            <Card text="Tak perlu check PM satu-satu" />
            <Card text="Track order dalam satu sistem" />
            <Card text="Ada stock control" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={ctaSection}>
        <div style={container}>
          <h2 style={{ fontSize: 28 }}>Jom mula sekarang</h2>
          <div style={ctaRow}>
            <a href="/signup" style={primaryBtn}>Sign Up</a>
            <a href="/login" style={secondaryBtnDark}>Login</a>
          </div>
        </div>
      </section>
    </main>
  )
}

function Card({ text }: { text: string }) {
  return <div style={card}>{text}</div>
}

/* STYLES */
const page = { fontFamily: 'sans-serif' }

const container = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '0 16px',
}

const header = {
  position: 'sticky' as const,
  top: 0,
  background: '#fff',
  borderBottom: '1px solid #eee',
}

const headerInner = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '12px 0',
}

const logoText = { fontWeight: 800 }

const nav = { display: 'flex', gap: 12 }

const navLink = { textDecoration: 'none', color: '#333' }

const navButton = {
  background: '#000',
  color: '#fff',
  padding: '6px 12px',
  borderRadius: 8,
  textDecoration: 'none',
}

const hero = { padding: '60px 0' }

const heroGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 20,
}

const tag = { color: 'blue' }

const title = { fontSize: 40, fontWeight: 800 }

const subtitle = { marginTop: 10 }

const ctaRow = { marginTop: 20, display: 'flex', gap: 10 }

const primaryBtn = {
  background: '#000',
  color: '#fff',
  padding: '12px 16px',
  borderRadius: 10,
  textDecoration: 'none',
}

const secondaryBtn = {
  border: '1px solid #ccc',
  padding: '12px 16px',
  borderRadius: 10,
  textDecoration: 'none',
}

const secondaryBtnDark = {
  background: '#333',
  color: '#fff',
  padding: '12px 16px',
  borderRadius: 10,
  textDecoration: 'none',
}

const phoneWrap = { display: 'flex', justifyContent: 'center' }

const phone = {
  width: 200,
  height: 400,
  background: '#000',
  borderRadius: 20,
  padding: 10,
}

const phoneScreen = {
  background: '#fff',
  height: '100%',
  borderRadius: 10,
  padding: 10,
}

const mockBtn = {
  marginTop: 20,
  background: '#000',
  color: '#fff',
  padding: 8,
  borderRadius: 6,
}

const section = { padding: '60px 0' }
const sectionAlt = { padding: '60px 0', background: '#f5f5f5' }

const sectionTitle = { textAlign: 'center' as const, marginBottom: 20 }

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
  gap: 12,
}

const card = {
  padding: 16,
  background: '#fff',
  borderRadius: 12,
  border: '1px solid #eee',
}

const ctaSection = {
  padding: '60px 0',
  textAlign: 'center' as const,
}
