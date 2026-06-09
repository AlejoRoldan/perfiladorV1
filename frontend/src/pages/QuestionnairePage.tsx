import { useState } from 'react';
import type { Pregunta, Respuesta } from '../types';

// Dataset de preguntas del piloto (en producción vendría del backend)
const PREGUNTAS: Pregunta[] = [
  { id: 'q1', texto: '¿Con qué frecuencia comunicas el avance de tu trabajo a tu equipo de forma clara y oportuna?', competenciaId: 'Comunicacion' },
  { id: 'q2', texto: '¿Qué tan cómodo te sientes tomando decisiones difíciles bajo presión?', competenciaId: 'Liderazgo' },
  { id: 'q3', texto: '¿Con qué frecuencia propones nuevas ideas o mejoras en los procesos de tu área?', competenciaId: 'Innovacion' },
  { id: 'q4', texto: '¿Qué tan bien adaptas tu estilo de comunicación según tu audiencia (técnica vs. no técnica)?', competenciaId: 'Comunicacion' },
  { id: 'q5', texto: '¿Con qué frecuencia motivas e inspiras a otros miembros del equipo?', competenciaId: 'Liderazgo' },
];

const ESCALA = [
  { valor: 1, label: 'Casi nunca' },
  { valor: 2, label: 'Pocas veces' },
  { valor: 3, label: 'A veces' },
  { valor: 4, label: 'Frecuentemente' },
  { valor: 5, label: 'Siempre' },
];

interface QuestionnairePageProps {
  onComplete: (respuestas: Respuesta[]) => void;
}

export function QuestionnairePage({ onComplete }: QuestionnairePageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const pregunta = PREGUNTAS[currentIndex];
  const progress = ((currentIndex) / PREGUNTAS.length) * 100;

  const handleNext = () => {
    if (selected === null) return;
    const nuevas = [...respuestas, { preguntaId: pregunta.id, valor: selected }];
    setRespuestas(nuevas);
    setSelected(null);
    if (currentIndex + 1 < PREGUNTAS.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(nuevas);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold text-violet-600 uppercase tracking-widest">Diagnóstico</span>
          <span className="text-xs text-gray-400">{currentIndex + 1} / {PREGUNTAS.length}</span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
          <div
            className="bg-violet-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Pregunta */}
        <p className="text-gray-800 font-medium text-lg leading-snug mb-8">{pregunta.texto}</p>

        {/* Escala */}
        <div className="space-y-3 mb-8">
          {ESCALA.map(opcion => (
            <button
              key={opcion.valor}
              onClick={() => setSelected(opcion.valor)}
              className={`w-full text-left px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
                selected === opcion.valor
                  ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-violet-300 hover:bg-violet-50'
              }`}
            >
              <span className="inline-block w-6 text-center font-bold text-violet-400 mr-2">{opcion.valor}</span>
              {opcion.label}
            </button>
          ))}
        </div>

        {/* Botón siguiente */}
        <button
          onClick={handleNext}
          disabled={selected === null}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition text-sm"
        >
          {currentIndex + 1 < PREGUNTAS.length ? 'Siguiente pregunta →' : 'Ver mis resultados →'}
        </button>
      </div>
    </div>
  );
}
