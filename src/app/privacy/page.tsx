export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      
      {/* Title */}
      <h1 className="text-3xl font-bold mb-2 text-slate-900">
        Privacy Policy
      </h1>

      <p className="text-sm text-slate-500 mb-8">
        Last updated: {new Date().getFullYear()}
      </p>

      {/* Intro */}
      <section className="mb-8">
        <p className="text-sm text-slate-600 leading-relaxed">
          BayarLink ("we", "our", or "us") respects your privacy and is committed to protecting your personal information. 
          This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
        </p>
      </section>

      {/* Section 1 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          1. Information We Collect
        </h2>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
          <li>Personal information such as name, email address, and contact number</li>
          <li>Business information provided by sellers</li>
          <li>Transaction and payment-related data</li>
          <li>Technical data such as IP address and browser information</li>
        </ul>
      </section>

      {/* Section 2 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
          <li>To operate and improve the BayarLink platform</li>
          <li>To process transactions securely</li>
          <li>To communicate important updates and notifications</li>
          <li>To provide customer support</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          3. Data Protection
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          We implement appropriate security measures to protect your data. All transactions are encrypted and handled through secure payment gateways.
        </p>
      </section>

      {/* Section 4 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          4. Sharing of Information
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          We do not sell or rent your personal information. Your data may only be shared with trusted third parties such as payment providers, 
          strictly for the purpose of delivering our services.
        </p>
      </section>

      {/* Section 5 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          5. Your Rights
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          You have the right to access, update, or request deletion of your personal data. You may contact us at any time regarding your data.
        </p>
      </section>

      {/* Section 6 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          6. Cookies
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          We may use cookies to enhance your experience on our platform. You can choose to disable cookies through your browser settings.
        </p>
      </section>

      {/* Section 7 */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          7. Changes to This Policy
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
        </p>
      </section>

      {/* Footer Contact */}
      <div className="border-t pt-6 text-sm text-slate-500">
        <p>
          If you have any questions, please contact us at{" "}
          <span className="font-medium text-slate-700">
            support@bayarlink.my
          </span>
        </p>

        <p className="mt-2">
          BayarLink by Neugens Solution (202503301282 / AS0504872)
        </p>
      </div>

    </main>
  )
}
