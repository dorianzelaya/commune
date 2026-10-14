// Spanish for the prayers, keyed by the stable id from prayers.js.
//
// PARTIAL ON PURPOSE. Only translated fields appear; anything missing
// falls back to English field by field (see merge() in prayerIndex.js).
// A prayer with a Spanish name and no Spanish text yet shows the Spanish
// name above the English text, which is correct rather than broken, and
// lets this file grow a few prayers at a time.
//
// The prayer TEXTS are received texts, not translations: the wording
// Spanish-speaking Catholics already know. They are not reworded to fit
// the English phrasing. The `history` paragraphs are the app's own
// explanatory prose and are translated normally.
//
// Categories and image paths deliberately live only in prayers.js.

const PRAYERS_ES = {
  'sign-of-the-cross': {
    name: 'La Señal de la Cruz',
    text: 'En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.',
    caption: 'Cristo en la Cruz — El Greco, c. 1600–1610',
    history: 'Uno de los gestos más antiguos del cristianismo, documentado al menos desde el siglo II. Tertuliano escribió en el año 200 que los cristianos marcaban su frente con la cruz en todas las acciones del día. La fórmula trinitaria "Padre, Hijo y Espíritu Santo" viene directamente de Mateo 28:19. Es a la vez una profesión de fe y una bendición sacramental.',
  },

  'glory-be': {
    name: 'Gloria',
    text: 'Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.',
    caption: 'La Santísima Trinidad — Antonio de Pereda, c. 1659',
    history: 'Llamada también Doxología Menor, esta breve oración de alabanza se remonta a la Iglesia primitiva. Se usaba en el Oficio Divino en el siglo IV y quedó fijada en su forma actual en el Concilio de Nicea (325). Se reza al final de cada decena del Rosario y después de cada salmo en la Liturgia de las Horas.',
  },

  'our-father': {
    name: 'Padre Nuestro',
    text: 'Padre nuestro que estás en los cielos, santificado sea tu Nombre; venga tu reino; hágase tu voluntad, así en la tierra como en el cielo; danos hoy el pan nuestro de cada día; perdona nuestras ofensas, así como nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación y líbranos de mal. Amén.',
    caption: 'El Padrenuestro — James Tissot, c. 1886–1894',
    history: 'Dada directamente por Jesucristo cuando sus discípulos le pidieron que les enseñara a orar (Mateo 6:9–13 y Lucas 11:2–4). Es la oración cristiana fundamental y ha ocupado un lugar central en la liturgia eucarística desde los primeros siglos de la Iglesia. Santo Tomás de Aquino la llamó "la más perfecta de las oraciones", y san Agustín enseñó que toda oración de la Escritura está contenida en ella.',
  },

  'hail-mary': {
    name: 'Ave María',
    text: 'Dios te salve, María. Llena eres de gracia: El Señor es contigo. Bendita tú eres entre todas las mujeres. Y bendito es el fruto de tu vientre: Jesús. Santa María, Madre de Dios, ruega por nosotros pecadores, ahora y en la hora de nuestra muerte. Amén.',
    caption: 'La Virgen Sixtina — Rafael, c. 1513–1514',
    history: 'Compuesta a partir de dos saludos de la Escritura: las palabras del ángel Gabriel a María (Lucas 1:28) y el saludo de Isabel en la Visitación (Lucas 1:42). La petición "Santa María, Madre de Dios, ruega por nosotros pecadores..." se desarrolló durante la Edad Media, y la forma actual quedó incluida oficialmente en el Breviario Romano en 1568. Es la oración que más se repite en el Rosario.',
  },

  // Titles, captions and the explanatory prose. The prayer TEXTS for
  // these are still pending and fall back to English until added.

  'morning-offering': {
    name: 'Ofrecimiento de la mañana',
    caption: 'Sagrado Corazón de Jesús — Pompeo Batoni, 1767',
    history: 'Esta forma del Ofrecimiento de la mañana fue difundida por el Apostolado de la Oración, fundado por el padre François Gautrelet SJ en Francia en 1844. La oración une las alegrías y los sufrimientos del día a las intenciones del Sagrado Corazón de Jesús, y convierte la vida diaria corriente en un acto de oración.',
  },

  'night-prayer': {
    name: 'Oración de la noche',
    caption: 'Cristo en Getsemaní — Heinrich Hofmann, 1886',
    history: 'Nace de la antigua tradición de las Completas, la última oración de la Liturgia de las Horas. Los monjes y religiosos han rezado oraciones nocturnas desde la Regla de san Benito (siglo VI). Esta forma refleja el espíritu manso y humilde de Cristo que Benito pedía imitar a sus monjes.',
  },

  'guardian-angel-prayer': {
    name: 'Ángel de la Guarda',
    text: 'Ángel de la Guarda, dulce compañía, no me desampares ni de noche ni de día. No me dejes solo, que me perdería. Amén.',
    caption: 'El Ángel de la Guarda — Gioacchino Assereto, c. 1630',
    history: 'La creencia en los ángeles custodios es antigua y está arraigada en la Escritura (Mateo 18:10; Salmo 91:11). Esta oración en concreto se desarrolló en la época medieval y suele ser una de las primeras que se enseñan a los niños católicos. La memoria de los Santos Ángeles Custodios se celebra el 2 de octubre.',
  },

  'grace-before-meals': {
    name: 'Bendición de la mesa',
    text: 'Bendícenos, Señor, y bendice estos alimentos que por tu bondad vamos a recibir. Por Cristo nuestro Señor. Amén.',
    caption: 'Las bodas de Caná — Garofalo (Benvenuto Tisi), 1531',
    history: 'La costumbre de bendecir a Dios antes de comer está arraigada en la tradición judía y fue continuada por los primeros cristianos. De san Pablo se dice que dio gracias antes de comer en Hechos 27:35. La fórmula católica conocida, "Bendícenos, Señor...", se formó dentro de la tradición latina de oración de la Iglesia y llegó a ser una bendición acostumbrada en los hogares y comunidades católicas.',
  },

  'grace-after-meals': {
    name: 'Acción de gracias después de comer',
    text: 'Te damos gracias, Señor, por todos tus beneficios, tú que vives y reinas por los siglos de los siglos. Amén.',
    history: 'Compañera de la bendición de la mesa, esta oración de agradecimiento después de comer hace eco de Deuteronomio 8:10: "Cuando hayas comido y estés satisfecho, bendecirás al Señor tu Dios". La práctica de bendecir a Dios después de las comidas es una de las formas más antiguas de oración judía y cristiana.',
  },

  'apostles-creed': {
    name: 'Credo de los Apóstoles',
    caption: 'Los precursores de Cristo con santos y mártires — Fra Angelico, c. 1423–1424',
    history: 'Aunque no fue escrito directamente por los Apóstoles, este credo resume fielmente la fe apostólica. Se formó a partir del antiguo credo bautismal de la Iglesia de Roma, cuyas raíces llegan hasta los primeros siglos, y alcanzó aproximadamente su forma actual en el siglo VIII. Se usa en el Bautismo, en el Rosario y, como alternativa al Credo Niceno, en algunas Misas.',
  },

  'nicene-creed': {
    name: 'Credo Niceno',
    caption: 'Primer Concilio de Nicea — Michael Damaskinos, 1591',
    history: 'Formulado por primera vez en el Concilio de Nicea en el año 325 para afirmar la plena divinidad de Cristo frente al arrianismo, fue desarrollado después en el Primer Concilio de Constantinopla en el año 381. Es el credo más compartido entre los cristianos católicos, ortodoxos y protestantes históricos, aunque existen diferencias en su redacción y en su uso. En el Rito Romano se proclama normalmente en la Misa los domingos y las solemnidades, y en ciertas circunstancias se permite el Credo de los Apóstoles como alternativa.',
  },

  // ---- Oraciones marianas ----

  'hail-holy-queen': {
    name: 'La Salve',
    caption: 'La coronación de la Virgen — Diego Velázquez, c. 1635–1636',
    history: 'Compuesta en la Edad Media, probablemente en el siglo XI, esta antífona mariana se atribuye tradicionalmente a figuras como Hermann de Reichenau, aunque su autor real es desconocido. Pasó a formar parte de la tradición litúrgica de la Iglesia como una de las antífonas marianas y se reza tradicionalmente al terminar el Rosario.',
  },

  'memorare': {
    name: 'Acordaos',
    caption: 'La coronación de la Virgen (Retablo Oddi) — Rafael, c. 1502–1504',
    history: 'Derivada de una oración mariana más larga del siglo XV, el Acordaos fue difundido en la Francia del siglo XVII por el padre Claude Bernard. Con frecuencia se atribuye por error a san Bernardo de Claraval. Su título viene de la palabra latina memorare, "acuérdate", y sigue siendo una de las oraciones más queridas de la Iglesia para pedir la intercesión de María.',
  },

  'magnificat': {
    name: 'Magníficat',
    caption: 'La Anunciación — Fra Angelico, c. 1426',
    history: 'El cántico propio de María, recogido en Lucas 1:46–55, fue pronunciado durante su visita a su parienta Isabel mientras esperaba a Jesús. Se inspira ampliamente en la oración de Ana en 1 Samuel 2:1–10. La Iglesia reza el Magníficat cada día en las Vísperas desde tiempos antiguos, lo que lo convierte en uno de los cánticos más rezados de la historia cristiana.',
  },

  'sub-tuum-praesidium': {
    name: 'Bajo tu amparo',
    text: 'Bajo tu amparo nos acogemos, santa Madre de Dios; no deseches las súplicas que te dirigimos en nuestras necesidades, antes bien líbranos de todo peligro, oh siempre Virgen gloriosa y bendita. Amén.',
    caption: 'Virgen de la Misericordia — Piero della Francesca, c. 1460–1462',
    history: 'La oración más antigua que se conoce a la Santísima Virgen María, hallada en un papiro griego (Papiro Rylands 470) datado hacia el siglo III. Ya se dirige a María como "Theotokos" (Madre de Dios), lo que confirma que ese título era de uso popular mucho antes de que el Concilio de Éfeso lo definiera formalmente en el año 431. Los fieles han rezado estas palabras durante unos diecisiete siglos.',
  },

  'the-angelus': {
    name: 'El Ángelus',
    caption: 'La Anunciación — Bartolomé Esteban Murillo, c. 1660',
    history: 'Devoción que conmemora la Encarnación, rezada tradicionalmente tres veces al día, a las seis de la mañana, al mediodía y a las seis de la tarde, cuando suenan las campanas. Toma su nombre de sus primeras palabras latinas, "Angelus Domini". La práctica se remonta al menos al siglo XIII y combina versículos de la Escritura con el Ave María.',
  },

  'regina-caeli': {
    name: 'Regina Caeli',
    text: 'Reina del cielo, alégrate; aleluya. Porque el que mereciste llevar en tu seno; aleluya. Ha resucitado, según su palabra; aleluya. Ruega al Señor por nosotros; aleluya.',
    caption: 'La glorificación de la Virgen — Fra Angelico, c. 1431–1435',
    history: 'Antífona mariana que se reza en el tiempo de Pascua en lugar del Ángelus, desde el Sábado Santo hasta Pentecostés. Se remonta al menos al siglo XII y sus estribillos de "aleluya" celebran la Resurrección. La tradición cuenta que sus primeros versos se oyeron cantados por los ángeles.',
  },

  'prayer-to-our-lady-of-guadalupe': {
    name: 'Oración a Nuestra Señora de Guadalupe',
    caption: 'Virgen de Guadalupe — Antonio y Manuel de Arellano, 1691',
    history: 'Honra la aparición de la Virgen María a san Juan Diego en 1531, en el cerro del Tepeyac, cerca de la Ciudad de México, donde su imagen quedó milagrosamente impresa en su tilma. Nuestra Señora de Guadalupe es la patrona de América y una de las devociones marianas más queridas del mundo.',
  },

  // ---- Actos ----

  'act-of-contrition': {
    name: 'Acto de contrición',
    caption: 'El regreso del hijo pródigo — Rembrandt, 1669',
    history: 'Un acto de contrición expresa el dolor por los pecados y el propósito de enmienda. A lo largo de la historia católica se han desarrollado muchas formas, tradicionales y modernas. En el sacramento de la Confesión, el penitente hace ordinariamente un acto de contrición antes de recibir la absolución. También se enseña habitualmente a los niños que se preparan para su primera confesión.',
  },

  'act-of-faith': {
    name: 'Acto de fe',
    text: 'Dios mío, creo firmemente todo lo que la santa Iglesia católica cree y enseña, porque tú lo has revelado, y tú eres la verdad misma. En esta fe quiero vivir y morir. Amén.',
    caption: 'La incredulidad de santo Tomás — Caravaggio, c. 1601–1602',
    history: 'Una de las oraciones tradicionales que corresponden a las tres virtudes teologales, afirma la fe en Dios y en las verdades que él ha revelado por medio de Cristo y de su Iglesia. Las virtudes de la fe, la esperanza y la caridad están arraigadas en la Escritura y fueron expuestas sistemáticamente por teólogos como santo Tomás de Aquino. Las fórmulas devocionales fijas de estos actos se hicieron comunes en los libros de oración y en la catequesis católica posteriores.',
  },

  'act-of-hope': {
    name: 'Acto de esperanza',
    text: 'Dios mío, espero de tu bondad, por tus promesas y por los méritos de Jesucristo, nuestro Salvador, la vida eterna y las gracias necesarias para merecerla con las buenas obras que debo hacer. Amén.',
    caption: 'La Resurrección de Cristo — Tiziano, c. 1542–1544',
    history: 'La segunda de las oraciones tradicionales que corresponden a las virtudes teologales, expresa la confianza en la misericordia de Dios, en sus promesas y en su gracia salvadora. Arraigada en pasajes como Romanos 5:1–5 y Hebreos 10:23, pone la esperanza del creyente en Dios y en los méritos de Jesucristo, por cuya gracia se promete la vida eterna.',
  },

  'act-of-love': {
    name: 'Acto de caridad',
    text: 'Dios mío, te amo con todo mi corazón sobre todas las cosas, porque eres infinitamente bueno, y amo a mi prójimo como a mí mismo por amor a ti. Amén.',
    caption: 'El buen samaritano — Eugène Delacroix, 1849',
    history: 'La oración de la tercera virtud teologal, que cumple en forma de oración el Mandamiento principal (Mateo 22:37-39). Santo Tomás de Aquino enseñó que la caridad es la mayor de las virtudes y la forma de todas ellas. Esta oración expresa el amor a Dios sobre todas las cosas y el amor al prójimo como su consecuencia necesaria.',
  },
}

export default PRAYERS_ES
