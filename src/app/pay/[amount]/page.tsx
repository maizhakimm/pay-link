'use client'

import { useSearchParams } from 'next/navigation'

export default function PayPage({ params }: { params: { amount: string } }) {
  const searchParams = useSearchParams()

  const amount = params.amount
  const description = searchParams.get('desc') || 'Payment'

  // 🔹 Seller bank details (boleh ubah nanti)
  const bankName = 'Ryt Bank'
  const accountName = 'Maizhakim Bin Mazlan'
  const accountNumber = '60163352087'

  // 🔹 WhatsApp number (seller)
  const whatsappNumber = '60123456789' // tukar nanti

  // 🔹 QR download
  const downloadQR = () => {
    const link = document.createElement('a')
    link.href = '/qr.png'
    link.download = 'qr.png'
    link.click()
  }

  // 🔹 Copy account number sahaja
  const copyAccountNumber = async () => {
    await navigator.clipboard.writeText(accountNumber)
    alert('Account number copied. Paste in your banking app.')
  }

  // 🔹 WhatsApp message
  const whatsappMessage = `Hi, I have made payment.\n\nAmount: RM ${amount}\nItem: ${description}`
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow p-6 text-center">

        {/* HEADER */}
        <p className="text-green-600 font-semibold text-sm mb-2">PAYMENT PAGE</p>

        <h1 className="text-3xl font-bold mb-1">RM {amount}</h1>
        <p className="text-lg font-medium mb-4">{description}</p>

        {/* INSTRUCTIONS */}
        <div className="bg-gray-50 border rounded-xl p-4 text-sm text-left mb-6">
          <p className="font-semibold mb-2">
            Step 1: Make payment using the QR code or bank details below.
          </p>
          <p>
            Step 2: Send your receipt via WhatsApp after payment.
          </p>
        </div>

        {/* QR */}
        <div className="border rounded-xl p-4 mb-4">
          <img src="/qr.png" alt="QR Code" className="mx-auto w-60" />
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Scan this QR or download it to scan from your gallery.
        </p>

        {/* BUTTONS */}
        <div className="flex flex-col gap-3 mb-6">

          <button
            onClick={downloadQR}
            className="bg-black text-white py-3 rounded-xl font-semibold"
          >
            Download QR
          </button>

          <a
            href={whatsappLink}
            target="_blank"
            className="bg-green-600 text-white py-3 rounded-xl font-semibold"
          >
            Send Receipt on WhatsApp
          </a>

        </div>

        {/* BANK DETAILS */}
        <div className="border rounded-xl p-4 text-left">
          <h2 className="font-semibold mb-3">Bank Details</h2>

          <p className="text-sm text-gray-500">Bank</p>
          <p className="font-medium mb-2">{bankName}</p>

          <p className="text-sm text-gray-500">Account Name</p>
          <p className="font-medium mb-2">{accountName}</p>

          <p className="text-sm text-gray-500">Account Number</p>
          <p className="font-bold text-lg mb-4">{accountNumber}</p>

          <button
            onClick={copyAccountNumber}
            className="w-full border rounded-xl py-3 font-semibold"
          >
            Copy Account Number
          </button>
        </div>

        {/* FOOTER */}
        <p className="text-xs text-gray-500 mt-6">
          Your order will be processed once payment is verified.
        </p>

      </div>
    </main>
  )
}
