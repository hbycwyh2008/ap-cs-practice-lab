import Link from "next/link";

export default function BetaNoticePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Beta Trial Notice</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">
          This Platform is Currently in Beta Trial
        </h2>
        <p className="text-blue-800">
          Thank you for participating in the early testing phase of our AP CSA practice platform.
          Your feedback helps us improve the auto-grading system and teacher analytics.
        </p>
      </div>

      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">Data Collection & Usage</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            This platform collects <strong>necessary learning activity data</strong> to provide
            auto-grading and analytics features:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Student submissions (code, timestamps)</li>
            <li>Scores and test results</li>
            <li>Question IDs and assignment IDs</li>
            <li>Error status and compilation output</li>
          </ul>
          <p className="mt-4">
            This data is used to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Improve AP CSA practice question quality</li>
            <li>Enhance auto-grading accuracy</li>
            <li>Provide teacher analytics (completion rates, question performance)</li>
          </ul>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">What We Do NOT Need</h3>
        <div className="text-gray-700">
          <p className="mb-3">The platform does <strong>not</strong> require or collect:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Student phone numbers</li>
            <li>Parent contact details</li>
            <li>Government-issued ID numbers</li>
            <li>Photos or biometric data</li>
            <li>Location tracking</li>
          </ul>
        </div>
      </section>

      <section className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">
          Beta Trial Best Practices
        </h3>
        <div className="text-amber-800 space-y-2">
          <p>
            <strong>For Teachers:</strong> During early beta testing, consider using:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Demo student accounts (e.g., <code>student1@demo.edu</code>)</li>
            <li>Anonymized usernames (e.g., <code>Student #42</code>)</li>
            <li>School-issued non-personal email addresses</li>
          </ul>
          <p className="mt-3">
            Avoid entering unnecessary personal information during the beta period.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Privacy in Analytics</h3>
        <div className="text-gray-700">
          <p>
            Teacher analytics display student progress using numeric identifiers 
            (e.g., <code>Student #123</code>) rather than email addresses. This protects
            student privacy while providing teachers with actionable completion data.
          </p>
        </div>
      </section>

      <div className="mt-8 text-center">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
