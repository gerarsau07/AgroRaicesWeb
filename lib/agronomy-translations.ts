import type { ShapVariableContribution } from '@/components/mapa-parcelas'

export interface FactorExplicadoAgricultor {
  variable: string
  etiquetaCorta: string
  tituloAmigable: string
  categoria: 'Agua y Humedad' | 'Clima y Temperatura' | 'Suelo y Terreno' | 'Desarrollo de la Planta'
  icono: string
  efecto: 'positivo' | 'negativo'
  impactoKgHa: number
  impactoTHa: number
  pesoPct: number
  resumenCorto: string
  explicacion: string
  recomendacionAccion: string
}

interface DiccionarioVariableAgronomica {
  etiquetaCorta: string
  tituloAmigable: string
  categoria: 'Agua y Humedad' | 'Clima y Temperatura' | 'Suelo y Terreno' | 'Desarrollo de la Planta'
  icono: string
  resumenPositivo: string
  resumenNegativo: string
  positivo: string
  negativo: string
  accionPositiva: string
  accionNegativa: string
}

const DICCIONARIO_SHAP_AGRICULTOR: Record<string, DiccionarioVariableAgronomica> = {
  bi_Tmin_anom25_04: {
    etiquetaCorta: 'Clima en la Siembra (Abril)',
    tituloAmigable: 'Temperatura en el arranque de abril',
    categoria: 'Clima y Temperatura',
    icono: '🌡️',
    resumenPositivo: 'Mañanas templadas en abril favorecieron un nacimiento parejo.',
    resumenNegativo: 'El frío de abril frenó ligeramente el arranque de la planta.',
    positivo:
      'Se estima que el clima templado y sin heladas fuertes durante abril permitió que la semilla naciera pareja y con buen vigor desde el inicio.',
    negativo:
      'Se estima que las mañanas frías de abril hicieron más lento el nacimiento y el arranque inicial de la cebada en tu terreno.',
    accionPositiva: 'Aprovechar el buen establecimiento inicial para aplicar la fertilización a tiempo.',
    accionNegativa: 'Cuidar la profundidad de siembra y apoyar con nutrición de arranque para fortalecer la raíz.',
  },
  lp_Tmin_anom25_04: {
    etiquetaCorta: 'Clima Nocturno en tu Zona',
    tituloAmigable: 'Temperatura nocturna por la altura del terreno',
    categoria: 'Clima y Temperatura',
    icono: '🏔️',
    resumenPositivo: 'La ubicación de tu parcela protegió al cultivo del frío nocturno.',
    resumenNegativo: 'El aire frío nocturno por la altura del predio restó ritmo inicial.',
    positivo:
      'Se estima que la ubicación de tu parcela amortiguó los cambios bruscos de temperatura por la noche, ayudando al amacollamiento.',
    negativo:
      'Se estima que por la altura de tu predio se concentró más aire frío en las madrugadas, retrasando ligeramente el desarrollo temprano.',
    accionPositiva: 'Mantener la densidad de siembra acostumbrada en tu lote.',
    accionNegativa: 'Conservar rastrojo en superficie para mantener más templado el suelo por la noche.',
  },
  prior_municipal: {
    etiquetaCorta: 'Calidad de Tierra de la Zona',
    tituloAmigable: 'Potencial productivo de las tierras de tu localidad',
    categoria: 'Suelo y Terreno',
    icono: '🌾',
    resumenPositivo: 'Tu predio está en una zona de tierras muy rendidoras para cebada.',
    resumenNegativo: 'Las tierras de esta microzona suelen tener potencial más moderado.',
    positivo:
      'Se estima que la vocación cebadera de las tierras de tu municipio impulsa de base un buen potencial de cosecha.',
    negativo:
      'Se estima que el promedio histórico de los terrenos vecinos es moderado debido a suelos más delgados o lluvias más variables.',
    accionPositiva: 'Conservar la fertilidad del terreno incorporando materia orgánica.',
    accionNegativa: 'Reforzar la fertilización de fondo en la siembra para superar el promedio de la zona.',
  },
  s2_mra_mean: {
    etiquetaCorta: 'Nutrición y Fuerza de la Hoja',
    tituloAmigable: 'Color verde y nutrición del follaje',
    categoria: 'Desarrollo de la Planta',
    icono: '🌿',
    resumenPositivo: 'Buena nutrición en las hojas impulsó el llenado de la espiga.',
    resumenNegativo: 'Faltó fuerza nutricional en las hojas durante el crecimiento.',
    positivo:
      'Se estima que el cultivo mantuvo hojas muy bien nutridas y de color verde intenso, lo que ayudó directamente a formar más grano.',
    negativo:
      'Se estima que el follaje presentó menor fuerza nutricional durante el ciclo, limitando el peso final de la espiga.',
    accionPositiva: 'El buen estado de la hoja respalda una cosecha de buena calidad maltera.',
    accionNegativa: 'Aplicar nutrición foliar de apoyo antes de que salga la espiga.',
  },
  planet_lai_std: {
    etiquetaCorta: 'Tupidez del Follaje',
    tituloAmigable: 'Cantidad y cierre de follaje en el surco',
    categoria: 'Desarrollo de la Planta',
    icono: '🌱',
    resumenPositivo: 'El cultivo cerró bien el surco y desarrolló abundante hoja.',
    resumenNegativo: 'El crecimiento del follaje fue menos tupido o disparejo.',
    positivo:
      'Se estima que la planta desarrolló abundante follaje en los meses de lluvia, aprovechando mejor el sol para llenar el grano.',
    negativo:
      'Se estima que el crecimiento de las hojas fue más lento o dejó claros en el terreno, reduciendo la cantidad de espigas por metro.',
    accionPositiva: 'Vigilar la sanidad de la hoja en las zonas donde el cultivo cerró más tupido.',
    accionNegativa: 'Revisar que la sembradora tire la semilla de manera pareja en todo el lote.',
  },
  nn_vpd_vege_std: {
    etiquetaCorta: 'Humedad del Ambiente',
    tituloAmigable: 'Humedad del aire durante el crecimiento',
    categoria: 'Clima y Temperatura',
    icono: '🌬️',
    resumenPositivo: 'El ambiente húmedo evitó que la planta se deshidratara.',
    resumenNegativo: 'Días con viento y aire seco exigieron más agua a la planta.',
    positivo:
      'Se estima que la humedad del aire fue estable durante mayo y junio, permitiendo que la cebada creciera sin desgaste de agua.',
    negativo:
      'Se estima que hubo semanas con aire muy seco durante el crecimiento juvenil, lo que obligó a la planta a frenar su desarrollo para no perder agua.',
    accionPositiva: 'Las condiciones de humedad ambiental favorecieron un crecimiento continuo.',
    accionNegativa: 'Dejar cobertura de rastrojo para que el aire seco no reseque tan rápido la tierra.',
  },
  bi_canopy_air_diff: {
    etiquetaCorta: 'Frescura de la Planta',
    tituloAmigable: 'Frescura del cultivo en horas de sol',
    categoria: 'Agua y Humedad',
    icono: '💧',
    resumenPositivo: 'La planta se mantuvo fresca gracias a buena humedad en raíz.',
    resumenNegativo: 'La planta resintió el calor de mediodía por falta de humedad.',
    positivo:
      'Se estima que tus plantas se mantuvieron frescas durante las tardes soleadas porque sus raíces encontraron buena humedad en el suelo.',
    negativo:
      'Se estima que el cultivo se calentó de más al mediodía porque le costó tomar agua rápida del subsuelo.',
    accionPositiva: 'Tu terreno guarda bien la humedad profunda para proteger al cultivo del sol.',
    accionNegativa: 'Aflojar el suelo antes de la temporada para que el agua de lluvia entre a mayor profundidad.',
  },
  landsat_vi6t_max: {
    etiquetaCorta: 'Calor Durante el Ciclo',
    tituloAmigable: 'Temperatura sobre el cultivo en días calurosos',
    categoria: 'Clima y Temperatura',
    icono: '☀️',
    resumenPositivo: 'Temperaturas suaves sin golpes de calor cuidaron el grano.',
    resumenNegativo: 'Días de calor fuerte aceleraron la planta y restaron peso.',
    positivo:
      'Se estima que la temperatura en tu parcela se mantuvo suave y sin golpes de calor, permitiendo un llenado de grano tranquilo y pesado.',
    negativo:
      'Se estima que los picos de calor en días despejados afectaron la cosecha al apresurar la maduración de la espiga.',
    accionPositiva: 'El clima templado favorece un grano lleno y de buen calibre para maltería.',
    accionNegativa: 'Sembrar a tiempo al inicio de las lluvias para que el llenado de grano ocurra en semanas más frescas.',
  },
  s2_ndwi_mean: {
    etiquetaCorta: 'Humedad en la Planta',
    tituloAmigable: 'Agua aprovechada por la planta en la temporada',
    categoria: 'Agua y Humedad',
    icono: '💧',
    resumenPositivo: 'Se estima que la buena humedad en la planta impulsó tu cosecha.',
    resumenNegativo: 'Se estima que la falta de humedad en la planta afectó la cosecha.',
    positivo:
      'Se estima que el cultivo contó con muy buena humedad en sus hojas durante el temporal, siendo uno de los principales impulsores de tu cosecha.',
    negativo:
      'Se estima que la menor disponibilidad de agua en la planta durante el ciclo redujo el peso esperado de la cosecha.',
    accionPositiva: 'Excelente aprovechamiento del agua de lluvia en tu terreno.',
    accionNegativa: 'Cuidar el sellado y surcado del suelo para retener cada lluvia dentro de la parcela.',
  },
  s2_ndwi_min: {
    etiquetaCorta: 'Reserva de Agua en Sequía',
    tituloAmigable: 'Humedad del cultivo en los días más secos',
    categoria: 'Agua y Humedad',
    icono: '🌧️',
    resumenPositivo: 'Tu terreno guardó humedad incluso en las semanas sin lluvia.',
    resumenNegativo: 'La falta de agua en las semanas secas restó kilos a la espiga.',
    positivo:
      'Se estima que aun durante las semanas con menos lluvia (canícula), tu suelo conservó suficiente humedad para no frenar el cultivo.',
    negativo:
      'Se estima que la falta de humedad durante los días más secos del verano afectó a la planta justo antes del espigado.',
    accionPositiva: 'Muy buena capacidad de tu tierra para aguantar pausas en las lluvias.',
    accionNegativa: 'Incorporar rastrojo y controlar pronto la maleza para que no le quite humedad a la cebada en verano.',
  },
  s2_dswi2_mean: {
    etiquetaCorta: 'Humedad en Suelo y Follaje',
    tituloAmigable: 'Reserva de humedad para el llenado de espiga',
    categoria: 'Agua y Humedad',
    icono: '💦',
    resumenPositivo: 'Buena humedad sostenida ayudó a formar espigas bien llenas.',
    resumenNegativo: 'El estrés por falta de agua limitó el llenado de los granos.',
    positivo:
      'Se estima que el buen nivel de humedad en el follaje y el suelo durante el embuche y espigado sumó kilos importantes a tu cosecha.',
    negativo:
      'Se estima que al cultivo le faltó humedad constante a mitad de temporada, reduciendo el número de granos llenos por espiga.',
    accionPositiva: 'Condición de humedad muy favorable para obtener alto rendimiento.',
    accionNegativa: 'Priorizar labores que conserven la humedad del suelo desde antes de la siembra.',
  },
  estres_termohidrico: {
    etiquetaCorta: 'Balance de Calor y Lluvia',
    tituloAmigable: 'Equilibrio entre calor y agua disponible',
    categoria: 'Agua y Humedad',
    icono: '🌤️',
    resumenPositivo: 'Buen equilibrio entre días de sol y lluvias oportunas.',
    resumenNegativo: 'La combinación de días calurosos y poca agua afectó el cultivo.',
    positivo:
      'Se estima que las lluvias acompañaron bien los días cálidos, evitando que la planta sufriera desgaste por calor y sequía.',
    negativo:
      'Se estima que coincidieron días de mucho sol con poca humedad en la tierra, lo que estresó a la planta y redujo el rendimiento.',
    accionPositiva: 'Temporada equilibrada en lluvias y temperatura para tu predio.',
    accionNegativa: 'Aplicar bioestimulantes foliares si se presentan semanas calurosas con retraso de lluvias.',
  },
  persistencia_verde_m11: {
    etiquetaCorta: 'Duración del Llenado',
    tituloAmigable: 'Tiempo que la planta se mantuvo verde llenando grano',
    categoria: 'Desarrollo de la Planta',
    icono: '🌾',
    resumenPositivo: 'La hoja duró verde y sana hasta terminar de llenar el grano.',
    resumenNegativo: 'La planta se secó antes de tiempo al cierre de la temporada.',
    positivo:
      'Se estima que el follaje se mantuvo sano y activo hasta el final del ciclo, dando más días para formar un grano pesado.',
    negativo:
      'Se estima que el cultivo se secó de forma anticipada al cierre del ciclo, acortando el tiempo de llenado del grano.',
    accionPositiva: 'Cosechar cuando el grano tenga entre 12% y 13.5% de humedad.',
    accionNegativa: 'Cuidar la hoja bandera contra enfermedades de fin de ciclo como roya o mancha foliar.',
  },
  log_area: {
    etiquetaCorta: 'Manejo por Tamaño del Lote',
    tituloAmigable: 'Uniformidad de manejo según el tamaño del predio',
    categoria: 'Suelo y Terreno',
    icono: '🚜',
    resumenPositivo: 'El tamaño del predio facilitó un manejo parejo del cultivo.',
    resumenNegativo: 'Por la extensión del terreno hay variaciones internas de suelo.',
    positivo:
      'Se estima que el tamaño de tu parcela permite realizar la siembra, fertilización y cuidado de forma muy pareja.',
    negativo:
      'Se estima que por el tamaño del lote existen franjas internas con distinta humedad o suelo que bajan un poco el promedio general.',
    accionPositiva: 'Continuar con el manejo uniforme en toda la superficie.',
    accionNegativa: 'Ubicar las partes más delgadas o secas del terreno para reforzar ahí la fertilización.',
  },
  elevacion_msnm: {
    etiquetaCorta: 'Altura del Terreno',
    tituloAmigable: 'Clima fresco por la altura de tu parcela',
    categoria: 'Suelo y Terreno',
    icono: '⛰️',
    resumenPositivo: 'La altura de tu terreno brinda un clima fresco ideal para cebada.',
    resumenNegativo: 'Por la mayor altura del terreno el clima es más frío y exigente.',
    positivo:
      'Se estima que la altura a la que se ubica tu terreno ofrece el clima templado ideal que necesita la cebada maltera.',
    negativo:
      'Se estima que por estar en una zona más alta y fría, el cultivo crece más despacio y está más expuesto a bajas temperaturas.',
    accionPositiva: 'Tu terreno tiene una altura excelente dentro de la región cebadera.',
    accionNegativa: 'Usar semilla adaptada a zonas altas y respetar las fechas óptimas de siembra.',
  },
  pendiente_grados: {
    etiquetaCorta: 'Inclinación del Terreno',
    tituloAmigable: 'Pendiente del suelo y aprovechamiento del agua',
    categoria: 'Suelo y Terreno',
    icono: '📐',
    resumenPositivo: 'Terreno plano o suave que aprovecha toda el agua de lluvia.',
    resumenNegativo: 'La inclinación del terreno hace que escurra parte de la lluvia.',
    positivo:
      'Se estima que la poca inclinación de tu terreno ayuda a que el agua de lluvia se quede en la raíz sin escurrirse.',
    negativo:
      'Se estima que la pendiente de tu parcela provoca que parte del agua de lluvia y del fertilizante escurra hacia las partes bajas.',
    accionPositiva: 'El relieve de tu terreno favorece guardar la humedad del temporal.',
    accionNegativa: 'Trazar los surcos al contorno (a nivel) para retener el agua de lluvia y evitar deslaves.',
  },
  lat_centro: {
    etiquetaCorta: 'Ubicación en el Valle',
    tituloAmigable: 'Paso de lluvias por la ubicación de tu predio',
    categoria: 'Suelo y Terreno',
    icono: '🧭',
    resumenPositivo: 'Buena ubicación dentro de la franja de lluvias del valle.',
    resumenNegativo: 'Franja del valle donde las lluvias suelen ser más espaciadas.',
    positivo:
      'Se estima que la ubicación de tu parcela dentro del valle recibe un paso favorable de lluvias durante el verano.',
    negativo:
      'Se estima que en esta franja del municipio las lluvias suelen caer de forma más espaciada que en otras zonas cercanas.',
    accionPositiva: 'Buena ubicación natural dentro del corredor cebadero.',
    accionNegativa: 'Cuidar el arrope de humedad desde la preparación del terreno.',
  },
  lon_centro: {
    etiquetaCorta: 'Entrada de Humedad Regional',
    tituloAmigable: 'Cercanía a las corrientes húmedas de la región',
    categoria: 'Suelo y Terreno',
    icono: '🧭',
    resumenPositivo: 'Tu parcela recibe buena brisa y humedad de la sierra.',
    resumenNegativo: 'Zona más abierta y seca hacia el poniente de la región.',
    positivo:
      'Se estima que la ubicación de tu terreno recibe mejor entrada de humedad regional, ayudando a mantener fresco el cultivo.',
    negativo:
      'Se estima que tu parcela se ubica en una franja más abierta donde el viento seca más rápido la humedad superficial.',
    accionPositiva: 'Aprovechar el buen régimen de humedad de tu zona.',
    accionNegativa: 'Ajustar la cantidad de semilla y fertilizante a la humedad real de tu terreno.',
  },
  s2_sti_presow: {
    etiquetaCorta: 'Preparación y Rastrojo Previo',
    tituloAmigable: 'Rastrojo y condición del suelo antes de sembrar',
    categoria: 'Suelo y Terreno',
    icono: '🌾',
    resumenPositivo: 'Buena cama de siembra y rastrojo guardaron la primera humedad.',
    resumenNegativo: 'Poca cobertura de rastrojo antes de sembrar resecó el suelo.',
    positivo:
      'Se estima que el terreno llegó a la siembra bien preparado y con rastrojo que ayudó a conservar la humedad de las primeras lluvias.',
    negativo:
      'Se estima que el suelo estuvo muy descubierto antes de sembrar, perdiendo humedad superficial por el sol y el viento.',
    accionPositiva: 'Mantener la práctica de dejar rastrojo picado para proteger la tierra.',
    accionNegativa: 'Evitar dejar la tierra totalmente desnuda meses antes de la siembra de abril.',
  },
  proxy_relieve_m: {
    etiquetaCorta: 'Parejura del Terreno',
    tituloAmigable: 'Desniveles internos dentro de la parcela',
    categoria: 'Suelo y Terreno',
    icono: '🏞️',
    resumenPositivo: 'Relieve favorable para captar humedad de forma pareja.',
    resumenNegativo: 'Los desniveles del terreno secan más rápido las partes altas.',
    positivo:
      'Se estima que la forma natural de tu terreno ayuda a distribuir bien la humedad y la ventilación del cultivo.',
    negativo:
      'Se estima que las ondulaciones del predio hacen que el agua se concentre en los bajos y falte en los lomos.',
    accionPositiva: 'Terreno con buena forma para el desarrollo del cultivo.',
    accionNegativa: 'Cuidar que el agua no corra con fuerza por las partes inclinadas del lote.',
  },
  landsat_vi6t_std: {
    etiquetaCorta: 'Estabilidad del Clima',
    tituloAmigable: 'Estabilidad de la temperatura entre semanas',
    categoria: 'Clima y Temperatura',
    icono: '🌡️',
    resumenPositivo: 'El clima se mantuvo estable sin cambios bruscos de calor a frío.',
    resumenNegativo: 'Cambios bruscos de temperatura entre semanas estresaron la planta.',
    positivo:
      'Se estima que la temperatura fue constante a lo largo del ciclo, permitiendo que la cebada creciera sin sobresaltos.',
    negativo:
      'Se estima que las variaciones fuertes entre días muy calurosos y días fríos restaron algo de ritmo al cultivo.',
    accionPositiva: 'Clima estable durante el desarrollo de la espiga.',
    accionNegativa: 'Asegurar buen aporte de potasio en la fertilización para que la planta resista cambios de clima.',
  },
  bi_vpd_ndwi_stress: {
    etiquetaCorta: 'Resistencia al Calor Seco',
    tituloAmigable: 'Agua en la planta frente a los días secos',
    categoria: 'Agua y Humedad',
    icono: '💧',
    resumenPositivo: 'La planta tuvo suficiente agua para soportar los días de sol.',
    resumenNegativo: 'El aire seco y la falta de agua frenaron el llenado de grano.',
    positivo:
      'Se estima que el cultivo estuvo bien hidratado para aguantar sin problema los días más soleados y secos del ciclo.',
    negativo:
      'Se estima que la combinación de aire seco y menor humedad en la planta redujo el peso de grano en tu cosecha.',
    accionPositiva: 'Buen balance de agua en la planta durante el verano.',
    accionNegativa: 'Eliminar malezas a tiempo para que toda la humedad del suelo la aproveche la cebada.',
  },
  planet_ndvi_mean: {
    etiquetaCorta: 'Vigor del Cultivo',
    tituloAmigable: 'Fuerza y cobertura verde de las plantas',
    categoria: 'Desarrollo de la Planta',
    icono: '🌱',
    resumenPositivo: 'Plantas vigorosas y bien pobladas impulsaron el rendimiento.',
    resumenNegativo: 'Menor vigor o población de plantas redujo la cosecha esperada.',
    positivo:
      'Se estima que tu parcela logró plantas fuertes, tupidas y sanas durante la temporada, impulsando una buena cosecha.',
    negativo:
      'Se estima que el cultivo tuvo un desarrollo más ralo o con menor fuerza vegetativa que otros predios de la zona.',
    accionPositiva: 'Excelente desarrollo de planta en tu terreno.',
    accionNegativa: 'Usar semilla certificada de buena germinación y revisar la fertilización de arranque.',
  },
  Z1_pls_clima: {
    etiquetaCorta: 'Clima General del Ciclo',
    tituloAmigable: 'Comportamiento general de lluvias y calor en el año',
    categoria: 'Clima y Temperatura',
    icono: '☀️',
    resumenPositivo: 'Las lluvias y el calor del ciclo se acomodaron bien al cultivo.',
    resumenNegativo: 'El clima de la temporada presentó desfases para la planta.',
    positivo:
      'Se estima que el comportamiento general del clima en la temporada acompañó bien cada etapa de crecimiento de tu cebada.',
    negativo:
      'Se estima que hubo semanas donde el calor y las lluvias no coincidieron con lo que pedía la planta en ese momento.',
    accionPositiva: 'Buena sincronía del clima con las etapas de tu cultivo.',
    accionNegativa: 'Vigilar el cultivo en encañe y espigado para aplicar nutrientes foliares de apoyo.',
  },
  Z2_pls_clima: {
    etiquetaCorta: 'Clima en Llenado de Grano',
    tituloAmigable: 'Temperaturas durante el espigado y llenado',
    categoria: 'Clima y Temperatura',
    icono: '🌤️',
    resumenPositivo: 'Días templados en el espigado ayudaron a llenar mejor el grano.',
    resumenNegativo: 'El clima durante el espigado restó algo de peso al grano.',
    positivo:
      'Se estima que las condiciones frescas y húmedas durante el espigado ayudaron a formar granos llenos y pesados.',
    negativo:
      'Se estima que las temperaturas durante el llenado de la espiga fueron menos favorables, reduciendo ligeramente el rendimiento.',
    accionPositiva: 'Buen cierre climático para la calidad maltera.',
    accionNegativa: 'Proteger la sanidad de la planta en agosto y septiembre para aprovechar todo el llenado.',
  },
  planet_msavi_mean: {
    etiquetaCorta: 'Amacollamiento y Cobertura',
    tituloAmigable: 'Fuerza con la que la planta cubrió el suelo',
    categoria: 'Desarrollo de la Planta',
    icono: '🌿',
    resumenPositivo: 'La planta amacolló bien y cubrió parejo el terreno.',
    resumenNegativo: 'La planta amacolló menos y dejó espacios descubiertos.',
    positivo:
      'Se estima que la cebada amacolló con fuerza y cubrió muy bien la tierra desde joven, ayudando a lograr más espigas.',
    negativo:
      'Se estima que el cultivo tuvo menor amacollamiento y dejó surcos más abiertos, disminuyendo la cosecha final.',
    accionPositiva: 'Buen cierre de cultivo sobre el terreno.',
    accionNegativa: 'Reforzar la nutrición con fósforo y nitrógeno temprano para impulsar el amacollamiento.',
  },
  landsat_intra_vi6t_std: {
    etiquetaCorta: 'Parejura de Humedad en el Lote',
    tituloAmigable: 'Uniformidad de humedad dentro de tu parcela',
    categoria: 'Agua y Humedad',
    icono: '🚜',
    resumenPositivo: 'Toda la parcela conservó la humedad de manera muy pareja.',
    resumenNegativo: 'Hay manchones dentro del terreno que se secan más rápido.',
    positivo:
      'Se estima que tu terreno guarda el agua de forma muy pareja en toda su superficie, logrando una maduración uniforme.',
    negativo:
      'Se estima que dentro de tu misma parcela hay partes altas o delgadas que se secan antes que el resto del lote.',
    accionPositiva: 'Terreno muy parejo para el manejo y la trilla.',
    accionNegativa: 'Agregar más rastrojo o abono orgánico en las manchas del terreno que se secan primero.',
  },
  elongacion_bbox: {
    etiquetaCorta: 'Forma de la Parcela',
    tituloAmigable: 'Facilidad de trabajo por la forma del terreno',
    categoria: 'Suelo y Terreno',
    icono: '📐',
    resumenPositivo: 'La forma del lote facilita las labores con maquinaria.',
    resumenNegativo: 'La forma del terreno genera más vueltas en las cabeceras.',
    positivo:
      'Se estima que la forma de tu parcela permite trabajar en melgas largas y aprovechar bien toda la superficie sembrada.',
    negativo:
      'Se estima que por la forma del terreno se compactan más las cabeceras al dar vuelta con el tractor.',
    accionPositiva: 'Buena geometría del terreno para las labores agrícolas.',
    accionNegativa: 'Aflojar bien las cabeceras del predio antes de sembrar.',
  },
}

export function traducirVariableShapAgricultor(item: ShapVariableContribution, pesoNormalizado?: number): FactorExplicadoAgricultor {
  const info = DICCIONARIO_SHAP_AGRICULTOR[item.variable] || {
    etiquetaCorta: 'Condición del Cultivo',
    tituloAmigable: 'Condición de clima y terreno en tu parcela',
    categoria: 'Clima y Temperatura' as const,
    icono: '🌾',
    resumenPositivo: 'Favoreció el buen desarrollo de tu cebada.',
    resumenNegativo: 'Redujo ligeramente el ritmo del cultivo.',
    positivo: 'Se estima que esta condición del terreno y del clima ayudó al desarrollo sano de la cebada.',
    negativo: 'Se estima que esta condición redujo ligeramente el ritmo de crecimiento del cultivo.',
    accionPositiva: 'Mantener el buen manejo actual en tu parcela.',
    accionNegativa: 'Supervisar el desarrollo del cultivo en las etapas críticas.',
  }

  const esPositivo = item.shap_kg_ha >= 0
  return {
    variable: item.variable,
    etiquetaCorta: info.etiquetaCorta,
    tituloAmigable: info.tituloAmigable,
    categoria: info.categoria,
    icono: '',
    efecto: esPositivo ? 'positivo' : 'negativo',
    impactoKgHa: Math.round(item.shap_kg_ha),
    impactoTHa: Math.round(item.shap_t_ha * 1000) / 1000,
    pesoPct: pesoNormalizado ?? Math.max(5, Math.round(item.impacto_pct || 15)),
    resumenCorto: esPositivo ? info.resumenPositivo : info.resumenNegativo,
    explicacion: esPositivo ? info.positivo : info.negativo,
    recomendacionAccion: esPositivo ? info.accionPositiva : info.accionNegativa,
  }
}

export function construirResumenAgricultorSHAP(
  shapVars: ShapVariableContribution[] | undefined,
  rendimientoTHa: number,
  municipio: string,
  pendienteGrados: number,
  regimenAgua: string
): {
  diagnosticoSubtitulo: string
  resumenNarrativo: string
  top4FactoresPeso: FactorExplicadoAgricultor[]
  factoresPositivos: FactorExplicadoAgricultor[]
  factoresNegativos: FactorExplicadoAgricultor[]
} {
  let baseList: ShapVariableContribution[] = []

  if (shapVars && shapVars.length > 0) {
    baseList = [...shapVars].sort((a, b) => Math.abs(b.shap_kg_ha) - Math.abs(a.shap_kg_ha))
  } else {
    // Si es un predio ingresado manualmente (Camino B), construimos las 4 variables de mayor peso según sus condiciones
    const impactoAgua = regimenAgua === 'riego' ? 320 : regimenAgua === 'temporal_bueno' ? 140 : -210
    const impactoPend = pendienteGrados > 3.0 ? -135 : 95
    baseList = [
      {
        variable: 's2_ndwi_mean',
        etiqueta: 'Humedad en la planta',
        nodo_qbaf: '',
        valor_parcela: 0,
        mediana_estado: 0,
        shap_t_ha: impactoAgua / 1000,
        shap_kg_ha: impactoAgua,
        impacto_pct: 38,
        efecto: impactoAgua >= 0 ? 'positivo' : 'negativo',
      },
      {
        variable: 'pendiente_grados',
        etiqueta: 'Inclinación del terreno',
        nodo_qbaf: '',
        valor_parcela: pendienteGrados,
        mediana_estado: 2.0,
        shap_t_ha: impactoPend / 1000,
        shap_kg_ha: impactoPend,
        impacto_pct: 26,
        efecto: impactoPend >= 0 ? 'positivo' : 'negativo',
      },
      {
        variable: 'bi_Tmin_anom25_04',
        etiqueta: 'Clima en la siembra',
        nodo_qbaf: '',
        valor_parcela: 0,
        mediana_estado: 0,
        shap_t_ha: 0.11,
        shap_kg_ha: 110,
        impacto_pct: 21,
        efecto: 'positivo',
      },
      {
        variable: 'planet_ndvi_mean',
        etiqueta: 'Vigor del cultivo',
        nodo_qbaf: '',
        valor_parcela: 0,
        mediana_estado: 0,
        shap_t_ha: regimenAgua === 'temporal_regular' ? -0.08 : 0.09,
        shap_kg_ha: regimenAgua === 'temporal_regular' ? -80 : 90,
        impacto_pct: 15,
        efecto: regimenAgua === 'temporal_regular' ? 'negativo' : 'positivo',
      },
    ]
  }

  const top4Raw = baseList.slice(0, 4)
  const sumAbsTop4 = top4Raw.reduce((acc, x) => acc + Math.max(Math.abs(x.shap_kg_ha), 8), 0) + 1e-9

  const top4FactoresPeso = top4Raw.map((item) => {
    const pesoRelativo = Math.max(8, Math.round((Math.abs(item.shap_kg_ha) / sumAbsTop4) * 100))
    return traducirVariableShapAgricultor(item, pesoRelativo)
  })

  const todosTraducidos = baseList
    .map((item) => traducirVariableShapAgricultor(item))
    .filter((f) => Math.abs(f.impactoKgHa) >= 5)

  const positivos = todosTraducidos
    .filter((f) => f.impactoKgHa > 0)
    .sort((a, b) => b.impactoKgHa - a.impactoKgHa)
    .slice(0, 3)

  const negativos = todosTraducidos
    .filter((f) => f.impactoKgHa < 0)
    .sort((a, b) => a.impactoKgHa - b.impactoKgHa)
    .slice(0, 3)

  const f1 = top4FactoresPeso[0]
  const f2 = top4FactoresPeso[1]
  const principalPos = positivos[0]
  const principalNeg = negativos[0]

  // Subtítulo dinámico para el recuadro "Diagnóstico del Cultivo"
  let diagnosticoSubtitulo = ''
  if (f1 && f2) {
    const verboF1 = f1.efecto === 'positivo' ? 'favoreció' : 'limitó'
    diagnosticoSubtitulo = `En tu parcela de ${municipio}, se estima que "${f1.tituloAmigable.toLowerCase()}" (${f1.pesoPct}% de peso) ${verboF1} el rendimiento, acompañado por "${f2.tituloAmigable.toLowerCase()}".`
  } else {
    diagnosticoSubtitulo = `Proyección estimada de ${rendimientoTHa} t/ha para tu terreno en ${municipio} de acuerdo con la humedad y el clima de la temporada.`
  }

  // Párrafo explicativo principal (sin mencionar sensores ni siglas técnicas)
  let resumenNarrativo = `Con base en las condiciones que más peso tuvieron en la predicción de tu parcela en ${municipio}, `
  if (principalPos && principalNeg && Math.abs(principalNeg.impactoKgHa) >= 15) {
    resumenNarrativo += `se estima que ${principalPos.tituloAmigable.toLowerCase()} ayudó a tu cosecha sumando +${principalPos.impactoKgHa} kg por hectárea (${principalPos.resumenCorto.toLowerCase()}), mientras que ${principalNeg.tituloAmigable.toLowerCase()} restó ${principalNeg.impactoKgHa} kg por hectárea (${principalNeg.resumenCorto.toLowerCase()}).`
  } else if (principalPos) {
    resumenNarrativo += `se estima que ${principalPos.tituloAmigable.toLowerCase()} fue el factor más importante impulsando tu cosecha con +${principalPos.impactoKgHa} kg por hectárea (${principalPos.resumenCorto.toLowerCase()}), sin que se presentaran pérdidas fuertes por clima o falta de agua.`
  } else if (principalNeg) {
    resumenNarrativo += `se estima que ${principalNeg.tituloAmigable.toLowerCase()} afectó la cosecha restando ${principalNeg.impactoKgHa} kg por hectárea (${principalNeg.resumenCorto.toLowerCase()}), por lo que se recomienda ${principalNeg.recomendacionAccion.toLowerCase()}`
  } else {
    resumenNarrativo += `el cultivo mantiene un comportamiento estable y cercano al promedio de tu localidad.`
  }

  return {
    diagnosticoSubtitulo,
    resumenNarrativo,
    top4FactoresPeso,
    factoresPositivos: positivos,
    factoresNegativos: negativos,
  }
}
