const handleSave = async () => {
  if (!sellerId || !userId) {
    alert('Missing sellerId or userId')
    return
  }

  if (!storeName.trim()) {
    alert('Store name is required')
    return
  }

  if (!storeSlug.trim()) {
    alert('Store slug is required')
    return
  }

  setSaving(true)

  try {
    const { error } = await supabase
      .from('seller_profiles')
      .update({
        store_name: storeName.trim(),
        store_slug: slugify(storeSlug),
        contact_phone: contactPhone.trim(),
        bank_name: bankName.trim(),
        account_name: accountName.trim(),
        account_number: accountNumber.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sellerId)

    if (error) {
      console.error(error)
      alert(`Save failed: ${error.message}`)
      return
    }

    alert('Store settings saved successfully')
  } catch (err) {
    console.error(err)
    alert('Unexpected error occurred')
  } finally {
    setSaving(false)
  }
}
