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
    title: { en: 'Timeline of the Church', es: 'Cronología de la Iglesia' },
    blurb: {
      en: 'From Bethlehem to Vatican II',
      es: 'De Belén al Concilio Vaticano II',
    },
    // Years carry a sortable number and a display label, because the honest
    // label is often a range or an approximation. Pentecost is dated
    // between 30 and 33 and the martyrdom of Peter and Paul between 64 and
    // 67; a timeline that prints those as single years is inventing
    // precision nobody has.
    events: [
      {
        year: -4, label: 'c. 4 BC',
        img: '/timeline/bc0004-nativity.jpg',
        caption: 'The Adoration of the Shepherds — Matthias Stom, c. 1650',
        title: { en: 'The birth of Christ', es: 'El nacimiento de Cristo' },
        body: {
          en: 'Jesus Christ is born in Bethlehem of the Virgin Mary. God becomes man without ceasing to be God.',
          es: 'Jesucristo nace en Belén de la Virgen María. Dios se hace hombre sin dejar de ser Dios.',
        },
      },
      {
        year: 29, label: 'c. 29–30',
        img: '/timeline/0029-keys.jpg',
        caption: 'The Delivery of the Keys — Pietro Perugino, 1481–1482',
        title: { en: 'Peter receives the keys', es: 'Pedro recibe las llaves' },
        body: {
          en: 'At Caesarea Philippi, Peter confesses Jesus as the Christ and is given the keys: on this rock I will build my Church. The Church is founded by Christ himself, not by the men who came after him.',
          es: 'En Cesarea de Filipo, Pedro confiesa a Jesús como el Cristo y recibe las llaves: sobre esta piedra edificaré mi Iglesia. La Iglesia la funda Cristo mismo, no los hombres que vinieron después.',
        },
      },
      {
        year: 30, label: 'c. 30–33',
        img: '/timeline/0030-crucifixion.jpg',
        caption: 'The Crucifixion — Andrea Mantegna, 1457–1459',
        title: { en: 'The Passion and the Resurrection', es: 'La Pasión y la Resurrección' },
        body: {
          en: 'Christ is crucified, dies, and rises on the third day. The centre of the faith and of history.',
          es: 'Cristo es crucificado, muere y resucita al tercer día. El centro de la fe y de la historia.',
        },
      },
      {
        year: 33, label: 'c. 33',
        img: '/timeline/0033-pentecost.jpg',
        caption: 'Pentecost — Jean II Restout, 1732',
        title: { en: 'Pentecost', es: 'Pentecostés' },
        body: {
          en: 'Fifty days after the Resurrection the Holy Spirit descends on the apostles in Jerusalem, and Peter preaches to the crowd. The Church begins in public.',
          es: 'Cincuenta días después de la Resurrección, el Espíritu Santo desciende sobre los apóstoles en Jerusalén y Pedro predica a la multitud. La Iglesia comienza en público.',
        },
      },
      {
        year: 49, label: 'c. 49',
        img: '/timeline/0049-jerusalem.jpg',
        caption: 'Saint Peter Preaching in the Presence of Saint Mark — Fra Angelico, c. 1433',
        title: { en: 'The Council of Jerusalem', es: 'El Concilio de Jerusalén' },
        body: {
          en: 'The apostles rule that Gentile converts need not keep the Mosaic Law, circumcision included, while asking a few things of them still.',
          es: 'Los apóstoles deciden que los conversos gentiles no han de guardar la Ley mosaica, ni la circuncisión, aunque les piden aún algunas cosas.',
        },
      },
      {
        year: 65, label: 'c. 64–67',
        img: '/timeline/0064-peter-paul.jpg',
        caption: 'The Martyrdom of Saint Peter — Leonello Spada, first half of the 17th century',
        title: { en: 'Peter and Paul die in Rome', es: 'Pedro y Pablo mueren en Roma' },
        body: {
          en: 'Both martyred under Nero, by tradition. Peter is buried on the Vatican hill, where his basilica stands.',
          es: 'Ambos martirizados bajo Nerón, según la tradición. Pedro es sepultado en la colina vaticana, donde se alza su basílica.',
        },
      },
      {
        year: 313, label: '313',
        img: '/timeline/0313-edict.jpg',
        caption: 'The Conversion of Constantine — Peter Paul Rubens, c. 1622',
        title: { en: 'The Edict of Milan', es: 'El Edicto de Milán' },
        body: {
          en: 'Constantine and Licinius grant Christians freedom of worship and return confiscated property. Persecution had been fierce but intermittent; now it ends as imperial policy.',
          es: 'Constantino y Licinio conceden a los cristianos libertad de culto y devuelven los bienes confiscados. La persecución había sido dura pero intermitente; ahora termina como política imperial.',
        },
      },
      {
        year: 325, label: '325',
        img: '/timeline/0325-nicaea.jpg',
        caption: 'The First Council of Nicaea — Cesare Nebbia and Giovanni Guerra, late 16th century',
        title: { en: 'The First Council of Nicaea', es: 'El Primer Concilio de Nicea' },
        body: {
          en: 'Against Arius, the council confesses the Son consubstantial with the Father. The Creed said at Mass begins here.',
          es: 'Frente a Arrio, el concilio confiesa al Hijo consustancial al Padre. El Credo que se reza en la Misa nace aquí.',
        },
      },
      {
        year: 380, label: '380',
        img: '/timeline/0380-thessalonica.jpg',
        caption: 'The Triumph of Christianity — Tommaso Laureti, 1585',
        title: { en: 'The Edict of Thessalonica', es: 'El Edicto de Tesalónica' },
        body: {
          en: 'Theodosius makes Nicene Christianity the religion of the empire. In sixty-seven years the faith goes from tolerated to established.',
          es: 'Teodosio hace del cristianismo niceno la religión del imperio. En sesenta y siete años la fe pasa de tolerada a oficial.',
        },
      },
      {
        year: 381, label: '381',
        img: '/timeline/0381-constantinople.jpg',
        caption: 'The First Council of Constantinople — fresco, Stavropoleos Church, Bucharest',
        title: { en: 'The First Council of Constantinople', es: 'El Primer Concilio de Constantinopla' },
        body: {
          en: 'The divinity of the Holy Spirit is confessed and the Creed takes the form still said today.',
          es: 'Se confiesa la divinidad del Espíritu Santo y el Credo toma la forma que aún se reza hoy.',
        },
      },
      {
        year: 431, label: '431',
        img: '/timeline/0431-ephesus.jpg',
        caption: 'The Coronation of the Virgin — Jacopo Torriti, apse of Santa Maria Maggiore, 1296',
        title: { en: 'The Council of Ephesus', es: 'El Concilio de Éfeso' },
        body: {
          en: 'Mary\u2019s title Theotokos, Mother of God, is solemnly affirmed. Christians had used it long before; the council defends it, because the one she bore is God.',
          es: 'Se afirma solemnemente el título de María, Theotokos, Madre de Dios. Los cristianos ya lo usaban mucho antes; el concilio lo defiende, porque aquel a quien dio a luz es Dios.',
        },
      },
      {
        year: 451, label: '451',
        img: '/timeline/0451-chalcedon.jpg',
        caption: 'The Fourth Ecumenical Council of Chalcedon — Vasily Surikov, 1876',
        title: { en: 'The Council of Chalcedon', es: 'El Concilio de Calcedonia' },
        body: {
          en: 'Christ is confessed as one Person in two natures, divine and human, without confusion or division.',
          es: 'Se confiesa a Cristo como una Persona en dos naturalezas, divina y humana, sin confusión ni división.',
        },
      },
      {
        year: 590, label: '590',
        img: '/timeline/0590-gregory.jpg',
        caption: 'Saint Gregory the Great — Francisco de Goya, c. 1797',
        title: { en: 'Gregory the Great', es: 'Gregorio Magno' },
        body: {
          en: 'Elected pope. He reforms the liturgy, sends missionaries to England, and shapes the Church of the West.',
          es: 'Elegido papa. Reforma la liturgia, envía misioneros a Inglaterra y da forma a la Iglesia de Occidente.',
        },
      },
      {
        year: 787, label: '787',
        img: '/timeline/0787-nicaea2.jpg',
        caption: 'The Second Council of Nicaea — Menologion of Basil II, c. 985',
        title: { en: 'The Second Council of Nicaea', es: 'El Segundo Concilio de Nicea' },
        body: {
          en: 'After decades of iconoclasm, the council upholds the veneration of images: honour paid to an image passes to the one it depicts.',
          es: 'Tras décadas de iconoclasia, el concilio defiende la veneración de las imágenes: el honor dado a la imagen pasa a quien representa.',
        },
      },
      {
        year: 1054, label: '1054',
        img: '/timeline/1054-schism.jpg',
        caption: 'The Entry of the Crusaders into Constantinople — Eugène Delacroix, 1840',
        title: { en: 'Rome and Constantinople divide', es: 'Roma y Constantinopla se separan' },
        body: {
          en: 'Papal legates and Patriarch Michael Cerularius exchange excommunications. Traditionally the date of the schism, though the estrangement grew over centuries and the sack of Constantinople in 1204 hardened it.',
          es: 'Los legados papales y el patriarca Miguel Cerulario intercambian excomuniones. Es la fecha tradicional del cisma, aunque el distanciamiento creció durante siglos y el saqueo de Constantinopla en 1204 lo endureció.',
        },
      },
      {
        year: 1215, label: '1215',
        img: '/timeline/1215-lateran.jpg',
        caption: 'The Fourth Lateran Council — attributed to Cesare Nebbia, late 16th century',
        title: { en: 'The Fourth Lateran Council', es: 'El Cuarto Concilio de Letrán' },
        body: {
          en: 'The council names the Eucharistic change transubstantiation, a belief far older than the word, and requires yearly confession and Communion at Easter.',
          es: 'El concilio llama transubstanciación al cambio eucarístico, creencia mucho más antigua que la palabra, y exige confesión anual y comunión por Pascua.',
        },
      },
      {
        year: 1265, label: '1265–1273',
        img: '/timeline/1265-summa.jpg',
        caption: 'The Triumph of Saint Thomas Aquinas — Andrea di Bonaiuto, 1366–1367',
        title: { en: 'Aquinas writes the Summa', es: 'Tomás de Aquino escribe la Suma' },
        body: {
          en: 'He stopped in December 1273, saying all he had written seemed as straw, and died three months later. Unfinished, the Summa remains the great synthesis of faith and reason.',
          es: 'Se detuvo en diciembre de 1273, diciendo que cuanto había escrito le parecía paja, y murió tres meses después. Inacabada, la Suma sigue siendo la gran síntesis de fe y razón.',
        },
      },
      {
        year: 1309, label: '1309–1377',
        img: '/timeline/1309-avignon.jpg',
        caption: 'The Return of Gregory XI to Rome — Giorgio Vasari, c. 1573',
        title: { en: 'The papacy at Avignon', es: 'El papado en Aviñón' },
        body: {
          en: 'Seven popes reign from France rather than Rome. Catherine of Siena presses Gregory XI to return.',
          es: 'Siete papas gobiernan desde Francia y no desde Roma. Catalina de Siena insta a Gregorio XI a volver.',
        },
      },
      {
        year: 1378, label: '1378–1417',
        img: '/timeline/1378-western-schism.jpg',
        caption: 'Jan Hus at the Council of Constance — Václav Brožík, 1883',
        title: { en: 'The Western Schism', es: 'El Cisma de Occidente' },
        body: {
          en: 'Rival claimants to the papacy, at one point three at once, divide Europe for forty years. The Council of Constance ends it.',
          es: 'Pretendientes rivales al papado, hasta tres a la vez, dividen Europa durante cuarenta años. El Concilio de Constanza pone fin al conflicto.',
        },
      },
      {
        year: 1517, label: '1517',
        img: '/timeline/1517-reformation.jpg',
        caption: 'Luther Hammers His 95 Theses to the Door — Ferdinand Pauwels, 1872',
        title: { en: 'The Reformation begins', es: 'Comienza la Reforma' },
        body: {
          en: 'Luther publishes his theses at Wittenberg. Within a generation, western Christendom is divided.',
          es: 'Lutero publica sus tesis en Wittenberg. En una generación, la cristiandad occidental queda dividida.',
        },
      },
      {
        year: 1545, label: '1545–1563',
        img: '/timeline/1545-trent.jpg',
        caption: 'The Council of Trent — Noël Robert Cochin, 17th century',
        title: { en: 'The Council of Trent', es: 'El Concilio de Trento' },
        body: {
          en: 'Meeting across three periods, the council answers the Reformation, defines doctrine, and reforms the clergy and the seminaries. The missal that bears its name follows in 1570.',
          es: 'Reunido en tres periodos, el concilio responde a la Reforma, define la doctrina y reforma el clero y los seminarios. El misal que lleva su nombre llega en 1570.',
        },
      },
      {
        year: 1869, label: '1869–1870',
        img: '/timeline/1869-vatican1.jpg',
        caption: 'The First Vatican Council in session — unknown artist, 1870',
        title: { en: 'The First Vatican Council', es: 'El Primer Concilio Vaticano' },
        body: {
          en: 'Defines papal primacy and infallibility: the pope is preserved from error only when, as pastor of all Christians, he definitively proclaims a doctrine of faith or morals for the whole Church.',
          es: 'Define el primado y la infalibilidad papal: el papa queda preservado del error solo cuando, como pastor de todos los cristianos, proclama definitivamente una doctrina de fe o costumbres para toda la Iglesia.',
        },
      },
      {
        year: 1950, label: '1950',
        img: '/timeline/1950-assumption.jpg',
        caption: 'The Assumption of the Virgin — Francesco Botticini, c. 1476',
        title: { en: 'The Assumption defined', es: 'La Asunción definida' },
        body: {
          en: 'Pius XII declares as dogma that Mary was taken body and soul into heaven. The clearest modern instance of the infallibility Vatican I had defined.',
          es: 'Pío XII declara como dogma que María fue llevada en cuerpo y alma al cielo. El ejemplo moderno más claro de la infalibilidad definida en el Vaticano I.',
        },
      },
      {
        year: 1962, label: '1962–1965',
        img: '/timeline/1962-vatican2.jpg',
        caption: 'The Second Vatican Council in session — Catholic Press Photo, 1962',
        title: { en: 'The Second Vatican Council', es: 'El Concilio Vaticano II' },
        body: {
          en: 'The largest council in history. It renewed the liturgy, taught the universal call to holiness, and addressed ecumenism, religious liberty and the modern world.',
          es: 'El concilio más numeroso de la historia. Renovó la liturgia, enseñó la llamada universal a la santidad y abordó el ecumenismo, la libertad religiosa y el mundo moderno.',
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
  {
    id: 'parables',
    kind: 'parables',
    title: { en: 'The parables of Jesus', es: 'Las parábolas de Jesús' },
    blurb: { en: 'Where to find each one', es: 'Dónde encontrar cada una' },
    parables: [
      {
        gospel: { en: 'Matthew', es: 'Mateo' },
        items: [
          { slug: 'matthew', chapter: 7, verse: 24,
            title: { en: 'The two houses', es: 'Las dos casas' },
            ref: { en: 'Matthew 7:24-27', es: 'Mateo 7:24-27' } },
          { slug: 'matthew', chapter: 9, verse: 16,
            title: { en: 'New cloth and new wine', es: 'El remiendo y los odres' },
            ref: { en: 'Matthew 9:16-17', es: 'Mateo 9:16-17' } },
          { slug: 'matthew', chapter: 13, verse: 3,
            title: { en: 'The sower', es: 'El sembrador' },
            ref: { en: 'Matthew 13:1-23', es: 'Mateo 13:1-23' } },
          { slug: 'matthew', chapter: 13, verse: 24,
            title: { en: 'The weeds among the wheat', es: 'La cizaña entre el trigo' },
            ref: { en: 'Matthew 13:24-30', es: 'Mateo 13:24-30' } },
          { slug: 'matthew', chapter: 13, verse: 31,
            title: { en: 'The mustard seed', es: 'El grano de mostaza' },
            ref: { en: 'Matthew 13:31-32', es: 'Mateo 13:31-32' } },
          { slug: 'matthew', chapter: 13, verse: 33,
            title: { en: 'The leaven', es: 'La levadura' },
            ref: { en: 'Matthew 13:33', es: 'Mateo 13:33' } },
          { slug: 'matthew', chapter: 13, verse: 44,
            title: { en: 'The hidden treasure', es: 'El tesoro escondido' },
            ref: { en: 'Matthew 13:44', es: 'Mateo 13:44' } },
          { slug: 'matthew', chapter: 13, verse: 45,
            title: { en: 'The pearl of great price', es: 'La perla de gran precio' },
            ref: { en: 'Matthew 13:45-46', es: 'Mateo 13:45-46' } },
          { slug: 'matthew', chapter: 13, verse: 47,
            title: { en: 'The net', es: 'La red' },
            ref: { en: 'Matthew 13:47-50', es: 'Mateo 13:47-50' } },
          { slug: 'matthew', chapter: 18, verse: 23,
            title: { en: 'The unforgiving servant', es: 'El siervo despiadado' },
            ref: { en: 'Matthew 18:23-35', es: 'Mateo 18:23-35' } },
          { slug: 'matthew', chapter: 20, verse: 1,
            title: { en: 'The labourers in the vineyard', es: 'Los obreros de la viña' },
            ref: { en: 'Matthew 20:1-16', es: 'Mateo 20:1-16' } },
          { slug: 'matthew', chapter: 21, verse: 28,
            title: { en: 'The two sons', es: 'Los dos hijos' },
            ref: { en: 'Matthew 21:28-32', es: 'Mateo 21:28-32' } },
          { slug: 'matthew', chapter: 21, verse: 33,
            title: { en: 'The wicked tenants', es: 'Los viñadores homicidas' },
            ref: { en: 'Matthew 21:33-46', es: 'Mateo 21:33-46' } },
          { slug: 'matthew', chapter: 22, verse: 1,
            title: { en: 'The wedding feast', es: 'El banquete de bodas' },
            ref: { en: 'Matthew 22:1-14', es: 'Mateo 22:1-14' } },
          { slug: 'matthew', chapter: 25, verse: 1,
            title: { en: 'The ten virgins', es: 'Las diez vírgenes' },
            ref: { en: 'Matthew 25:1-13', es: 'Mateo 25:1-13' } },
          { slug: 'matthew', chapter: 25, verse: 14,
            title: { en: 'The talents', es: 'Los talentos' },
            ref: { en: 'Matthew 25:14-30', es: 'Mateo 25:14-30' } },
          { slug: 'matthew', chapter: 25, verse: 31,
            title: { en: 'The sheep and the goats', es: 'Las ovejas y los cabritos' },
            ref: { en: 'Matthew 25:31-46', es: 'Mateo 25:31-46' } },
        ],
      },
      {
        gospel: { en: 'Mark', es: 'Marcos' },
        items: [
          { slug: 'mark', chapter: 4, verse: 21,
            title: { en: 'The lamp under a bushel', es: 'La lámpara bajo el celemín' },
            ref: { en: 'Mark 4:21-25', es: 'Marcos 4:21-25' } },
          { slug: 'mark', chapter: 4, verse: 26,
            title: { en: 'The seed growing by itself', es: 'La semilla que crece sola' },
            ref: { en: 'Mark 4:26-29', es: 'Marcos 4:26-29' } },
          { slug: 'mark', chapter: 13, verse: 28,
            title: { en: 'The budding fig tree', es: 'La higuera que brota' },
            ref: { en: 'Mark 13:28-31', es: 'Marcos 13:28-31' } },
        ],
      },
      {
        gospel: { en: 'Luke', es: 'Lucas' },
        items: [
          { slug: 'luke', chapter: 7, verse: 41,
            title: { en: 'The two debtors', es: 'Los dos deudores' },
            ref: { en: 'Luke 7:41-43', es: 'Lucas 7:41-43' } },
          { slug: 'luke', chapter: 10, verse: 30,
            title: { en: 'The good Samaritan', es: 'El buen samaritano' },
            ref: { en: 'Luke 10:25-37', es: 'Lucas 10:25-37' } },
          { slug: 'luke', chapter: 11, verse: 5,
            title: { en: 'The friend at midnight', es: 'El amigo inoportuno' },
            ref: { en: 'Luke 11:5-8', es: 'Lucas 11:5-8' } },
          { slug: 'luke', chapter: 12, verse: 16,
            title: { en: 'The rich fool', es: 'El rico insensato' },
            ref: { en: 'Luke 12:16-21', es: 'Lucas 12:16-21' } },
          { slug: 'luke', chapter: 12, verse: 35,
            title: { en: 'The watchful servants', es: 'Los siervos vigilantes' },
            ref: { en: 'Luke 12:35-40', es: 'Lucas 12:35-40' } },
          { slug: 'luke', chapter: 12, verse: 42,
            title: { en: 'The faithful steward', es: 'El administrador fiel' },
            ref: { en: 'Luke 12:42-48', es: 'Lucas 12:42-48' } },
          { slug: 'luke', chapter: 13, verse: 6,
            title: { en: 'The barren fig tree', es: 'La higuera estéril' },
            ref: { en: 'Luke 13:6-9', es: 'Lucas 13:6-9' } },
          { slug: 'luke', chapter: 14, verse: 16,
            title: { en: 'The great supper', es: 'El gran banquete' },
            ref: { en: 'Luke 14:15-24', es: 'Lucas 14:15-24' } },
          { slug: 'luke', chapter: 15, verse: 4,
            title: { en: 'The lost sheep', es: 'La oveja perdida' },
            ref: { en: 'Luke 15:3-7', es: 'Lucas 15:3-7' } },
          { slug: 'luke', chapter: 15, verse: 8,
            title: { en: 'The lost coin', es: 'La dracma perdida' },
            ref: { en: 'Luke 15:8-10', es: 'Lucas 15:8-10' } },
          { slug: 'luke', chapter: 15, verse: 11,
            title: { en: 'The prodigal son', es: 'El hijo pródigo' },
            ref: { en: 'Luke 15:11-32', es: 'Lucas 15:11-32' } },
          { slug: 'luke', chapter: 16, verse: 1,
            title: { en: 'The unjust steward', es: 'El administrador infiel' },
            ref: { en: 'Luke 16:1-13', es: 'Lucas 16:1-13' } },
          { slug: 'luke', chapter: 16, verse: 19,
            title: { en: 'The rich man and Lazarus', es: 'El rico y Lázaro' },
            ref: { en: 'Luke 16:19-31', es: 'Lucas 16:19-31' } },
          { slug: 'luke', chapter: 17, verse: 7,
            title: { en: 'The master and the servant', es: 'El amo y el siervo' },
            ref: { en: 'Luke 17:7-10', es: 'Lucas 17:7-10' } },
          { slug: 'luke', chapter: 18, verse: 1,
            title: { en: 'The persistent widow', es: 'La viuda y el juez injusto' },
            ref: { en: 'Luke 18:1-8', es: 'Lucas 18:1-8' } },
          { slug: 'luke', chapter: 18, verse: 9,
            title: { en: 'The Pharisee and the publican', es: 'El fariseo y el publicano' },
            ref: { en: 'Luke 18:9-14', es: 'Lucas 18:9-14' } },
          { slug: 'luke', chapter: 19, verse: 11,
            title: { en: 'The pounds', es: 'Las minas' },
            ref: { en: 'Luke 19:11-27', es: 'Lucas 19:11-27' } },
        ],
      },
      {
        gospel: { en: 'John', es: 'Juan' },
        items: [
          { slug: 'john', chapter: 10, verse: 1,
            title: { en: 'The good shepherd', es: 'El buen pastor' },
            ref: { en: 'John 10:1-18', es: 'Juan 10:1-18' } },
          { slug: 'john', chapter: 15, verse: 1,
            title: { en: 'The true vine', es: 'La vid verdadera' },
            ref: { en: 'John 15:1-17', es: 'Juan 15:1-17' } },
        ],
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
      img: e.img || null,
      caption: e.caption || '',
      label: e.label,
      title: pick(e.title),
      body: pick(e.body),
    })),
    parables: (topic.parables || []).map(g => ({
      gospel: pick(g.gospel),
      items: (g.items || []).map(i => ({
        title: pick(i.title), ref: pick(i.ref),
        slug: i.slug, chapter: i.chapter, verse: i.verse,
      })),
    })),
  }))
}

export default TOPICS
