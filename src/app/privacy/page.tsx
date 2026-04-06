import SimpleHeader from "../../components/SimpleHeader"

export default function PrivacyPage() {
  return (
    <>
      <SimpleHeader />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Privacy Policy
        </h1>

        <p className="mb-8 text-sm text-slate-500">
          Last updated: {new Date().getFullYear()}
        </p>

        <section className="mb-8">
          <p className="text-sm leading-relaxed text-slate-600">
            BayarLink ("we", "our", or "us") respects your privacy and is committed
            to protecting your personal information. This Privacy Policy explains
            how we collect, use, and safeguard your information when you use our
            platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            1. Information We Collect
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Personal information such as name, email address, and contact number</li>
            <li>Business information provided by sellers</li>
            <li>Transaction and payment-related data</li>
            <li>Technical data such as IP address and browser information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>To operate and improve the BayarLink platform</li>
            <li>To process transactions securely</li>
            <li>To communicate important updates and notifications</li>
            <li>To provide customer support</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            3. Data Protection
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            We implement appropriate security measures to protect your data. All
            transactions are encrypted and handled through secure payment gateways.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            4. Sharing of Information
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            We do not sell or rent your personal information. Your data may only be
            shared with trusted third parties such as payment providers, strictly
            for the purpose of delivering our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            5. Your Rights
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            You have the right to access, update, or request deletion of your
            personal data. You may contact us at any time regarding your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            6. Cookies
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            We may use cookies to enhance your experience on our platform. You can
            choose to disable cookies through your browser settings.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            7. Changes to This Policy
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            We may update this Privacy Policy from time to time. Any changes will be
            posted on this page with an updated revision date.
          </p>
        </section>

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
    </>
  )
}
