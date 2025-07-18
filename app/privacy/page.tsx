// app/privacy/page.tsx

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">Effective Date: July 18, 2025</p>

      <p className="mb-4">
        At Shiper, we value your privacy. This Privacy Policy explains how we collect, use,
        and protect your information when you use our services, including logging in with
        third-party providers like Facebook and Google.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Your name, email, and profile image (if granted permission)</li>
        <li>Authentication tokens for login</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Your Information</h2>
      <p className="mb-4">
        We use your information solely to authenticate your account, improve your experience,
        and personalize our service.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Third-Party Services</h2>
      <p className="mb-4">
        We use third-party providers like Facebook Login and Google OAuth to authenticate users.
        These services may collect their own information according to their privacy policies.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
      <p className="mb-4">
        If you have any questions about this policy, contact us at: <strong>support@shiper.io</strong>
      </p>
    </main>
  );
}
