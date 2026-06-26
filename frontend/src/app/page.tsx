import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AP CS Practice Lab
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A beta AP CSA Java FRQ practice platform with auto-grading, teacher analytics, and anonymized student accounts.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link
              href="/beta-notice"
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              View Beta Notice
            </Link>
          </div>
        </div>

        {/* What this platform does */}
        <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What This Platform Does</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Java FRQ auto-grading</li>
            <li>✅ Public and hidden tests</li>
            <li>✅ Teacher-created question bank</li>
            <li>✅ Auto-generated assignments</li>
            <li>✅ Teacher analytics</li>
            <li>✅ CSV export</li>
            <li>✅ Anonymized beta student accounts</li>
          </ul>
        </section>

        {/* Current beta scope */}
        <section className="mb-12 bg-amber-50 border border-amber-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Beta Scope</h2>
          <div className="space-y-2 text-gray-700">
            <p><strong>Supported:</strong></p>
            <ul className="ml-6 space-y-1">
              <li>• AP CSA only</li>
              <li>• FRQ_CODE only</li>
              <li>• <code className="bg-amber-100 px-2 py-1 rounded">public int solve(int[] nums)</code> style methods</li>
            </ul>
            <p className="mt-4"><strong>Not yet supported:</strong></p>
            <ul className="ml-6 space-y-1">
              <li>• AP CSP</li>
              <li>• AI feedback</li>
              <li>• Rubric scoring</li>
            </ul>
          </div>
        </section>

        {/* For teachers */}
        <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">For Teachers</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Create a class</li>
            <li>Bulk-create anonymized student accounts</li>
            <li>Create or auto-generate assignments</li>
            <li>Review completion rate and question performance</li>
          </ol>
        </section>

        {/* For students */}
        <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">For Students</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Open assignments</li>
            <li>Run public tests</li>
            <li>Submit final answers</li>
            <li>Practice Java array traversal skills</li>
          </ol>
        </section>

        {/* Privacy-first beta trial */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy-First Beta Trial</h2>
          <ul className="space-y-2 text-gray-700 mb-4">
            <li>✓ Use demo/anonymized accounts</li>
            <li>✓ Do not use real student personal data during early beta</li>
            <li>✓ Transparent data collection policy</li>
          </ul>
          <Link
            href="/beta-notice"
            className="text-blue-600 hover:underline font-semibold"
          >
            Learn more about privacy →
          </Link>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-12">
          <p>Beta version. For demo and evaluation purposes.</p>
        </footer>
      </div>
    </div>
  );
}
