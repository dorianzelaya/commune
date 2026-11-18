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
    title: pick(topic.title),
    blurb: pick(topic.blurb),
    sections: topic.sections.map(s => ({
      heading: pick(s.heading),
      body: pick(s.body),
    })),
  }))
}

export default TOPICS
