export default function HomePage() {
  return (
    <main style={pageWrap}>
      {/* HEADER */}
      <header style={header}>
        <div style={container}>
          <div style={headerInner}>
            <div style={brandRow}>
              <img
                src="/GoBayar%20Logo%2001%20800px.svg"
                alt="GoBayar"
                style={logo}
              />
            </div>

            <div style={headerActions}>
              <a href="/login" style={headerLogin}>
                Login
              </a>
              <a href="/signup" style={headerSignup}>
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={heroSection}>
        <div style={container}>
          <div style={heroGrid}>
            <div>
              <p style={heroMini}>Untuk penjual dari rumah</p>
              <h1 style={heroTitle}>Mudah Jual. Mudah Bayar.</h1>
              <p style={heroText}>
                Jual produk tanpa pening urus WhatsApp satu-satu. Semua dalam
                satu link — lebih mudah untuk anda, lebih senang untuk customer.
              </p>

              <div style={heroButtonRow}>
                <a href="/signup" style={primaryButton}>
                  Sign Up
                </a>
                <a href="/login" style={secondaryButton}>
                  Login
                </a>
              </div>

              <div style={trustRow}>
                <span style={trustPill}>✅ Sesuai untuk home-based seller</span>
                <span style={trustPill}>✅ Mobile friendly</span>
                <span style={trustPill}>✅ Bermula secara percuma</span>
              </div>
            </div>

            <div style={mockWrap}>
              <div style={mockPhone}>
                <div style={mockScreen}>
                  <div style={mockStoreHeader}>
                    <div style={mockAvatar}>G</div>
                    <div>
                      <div style={mockStoreName}>GoBayar Demo Shop</div>
                      <div style={mockStoreSub}>Menu & bayaran dalam satu link</div>
                    </div>
                  </div>

                  <div style={mockProductCard}>
                    <div style={mockProductImage}>🍱</div>
                    <div style={{ flex: 1 }}>
                      <div style={mockProductName}>Nasi Lemak Ayam</div>
                      <div style={mockProductPrice}>RM 8.00</div>
                      <div style={mockStock}>Stock tersedia</div>
                    </div>
                  </div>

                  <div style={mockProductCard}>
                    <div style={mockProductImage}>🧁</div>
                    <div style={{ flex: 1 }}>
                      <div style={mockProductName}>Mini Cupcake Box</div>
                      <div style={mockProductPrice}>RM 15.00</div>
                      <div style={mockStock}>Stock tersedia</div>
                    </div>
                  </div>

                  <div style={mockButton}>Customer terus order & bayar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={sectionWrap}>
        <div style={container}>
          <div style={sectionHeader}>
            <p style={sectionMini}>Masalah biasa seller</p>
            <h2 style={sectionTitle}>Jual makin banyak… tapi makin pening?</h2>
            <p style={sectionText}>
              Ramai penjual mula dengan group WhatsApp dan chat peribadi. Bila
              order bertambah, semuanya jadi serabut dan susah nak track.
            </p>
          </div>

          <div style={grid4}>
            <div style={infoCard}>
              <div style={emoji}>💬</div>
              <h3 style={cardTitle}>Customer PM satu-satu</h3>
              <p style={cardText}>
                Bila ramai mula tanya dan order dalam chat, susah nak urus dengan
                kemas.
              </p>
            </div>

            <div style={infoCard}>
              <div style={emoji}>💸</div>
              <h3 style={cardTitle}>Susah nak check payment</h3>
              <p style={cardText}>
                Ada yang dah bayar, ada yang belum. Kena semak satu-satu dan
                mudah terlepas pandang.
              </p>
            </div>

            <div style={infoCard}>
              <div style={emoji}>📦</div>
              <h3 style={cardTitle}>Pening nak track order</h3>
              <p style={cardText}>
                Order bercampur dalam PM. Nak cari semula pun ambil masa.
              </p>
            </div>

            <div style={infoCard}>
              <div style={emoji}>⚠️</div>
              <h3 style={cardTitle}>Risau double order</h3>
              <p style={cardText}>
                Bila stock tak dikawal dengan baik, mudah jadi terlebih jual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section style={softSectionWrap}>
        <div style={container}>
          <div style={sectionHeader}>
            <p style={sectionMini}>Solusi GoBayar</p>
            <h2 style={sectionTitle}>Sekarang semuanya jadi lebih mudah</h2>
            <p style={sectionText}>
              GoBayar bantu seller dari rumah urus produk, order dan bayaran
              dalam satu sistem yang ringkas dan mudah difahami.
            </p>
          </div>

          <div style={solutionGrid}>
            <div style={solutionBox}>
              <div style={solutionIcon}>🔗</div>
              <div>
                <h3 style={solutionTitle}>Semua menu dalam 1 link</h3>
                <p style={solutionText}>
                  Share satu link sahaja supaya customer terus nampak semua menu,
                  harga dan pilihan yang anda jual.
                </p>
              </div>
            </div>

            <div style={solutionBox}>
              <div style={solutionIcon}>💳</div>
              <div>
                <h3 style={solutionTitle}>Mudah untuk customer bayar</h3>
                <p style={solutionText}>
                  Customer boleh terus pilih dan buat bayaran dengan lebih mudah,
                  tanpa perlu tanya banyak kali.
                </p>
              </div>
            </div>

            <div style={solutionBox}>
              <div style={solutionIcon}>📋</div>
              <div>
                <h3 style={solutionTitle}>Tak perlu check PM satu-satu</h3>
                <p style={solutionText}>
                  Order lebih tersusun dan mudah disemak dalam satu tempat.
                </p>
              </div>
            </div>

            <div style={solutionBox}>
              <div style={solutionIcon}>📦</div>
              <div>
                <h3 style={solutionTitle}>Track order dalam satu sistem</h3>
                <p style={solutionText}>
                  Lebih senang tengok order masuk, semak bayaran, dan urus jualan
                  harian dengan lebih kemas.
                </p>
              </div>
            </div>

            <div style={solutionBox}>
              <div style={solutionIcon}>📉</div>
              <div>
                <h3 style={solutionTitle}>Ada stock count</h3>
                <p style={solutionText}>
                  Kurangkan risiko double order dan lebih yakin semasa terima
                  tempahan.
                </p>
              </div>
            </div>

            <div style={solutionBox}>
              <div style={solutionIcon}>📱</div>
              <div>
                <h3 style={solutionTitle}>Mesra telefon</h3>
                <p style={solutionText}>
                  Dibina untuk seller yang urus semuanya terus dari telefon.
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
                ringkas.
              </p>
            </div>

            <div style={stepCard}>
              <div style={stepNumber}>2</div>
              <h3 style={cardTitle}>Share link</h3>
              <p style={cardText}>
                Hantar link kedai anda ke WhatsApp, Telegram, Instagram atau
                mana-mana platform yang anda gunakan.
              </p>
            </div>

            <div style={stepCard}>
              <div style={stepNumber}>3</div>
              <h3 style={cardTitle}>Terima order dengan lebih kemas</h3>
              <p style={cardText}>
                Customer pilih menu dan buat bayaran, anda pula boleh semak order
                dengan lebih tersusun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TARGET USERS */}
      <section style={softSectionWrap}>
        <div style={container}>
          <div style={sectionHeader}>
            <p style={sectionMini}>Siapa yang sesuai?</p>
            <h2 style={sectionTitle}>Dibina khas untuk seller kecil yang aktif online</h2>
          </div>

          <div style={pillWrap}>
            <span style={pill}>🏠 Home-based seller</span>
            <span style={pill}>🍰 Seller makanan & dessert</span>
            <span style={pill}>📱 WhatsApp seller</span>
            <span style={pill}>🎁 Seller preorder</span>
            <span style={pill}>🛍️ Small business owner</span>
            <span style={pill}>📦 Penjual produk harian</span>
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
              Maklumat harga dan pakej akan diperkenalkan kemudian mengikut
              keperluan pengguna.
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

      {/* FAQ */}
      <section style={softSectionWrap}>
        <div style={container}>
          <div style={sectionHeader}>
            <p style={sectionMini}>Soalan Lazim</p>
            <h2 style={sectionTitle}>FAQ</h2>
          </div>

          <div style={faqWrap}>
            <div style={faqItem}>
              <h3 style={faqQuestion}>Adakah GoBayar sesuai untuk penjual dari rumah?</h3>
              <p style={faqAnswer}>
                Ya. GoBayar dibina khas untuk memudahkan penjual kecil dan
                home-based seller yang aktif mengambil order melalui WhatsApp dan
                media sosial.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQuestion}>Adakah saya perlu website sendiri?</h3>
              <p style={faqAnswer}>
                Tidak perlu. Anda hanya perlu masukkan produk dan share link anda
                kepada customer.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQuestion}>Boleh guna melalui telefon sahaja?</h3>
              <p style={faqAnswer}>
                Ya. GoBayar dibina supaya mudah digunakan melalui telefon tanpa
                perlu bergantung kepada laptop.
              </p>
            </div>

            <div style={faqItem}>
              <h3 style={faqQuestion}>Adakah pendaftaran percuma?</h3>
              <p style={faqAnswer}>
                Ya, buat masa ini pendaftaran adalah percuma. Maklumat pakej akan
                diumumkan kemudian.
              </p>
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
              Platform mudah untuk penjual dari rumah urus produk, order dan
              bayaran dengan lebih tersusun.
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
  maxWidth: '1120px',
  margin: '0 auto',
  padding: '0 16px',
  boxSizing: 'border-box' as const,
} as const

const header = {
  position: 'sticky' as const,
  top: 0,
  zIndex: 20,
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid #e5e7eb',
} as const

const headerInner = {
  minHeight: '72px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
} as const

const brandRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
} as const

const logo = {
  height: '38px',
  width: 'auto',
  display: 'block',
} as const

const headerActions = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  flexWrap: 'wrap' as const,
} as const

const headerLogin = {
  display: 'inline-block',
  textDecoration: 'none',
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: 700,
  padding: '10px 14px',
  borderRadius: '12px',
} as const

const headerSignup = {
  display: 'inline-block',
  textDecoration: 'none',
  color: '#ffffff',
  background: '#0f172a',
  fontSize: '14px',
  fontWeight: 700,
  padding: '10px 14px',
  borderRadius: '12px',
} as const

const heroSection = {
  padding: '34px 0 26px',
  background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
} as const

const heroGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '24px',
  alignItems: 'center',
} as const

const heroMini = {
  margin: '0 0 10px 0',
  color: '#1d4ed8',
  fontSize: '13px',
  fontWeight: 700,
} as const

const heroTitle = {
  margin: '0 0 12px 0',
  fontSize: '40px',
  lineHeight: 1.1,
  color: '#0f172a',
  fontWeight: 800,
} as const

const heroText = {
  margin: 0,
  color: '#475569',
  fontSize: '16px',
  lineHeight: 1.8,
  maxWidth: '640px',
} as const

const heroButtonRow = {
  display: 'flex',
  gap: '10px',
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

const trustRow = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap' as const,
  marginTop: '16px',
} as const

const trustPill = {
  display: 'inline-block',
  padding: '8px 12px',
  borderRadius: '999px',
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  color: '#334155',
  fontSize: '12px',
  fontWeight: 700,
} as const

const mockWrap = {
  display: 'flex',
  justifyContent: 'center',
} as const

const mockPhone = {
  width: '290px',
  maxWidth: '100%',
  background: '#0f172a',
  borderRadius: '30px',
  padding: '14px',
  boxShadow: '0 30px 60px rgba(15,23,42,0.18)',
} as const

const mockScreen = {
  background: '#ffffff',
  borderRadius: '22px',
  padding: '16px',
  display: 'grid',
  gap: '12px',
} as const

const mockStoreHeader = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
} as const

const mockAvatar = {
  width: '42px',
  height: '42px',
  borderRadius: '999px',
  background: '#dbeafe',
  color: '#1d4ed8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
} as const

const mockStoreName = {
  color: '#0f172a',
  fontSize: '15px',
  fontWeight: 800,
} as const

const mockStoreSub = {
  color: '#64748b',
  fontSize: '12px',
} as const

const mockProductCard = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '10px',
} as const

const mockProductImage = {
  width: '54px',
  height: '54px',
  borderRadius: '14px',
  background: '#e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
} as const

const mockProductName = {
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: 800,
  marginBottom: '4px',
} as const

const mockProductPrice = {
  color: '#1d4ed8',
  fontSize: '14px',
  fontWeight: 800,
  marginBottom: '4px',
} as const

const mockStock = {
  color: '#64748b',
  fontSize: '12px',
} as const

const mockButton = {
  marginTop: '4px',
  padding: '12px 14px',
  borderRadius: '14px',
  background: '#0f172a',
  color: '#ffffff',
  textAlign: 'center' as const,
  fontWeight: 800,
  fontSize: '14px',
} as const

const sectionWrap = {
  padding: '54px 0',
} as const

const softSectionWrap = {
  padding: '54px 0',
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
  fontSize: '30px',
  lineHeight: 1.2,
  fontWeight: 800,
} as const

const sectionText = {
  margin: '0 auto',
  maxWidth: '760px',
  color: '#64748b',
  fontSize: '15px',
  lineHeight: 1.8,
} as const

const grid4 = {
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

const faqWrap = {
  display: 'grid',
  gap: '12px',
  maxWidth: '860px',
  margin: '0 auto',
} as const

const faqItem = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  padding: '18px',
} as const

const faqQuestion = {
  margin: '0 0 8px 0',
  color: '#0f172a',
  fontSize: '17px',
  fontWeight: 800,
} as const

const faqAnswer = {
  margin: 0,
  color: '#64748b',
  fontSize: '14px',
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
  fontSize: '32px',
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
