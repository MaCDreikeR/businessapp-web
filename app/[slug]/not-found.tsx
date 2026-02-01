export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          404
        </h1>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Estabelecimento não encontrado
        </h2>
        
        <p className="text-gray-600 mb-6">
          O link que você está tentando acessar não existe ou foi desativado.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
          <p className="font-medium text-blue-900 mb-2">
            Possíveis motivos:
          </p>
          <ul className="text-blue-800 space-y-1 list-disc list-inside">
            <li>O link pode estar incorreto</li>
            <li>O estabelecimento pode ter sido desativado</li>
            <li>A conta pode estar temporariamente suspensa</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Entre em contato com o estabelecimento para verificar
        </p>
      </div>
    </div>
  );
}
