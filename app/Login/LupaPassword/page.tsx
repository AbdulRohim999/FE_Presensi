export default function LupaPassword() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 6px 16px rgba(0,0,0,0.07)",
          padding: 32,
          textAlign: "center",
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>
          Lupa Password?
        </h2>
        <p style={{ color: "#888", marginBottom: 32 }}>
          Jangan khawatir, kami siap membantu Anda
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "#e6f0ff",
              borderRadius: "50%",
              width: 80,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="40"
              height="40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
              />
            </svg>
          </div>
        </div>
        <h3 style={{ fontWeight: 600, fontSize: 22, marginBottom: 8 }}>
          Hubungi Admin
        </h3>
        <p style={{ color: "#888", marginBottom: 32 }}>
          Untuk reset password, silakan hubungi admin melalui WhatsApp. Tim kami
          akan membantu Anda dengan cepat dan aman.
        </p>
        <a
          href="https://wa.me/6281268933543?text=Assalamualaikum%20wr.wb.%0ADengan%20hormat%2C%20saya%20ingin%20meminta%20bantuan%20untuk%20memperbarui%20password%20akun%20saya%20karena%20saya%20lupa%20password%20lama.%20Mohon%20kesediaannya%20untuk%20membantu%20proses%20reset%20password%20tersebut.%20Terima%20kasih%20atas%20perhatian%20dan%20bantuannya.%0ANama%09%09%3A%0AEmail%09%09%3A%0ANIDN%09%09%3A%0ABidang%20Kerja%09%3A"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#25D366",
            color: "#fff",
            fontWeight: 600,
            fontSize: 18,
            border: "none",
            borderRadius: 8,
            padding: "14px 0",
            textDecoration: "none",
            marginBottom: 24,
            gap: 10,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 3C9.373 3 4 8.373 4 15c0 2.637.86 5.08 2.34 7.09L4 29l7.18-2.31A12.93 12.93 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.98 0-3.89-.52-5.54-1.5l-.39-.23-4.27 1.37 1.4-4.16-.25-.4A9.93 9.93 0 016 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.07-7.75c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.22.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z" />
          </svg>
          Hubungi Admin via WhatsApp
        </a>
        <a
          href="/Login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            color: "#222",
            fontWeight: 500,
            fontSize: 16,
            textDecoration: "none",
            gap: 8,
          }}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Kembali ke Login
        </a>
      </div>
    </div>
  );
}
