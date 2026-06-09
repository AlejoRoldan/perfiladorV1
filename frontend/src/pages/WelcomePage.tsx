interface WelcomePageProps {
  onStart: (userId: string, roleId: string) => void;
}

const ROLES = [
  { id: 'tech-lead', label: 'Tech Lead' },
  { id: 'manager-it', label: 'Manager IT' },
  { id: 'developer', label: 'Desarrollador' },
];

export function WelcomePage({ onStart }: WelcomePageProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const userId = (form.elements.namedItem('userId') as HTMLInputElement).value.trim();
    const roleId = (form.elements.namedItem('roleId') as HTMLSelectElement).value;
    if (userId && roleId) onStart(userId, roleId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold">V</span>
          </div>
          <span className="text-sm font-semibold text-violet-600 uppercase tracking-widest">Grupo Vázquez</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Diagnóstico de Competencias</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Este diagnóstico nos ayuda a entender tus fortalezas y áreas de desarrollo. Al finalizar, recibirás un perfil personalizado y comenzarás una conversación con tu mentor digital.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre o ID</label>
            <input
              name="userId"
              type="text"
              required
              placeholder="Ej: Ana García"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tu rol actual</label>
            <select
              name="roleId"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition bg-white"
            >
              <option value="">Selecciona un rol...</option>
              {ROLES.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            Comenzar diagnóstico →
          </button>
        </form>
      </div>
    </div>
  );
}
