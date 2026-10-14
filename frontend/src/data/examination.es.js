// Spanish for the examination of conscience, keyed by the Roman-numeral
// id in examination.js.
//
// Partial and flat like the other translation files. The `questions` are
// the app's own prose, so they are translations.
//
// The COMMANDMENTS are not. Spanish-speaking Catholics learn the decalogue
// in a fixed catechetical form, which is shorter and plainer than the
// biblical phrasing used in the English file - "Santificarás las fiestas"
// rather than "Remember to keep holy the Lord's Day". These use the form
// people actually recite, so the two languages differ in length on
// purpose.

const EXAMINATION_ES = {
  i: {
    commandment: 'I. Amarás a Dios sobre todas las cosas.',
    questions: [
      '¿He dudado o negado la existencia de Dios?',
      '¿Me he negado a creer lo que Dios nos ha revelado por medio de la Iglesia católica?',
      '¿He puesto mi fe en supersticiones, horóscopos o el ocultismo?',
      '¿He descuidado la oración durante un tiempo largo?',
      '¿He recibido la sagrada Comunión u otro sacramento en estado de pecado mortal?',
      '¿He puesto algo por delante de Dios en mi corazón: el dinero, la comodidad, la carrera, otra persona?',
    ],
  },
  ii: {
    commandment: 'II. No tomarás el nombre de Dios en vano.',
    questions: [
      '¿He usado el nombre de Dios a la ligera, con enojo o como maldición?',
      '¿He hablado sin reverencia de Dios, de la Virgen María, de los santos o de las cosas sagradas?',
      '¿He quebrantado un juramento o una promesa hecha en nombre de Dios?',
      '¿He blasfemado?',
    ],
  },
  iii: {
    commandment: 'III. Santificarás las fiestas.',
    questions: [
      '¿He faltado a Misa en domingo o en fiesta de precepto sin una razón grave?',
      '¿He llegado tarde a Misa o me he ido antes del final sin necesidad?',
      '¿He hecho trabajos innecesarios en domingo?',
      '¿He dejado que los negocios o las diversiones innecesarias me quiten el tiempo para Dios y para la familia?',
    ],
  },
  iv: {
    commandment: 'IV. Honrarás a tu padre y a tu madre.',
    questions: [
      '¿He sido desobediente, irrespetuoso o ingrato con mis padres?',
      '¿He descuidado el cuidado de familiares ancianos o enfermos?',
      '¿He faltado a mis deberes con mi cónyuge o con mis hijos?',
      '¿He dejado de proveer a las necesidades materiales y espirituales de mi familia?',
      '¿He sido desobediente a la autoridad legítima: los superiores en el trabajo, la ley civil, la Iglesia?',
    ],
  },
  v: {
    commandment: 'V. No matarás.',
    questions: [
      '¿He quitado una vida humana o he cooperado en ello?',
      '¿He tenido un aborto, o he animado o ayudado a alguien a tenerlo?',
      '¿He puesto en peligro deliberadamente mi salud o mi vida por imprudencia?',
      '¿He abusado del alcohol o de las drogas?',
      '¿He guardado odio o deseo de venganza contra otra persona?',
      '¿He causado un daño grave a otra persona con mi ira?',
      '¿He dado escándalo llevando a otro a un pecado grave?',
    ],
  },
  vi: {
    commandment: 'VI. No cometerás actos impuros.',
    questions: [
      '¿He sido infiel a mi cónyuge en pensamiento, palabra u obra?',
      '¿He tenido relaciones sexuales fuera del matrimonio?',
      '¿He usado anticonceptivos artificiales?',
      '¿He mirado deliberadamente imágenes o espectáculos impuros?',
      '¿He consentido voluntariamente pensamientos o deseos impuros?',
      '¿He sido inmodesto en el vestir o en el comportamiento?',
    ],
  },
  vii: {
    commandment: 'VII. No robarás.',
    questions: [
      '¿He tomado lo que pertenece a otro?',
      '¿He dañado los bienes de otro?',
      '¿He hecho fraude en los negocios, en los impuestos o en los estudios?',
      '¿He dejado de restituir algo que tomé o dañé?',
      '¿He gastado dinero en juegos de azar o en lujos innecesarios descuidando mis obligaciones?',
    ],
  },
  viii: {
    commandment: 'VIII. No dirás falso testimonio ni mentirás.',
    questions: [
      '¿He dicho mentiras?',
      '¿He dicho mentiras que dañaron la fama de otra persona?',
      '¿He revelado secretos que estaba obligado a guardar?',
      '¿He hecho juicios temerarios sobre el carácter de otro?',
      '¿He murmurado o difundido rumores?',
      '¿He halagado a otros con falsedad para sacar provecho?',
    ],
  },
  ix: {
    commandment: 'IX. No consentirás pensamientos ni deseos impuros.',
    questions: [
      '¿He consentido pensamientos o deseos impuros acerca de otra persona?',
      '¿He buscado ocasiones de impureza?',
      '¿He dejado de guardar la vista y la imaginación frente a la tentación?',
    ],
  },
  x: {
    commandment: 'X. No codiciarás los bienes ajenos.',
    questions: [
      '¿He tenido envidia del éxito, de los bienes o de las relaciones de otros?',
      '¿He sido ingrato por lo que Dios me ha dado?',
      '¿He sido avaro o he acumulado más de lo que necesito mientras otros pasan necesidad?',
      '¿He dejado que la envidia dañe mi relación con otra persona?',
    ],
  },
}

export default EXAMINATION_ES
