import SimpleHeader from "../../components/SimpleHeader"

export default function TermsPage() {
  return (
    <>
      <SimpleHeader />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Terms & Conditions
        </h1>

        <p className="mb-8 text-sm text-slate-500">
          Last updated: {new Date().getFullYear()}
        </p>

        <section className="mb-8">
          <p className="text-sm leading-relaxed text-slate-600">
            Welcome to BayarLink. These Terms & Conditions govern your access to
            and use of the BayarLink platform. By using this platform, you agree
            to comply with these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            1. Use of Platform
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            BayarLink is designed to help sellers manage products, orders, and
            payments. You agree to use the platform responsibly and only for
            lawful business purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            2. Seller Responsibility
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Sellers are fully responsible for their products, pricing, customer
            communication, and order fulfilment. BayarLink does not own or manage
            the products listed on the platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            3. Payments
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Payments are processed through third-party providers. Sellers are
            responsible for ensuring all payment details are accurate. BayarLink
            is not liable for disputes between sellers and customers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            4. Account Usage
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            You are responsible for maintaining your account security. Any
            activity under your account is your responsibility.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            5. Platform Availability
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            We strive to ensure the platform is always available, but we do not
            guarantee uninterrupted service at all times.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            6. Prohibited Activities
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
            <li>Using the platform for illegal activities</li>
            <li>Providing false or misleading product information</li>
            <li>Attempting to hack or disrupt the system</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            7. Changes to Terms
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            We reserve the right to update these Terms & Conditions at any time.
            Continued use of the platform means you accept the updated terms.
          </p>
        </section>

        <div className="border-t pt-6 text-sm text-slate-500">
          <p>
            Contact:{" "}
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
