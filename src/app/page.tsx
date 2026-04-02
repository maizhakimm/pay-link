export default function HomePage() {
  return (
    <main style={pageWrap}>
      {/* HERO */}
      <section style={heroSection}>
        <div style={container}>
          <div style={heroCard}>
            <div style={logoWrap}>
              <img
                src="/GoBayar%20Logo%2001%20800px.svg"
                alt="GoBayar"
                style={logo}
              />
            </div>

            <p style={heroMini}>Untuk penjual dari rumah</p>

            <h1 style={heroTitle}>Mudah Jual. Mudah Bayar.</h1>

            <p style={heroText}>
              Jual produk dari rumah tanpa pening urus WhatsApp satu-satu.
              Semua dalam satu link — senang untuk anda, senang untuk customer.
            </p>

            <div style={heroButtonRow}>
              <a href="/signup" style={primaryButton}>
                Sign Up
              </a>
              <a href="/login" style={secondaryButton}>
                Login
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={sectionWrap}>
        <div style={container}>
          <div style={sectionHeader}>
            <p style={sectionMini}>Masalah biasa seller</p>
            <h2 style={sectionTitle}>Pernah rasa macam ni?</h2>
            <p style={sectionText}>
              Ramai penjual dari rumah mula dengan WhatsApp. Tapi bila order makin
              banyak, kerja jadi makin serabut.
            </p>
          </div>

          <div style={cardGrid}>
            <div style={infoCard}>
              <div style={emoji}>💬</div>
              <h3 style={cardTitle}>Customer PM satu-satu</h3>
              <p style={cardText}>
                Jual dalam group WhatsApp, tapi bila orang mula PM seorang demi
                seorang, susah nak urus.
              </p>
            </div>

            <div style={infoCard}>
              <div style={emoji}>💸</div>
              <h3 style={cardTitle}>Susah check payment</h3>
              <p style={cardText}>
                Ada yang dah bayar, ada yang belum. Kena semak satu-satu, kadang
                terlepas pandang.
              </p>
            </div>

            <div style={infoCard}>
              <div style={emoji}>📦</div>
              <h3 style={cardTitle}>Pening nak track order</h3>
              <p style={cardText}>
                Order bercampur dalam chat. Nak cari semula pun ambil masa dan
                memenatkan.
              </p>
            </div>

            <div style={infoCard}>
              <div style={emoji}>📉</div>
              <h3 style={cardTitle}>Tak pasti stock cukup</h3>
              <p style={cardText}>
                Risau double order atau tertinggal update stock bila ramai order
                masuk serentak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section style={softSectionWrap}>
        <div style={container}>
          <div style={sectionHeader}>
            <p style={sectionMini}>Solusi yang lebih mudah</p>
            <h2 style={sectionTitle}>Sekarang semuanya jadi lebih tersusun</h2>
            <p style={sectionText}>
              GoBayar bantu anda urus jualan dengan lebih mudah, walaupun hanya
              berniaga dari rumah.
            </p>
          </div>

          <div style={solutionGrid}>
            <div style={solutionBox}>
              <div style={solutionIcon}>🔗</div>
              <div>
                <h3 style={solutionTitle}>Semua menu dalam 1 link</h3>
                <p style={solutionText}>
                  Letak semua produk, harga dan gambar dalam satu link yang boleh
                  terus dikongsi kepada customer.
                </p>
              </div>
            </div>

            <div style={solutionBox}>
              <div style={solutionIcon}>💳</div>
              <div>
                <h3 style={solutionTitle}>Mudah untuk customer bayar</h3>
                <p style={solutionText}>
                  Bagi customer cara yang lebih mudah untuk buat bayaran tanpa
                  perlu tanya berulang kali.
                </p>
              </div>
            </div>

            <div style={solutionBox}>
              <div style={solutionIcon}>🧾</div>
              <div>
                <h3 style={solutionTitle}>Tak perlu check PM satu-satu</h3>
                <p style={solutionText}>
                  Order dan bayaran lebih tersusun dalam satu sistem, jadi tak
                  perlu scroll chat panjang setiap kali.
                </p>
              </div>
            </div>

            <div style={solutionBox}>
              <div style={solutionIcon}>📊</div>
              <div>
                <h3 style={solutionTitle}>Track order dalam satu tempat</h3>
                <p style={solutionText}>
                  Lebih mudah semak order masuk, status bayaran dan urusan harian
                  tanpa pening kepala.
                </p>
              </div>
            </div>

            <div style={solutionBox}>
              <div style={solutionIcon}>📦</div>
              <div>
                <h3 style={solutionTitle}>Ada stock count</h3>
                <p style={solutionText}>
                  Lebih yakin urus stok dan kurangkan risiko double order bila
                  ramai customer datang serentak.
                </p>
              </div>
            </div>

            <div style={solutionBox}>
              <div style={solutionIcon}>📱</div>
              <div>
                <h3 style={solutionTitle}>Mesra telefon</h3>
                <p style={solutionText}>
                  Sesuai untuk seller yang urus bisnes sepenuhnya melalui telefon,
                  tanpa perlu laptop atau sistem yang rumit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={sectionWrap}>
        <div style={container}>
          <div style={sectionHeader}>
            <p style={sectionMini}>Cara guna</p>
            <h2 style={sectionTitle}>Mulakan dalam 3 langkah mudah</h2>
          </div>

          <div style={stepsGrid}>
            <div style={stepCard}>
              <div style={stepNumber}>1</div>
              <h3 style={cardTitle}>Masukkan produk</h3>
              <p style={cardText}>
                Tambah nama produk, harga, gambar dan stock dengan cara yang
                mudah.
              </p>
            </div>

            <div style={stepCard}>
              <div style={stepNumber}>2</div>
              <h3 style={cardTitle}>Share link</h3>
              <p style={cardText}>
                Hantar link anda ke WhatsApp, Telegram, Instagram atau mana-mana
                platform yang anda gunakan.
              </p>
            </div>

            <div style={stepCard}>
              <div style={stepNumber}>3</div>
              <h3 style={cardTitle}>Terima order dengan lebih kemas</h3>
              <p style={cardText}>
                Customer boleh lihat menu dan buat bayaran dengan lebih mudah,
                sementara anda urus semuanya dengan lebih tersusun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TARGET USERS */}
      <section style={softSectionWrap}>
        <div style={container}>
          <div style={sectionHeader}>
            <p style={sectionMini}>Siapa yang sesuai guna?</p>
            <h2 style={sectionTitle}>GoBayar dibina untuk seller kecil yang aktif online</h2>
          </div>

          <div style={pillWrap}>
            <span style={pill}>🏠 Home-based seller</span>
            <span style={pill}>🍰 Seller makanan & dessert</span>
            <span style={pill}>📱 WhatsApp seller</span>
            <span style={pill}>🛍️ Small business owner</span>
            <span style={pill}>🎁 Penjual preorder</span>
            <span style={pill}>📦 Seller produk harian</span>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={sectionWrap}>
        <div style={container}>
          <div style={pricingCard}>
            <p style={sectionMini}>Pendaftaran</p>
            <h2 style={sectionTitle}>Bermula Secara Percuma</h2>
            <p style={pricingText}>
              Buat masa ini, pendaftaran adalah <strong>percuma</strong>.
            </p>
            <p style={pricingSubText}>
              Anda boleh mula gunakan GoBayar tanpa bayaran pendaftaran.
              Maklumat harga dan pakej akan diumumkan kemudian mengikut keperluan
              pengguna.
            </p>

            <div style={heroButtonRow}>
              <a href="/signup" style={primaryButton}>
                Sign Up
              </a>
              <a href="/login" style={secondaryButton}>
                Login
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={finalCtaSection}>
        <div style={container}>
          <div style={finalCtaCard}>
            <h2 style={finalCtaTitle}>Jom mula jual dengan cara yang lebih mudah</h2>
            <p style={finalCtaText}>
              Kurangkan serabut, susun order dengan lebih kemas, dan mudahkan
              customer untuk buat bayaran.
            </p>

            <div style={heroButtonRow}>
              <a href="/signup" style={primaryButton}>
                Sign Up
              </a>
              <a href="/login" style={secondaryButtonDark}>
                Login
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={footer}>
        <div style={container}>
          <div style={footerInner}>
            <div style={footerBrand}>GoBayar</div>
            <p style={footerText}>
              Platform mudah untuk penjual dari rumah urus produk, order dan bayaran
              dengan lebih tersusun.
            </p>

            <div style={footerDivider} />

            <p style={footerMeta}>
              Nama Syarikat: <strong>NEUGENS SOLUTION</strong>
            </p>
            <p style={footerMeta}>
              No. Pendaftaran: <strong>[MASUKKAN NO PENDAFTARAN SYARIKAT]</strong>
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

const pageWrap = {
  minHeight: '100vh',
  background: '#f8fafc',
} as const

const container = {
  width: '100%',
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '0 16px',
  boxSizing: 'border-box' as const,
} as const

const heroSection = {
  padding: '24px 0 16px',
  background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
} as const

const heroCard = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '24px',
  padding: '28px 20px',
  boxShadow: '0 14px 40px rgba(15,23,42,0.07)',
  textAlign: 'center' as const,
} as const

const logoWrap = {
  marginBottom: '16px',
} as const

const logo = {
  height: '42px',
  width: 'auto',
  display: 'block',
  margin: '0 auto',
} as const

const heroMini = {
  margin: '0 0 10px 0',
  color: '#1d4ed8',
  fontSize: '13px',
  fontWeight: 700,
} as const

const heroTitle = {
  margin: '0 0 12px 0',
  fontSize: '34px',
  lineHeight: 1.15,
  color: '#0f172a',
  fontWeight: 800,
} as const

const heroText = {
  margin: '0 auto',
  maxWidth: '720px',
  color: '#475569',
  fontSize: '16px',
  lineHeight: 1.8,
} as const

const heroButtonRow = {
  display: 'flex',
  gap: '10px',
  justifyContent: 'center',
  flexWrap: 'wrap' as const,
  marginTop: '22px',
} as const

const primaryButton = {
  display: 'inline-block',
  padding: '14px 18px',
  borderRadius: '14px',
  background: '#0f172a',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: '14px',
  minWidth: '140px',
  textAlign: 'center' as const,
} as const

const secondaryButton = {
  display: 'inline-block',
  padding: '14px 18px',
  borderRadius: '14px',
  background: '#ffffff',
  color: '#0f172a',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: '14px',
  minWidth: '140px',
  textAlign: 'center' as const,
  border: '1px solid #cbd5e1',
} as const

const secondaryButtonDark = {
  display: 'inline-block',
  padding: '14px 18px',
  borderRadius: '14px',
  background: '#1e293b',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: '14px',
  minWidth: '140px',
  textAlign: 'center' as const,
  border: '1px solid #334155',
} as const

const sectionWrap = {
  padding: '48px 0',
} as const

const softSectionWrap = {
  padding: '48px 0',
  background: '#ffffff',
} as const

const sectionHeader = {
  textAlign: 'center' as const,
  marginBottom: '22px',
} as const

const sectionMini = {
  margin: '0 0 8px 0',
  color: '#1d4ed8',
  fontSize: '13px',
  fontWeight: 700,
} as const

const sectionTitle = {
  margin: '0 0 10px 0',
  color: '#0f172a',
  fontSize: '28px',
  lineHeight: 1.25,
  fontWeight: 800,
} as const

const sectionText = {
  margin: '0 auto',
  maxWidth: '760px',
  color: '#64748b',
  fontSize: '15px',
  lineHeight: 1.8,
} as const

const cardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
  gap: '14px',
} as const

const infoCard = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '20px',
  padding: '18px',
  boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
} as const

const emoji = {
  fontSize: '28px',
  marginBottom: '10px',
} as const

const cardTitle = {
  margin: '0 0 8px 0',
  color: '#0f172a',
  fontSize: '18px',
  fontWeight: 800,
  lineHeight: 1.35,
} as const

const cardText = {
  margin: 0,
  color: '#64748b',
  fontSize: '14px',
  lineHeight: 1.75,
} as const

const solutionGrid = {
  display: 'grid',
  gap: '14px',
} as const

const solutionBox = {
  display: 'flex',
  gap: '14px',
  alignItems: 'flex-start',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  padding: '16px',
} as const

const solutionIcon = {
  width: '44px',
  height: '44px',
  minWidth: '44px',
  borderRadius: '14px',
  background: '#dbeafe',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px',
} as const

const solutionTitle = {
  margin: '0 0 6px 0',
  color: '#0f172a',
  fontSize: '17px',
  fontWeight: 800,
} as const

const solutionText = {
  margin: 0,
  color: '#64748b',
  fontSize: '14px',
  lineHeight: 1.75,
} as const

const stepsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '14px',
} as const

const stepCard = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '20px',
  padding: '18px',
  boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
} as const

const stepNumber = {
  width: '38px',
  height: '38px',
  borderRadius: '999px',
  background: '#0f172a',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  marginBottom: '10px',
} as const

const pillWrap = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap' as const,
  justifyContent: 'center',
} as const

const pill = {
  display: 'inline-block',
  padding: '10px 14px',
  borderRadius: '999px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  color: '#334155',
  fontSize: '14px',
  fontWeight: 700,
} as const

const pricingCard = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '24px',
  padding: '26px 20px',
  textAlign: 'center' as const,
  boxShadow: '0 14px 40px rgba(15,23,42,0.05)',
} as const

const pricingText = {
  margin: '0 0 8px 0',
  color: '#0f172a',
  fontSize: '18px',
  lineHeight: 1.7,
} as const

const pricingSubText = {
  margin: '0 auto',
  maxWidth: '720px',
  color: '#64748b',
  fontSize: '15px',
  lineHeight: 1.8,
} as const

const finalCtaSection = {
  padding: '24px 0 54px',
} as const

const finalCtaCard = {
  background: '#0f172a',
  color: '#ffffff',
  borderRadius: '26px',
  padding: '30px 20px',
  textAlign: 'center' as const,
} as const

const finalCtaTitle = {
  margin: '0 0 10px 0',
  fontSize: '30px',
  lineHeight: 1.2,
  fontWeight: 800,
} as const

const finalCtaText = {
  margin: '0 auto',
  maxWidth: '700px',
  color: '#cbd5e1',
  fontSize: '15px',
  lineHeight: 1.8,
} as const

const footer = {
  background: '#ffffff',
  borderTop: '1px solid #e5e7eb',
  padding: '24px 0 36px',
} as const

const footerInner = {
  textAlign: 'center' as const,
} as const

const footerBrand = {
  color: '#0f172a',
  fontSize: '20px',
  fontWeight: 800,
  marginBottom: '8px',
} as const

const footerText = {
  margin: '0 auto 16px',
  maxWidth: '700px',
  color: '#64748b',
  fontSize: '14px',
  lineHeight: 1.8,
} as const

const footerDivider = {
  height: '1px',
  background: '#e5e7eb',
  maxWidth: '640px',
  margin: '0 auto 16px',
} as const

const footerMeta = {
  margin: '6px 0',
  color: '#475569',
  fontSize: '14px',
  lineHeight: 1.7,
} as const
