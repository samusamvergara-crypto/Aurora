import { NextResponse } from "next/server";
import {
  buildCompletePlanner,
  initialPlannerData,
  type Grade,
  type PlannerFormData,
  type Trimester
} from "../../../lib/planner";

type AIPlannerRequest = {
  grado?: Grade;
  asignatura?: string;
  tema?: string;
  duracion?: string;
  docente?: string;
  escuela?: string;
  trimestre?: Trimester;
  fecha?: string;
};

function mergeWithDefaults(input: AIPlannerRequest): PlannerFormData {
  return {
    ...initialPlannerData,
    grado: input.grado || initialPlannerData.grado,
    asignatura: input.asignatura || initialPlannerData.asignatura,
    tema: input.tema || initialPlannerData.tema,
    duracion: input.duracion || initialPlannerData.duracion,
    docente: input.docente || initialPlannerData.docente,
    escuela: input.escuela || initialPlannerData.escuela,
    trimestre: input.trimestre || initialPlannerData.trimestre,
    fecha: input.fecha || initialPlannerData.fecha
  };
}

function buildPrompt(input: PlannerFormData) {
  return `
Genera un planeamiento escolar de informática en español formal, claro y apto para primaria.

Datos base:
- Grado: ${input.grado}
- Asignatura: ${input.asignatura}
- Tema: ${input.tema}
- Duración: ${input.duracion}
- Docente: ${input.docente}
- Escuela: ${input.escuela}
- Trimestre: ${input.trimestre}
- Fecha o semana: ${input.fecha}

Devuelve únicamente JSON válido con estas claves:
objetivo,
metaAprendizaje,
aprendizajeFundamental,
contenido,
inicio,
desarrollo,
cierre,
recursos,
estrategiaEvaluacion,
evidencias,
criteriosEvaluacion,
tipoEvaluacion,
instrumento,
indicadores,
observaciones.

Requisitos:
- Redacción formal y pedagógica.
- Adecuado para planeamientos escolares.
- El contenido, las actividades y la evaluación deben corresponder claramente al tema indicado.
- El objetivo, la meta y el contenido deben estar alineados entre sí.
- Actividades realistas para el grado indicado.
- Mantén cada campo con una extensión moderada para que pueda imprimirse en una hoja tamaño carta horizontal.
- Evita párrafos excesivamente largos; prefiere frases claras y compactas.
- Si falta contexto adicional, infiérelo de manera razonable a partir del grado, asignatura, tema y duración.
- Usa listas cortas separadas por saltos de línea cuando convenga en evidencias, criterios e indicadores.
- No incluyas markdown ni texto fuera del JSON.
`.trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AIPlannerRequest;
    const merged = mergeWithDefaults(body);
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    if (!apiKey) {
      return NextResponse.json({
        source: "fallback",
        plan: buildCompletePlanner(merged),
        message:
          "No se encontró OPENAI_API_KEY. Se usó la generación local de respaldo."
      });
    }

    // Se mantiene una llamada HTTP simple para evitar dependencias extras y facilitar la configuración.
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente experto en planeamientos escolares de informática para primaria. Respondes solo con JSON válido."
          },
          {
            role: "user",
            content: buildPrompt(merged)
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          source: "error",
          message: `La API de OpenAI devolvió un error: ${errorText}`
        },
        { status: 500 }
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json(
        {
          source: "error",
          message: "La respuesta de OpenAI no incluyó contenido utilizable."
        },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(rawContent) as Partial<PlannerFormData>;
    const plan = buildCompletePlanner({
      ...merged,
      ...parsed
    });

    return NextResponse.json({
      source: "openai",
      plan
    });
  } catch (error) {
    const fallback = buildCompletePlanner(initialPlannerData);

    return NextResponse.json(
      {
        source: "fallback",
        plan: fallback,
        message:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado al generar el planeamiento."
      },
      { status: 500 }
    );
  }
}
