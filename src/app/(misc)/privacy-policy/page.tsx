import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - Vidbox",
  description: "Privacy policy and data handling practices for Vidbox services",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none">
        <p className="mb-6">
          At Vidbox, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
          disclose, and safeguard your information when you use our service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
        <p className="mb-6">
          We collect information that you provide directly to us when you:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Create an account</li>
          <li>Use our services</li>
          <li>Contact us for support</li>
          <li>Subscribe to our newsletters</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
        <p className="mb-6">
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Provide, maintain, and improve our services</li>
          <li>Process your transactions</li>
          <li>Send you technical notices and support messages</li>
          <li>Communicate with you about products, services, and events</li>
          <li>Protect against fraudulent or illegal activity</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
        <p className="mb-6">
          We implement appropriate technical and organizational measures to protect your personal data 
          against unauthorized or unlawful processing, accidental loss, destruction, or damage.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
        <p className="mb-6">
          You have the right to:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to processing of your data</li>
          <li>Request transfer of your data</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
        <p className="mb-6">
          If you have any questions about this Privacy Policy, please contact us at admin@vidbox.to
        </p>
      </div>
    </div>
  )
}