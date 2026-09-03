# Catatan keamanan FinSight

## Yang telah diterapkan

- Header untuk mencegah clickjacking, MIME sniffing, kebocoran referrer, dan akses browser API yang tidak dipakai.
- CSP dasar membatasi sumber konten ke origin aplikasi dan Supabase. `unsafe-inline` masih diperlukan oleh runtime Next.js dan `next-themes`; gunakan nonce CSP bila aplikasi kelak membutuhkan proteksi XSS yang lebih ketat.
- Endpoint `/api/analyze` sekarang mewajibkan access token Supabase, memvalidasi bulan, membatasi ukuran body, serta mengambil transaksi dari database berdasarkan pengguna terautentikasi. Browser tidak lagi dapat menyuntikkan data transaksi milik pengguna lain ke prompt AI.
- Service worker hanya menyimpan halaman offline generik. Halaman atau API berisi data finansial tidak pernah disimpan dalam cache offline.

## Tindakan wajib sebelum produksi

1. Aktifkan Row Level Security (RLS) pada tabel `transactions`, dengan policy `user_id = auth.uid()` untuk `SELECT`, `INSERT`, `UPDATE`, dan `DELETE`. Pastikan `WITH CHECK (user_id = auth.uid())` dipakai pada insert/update.
2. Di Supabase Auth, aktifkan konfirmasi email, atur redirect URL hanya ke domain produksi dan localhost pengembangan, serta tingkatkan kebijakan password (disarankan minimal 12 karakter).
3. Pasang rate limiting pada `/api/analyze` (misalnya melalui gateway/deployment platform atau Redis) dan kuota per pengguna agar API key Groq tidak dapat dikuras.
4. Simpan hanya `GROQ_API_KEY` dan kredensial server lain sebagai environment variable server-side; jangan pernah memakai `NEXT_PUBLIC_` untuk secret. Rotasi key jika pernah masuk commit, log, atau tangkapan layar.
5. Terapkan HTTPS pada domain produksi. PWA, service worker, dan HSTS hanya aman/berfungsi penuh di HTTPS.
6. Tambahkan logging terstruktur dan monitoring untuk kegagalan autentikasi, error endpoint AI, serta lonjakan request.

## Pemeriksaan rutin

- Jalankan `npm audit` dan perbarui dependency secara berkala.
- Uji RLS memakai dua akun berbeda: akun A tidak boleh bisa membaca, mengubah, atau menghapus transaksi akun B, termasuk melalui REST API Supabase.
- Audit CSP setelah menambah pihak ketiga baru; tambahkan domain sesempit mungkin.
