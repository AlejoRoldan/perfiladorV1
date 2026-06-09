import { useState } from 'react';
import type { AppStep, Respuesta, ScoreCompetenciaEvent, NecesidadDetectadaEvent } from './types';
import { WelcomePage } from './pages/WelcomePage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { ResultsPage } from './pages/ResultsPage';
import { ChatPage } from './pages/ChatPage';
import { submitDiagnostico } from './services/api';

/**
 * App.tsx — Máquina de estados del flujo del perfilador.
 * Orquesta la navegación entre: Welcome -> Questionnaire -> Results -> Chat.
 */
export default function App() {
  const [step, setStep] = useState<AppStep>('welcome');
  const [userId, setUserId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [scoreEvent, setScoreEvent] = useState<ScoreCompetenciaEvent | null>(null);
  const [necesidadEvent, setNecesidadEvent] = useState<NecesidadDetectadaEvent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = (uid: string, rid: string) => {
    setUserId(uid);
    setRoleId(rid);
    setStep('questionnaire');
  };

  const handleQuestionnaireComplete = async (respuestas: Respuesta[]) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await submitDiagnostico({ userId, roleId, respuestas });
      setScoreEvent(result.scoreEvent);
      setNecesidadEvent(result.necesidadEvent);
      setStep('results');
    } catch (err) {
      setError('Hubo un problema al procesar tu diagnóstico. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100">
        <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin mb-4" />
        <p className="text-gray-600 text-sm font-medium">Analizando tu perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => { setError(null); setStep('welcome'); }}
            className="bg-violet-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {step === 'welcome' && <WelcomePage onStart={handleStart} />}
      {step === 'questionnaire' && <QuestionnairePage onComplete={handleQuestionnaireComplete} />}
      {step === 'results' && scoreEvent && (
        <ResultsPage
          scoreEvent={scoreEvent}
          necesidadEvent={necesidadEvent}
          onContinue={() => setStep('chat')}
        />
      )}
      {step === 'chat' && scoreEvent && (
        <ChatPage scoreEvent={scoreEvent} necesidadEvent={necesidadEvent} />
      )}
    </>
  );
}
