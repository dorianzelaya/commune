// Topics for the Learn section.
//
// Each topic is a title, a one-line blurb for its row, and a list of
// sections. Everything is written in both languages in place, the same way
// the prayers and examination data are, so adding a topic is a data edit
// and never a code change.
//
// Content here must be original or public domain. The 1913 Catholic
// Encyclopedia, the Baltimore Catechism, Haydock and the 19th century
// translations of the Fathers are all free to quote; a modern catechism or
// study Bible is not.

const TOPICS = [
  {
    id: 'timeline',
    kind: 'timeline',
    title: { en: 'The Church through time', es: 'La Iglesia a través del tiempo' },
    blurb: {
      en: 'Twenty centuries, in the events that shaped them',
      es: 'Veinte siglos, en los hechos que los formaron',
    },
    // Years carry a sortable number and a display label, because the honest
    // label is often a range or an approximation. Pentecost is dated
    // between 30 and 33 and the martyrdom of Peter and Paul between 64 and
    // 67; a timeline that prints those as single years is inventing
    // precision nobody has.
    events: [
      {
        year: 33, label: 'c. 33',
        title: { en: 'Pentecost', es: 'Pentecostés' },
        body: {
          en: 'The Holy Spirit descends on the apostles in Jerusalem and Peter preaches to the crowd. The Church begins in public.',
          es: 'El Espíritu Santo desciende sobre los apóstoles en Jerusalén y Pedro predica a la multitud. La Iglesia comienza en público.',
        },
      },
      {
        year: 49, label: 'c. 49',
        title: { en: 'The Council of Jerusalem', es: 'El Concilio de Jerusalén' },
        body: {
          en: 'The apostles rule that Gentile converts are not bound to the Law of Moses. The first council, and the pattern for every one after it.',
          es: 'Los apóstoles deciden que los conversos gentiles no quedan sujetos a la Ley de Moisés. El primer concilio, y el modelo de todos los demás.',
        },
      },
      {
        year: 65, label: 'c. 64–67',
        title: { en: 'Peter and Paul die in Rome', es: 'Pedro y Pablo mueren en Roma' },
        body: {
          en: 'Both martyred under Nero. Peter is buried on the Vatican hill, where his basilica stands.',
          es: 'Ambos martirizados bajo Nerón. Pedro es sepultado en la colina vaticana, donde se alza su basílica.',
        },
      },
      {
        year: 313, label: '313',
        title: { en: 'The Edict of Milan', es: 'El Edicto de Milán' },
        body: {
          en: 'Constantine and Licinius grant Christians freedom of worship. Three centuries of persecution end.',
          es: 'Constantino y Licinio conceden a los cristianos libertad de culto. Terminan tres siglos de persecución.',
        },
      },
      {
        year: 325, label: '325',
        title: { en: 'The First Council of Nicaea', es: 'El Primer Concilio de Nicea' },
        body: {
          en: 'Against Arius, the council confesses the Son consubstantial with the Father. The Creed said at Mass begins here.',
          es: 'Frente a Arrio, el concilio confiesa al Hijo consustancial al Padre. El Credo que se reza en la Misa nace aquí.',
        },
      },
      {
        year: 381, label: '381',
        title: { en: 'The First Council of Constantinople', es: 'El Primer Concilio de Constantinopla' },
        body: {
          en: 'The divinity of the Holy Spirit is confessed and the Creed takes the form still used today.',
          es: 'Se confiesa la divinidad del Espíritu Santo y el Credo toma la forma que aún se usa hoy.',
        },
      },
      {
        year: 431, label: '431',
        title: { en: 'The Council of Ephesus', es: 'El Concilio de Éfeso' },
        body: {
          en: 'Mary is declared Theotokos, Mother of God, because the one she bore is God.',
          es: 'María es declarada Theotokos, Madre de Dios, porque aquel a quien dio a luz es Dios.',
        },
      },
      {
        year: 451, label: '451',
        title: { en: 'The Council of Chalcedon', es: 'El Concilio de Calcedonia' },
        body: {
          en: 'Christ is confessed as one Person in two natures, divine and human, without confusion or division.',
          es: 'Se confiesa a Cristo como una Persona en dos naturalezas, divina y humana, sin confusión ni división.',
        },
      },
      {
        year: 590, label: '590',
        title: { en: 'Gregory the Great', es: 'Gregorio Magno' },
        body: {
          en: 'Elected pope. He reforms the liturgy, sends missionaries to England, and shapes the Church of the West.',
          es: 'Elegido papa. Reforma la liturgia, envía misioneros a Inglaterra y da forma a la Iglesia de Occidente.',
        },
      },
      {
        year: 1054, label: '1054',
        title: { en: 'The East–West Schism', es: 'El Cisma de Oriente y Occidente' },
        body: {
          en: 'Rome and Constantinople break communion. The division between Catholic and Orthodox dates from here.',
          es: 'Roma y Constantinopla rompen la comunión. De aquí data la división entre católicos y ortodoxos.',
        },
      },
      {
        year: 1215, label: '1215',
        title: { en: 'The Fourth Lateran Council', es: 'El Cuarto Concilio de Letrán' },
        body: {
          en: 'Transubstantiation is defined, and Catholics are required to confess and receive communion at least once a year.',
          es: 'Se define la transubstanciación y se exige a los católicos confesar y comulgar al menos una vez al año.',
        },
      },
      {
        year: 1274, label: '1265–1274',
        title: { en: 'Aquinas writes the Summa', es: 'Tomás de Aquino escribe la Suma' },
        body: {
          en: 'The Summa Theologiae, left unfinished at his death, becomes the great synthesis of faith and reason.',
          es: 'La Suma Teológica, inacabada a su muerte, se convierte en la gran síntesis de fe y razón.',
        },
      },
      {
        year: 1309, label: '1309–1377',
        title: { en: 'The papacy at Avignon', es: 'El papado en Aviñón' },
        body: {
          en: 'Seven popes reign from France rather than Rome. Catherine of Siena presses Gregory XI to return.',
          es: 'Siete papas gobiernan desde Francia y no desde Roma. Catalina de Siena insta a Gregorio XI a volver.',
        },
      },
      {
        year: 1517, label: '1517',
        title: { en: 'The Reformation begins', es: 'Comienza la Reforma' },
        body: {
          en: 'Luther publishes his theses at Wittenberg. Within a generation, western Christendom is divided.',
          es: 'Lutero publica sus tesis en Wittenberg. En una generación, la cristiandad occidental queda dividida.',
        },
      },
      {
        year: 1545, label: '1545–1563',
        title: { en: 'The Council of Trent', es: 'El Concilio de Trento' },
        body: {
          en: 'Eighteen years of sessions answer the Reformation, define doctrine, and reform the clergy, the seminaries and the Mass.',
          es: 'Dieciocho años de sesiones responden a la Reforma, definen la doctrina y reforman el clero, los seminarios y la Misa.',
        },
      },
      {
        year: 1869, label: '1869–1870',
        title: { en: 'The First Vatican Council', es: 'El Primer Concilio Vaticano' },
        body: {
          en: 'Defines papal infallibility, exercised only when the pope teaches on faith or morals for the whole Church.',
          es: 'Define la infalibilidad papal, ejercida solo cuando el papa enseña sobre fe o moral a toda la Iglesia.',
        },
      },
      {
        year: 1962, label: '1962–1965',
        title: { en: 'The Second Vatican Council', es: 'El Concilio Vaticano II' },
        body: {
          en: 'The largest council in history. It reshaped the liturgy, the Church\u2019s self-understanding, and her relations with the modern world.',
          es: 'El concilio más numeroso de la historia. Transformó la liturgia, la comprensión que la Iglesia tiene de sí misma y su relación con el mundo moderno.',
        },
      },
    ],
  },
  {
    id: 'liturgical-year',
    title: { en: 'The liturgical year', es: 'El año litúrgico' },
    blurb: {
      en: 'The seasons, and the colour worn in each',
      es: 'Los tiempos y el color de cada uno',
    },
    sections: [
      {
        heading: { en: 'Advent', es: 'Adviento' },
        body: {
          en: 'Four weeks of preparation before Christmas, beginning the Church\u2019s year. A season of waiting rather than celebration, which is why the colour is violet and the Gloria is not sung. The third Sunday, Gaudete, lightens to rose.',
          es: 'Cuatro semanas de preparación antes de la Navidad, con las que comienza el año de la Iglesia. Es un tiempo de espera más que de fiesta, y por eso el color es el morado y no se canta el Gloria. El tercer domingo, Gaudete, se aligera al rosa.',
        },
      },
      {
        heading: { en: 'Christmas', es: 'Navidad' },
        body: {
          en: 'From Christmas Day to the Baptism of the Lord. White, the colour of feasts of the Lord, of Our Lady and of the saints who were not martyrs.',
          es: 'Desde el día de Navidad hasta el Bautismo del Señor. Blanco, el color de las fiestas del Señor, de la Virgen y de los santos que no fueron mártires.',
        },
      },
      {
        heading: { en: 'Ordinary Time', es: 'Tiempo Ordinario' },
        body: {
          en: 'The longest stretch of the year, in two parts: after Christmas until Lent, and after Pentecost until Advent. Green, for growth. Ordinary here means counted, as in the numbered weeks, not plain.',
          es: 'El tramo más largo del año, en dos partes: después de Navidad hasta la Cuaresma, y después de Pentecostés hasta el Adviento. Verde, color de crecimiento. Ordinario aquí significa contado, por las semanas numeradas, no común.',
        },
      },
      {
        heading: { en: 'Lent', es: 'Cuaresma' },
        body: {
          en: 'Forty days from Ash Wednesday, kept by prayer, fasting and almsgiving. Violet again, and the Alleluia is set aside until Easter. The fourth Sunday, Laetare, lightens to rose.',
          es: 'Cuarenta días desde el Miércoles de Ceniza, vividos con oración, ayuno y limosna. De nuevo el morado, y el Aleluya se reserva hasta la Pascua. El cuarto domingo, Laetare, se aligera al rosa.',
        },
      },
      {
        heading: { en: 'The Triduum', es: 'El Triduo' },
        body: {
          en: 'Holy Thursday evening to Easter Sunday: the Lord\u2019s Supper, his Passion, and his rising. White on Thursday, red on Good Friday, white again at the Vigil.',
          es: 'Desde la tarde del Jueves Santo hasta el Domingo de Pascua: la Última Cena, la Pasión y la Resurrección. Blanco el jueves, rojo el Viernes Santo, y blanco otra vez en la Vigilia.',
        },
      },
      {
        heading: { en: 'Easter', es: 'Pascua' },
        body: {
          en: 'Fifty days to Pentecost, the longest feast in the year. White throughout, and red on Pentecost itself for the fire of the Holy Spirit.',
          es: 'Cincuenta días hasta Pentecostés, la fiesta más larga del año. Blanco durante todo el tiempo, y rojo el día de Pentecostés por el fuego del Espíritu Santo.',
        },
      },
      {
        heading: { en: 'The colours', es: 'Los colores' },
        body: {
          en: 'Green in Ordinary Time. Violet in Advent and Lent. White for Christmas, Easter, Our Lady and saints who were not martyrs. Red for Pentecost, the Lord\u2019s Passion, and the apostles and martyrs. Rose on two days only. Gold may stand in place of white on solemn days, which is what this app does.',
          es: 'Verde en el Tiempo Ordinario. Morado en Adviento y Cuaresma. Blanco en Navidad, Pascua, las fiestas de la Virgen y de los santos que no fueron mártires. Rojo en Pentecostés, en la Pasión del Señor y en los apóstoles y mártires. Rosa solo dos días. El oro puede sustituir al blanco en los días solemnes, que es lo que hace esta aplicación.',
        },
      },
    ],
  },
]

export function getTopics(lang) {
  const pick = v => (v && (v[lang] || v.en)) || ''
  return TOPICS.map(topic => ({
    id: topic.id,
    kind: topic.kind || 'prose',
    title: pick(topic.title),
    blurb: pick(topic.blurb),
    sections: (topic.sections || []).map(s => ({
      heading: pick(s.heading),
      body: pick(s.body),
    })),
    events: (topic.events || []).map(e => ({
      year: e.year,
      label: e.label,
      title: pick(e.title),
      body: pick(e.body),
    })),
  }))
}

export default TOPICS
