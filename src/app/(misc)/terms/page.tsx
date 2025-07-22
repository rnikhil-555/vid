import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Vidbox",
  description: "Terms and conditions for using Vidbox services",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
      <div className="prose prose-invert max-w-none">
        <p className="mb-6">
          This Agreement contains the complete terms and conditions that apply to your participation in our site. 
          If you wish to use the site including its tools and services please read these terms of use carefully.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Modifications of Terms and Conditions</h2>
        <p className="mb-6">
          Amendments to this agreement can be made and effected by us from time to time without specific notice to your end. 
          Agreement posted on the Site reflects the latest agreement and you should carefully review the same before you use our site.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Use of the Site</h2>
        <p className="mb-6">
          The Site allows you to post offers, sell, advertise, bid and shop online. However, you are prohibited to do the following acts:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Use our sites, including its services and or tools if you are not able to form legally binding contracts, are under the age of 18</li>
          <li>Posting of items in inappropriate category or areas on our sites and services</li>
          <li>Collecting information about users&apos; personal information</li>
          <li>Maneuvering the price of any item or interfere with other users&apos; listings</li>
          <li>Post false, inaccurate, misleading, defamatory, or libelous content</li>
          <li>Take any action that may damage the rating system</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Registration Information</h2>
        <p className="mb-6">
          For you to complete the sign-up process in our site, you must provide your full legal name, current address, 
          a valid email address, member name and any other information needed in order to complete the signup process. 
          You must qualify that you are 18 years or older and must be responsible for keeping your password secure and 
          be responsible for all activities and contents that are uploaded under your account.
        </p>
      </div>
    </div>
  )
}