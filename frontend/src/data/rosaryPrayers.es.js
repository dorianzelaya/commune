// Spanish for the seven prayers recited during the rosary walkthrough,
// keyed by the object keys in rosary.js's PRAYERS block.
//
// WHY THIS IS SEPARATE FROM prayers.es.js
//
// rosary.js carries its own copy of these prayers, and the wording is
// deliberately different from the Prayers page in places: the rosary's
// Hail Holy Queen includes the versicles and the closing collect, and its
// Creed says "Holy Ghost" where the other says "Holy Spirit". Those are
// rosary-specific traditional forms, not an accident, so the two are not
// merged. This file keeps the same separation on the Spanish side.
//
// Partial like the others. Two entries are missing their text on purpose
// and fall back to English until a source is available: the Creed and the
// Salve, the latter because the rosary version is the long form with
// versicles and a collect rather than the antiphon alone.

const ROSARY_PRAYERS_ES = {
  signOfCross: {
    name: 'La Señal de la Cruz',
    text: 'En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.',
  },
  apostlesCreed: {
    name: 'Credo de los Apóstoles',
    text: 'Creo en Dios, Padre todopoderoso, Creador del cielo y de la tierra. Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo, nació de santa María Virgen, padeció bajo el poder de Poncio Pilato, fue crucificado, muerto y sepultado, descendió a los infiernos, al tercer día resucitó de entre los muertos, subió a los cielos y está sentado a la derecha de Dios, Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos. Creo en el Espíritu Santo, la santa Iglesia católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén.',
  },
  ourFather: {
    name: 'Padre Nuestro',
    text: 'Padre nuestro, que estás en el cielo, santificado sea tu Nombre; venga a nosotros tu Reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.',
  },
  hailMary: {
    name: 'Ave María',
    text: 'Dios te salve, María. Llena eres de gracia: El Señor es contigo. Bendita tú eres entre todas las mujeres. Y bendito es el fruto de tu vientre: Jesús. Santa María, Madre de Dios, ruega por nosotros pecadores, ahora y en la hora de nuestra muerte. Amén.',
  },
  gloryBe: {
    name: 'Gloria',
    text: 'Gloria al Padre, al Hijo y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.',
  },
  fatimaPlayer: {
    name: 'Oración de Fátima',
    text: 'Oh Jesús mío, perdona nuestros pecados, sálvanos del fuego del infierno. Lleva al cielo a todas las almas, especialmente las más necesitadas de tu misericordia.',
  },
  hailHolyQueen: {
    name: 'La Salve',
  },
}

export default ROSARY_PRAYERS_ES
