import { NextResponse } from 'next/server'
import { construirResumenAgricultorSHAP } from '@/lib/agronomy-translations'
import type { ShapVariableContribution } from '@/components/mapa-parcelas'

interface SolicitudExplicacion {
  id_poligono?: string
  municipio: string
  estado: string
  area_ha: number
  rendimiento_t_ha: number
  pendiente_grados: number
  elevacion_msnm: number
  regimen_agua?: string
  temporada?: string
  shap_variables?: ShapVariableContribution[]
}

const CACHE_EXPLICACIONES_LLM = new Map<string, any>()

export async function POST(request: Request) {
  try {
    const body: SolicitudExplicacion = await request.json()
    const {
      id_poligono = 'Predio',
      municipio = 'tu municipio',
      estado = 'Hidalgo',
      area_ha = 5,
      rendimiento_t_ha = 3.8,
      pendiente_grados = 2.0,
      elevacion_msnm = 2550,
      regimen_agua = 'temporal_bueno',
      temporada = 'Abril – Octubre 2026',
      shap_variables = [],
    } = body

    // Base traducida determinista como respaldo y contexto estructurado para Gemini
    const baseAmigable = construirResumenAgricultorSHAP(
      shap_variables,
      rendimiento_t_ha,
      municipio,
      pendiente_grados,
      regimen_agua
    )

    const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim()
    const tieneClaveValida =
      apiKey.length > 15 &&
      !apiKey.includes('PEGA_AQUI') &&
      !apiKey.includes('tu_clave')

    const cacheKey = `${id_poligono}_${municipio}_${rendimiento_t_ha}_${pendiente_grados}_${regimen_agua}`
    if (CACHE_EXPLICACIONES_LLM.has(cacheKey)) {
      return NextResponse.json(CACHE_EXPLICACIONES_LLM.get(cacheKey))
    }

    if (!tieneClaveValida) {
      return NextResponse.json({
        generado_por_llm: false,
        modelo_llm: 'Motor Agronómico Local (Configura GEMINI_API_KEY en Vercel/.env para activar Google Gemini)',
        diagnosticoSubtitulo: baseAmigable.diagnosticoSubtitulo,
        resumenNarrativo: baseAmigable.resumenNarrativo,
        top4FactoresPeso: baseAmigable.top4FactoresPeso,
        factoresPositivos: baseAmigable.factoresPositivos,
        factoresNegativos: baseAmigable.factoresNegativos,
      })
    }

    // Construimos el resumen de los factores de mayor peso (positivos y negativos) sin tecnicismos para que Gemini los valide y redacte
    const topPositivosTexto = baseAmigable.factoresPositivos
      .map((f) => `- ${f.tituloAmigable}: suma +${f.impactoKgHa} kg/ha (${f.pesoPct}% de peso). Significado en campo: ${f.explicacion}`)
      .join('\n')

    const topNegativosTexto = baseAmigable.factoresNegativos
      .map((f) => `- ${f.tituloAmigable}: resta ${f.impactoKgHa} kg/ha (${f.pesoPct}% de peso). Problema que genera: ${f.explicacion}. Recomendación: ${f.recomendacionAccion}`)
      .join('\n')

    const promptSistema = `Eres un asesor agrónomo mexicano experto en cebada maltera del Altiplano Central (Hidalgo, Puebla y Tlaxcala).
Tu tarea es explicarle a un agricultor (que NO es especialista técnico ni científico de datos) por qué el modelo predijo una cosecha de ${rendimiento_t_ha} toneladas por hectárea en su terreno de ${area_ha} hectáreas en ${municipio}, ${estado} para el ciclo ${temporada}.

REGLAS ESTRICTAS DE REDACCIÓN:
1. PROHIBIDO usar nombres de satélites, sensores, siglas o nombres de variables técnicas (NUNCA escribas Landsat, Sentinel-2, PlanetScope, INEGI, CEM 4.0, SHAP, QBAF, DF-QuAD, NDWI, NDVI, LAI, VI6T, VPD, GDD ni nombres con guiones bajos).
2. Usa un lenguaje claro, cálido, directo y campesino/agrícola.
3. Explica explícitamente qué condiciones tuvieron más peso a favor (por ejemplo, cómo la humedad retenida en la planta y el suelo o el clima templado de abril ayudaron a formar más grano) y qué condiciones jugaron en contra (por ejemplo, por qué la falta de humedad en semanas secas, el frío al arranque o la inclinación del terreno pueden generar problemas en la espiga y qué debe tomar en cuenta el productor para cuidarlo).

DATOS DEL PREDIO Y VARIABLES QUE MÁS PESO TUVIERON EN LA PREDICCIÓN:
- Municipio: ${municipio}, ${estado}
- Superficie: ${area_ha} ha | Altura: ${elevacion_msnm} m | Inclinación del terreno: ${pendiente_grados}°
- Rendimiento estimado: ${rendimiento_t_ha} t/ha (${Math.round(rendimiento_t_ha * 1000)} kg/ha)

Factores que afectaron POSITIVAMENTE la predicción:
${topPositivosTexto || '- Condiciones generales estables en el municipio.'}

Factores que afectaron NEGATIVAMENTE (en contra) la predicción:
${topNegativosTexto || '- Sin factores negativos severos detectados.'}

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta:
{
  "diagnosticoSubtitulo": "1 o 2 oraciones claras resumiendo cómo está el cultivo y cuál fue el factor principal a favor y en contra (sin tecnicismos).",
  "resumenNarrativo": "Un párrafo de 3 a 4 oraciones bien redactadas que explique en lenguaje sencillo por qué se estima esa cosecha, mencionando cómo la humedad, el clima o el terreno ayudaron y qué factores en contra pueden generar problemas y deben cuidarse.",
  "comentarioPositivo": "Explicación clara en 2 oraciones de las condiciones que impulsaron la cosecha y por qué beneficiaron a la planta.",
  "comentarioNegativoYCuidados": "Explicación clara en 2 oraciones de las condiciones que afectaron en contra, por qué pueden causar problemas en el cultivo y qué debe tomar en cuenta el agricultor."
}`

    const rawModel = (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim()
    const modelName = rawModel === 'gemini-2.5-flash' ? 'gemini-3.8-flash' : rawModel
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptSistema }] }],
        generationConfig: {
          temperature: 0.35,
          responseMimeType: 'application/json',
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API HTTP ${response.status}`)
    }

    const geminiJson = await response.json()
    const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const parsedLlm = JSON.parse(rawText)

    const payloadFinal = {
      generado_por_llm: true,
      modelo_llm: `Google Gemini (${modelName})`,
      diagnosticoSubtitulo: parsedLlm.diagnosticoSubtitulo || baseAmigable.diagnosticoSubtitulo,
      resumenNarrativo: parsedLlm.resumenNarrativo || baseAmigable.resumenNarrativo,
      comentarioPositivo: parsedLlm.comentarioPositivo || null,
      comentarioNegativoYCuidados: parsedLlm.comentarioNegativoYCuidados || null,
      top4FactoresPeso: baseAmigable.top4FactoresPeso,
      factoresPositivos: baseAmigable.factoresPositivos,
      factoresNegativos: baseAmigable.factoresNegativos,
    }

    CACHE_EXPLICACIONES_LLM.set(cacheKey, payloadFinal)
    return NextResponse.json(payloadFinal)
  } catch (error) {
    console.warn('Aviso en /api/explicar-agricultor (usando respaldo agronómico sin tecnicismos):', error)
    return NextResponse.json({
      generado_por_llm: false,
      modelo_llm: 'Respaldo Agronómico Local',
    })
  }
}
