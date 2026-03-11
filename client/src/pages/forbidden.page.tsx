import React from "react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8 bg-white rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">403 Forbidden</h1>
        <p className="text-gray-600 mb-4">
          You don’t have permission to access this page.
        </p>
        <a href="/" className="inline-block px-4 py-2 rounded bg-blue-600 text-white">
          Go Home
        </a>
      </div>
    </div>
  );
}

