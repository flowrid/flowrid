import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Flowrid",
  description: "Flowrid privacy policy — how we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[860px] mx-auto px-4 py-12 text-text leading-relaxed">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <h2 className="text-xl font-semibold mt-8 mb-3">Introduction</h2>
      <p className="mb-3">Flowrid respects your privacy and is committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit flowrid.com and our practices for collecting, using, maintaining, protecting, and disclosing that information.</p>
      <p className="mb-3">This policy applies to information we collect on the Website; in email, text, and other electronic messages between you and the Website; and when you interact with our advertising and applications on third-party websites and services.</p>
      <p className="mb-3">Please read this policy carefully to understand our policies and practices regarding your information and how we treat it. If you do not agree with our policies and practices, your choice is not to use our Website. By accessing or using this Website, you agree to this privacy policy.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Children Under the Age of 18</h2>
      <p className="mb-3">Our Website is not intended for children under 18 years of age. No one under age 18 may provide any information to or on the Website. We do not knowingly collect personal information from children under 18. If you are under 18, do not use or provide any information on this Website. If we learn we have collected or received personal information from a child under 18 without verification of parental consent, we will delete that information.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Information We Collect About You and How We Collect It</h2>
      <p className="mb-3">We collect several types of information from and about users of our Website, including:</p>
      <ul className="list-disc pl-6 mb-3 space-y-2">
        <li>Personal information, such as name, postal address, email address, telephone number, or any other identifier by which you may be contacted online or offline.</li>
        <li>Information about you that does not individually identify you.</li>
        <li>Business-related information, such as business name, location, contacts, and related details.</li>
        <li>About your internet connection, the equipment you use to access our Website, and usage details.</li>
      </ul>
      <p className="mb-3">We collect this information directly from you when you provide it to us, automatically as you navigate through the site, and from third parties such as our business partners.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Automatic Data Collection Technologies</h2>
      <p className="mb-3">As you navigate through and interact with our Website, we may use automatic data collection technologies to collect certain information about your equipment, browsing actions, and patterns, including details of your visits to our Website, traffic data, location data, logs, and other communication data.</p>
      <p className="mb-3">The technologies we use for this automatic data collection may include cookies (browser cookies), web beacons, and flash cookies. You may refuse to accept browser cookies by activating the appropriate setting on your browser. However, if you select this setting you may be unable to access certain parts of our Website.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">How We Use Your Information</h2>
      <p className="mb-3">We use information that we collect about you or that you provide to us:</p>
      <ul className="list-disc pl-6 mb-3 space-y-2">
        <li>To present our Website and its contents to you.</li>
        <li>To provide you with information, products, or services that you request from us.</li>
        <li>To connect warehouses with logistics needs of e-commerce brands.</li>
        <li>To fulfill any other purpose for which you provide it.</li>
        <li>To carry out our obligations and enforce our rights.</li>
        <li>To notify you about changes to our Website or any products or services we offer.</li>
        <li>To contact you about our own and third-party goods and services that may be of interest to you.</li>
        <li>For any other purpose with your consent.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Disclosure of Your Information</h2>
      <p className="mb-3">We may disclose aggregated information about our users without restriction. We may disclose personal information that we collect or you provide to our subsidiaries and affiliates; to contractors, service providers, and other third parties we use to support our business; to a buyer or other successor in the event of a merger, divestiture, restructuring, or other sale or transfer of assets; to fulfill the purpose for which you provide it; for any other purpose disclosed by us when you provide the information; and with your consent.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Security</h2>
      <p className="mb-3">We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. However, the transmission of information via the internet is not completely secure. We cannot guarantee the security of your personal information transmitted to our Website. Any transmission of personal information is at your own risk.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Changes to Our Privacy Policy</h2>
      <p className="mb-3">It is our policy to post any changes we make to our privacy policy on this page. You are responsible for periodically visiting this privacy policy to check for any changes.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact Information</h2>
      <p className="mb-3">To ask questions or comment about this privacy policy and our privacy practices, contact us at team@flowrid.com or through our contact page.</p>

      <p className="text-text-secondary text-sm mt-12">Last updated: June 14, 2026</p>
    </div>
  );
}
