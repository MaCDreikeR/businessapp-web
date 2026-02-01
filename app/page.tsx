export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BusinessApp</h1>
        <p className="text-gray-600 mb-8">Sistema de Agendamento Online</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
          <p className="font-medium text-blue-900 mb-2">Como acessar sua página de agendamento:</p>
          <code className="block bg-white px-3 py-2 rounded border border-blue-200 text-blue-700 text-xs break-all">
            https://seudominio.com/[seu-slug]
          </code>
        </div>
        
        <p className="text-xs text-gray-500 mt-8">
          Configure seu estabelecimento no app mobile
        </p>
      </div>
    </div>
  );
}
