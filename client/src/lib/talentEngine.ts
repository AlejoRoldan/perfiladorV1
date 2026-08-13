export type SkillScore = Record<string, number>;

export type MatchInput = {
  requiredSkills: Record<string, number>;
  desiredSkills?: Record<string, number>;
  employeeSkills: SkillScore;
};

export function normalizeScore(value: number, minimum = 1, maximum = 5) {
  if (!Number.isFinite(value) || maximum <= minimum) return null;
  const constrained = Math.min(Math.max(value, minimum), maximum);
  return Math.round(((constrained - minimum) / (maximum - minimum)) * 100);
}

export function calculateGap(observed: number, expected: number) {
  if (!Number.isFinite(observed) || !Number.isFinite(expected)) return null;
  return Math.max(0, expected - observed);
}

export function calculateWeightedScore(
  responses: Array<{ score: number | null; weight: number }>,
) {
  const validResponses = responses.filter(
    response => response.score !== null && Number.isFinite(response.score) && Number.isFinite(response.weight) && response.weight > 0,
  );
  const totalWeight = validResponses.reduce((sum, response) => sum + response.weight, 0);
  if (!validResponses.length || totalWeight === 0) return null;
  const weighted = validResponses.reduce((sum, response) => sum + (response.score ?? 0) * response.weight, 0);
  return Number((weighted / totalWeight).toFixed(2));
}

export function calculateRoleMatch({ requiredSkills, desiredSkills = {}, employeeSkills }: MatchInput) {
  const required = Object.entries(requiredSkills);
  const requiredMatches = required.map(([skill, expected]) => {
    const observed = employeeSkills[skill] ?? 0;
    return { skill, expected, observed, gap: calculateGap(observed, expected) ?? expected };
  });
  const requiredMet = requiredMatches.filter(item => item.gap === 0).length;
  const desired = Object.entries(desiredSkills);
  const desiredMet = desired.filter(([skill, expected]) => (employeeSkills[skill] ?? 0) >= expected).length;
  const requiredRatio = required.length ? requiredMet / required.length : 1;
  const desiredRatio = desired.length ? desiredMet / desired.length : 0;
  const score = Math.round((requiredRatio * 0.8 + desiredRatio * 0.2) * 100);
  const missing = requiredMatches.filter(item => item.gap > 0);

  return {
    score,
    requiredMatches,
    missing,
    requiredMet,
    confidence: Math.max(62, Math.min(94, 66 + required.length * 4)),
    explanation: missing.length
      ? `${requiredMet} de ${required.length} requisitos obligatorios cubiertos; se recomienda desarrollar ${missing.map(item => item.skill).join(", ")}.`
      : "Cubre los requisitos obligatorios del rol con evidencia suficiente en esta demostración.",
  };
}
