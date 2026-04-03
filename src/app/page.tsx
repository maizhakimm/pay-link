export default function HomePage() {
  return (
    <main style={pageWrap}>
      {/* HEADER */}
      <header style={header}>
        <div style={container}>
          <div style={headerInner}>
            <img
              src="/GoBayar%20Logo%2001%20800px.svg"
              alt="GoBayar"
              style={logo}
            />

            <div style={headerActions}>
              <a href="/login" style={headerLogin}>Login</a>
              <a href="/signup" style={headerSignup}>Sign Up</a>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={hero}>
        <div style={container}>
          <div style={heroBox}>
            <p style={beta}>Beta</p>

            <h1 style={title}>
              Menjual dengan mudah di WhatsApp hanya dengan 1 link.
              <br />
              Mudah untuk anda, mudah untuk customer!
            </h1>

            <div style={heroButtons}>
              <a href="/signup" style={primaryBtn}>Sign Up</a>
              <a href="/login" style={secondaryBtn}>Login</a>
            </div>

            <div style={trust}>
              ✔ Produk Makanan  
              ✔ Barangan  
              ✔ Servis Perkhidmatan
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={section}>
        <div style={container}>
          <h2 style={sectionTitle}>Masalah</h2>

          <p style={sectionText}>
            Order dah makin banyak… Susah nak track PM satu-satu check order.
            Nak kena cross check payment lagi. Kadang payment terlepas pandang,
            ada yang belum bayar lagi.
          </p>

          <div style={grid}>
            <Card
              title="Customer PM satu-satu"
              text="Nak urus order susah sebab bercampur aduk dengan chat customer semua."
            />
            <Card
              title="Susah nak check payment"
              text="Bila customer buat payment, kena check bank satu-satu. Memang leceh."
            />
            <Card
              title="Susah nak track order"
              text="Bila order bersepah, pening nak check satu-satu PM untuk track semua order."
            />
            <Card
              title="Risau double order"
              text="Kalau stock tak update betul, mudah jadi terlebih jual tanpa sedar."
            />
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section style={sectionAlt}>
        <div style={container}>
          <h2 style={sectionTitle}>Solusi</h2>

          <div style={grid}>
            <Card title="1 link semua produk" text="Letak semua menu dalam satu link." />
            <Card title="Tak perlu check PM" text="Semua order tersusun dalam sistem." />
            <Card title="Track order mudah" text="Tak perlu scroll chat panjang lagi." />
            <Card title="Ada stock control" text="Elak double order secara automatik." />
            <Card
              title="Banyak payment method"
              text="Customer boleh bayar guna FPX, Kad dan PayLater."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={cta}>
        <div style={container}>
          <h2 style={ctaTitle}>
            Tunggu apa lagi?
            <br />
            Tak payah pening. Daftar dulu GoBayar.
          </h2>

          <p style={ctaSub}>Tak kena bayar pun!</p>

          <div style={heroButtons}>
            <a href="/signup" style={primaryBtn}>Sign Up</a>
            <a href="/login" style={secondaryBtnDark}>Login</a>
          </div>

          <div style={trustSmall}>
            ✔ Daftar percuma ✔ Setup kurang 5 minit ✔ Terus boleh jual
          </div>
        </div>
      </section>

      {/* TARGET */}
      <section style={section}>
        <div style={container}>
          <h2 style={sectionTitle}>GoBayar ni untuk siapa?</h2>
          <p style={sectionText}>
            Sesuai untuk peniaga yang online kecil dan sederhana.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={footer}>
        <div style={container}>
          <p>GoBayar</p>
          <p>NEUGENS SOLUTION</p>
          <p>[MASUKKAN NO PENDAFTARAN SYARIKAT]</p>
        </div>
      </footer>
    </main>
  )
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div style={card}>
      <h3 style={cardTitle}>{title}</h3>
      <p style={cardText}>{text}</p>
    </div>
  )
}

/* STYLES */

const pageWrap = { fontFamily: 'sans-serif' }

const container = {
  maxWidth: 1000,
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

const logo = { height: 36 }

const headerActions = { display: 'flex', gap: 10 }

const headerLogin = { textDecoration: 'none', color: '#333' }

const headerSignup = {
  background: '#000',
  color: '#fff',
  padding: '6px 12px',
  borderRadius: 8,
  textDecoration: 'none',
}

const hero = { padding: '60px 0', textAlign: 'center' as const }

const heroBox = { maxWidth: 700, margin: '0 auto' }

const beta = { color: 'blue', fontWeight: 700 }

const title = { fontSize: 32, fontWeight: 800 }

const heroButtons = {
  marginTop: 20,
  display: 'flex',
  gap: 10,
  justifyContent: 'center',
}

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

const trust = { marginTop: 20, fontSize: 14 }

const section = { padding: '60px 0' }

const sectionAlt = { padding: '60px 0', background: '#f5f5f5' }

const sectionTitle = { textAlign: 'center' as const, marginBottom: 20 }

const sectionText = {
  textAlign: 'center' as const,
  marginBottom: 20,
}

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

const cardTitle = { fontWeight: 700 }

const cardText = { fontSize: 14 }

const cta = {
  padding: '60px 0',
  textAlign: 'center' as const,
}

const ctaTitle = { fontSize: 28, fontWeight: 800 }

const ctaSub = { marginTop: 10 }

const trustSmall = { marginTop: 16, fontSize: 13 }

const footer = {
  padding: '40px 0',
  textAlign: 'center' as const,
  borderTop: '1px solid #eee',
}
