import { describe, expect, it } from "vitest";
import { getDirectoryState } from "./interactionStates";
import { validateAssessmentDraft } from "./interactionStates";

describe("getDirectoryState", () => {
  it("mantiene el directorio listo cuando no hay una búsqueda activa", () => {
    expect(getDirectoryState("", 0)).toBe("ready");
  });

  it("expone un estado vacío cuando la búsqueda no devuelve colaboradores", () => {
    expect(getDirectoryState("rol inexistente", 0)).toBe("empty");
  });

  it("conserva el estado listo cuando existen coincidencias", () => {
    expect(getDirectoryState("producto", 4)).toBe("ready");
  });

  it("rechaza borradores que no contienen los mínimos publicables", () => {
    expect(validateAssessmentDraft(2, 0)).toEqual({ valid: false, message: "Selecciona al menos una competencia antes de guardar." });
    expect(validateAssessmentDraft(1, 2)).toEqual({ valid: false, message: "Incluye al menos dos preguntas para publicar una versión." });
  });

  it("acepta borradores con competencias y preguntas suficientes", () => {
    expect(validateAssessmentDraft(2, 1)).toEqual({ valid: true });
  });
});
