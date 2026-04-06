export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2 text-slate-900">
        Terms & Conditions
      </h1>

      <p className="text-sm text-slate-500 mb-8">
        Last updated: {new Date().getFullYear()}
      </p>

      <section className="mb-8">
        <p className="text-sm text-slate-600 leading-relaxed">
          Welcome to BayarLink. These Terms & Conditions govern your access to
          and use of the BayarLink platform. By accessing or using BayarLink,
          you agree to be bound by these terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          1. Use of Platform
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          BayarLink is provided as a platform to help sellers manage products,
          orders, and payment-related workflows. You agree to use the platform
          only for lawful business purposes and in a manner that does not harm
          the platform, its users, or third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          2. User Responsibility
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Users are fully responsible for their own products, pricing,
          descriptions, customer communications, order fulfilment, and business
          dealings. BayarLink does not take ownership of the products or
          services sold by sellers on the platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          3. Payments and Transactions
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          BayarLink may support payment-related workflows through connected
          payment providers or third-party services. Sellers are responsible for
          ensuring that payment details, pricing, and fulfilment information are
          accurate. BayarLink is not responsible for disputes arising directly
          between sellers and customers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          4. Account and Access
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activities under your account.
          BayarLink reserves the right to suspend or restrict access where
          misuse, suspicious activity, or policy violations are detected.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          5. Platform Availability
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          We aim to keep BayarLink available and functioning smoothly, but we do
          not guarantee uninterrupted access at all times. Temporary downtime,
          maintenance, system upgrades, or third-party service interruptions may
          affect availability from time to time.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          6. Prohibited Activities
        </h2>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
          <li>Using the platform for unlawful, fraudulent, or misleading purposes</li>
          <li>Uploading false, inaccurate, or deceptive product information</li>
          <li>Attempting to disrupt, damage, or gain unauthorized access to the platform</li>
          <li>Using BayarLink in ways that may harm customers, sellers, or third parties</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          7. Intellectual Property
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          The BayarLink name, branding, platform design, and related materials
          remain the property of BayarLink and/or its owner, unless otherwise
          stated. Users may not reproduce, copy, or exploit any part of the
          platform without prior permission.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          8. Limitation of Responsibility
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          BayarLink provides the platform on an as-is basis. While we strive to
          provide a reliable service, we are not responsible for losses,
          disputes, delays, or damages arising from user conduct, customer
          dealings, payment provider issues, or third-party system failures.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          9. Changes to Terms
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          We reserve the right to update or revise these Terms & Conditions at
          any time. Continued use of the platform after changes are posted means
          that you accept the updated terms.
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
  )
}
