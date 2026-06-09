import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';
import type { ScoreCompetenciaEvent, NecesidadDetectadaEvent } from '../types';

const PRIORIDAD_COLOR: Record<string, string> = {
  ALTA: 'bg-red-100 text-red-700 border-red-200',
  MEDIA: 'bg-amber-100 text-amber-700 border-amber-200',
  BAJA: 'bg-green-100 text-green-700 border-green-200',
};

interface ResultsPageProps {
  scoreEvent: ScoreCompetenciaEvent;
  necesidadEvent: NecesidadDetectadaEvent | null;
  onContinue: () => void;
}

export function ResultsPage({ scoreEvent, necesidadEvent, onContinue }: ResultsPageProps) {
  const radarData = scoreEvent.scores_por_competencia.map(s => ({
    competencia: s.competenciaId,
    score: s.score,
    fullMark: 5,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">V</span>
            </div>
            <span className="text-xs font-semibold text-violet-600 uppercase tracking-widest">Grupo Vázquez</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Tu perfil de competencias</h1>
          <p className="text-gray-500 text-sm mt-1">
            Rol evaluado: <span className="font-medium text-gray-700">{scoreEvent.role_id}</span>
            &nbsp;·&nbsp; Versión de matriz: <span className="font-mono text-xs text-gray-400">{scoreEvent.matrix_version}</span>
          </p>
        </div>

        {/* Gráfico de Radar */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Mapa de competencias</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="competencia" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip
                formatter={(value: number) => [`${value} / 5`, 'Score']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#7c3aed"
                fill="#7c3aed"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Scores detallados */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Detalle por competencia</h2>
          <div className="space-y-3">
            {scoreEvent.scores_por_competencia.map(s => (
              <div key={s.competenciaId}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{s.competenciaId}</span>
                  <span className="text-gray-500">{s.score} / 5</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-violet-500 h-2 rounded-full transition-all"
                    style={{ width: `${(s.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Necesidades detectadas */}
        {necesidadEvent && necesidadEvent.necesidades.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">Áreas de desarrollo detectadas</h2>
            <p className="text-gray-500 text-xs mb-4">Estas son las competencias donde puedes crecer más para alcanzar el perfil esperado de tu rol.</p>
            <div className="space-y-3">
              {necesidadEvent.necesidades.map(n => (
                <div key={n.competenciaId} className={`border rounded-xl p-4 ${PRIORIDAD_COLOR[n.prioridad]}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{n.competenciaId}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRIORIDAD_COLOR[n.prioridad]}`}>
                      {n.prioridad}
                    </span>
                  </div>
                  <p className="text-xs opacity-80">
                    Score actual: <strong>{n.scoreActual}</strong> · Esperado: <strong>{n.scoreEsperado}</strong> · Brecha: <strong>{n.brecha}</strong> puntos
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA al agente */}
        <div className="bg-violet-600 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-bold mb-1">¿Listo para trabajar en tu desarrollo?</h2>
          <p className="text-violet-200 text-sm mb-4">Tu mentor digital analizó tu perfil y está listo para acompañarte en el siguiente paso.</p>
          <button
            onClick={onContinue}
            className="bg-white text-violet-700 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-violet-50 transition"
          >
            Hablar con mi mentor →
          </button>
        </div>

      </div>
    </div>
  );
}
