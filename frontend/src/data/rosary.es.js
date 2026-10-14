// Spanish for the rosary mysteries, keyed by the stable id in rosary.js.
//
// Same contract as prayers.es.js: partial and flat, falling back field by
// field to English. The meditations are the app's own prose, so these are
// translations. The scripture references are localised book names.
//
// The mystery SET keys (Joyful, Sorrowful, Glorious, Luminous) are not in
// here. They are identifiers - rosary_mystery stores one in localStorage
// and syncs it across devices, so translating them would orphan saved
// progress. Their display names live in the string table under
// rosary.set.*.

const MYSTERIES_ES = {
  // Misterios gozosos
  'the-annunciation': {
    name: 'La Anunciación',
    meditation: 'El ángel Gabriel anuncia a María que concebirá y dará a luz al Hijo de Dios. María responde con confianza total: "Hágase en mí según tu palabra".',
    scripture: 'Lucas 1:26–38',
    imageCaption: 'La Anunciación — Fra Angelico, c. 1426',
  },
  'the-visitation': {
    name: 'La Visitación',
    meditation: 'María visita a su prima Isabel, que espera un hijo. Al saludo de María, el niño Juan salta en el vientre de su madre, e Isabel proclama: "Bendita tú entre las mujeres".',
    scripture: 'Lucas 1:39–56',
    imageCaption: 'La Visitación con María Jacobé y María Salomé — Domenico Ghirlandaio, 1491',
  },
  'the-nativity': {
    name: 'El Nacimiento de Jesús',
    meditation: 'Jesús nace en un establo de Belén, envuelto en pañales y recostado en un pesebre. Los ángeles anuncian paz en la tierra a los hombres de buena voluntad.',
    scripture: 'Lucas 2:1–20',
    imageCaption: 'La noche santa (La Notte) — Correggio, c. 1528–1530',
  },
  'the-presentation': {
    name: 'La Presentación',
    meditation: 'María y José presentan al niño Jesús en el Templo. Simeón lo toma en sus brazos y profetiza que será luz para las naciones.',
    scripture: 'Lucas 2:22–38',
    imageCaption: 'La presentación de Cristo en el Templo — Andrea Mantegna, c. 1454',
  },
  'the-finding-in-the-temple': {
    name: 'El Niño perdido y hallado en el Templo',
    meditation: 'Después de tres días de búsqueda, María y José encuentran a Jesús, de doce años, en el Templo, sentado entre los maestros, escuchando y preguntando.',
    scripture: 'Lucas 2:41–52',
    imageCaption: 'Jesús entre los doctores — Jean-Auguste-Dominique Ingres, 1862',
  },

  // Misterios dolorosos
  'the-agony-in-the-garden': {
    name: 'La oración de Jesús en el huerto',
    meditation: 'Jesús ora en el huerto de Getsemaní y su sudor cae como gotas de sangre. Acepta la voluntad del Padre: "No se haga mi voluntad, sino la tuya".',
    scripture: 'Lucas 22:39–46',
    imageCaption: 'Cristo en Getsemaní — Heinrich Hofmann, 1886',
  },
  'the-scourging-at-the-pillar': {
    name: 'La flagelación del Señor',
    meditation: 'Jesús es atado a una columna y azotado. Soporta este sufrimiento en silencio y lo ofrece por los pecados del mundo.',
    scripture: 'Juan 19:1',
    imageCaption: 'La flagelación de nuestro Señor Jesucristo — William-Adolphe Bouguereau, 1880',
  },
  'the-crowning-with-thorns': {
    name: 'La coronación de espinas',
    meditation: 'Los soldados colocan una corona de espinas en la cabeza de Jesús y se burlan de él como Rey de los judíos. Soporta esta humillación con paciencia y amor.',
    scripture: 'Mateo 27:27–31',
    imageCaption: 'La coronación de espinas — Tiziano, c. 1540–1543',
  },
  'the-carrying-of-the-cross': {
    name: 'Jesús con la cruz camino del Calvario',
    meditation: 'Jesús lleva su cruz por las calles de Jerusalén hasta el Calvario; cae tres veces bajo su peso y se encuentra con su Madre en el camino.',
    scripture: 'Juan 19:17',
    imageCaption: 'Cristo con la cruz — atribuido a Leonardo da Vinci, c. 1500',
  },
  'the-crucifixion': {
    name: 'La crucifixión y muerte de Jesús',
    meditation: 'Jesús es clavado en la cruz y muere después de tres horas de agonía. Sus últimas palabras son: "Padre, en tus manos encomiendo mi espíritu".',
    scripture: 'Juan 19:18–30',
    imageCaption: 'El martirio de Jesús de Nazaret — Aimé-Nicolas Morot, 1883',
  },

  // Misterios gloriosos
  'the-resurrection': {
    name: 'La Resurrección',
    meditation: 'Al tercer día, Jesús resucita de entre los muertos y vence al pecado y a la muerte. María Magdalena es la primera en encontrarse con el Resucitado junto al sepulcro vacío.',
    scripture: 'Juan 20:1–18',
    imageCaption: 'La Resurrección de Cristo — Tiziano, c. 1542–1544',
  },
  'the-ascension': {
    name: 'La Ascensión del Señor',
    meditation: 'Cuarenta días después de la Resurrección, Jesús sube al cielo a la vista de sus discípulos y promete enviar al Espíritu Santo.',
    scripture: 'Hechos 1:9–11',
    imageCaption: 'La Ascensión — John Singleton Copley, 1775',
  },
  'the-descent-of-the-holy-spirit': {
    name: 'La venida del Espíritu Santo',
    meditation: 'En Pentecostés, el Espíritu Santo desciende sobre María y los Apóstoles en forma de lenguas de fuego. Nace la Iglesia y los Apóstoles salen a predicar.',
    scripture: 'Hechos 2:1–4',
    imageCaption: 'Pentecostés — El Greco, c. 1600',
  },
  'the-assumption-of-mary': {
    name: 'La Asunción de María',
    meditation: 'Al término de su vida terrena, María es llevada en cuerpo y alma a la gloria del cielo, señal de la resurrección prometida a todos los fieles.',
    scripture: 'Este misterio es un dogma definido de la Iglesia y no se narra directamente en la Escritura.',
    imageCaption: 'La Inmaculada Concepción de Walpole — Bartolomé Esteban Murillo, c. 1680',
  },
  'the-coronation-of-mary': {
    name: 'La coronación de María',
    meditation: 'María es coronada por su Hijo como Reina del cielo y de la tierra. Reina como nuestra Madre y Medianera, e intercede por todos sus hijos.',
    scripture: 'Este misterio es un dogma definido de la Iglesia y no se narra directamente en la Escritura.',
    imageCaption: 'La coronación de la Virgen — Diego Velázquez, c. 1635–1636',
  },

  // Misterios luminosos
  'the-baptism-of-jesus': {
    name: 'El Bautismo de Jesús',
    meditation: 'Jesús es bautizado en el Jordán por Juan. Se abren los cielos y se oye la voz del Padre: "Este es mi Hijo amado, en quien me complazco".',
    scripture: 'Mateo 3:13–17',
    imageCaption: 'El bautismo de Cristo — Andrea del Verrocchio con Leonardo da Vinci, c. 1470–1475',
  },
  'the-wedding-at-cana': {
    name: 'Las bodas de Caná',
    meditation: 'Por la intercesión de María, Jesús realiza su primer milagro y convierte el agua en vino. Sus discípulos creen en él.',
    scripture: 'Juan 2:1–11',
    imageCaption: 'Las bodas de Caná — Garofalo (Benvenuto Tisi), 1531',
  },
  'the-proclamation-of-the-kingdom': {
    name: 'El anuncio del Reino de Dios',
    meditation: 'Jesús anuncia el Reino de Dios, llama a los pecadores a la conversión y perdona los pecados. Invita a todos a un cambio de corazón.',
    scripture: 'Marcos 1:14–15',
    imageCaption: 'El sermón de la montaña — Carl Heinrich Bloch, 1877',
  },
  'the-transfiguration': {
    name: 'La Transfiguración',
    meditation: 'En el monte Tabor, Jesús se transfigura ante Pedro, Santiago y Juan. Su rostro brilla como el sol y sus vestidos se vuelven de un blanco resplandeciente.',
    scripture: 'Mateo 17:1–8',
    imageCaption: 'La Transfiguración — Rafael, 1520',
  },
  'the-institution-of-the-eucharist': {
    name: 'La institución de la Eucaristía',
    meditation: 'En la Última Cena, Jesús toma el pan y el vino y dice: "Esto es mi cuerpo. Esta es mi sangre". Se entrega por completo como alimento para la vida eterna.',
    scripture: 'Mateo 26:26–28',
    imageCaption: 'La Última Cena — Leonardo da Vinci, c. 1495–1498',
  },
}

export default MYSTERIES_ES
