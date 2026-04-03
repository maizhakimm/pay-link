export default function HomePage() {
  return (
    <main style={wrap}>
      {/* HEADER */}
      <header style={header}>
        <div style={container}>
          <div style={nav}>
            <div style={logo}>GoBayar</div>

            <div style={navActions}>
              <a href="/login" style={navLink}>Login</a>
              <a href="/signup" style={navBtn}>Sign Up</a>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={hero}>
        <div style={container}>
          <div style={heroInner}>
            <div style={badge}>Beta</div>

            <h1 style={heroTitle}>
              Jual di WhatsApp<br />
              <span style={{ color: '#6366f1' }}>hanya dengan 1 link</span>
            </h1>

            <p style={heroSub}>
              Mudah untuk anda, mudah untuk customer.  
              Tak perlu pening urus PM, payment dan order lagi.
            </p>

            <div style={ctaRow}>
              <a href="/signup" style={primaryBtn}>Start Free</a>
              <a
                href="/shop/maiz-kitchen"
                target="_blank"
                style={ghostBtn}
              >
                View Demo Shop
              </a>
            </div>

            <div style={trust}>
              ✔ Setup kurang 5 minit  
              ✔ Mobile friendly  
              ✔ Terus boleh jual
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={section}>
        <div style={container}>
          <h2 style={sectionTitle}>Masalah biasa seller</h2>

          <div style={grid}>
            <Card
              title="Customer PM satu-satu"
              text="Order bercampur dengan chat, susah nak urus dengan kemas."
            />
            <Card
              title="Susah check payment"
              text="Setiap kali bayar, kena buka bank dan semak satu-satu."
            />
            <Card
              title="Track order serabut"
              text="Order bersepah dalam PM, susah nak cari semula."
            />
            <Card
              title="Risau double order"
              text="Stock tak update, mudah terlebih jual tanpa sedar."
            />
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section style={sectionAlt}>
        <div style={container}>
          <h2 style={sectionTitle}>GoBayar selesaikan semua</h2>

          <div style={grid}>
            <Card title="1 link semua produk" text="Share sekali, terus boleh order." />
            <Card title="Auto collect order" text="Tak perlu check PM satu-satu." />
            <Card title="Payment auto track" text="Tak perlu check bank manual." />
            <Card title="Stock auto update" text="Elak oversell dan double order." />
            <Card title="Multi payment" text="FPX, Kad & PayLater tersedia." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={cta}>
        <div style={container}>
          <h2 style={ctaTitle}>
            Tak payah pening lagi.
            <br />
            Start jual cara lebih smart.
          </h2>

          <div style={ctaRow}>
            <a href="/signup" style={primaryBtn}>Sign Up Free</a>
            <a href="/login" style={ghostBtnDark}>Login</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={footer}>
        <p>GoBayar</p>
        <p>NEUGENS SOLUTION</p>
        <p>SSM: [MASUKKAN NO PENDAFTARAN]</p>
      </footer>

      {/* FLOATING WHATSAPP */}
      <a
        href="https://wa.me/60163352087"
        target="_blank"
        style={whatsapp}
      >
        💬
      </a>
    </main>
  )
}

/* COMPONENT */
function Card({ title, text }: any) {
  return (
    <div style={card}>
      <h3 style={cardTitle}>{title}</h3>
      <p style={cardText}>{text}</p>
    </div>
  )
}

/* STYLES */

const wrap = { fontFamily: 'system-ui, sans-serif', color: '#111' }

const container = {
  maxWidth: 1000,
  margin: '0 auto',
  padding: '0 20px',
}

const header = {
  borderBottom: '1px solid #eee',
  background: '#fff',
}

const nav = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px 0',
}

const logo = { fontWeight: 800 }

const navActions = { display: 'flex', gap: 12 }

const navLink = { textDecoration: 'none', color: '#333' }

const navBtn = {
  background: '#111',
  color: '#fff',
  padding: '6px 12px',
  borderRadius: 8,
  textDecoration: 'none',
}

const hero = { padding: '80px 0', textAlign: 'center' }

const heroInner = { maxWidth: 600, margin: '0 auto' }

const badge = {
  display: 'inline-block',
  background: '#eef2ff',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  marginBottom: 16,
}

const heroTitle = {
  fontSize: 40,
  fontWeight: 800,
  marginBottom: 16,
}

const heroSub = {
  color: '#555',
  marginBottom: 20,
}

const ctaRow = {
  display: 'flex',
  justifyContent: 'center',
  gap: 10,
  flexWrap: 'wrap',
}

const primaryBtn = {
  background: '#111',
  color: '#fff',
  padding: '12px 18px',
  borderRadius: 10,
  textDecoration: 'none',
}

const ghostBtn = {
  border: '1px solid #ddd',
  padding: '12px 18px',
  borderRadius: 10,
  textDecoration: 'none',
}

const ghostBtnDark = {
  background: '#eee',
  padding: '12px 18px',
  borderRadius: 10,
  textDecoration: 'none',
}

const trust = {
  marginTop: 16,
  fontSize: 13,
  color: '#666',
}

const section = { padding: '60px 0' }
const sectionAlt = { padding: '60px 0', background: '#f9fafb' }

const sectionTitle = {
  textAlign: 'center',
  marginBottom: 30,
  fontSize: 24,
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
  gap: 16,
}

const card = {
  padding: 18,
  border: '1px solid #eee',
  borderRadius: 12,
  background: '#fff',
}

const cardTitle = { fontWeight: 700, marginBottom: 6 }
const cardText = { fontSize: 14, color: '#555' }

const cta = {
  padding: '60px 0',
  textAlign: 'center',
}

const ctaTitle = {
  fontSize: 28,
  fontWeight: 800,
  marginBottom: 20,
}

const footer = {
  padding: '40px 0',
  textAlign: 'center',
  borderTop: '1px solid #eee',
}

const whatsapp = {
  position: 'fixed',
  bottom: 20,
  right: 20,
  background: '#25D366',
  color: '#fff',
  width: 55,
  height: 55,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 24,
  textDecoration: 'none',
}
