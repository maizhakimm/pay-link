<div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
  
  {/* Header */}
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-slate-900">Share Preview</h2>
    <p className="text-sm text-slate-500">
      Tulis caption. Preview akan dikemaskini secara automatik.
    </p>
  </div>

  {/* Caption (NO LABEL) */}
  <div className="mb-5">
    <textarea
      value={dailyNote}
      onChange={(e) => setDailyNote(e.target.value)}
      placeholder="Contoh: Open order hari ini! Delivery petang 🚚"
      rows={3}
      className="w-full rounded-lg border border-slate-200 p-3 text-base text-slate-900 outline-none transition focus:border-black"
    />
  </div>

  {/* Image Selection */}
  <div className="mb-5">
    <p className="mb-3 text-xs text-slate-500">
      Pilih gambar yang akan dipaparkan bila link di-share.
    </p>

    <div className="grid gap-3">
      <select
        value={shareMode}
        onChange={(e) =>
          setShareMode(e.target.value as 'product' | 'logo' | 'poster')
        }
        className="w-full rounded-lg border border-slate-200 p-3 text-base text-slate-900 outline-none transition focus:border-black"
      >
        <option value="product">Product Image</option>
        <option value="logo">Logo Kedai</option>
        <option value="poster">Upload Poster</option>
      </select>

      {shareMode === 'poster' && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => uploadPoster(e.target.files?.[0])}
          className="w-full rounded-lg border border-slate-200 p-3 text-base text-slate-900 outline-none transition focus:border-black"
        />
      )}
    </div>
  </div>

  {/* Preview */}
  <div className="grid gap-4 lg:grid-cols-2">
    
    {/* Link Preview */}
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Link Preview
      </p>

      <div className="overflow-hidden rounded-lg border bg-white">
        {previewImage && (
          <img
            src={previewImage}
            alt="Preview"
            className="h-40 w-full object-cover transition duration-300 hover:scale-[1.02]"
          />
        )}

        <div className="p-3">
          <p className="text-sm font-semibold text-slate-900">
            {seller?.store_name || 'Nama Kedai'}
          </p>

          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {dailyNote.trim() || 'Order dengan mudah di sini.'}
          </p>

          <p className="mt-2 break-all text-xs text-slate-400">
            {shopLink || 'https://www.bayarlink.my'}
          </p>
        </div>
      </div>
    </div>

    {/* WhatsApp Preview */}
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        WhatsApp Preview
      </p>

      <div className="whitespace-pre-line rounded-lg border bg-white p-3 text-sm text-slate-800">
        {message}
      </div>
    </div>
  </div>

  {/* Actions */}
  <div className="mt-4 flex flex-wrap gap-2">
    <button
      onClick={saveAllShareSettings}
      disabled={savingNote}
      className="rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:opacity-90 disabled:opacity-70"
    >
      {savingNote ? 'Saving...' : 'Save Changes'}
    </button>

    <button
      onClick={copyMessage}
      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition hover:bg-slate-50"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>

    <button
      onClick={shareWhatsApp}
      className="rounded-lg bg-green-500 px-3 py-2 text-sm text-white transition hover:bg-green-600"
    >
      Share to WhatsApp
    </button>
  </div>
</div>
