export type ReportExport = {
  filename: string;
  contentType: "text/csv;charset=utf-8";
  content: string;
  generatedAt: Date;
};

/**
 * El resumen actual contiene únicamente métricas sintéticas. Cuando se incorporen
 * participantes reales, este generador deberá delegar al repositorio filtrado por
 * tenant y rol antes de serializar cualquier fila.
 */
export function buildSyntheticReportExport(): ReportExport {
  const generatedAt = new Date();
  return {
    filename: `itti-talent-resumen-demo-${generatedAt.toISOString().slice(0, 10)}.csv`,
    contentType: "text/csv;charset=utf-8",
    content: [
      "seccion,indicador,valor,clasificacion",
      "Panorama,Colaboradores activos,80,sintetico",
      "Panorama,Participacion,72%,sintetico",
      "Panorama,Talento emergente,18,sintetico",
      "Panorama,Brechas criticas,12,sintetico",
    ].join("\n"),
    generatedAt,
  };
}
