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
    text: 'Gloria al Padre, al Hijo y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.',
    caption: 'La Santísima Trinidad — Antonio de Pereda, c. 1659',
    history: 'Llamada también Doxología Menor, esta breve oración de alabanza se remonta a la Iglesia primitiva. Se usaba en el Oficio Divino en el siglo IV y quedó fijada en su forma actual en el Concilio de Nicea (325). Se reza al final de cada decena del Rosario y después de cada salmo en la Liturgia de las Horas.',
  },

  'our-father': {
    name: 'Padre Nuestro',
    text: 'Padre nuestro, que estás en el cielo, santificado sea tu Nombre; venga a nosotros tu Reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.',
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
    text: 'Dios mío, te doy gracias por haberme protegido durante la noche. Te alabo y te doy gracias por todos los bienes que me has concedido. En unión con Jesús, te consagro todos mis pensamientos, palabras, obras, alegrías y sufrimientos de este día. María, Madre mía, bendíceme hoy y protégeme de todo peligro. Ángel de mi guarda y todos mis santos patronos, rogad por mí. Amén.',
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
    text: 'Creo en Dios, Padre todopoderoso, Creador del cielo y de la tierra. Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo, nació de santa María Virgen, padeció bajo el poder de Poncio Pilato, fue crucificado, muerto y sepultado, descendió a los infiernos, al tercer día resucitó de entre los muertos, subió a los cielos y está sentado a la derecha de Dios, Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos. Creo en el Espíritu Santo, la santa Iglesia católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén.',
    caption: 'Los precursores de Cristo con santos y mártires — Fra Angelico, c. 1423–1424',
    history: 'Aunque no fue escrito directamente por los Apóstoles, este credo resume fielmente la fe apostólica. Se formó a partir del antiguo credo bautismal de la Iglesia de Roma, cuyas raíces llegan hasta los primeros siglos, y alcanzó aproximadamente su forma actual en el siglo VIII. Se usa en el Bautismo, en el Rosario y, como alternativa al Credo Niceno, en algunas Misas.',
  },

  'nicene-creed': {
    name: 'Credo Niceno',
    text: 'Creo en un solo Dios, Padre todopoderoso, Creador del cielo y de la tierra, de todo lo visible y lo invisible. Creo en un solo Señor, Jesucristo, Hijo único de Dios, nacido del Padre antes de todos los siglos: Dios de Dios, Luz de Luz, Dios verdadero de Dios verdadero, engendrado, no creado, de la misma naturaleza del Padre, por quien todo fue hecho; que por nosotros los hombres y por nuestra salvación bajó del cielo, y por obra del Espíritu Santo se encarnó de María, la Virgen, y se hizo hombre; y por nuestra causa fue crucificado en tiempos de Poncio Pilato, padeció y fue sepultado, y resucitó al tercer día, según las Escrituras, y subió al cielo, y está sentado a la derecha del Padre; y de nuevo vendrá con gloria para juzgar a vivos y muertos, y su reino no tendrá fin. Creo en el Espíritu Santo, Señor y dador de vida, que procede del Padre y del Hijo, que con el Padre y el Hijo recibe una misma adoración y gloria, y que habló por los profetas. Creo en la Iglesia, que es una, santa, católica y apostólica. Confieso que hay un solo Bautismo para el perdón de los pecados. Espero la resurrección de los muertos y la vida del mundo futuro. Amén.',
    caption: 'Primer Concilio de Nicea — Michael Damaskinos, 1591',
    history: 'Formulado por primera vez en el Concilio de Nicea en el año 325 para afirmar la plena divinidad de Cristo frente al arrianismo, fue desarrollado después en el Primer Concilio de Constantinopla en el año 381. Es el credo más compartido entre los cristianos católicos, ortodoxos y protestantes históricos, aunque existen diferencias en su redacción y en su uso. En el Rito Romano se proclama normalmente en la Misa los domingos y las solemnidades, y en ciertas circunstancias se permite el Credo de los Apóstoles como alternativa.',
  },

  // ---- Oraciones marianas ----

  'hail-holy-queen': {
    name: 'La Salve',
    text: 'Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra; Dios te salve. A ti llamamos los desterrados hijos de Eva; a ti suspiramos, gimiendo y llorando, en este valle de lágrimas. Ea, pues, Señora, abogada nuestra, vuelve a nosotros esos tus ojos misericordiosos; y después de este destierro, muéstranos a Jesús, fruto bendito de tu vientre. Oh clementísima, oh piadosa, oh dulce Virgen María. Ruega por nosotros, santa Madre de Dios, para que seamos dignos de alcanzar las promesas de nuestro Señor Jesucristo. Amén.',
    caption: 'La coronación de la Virgen — Diego Velázquez, c. 1635–1636',
    history: 'Compuesta en la Edad Media, probablemente en el siglo XI, esta antífona mariana se atribuye tradicionalmente a figuras como Hermann de Reichenau, aunque su autor real es desconocido. Pasó a formar parte de la tradición litúrgica de la Iglesia como una de las antífonas marianas y se reza tradicionalmente al terminar el Rosario.',
  },

  'memorare': {
    name: 'Acordaos',
    text: 'Acordaos, oh piadosísima Virgen María, que jamás se ha oído decir que ninguno de los que han acudido a vuestra protección, implorando vuestra asistencia y reclamando vuestro socorro, haya sido abandonado de Vos. Animado con esta confianza, a Vos acudo, oh Madre, Virgen de las vírgenes, y aunque gimiendo bajo el peso de mis pecados, me atrevo a comparecer ante vuestra presencia soberana. No desechéis mis humildes súplicas, oh Madre del Verbo Encarnado, antes bien, escuchadlas y acogedlas benignamente. Amén.',
    caption: 'La coronación de la Virgen (Retablo Oddi) — Rafael, c. 1502–1504',
    history: 'Derivada de una oración mariana más larga del siglo XV, el Acordaos fue difundido en la Francia del siglo XVII por el padre Claude Bernard. Con frecuencia se atribuye por error a san Bernardo de Claraval. Su título viene de la palabra latina memorare, "acuérdate", y sigue siendo una de las oraciones más queridas de la Iglesia para pedir la intercesión de María.',
  },

  'magnificat': {
    name: 'Magníficat',
    text: 'Proclama mi alma la grandeza del Señor, se alegra mi espíritu en Dios, mi salvador; porque ha mirado la humillación de su esclava. Desde ahora me felicitarán todas las generaciones, porque el Poderoso ha hecho obras grandes por mí: su nombre es santo, y su misericordia llega a sus fieles de generación en generación. Él hace proezas con su brazo: dispersa a los soberbios de corazón, derriba del trono a los poderosos y enaltece a los humildes, a los hambrientos los colma de bienes y a los ricos los despide vacíos. Auxilia a Israel, su siervo, acordándose de su misericordia, como lo había prometido a nuestros padres en favor de Abrahán y su descendencia por siempre.',
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
    text: 'Dios mío, me arrepiento de todo corazón de todos mis pecados y los aborrezco, por el castigo que merecen, pero sobre todo porque te ofenden a ti, que eres todo bondad y digno de todo mi amor. Propongo firmemente, con el auxilio de tu gracia, no volver a pecar y evitar las ocasiones próximas de pecado. Amén.',
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

  // ---- Al Espíritu Santo ----

  'prayer-to-the-holy-spirit': {
    name: 'Oración al Espíritu Santo',
    text: 'Respira en mí, Espíritu Santo, para que mis pensamientos sean santos. Obra en mí, Espíritu Santo, para que mi trabajo también sea santo. Atrae mi corazón, Espíritu Santo, para que solo ame lo que es santo. Fortaléceme, Espíritu Santo, para que defienda todo lo que es santo. Guárdame, Espíritu Santo, para que siempre sea santo. Amén.',
    caption: 'Pentecostés — El Greco, c. 1600',
    history: 'Atribuida tradicionalmente a san Agustín de Hipona, aunque su autoría es incierta, esta oración emplea una serie meditativa de peticiones que piden al Espíritu Santo habitar en el creyente, guiar sus pensamientos y acciones, inspirar el amor, dar fortaleza y conducir el alma hacia la santidad.',
  },

  'come-holy-spirit': {
    name: 'Ven, Espíritu Santo',
    text: 'Ven, Espíritu Santo, llena los corazones de tus fieles y enciende en ellos el fuego de tu amor. Envía tu Espíritu y todo será creado, y renovarás la faz de la tierra.',
    caption: 'Pentecostés — Jean Restout, 1732',
    history: 'Conocida en latín como Veni Sancte Spiritus, esta secuencia medieval se atribuye tradicionalmente al papa Inocencio III o al arzobispo Stephen Langton y se remonta a finales del siglo XII o principios del XIII. Se canta o se recita en la Misa de Pentecostés. No debe confundirse con el himno del siglo IX Veni Creator Spiritus, que se canta tradicionalmente en las ordenaciones, los concilios y otras asambleas importantes de la Iglesia.',
  },

  'fatima-prayer': {
    name: 'Oración de Fátima',
    text: 'Oh Jesús mío, perdona nuestros pecados, sálvanos del fuego del infierno. Lleva al cielo a todas las almas, especialmente las más necesitadas de tu misericordia.',
    caption: 'Nuestra Señora de Fátima — Imp. FB Bonella, Milán',
    history: 'Según el relato de sor Lucía sobre las apariciones aprobadas de Fátima, esta oración fue dada por la Virgen a Lucía, Francisco y Jacinta el 13 de julio de 1917. La Virgen les pidió que la rezaran después de cada misterio del Rosario. Desde entonces se ha convertido en una añadidura muy extendida, aunque opcional, después de cada decena.',
  },

  // ---- Eucarísticas ----

  'act-of-spiritual-communion': {
    name: 'Comunión espiritual',
    text: 'Jesús mío, creo que estás realmente presente en el Santísimo Sacramento del altar. Te amo sobre todas las cosas y deseo recibirte en mi alma. Pero como ahora no puedo recibirte sacramentado, ven al menos espiritualmente a mi corazón. Y quedándote en él, haz que yo permanezca unido a ti. No permitas que me aparte nunca de ti. Amén.',
    caption: 'La comunión de los Apóstoles — Justus van Gent, c. 1473–1476',
    history: 'Compuesta por san Alfonso María de Ligorio (1696–1787), esta oración expresa el deseo de recibir a Cristo cuando no es posible comulgar sacramentalmente. Santo Tomás de Aquino describió la comunión espiritual como "un deseo ardiente de recibir a Jesús". El padre Pío la rezaba muchas veces a lo largo del día.',
  },

  'o-salutaris-hostia': {
    name: 'O Salutaris Hostia',
    caption: 'La disputa del Santísimo Sacramento — Rafael, c. 1509–1510',
    history: 'Escrita por santo Tomás de Aquino para la fiesta del Corpus Christi, establecida en 1264. Está formada por las dos últimas estrofas de su himno "Verbum Supernum Prodiens" y se canta tradicionalmente en la bendición con el Santísimo Sacramento, sobre todo al colocar el ostensorio en el altar.',
  },

  'prayer-of-st-thomas-aquinas-before-mass': {
    name: 'Oración de santo Tomás de Aquino antes de la Misa',
    caption: 'Santo Tomás de Aquino — Carlo Crivelli, 1476',
    history: 'Oración de preparación compuesta por el Doctor Angélico (1225–1274), el teólogo más eminente de la Iglesia. Se acerca a la Eucaristía con profunda humildad y presenta el alma como enferma, manchada, ciega y pobre ante el médico, la fuente, la luz y el Señor del cielo y de la tierra.',
  },

  'prayer-of-st-thomas-aquinas-after-mass': {
    name: 'Oración de santo Tomás de Aquino después de la Misa',
    caption: 'El triunfo de santo Tomás de Aquino — Benozzo Gozzoli, c. 1471',
    history: 'Oración de acción de gracias de santo Tomás de Aquino después de recibir la sagrada Comunión. Pide que la Eucaristía recibida sea fuente de perdón, de protección y de virtud, que una el alma cada vez más estrechamente a Dios y que la lleve con seguridad a la felicidad eterna.',
  },

  // ---- Oraciones a los santos ----

  'prayer-to-st-michael': {
    name: 'Oración a san Miguel Arcángel',
    text: 'San Miguel Arcángel, defiéndenos en la batalla. Sé nuestro amparo contra la perversidad y acechanzas del demonio. Que Dios manifieste sobre él su poder, es nuestra humilde súplica. Y tú, oh Príncipe de la milicia celestial, con el poder que Dios te ha conferido, arroja al infierno a Satanás y a los demás espíritus malignos que vagan por el mundo para la perdición de las almas. Amén.',
    caption: 'San Miguel Arcángel venciendo a Satanás — Guido Reni, c. 1630–1635',
    history: 'El papa León XIII añadió esta oración a las Oraciones Leoninas en 1886, dos años después de que aquellas oraciones se instituyeran para rezarse después de la Misa rezada. Una tradición posterior relaciona su composición con una visión estremecedora que, según se cuenta, tuvo el Papa, aunque la evidencia histórica de ese relato es incierta. Las Oraciones Leoninas dejaron de ser obligatorias después de la Misa en 1964, pero la oración a san Miguel sigue siendo una oración católica muy popular de protección espiritual.',
  },

  'prayer-of-st-francis': {
    name: 'Oración de san Francisco',
    text: 'Señor, hazme instrumento de tu paz. Donde haya odio, que yo lleve el amor; donde haya ofensa, que yo lleve el perdón; donde haya duda, que yo lleve la fe; donde haya desesperación, que yo lleve la esperanza; donde haya tinieblas, que yo lleve la luz; donde haya tristeza, que yo lleve la alegría. Oh Maestro, que no busque tanto ser consolado como consolar, ser comprendido como comprender, ser amado como amar. Porque es dando como se recibe, es perdonando como se es perdonado, y es muriendo como se nace a la vida eterna. Amén.',
    caption: 'San Francisco de Asís — Escuela de Francisco de Zurbarán, c. 1600–1644',
    history: 'Aunque se atribuye a san Francisco de Asís, esta oración anónima apareció por primera vez en Francia en 1912 y se difundió durante la Primera Guerra Mundial. Su publicación más antigua conocida fue en la revista espiritual francesa La Clochette. Aunque no la compuso san Francisco, su mensaje de paz, perdón y entrega de sí coincide con la espiritualidad franciscana.',
  },

  'prayer-to-st-jude': {
    name: 'Oración a san Judas Tadeo',
    text: 'Santísimo apóstol san Judas, siervo fiel y amigo de Jesús, la Iglesia te honra e invoca universalmente como patrono de los casos difíciles y desesperados. Ruega por mí, que me siento tan solo y sin ayuda. Haz uso, te lo suplico, de ese privilegio particular que se te ha concedido de socorrer pronto y visiblemente allí donde casi toda esperanza se ha perdido. Ven en mi auxilio en esta gran necesidad, para que reciba el consuelo y el socorro del cielo en todas mis necesidades, tribulaciones y sufrimientos, y en particular (haz aquí tu petición), y para que alabe a Dios contigo y con todos los elegidos para siempre. Amén.',
    caption: 'San Judas Tadeo — Jusepe de Ribera, c. 1607–1609',
    history: 'San Judas Tadeo fue uno de los Doce Apóstoles y se identifica tradicionalmente con el Judas que da nombre a la Epístola de Judas en el Nuevo Testamento. Llegó a ser invocado ampliamente como patrono de las causas desesperadas o aparentemente imposibles. Una explicación popular dice que los cristianos dudaban antes en invocarlo porque su nombre se parecía al de Judas Iscariote, aunque el origen histórico de su patrocinio es incierto. Su fiesta se celebra el 28 de octubre.',
  },

  'prayer-to-st-joseph': {
    name: 'Oración a san José',
    text: 'A vos, bienaventurado san José, acudimos en nuestra tribulación, y después de implorar el auxilio de vuestra santísima Esposa, solicitamos también confiados vuestro patrocinio. Por aquella caridad que os unió con la Inmaculada Virgen Madre de Dios, y por el amor paterno que tuvisteis al Niño Jesús, os rogamos encarecidamente que miréis con bondad la heredad que con su sangre adquirió Jesucristo, y nos socorráis en nuestras necesidades con vuestro poder y auxilio. Protegednos, oh providentísimo custodio de la Sagrada Familia, la escogida descendencia de Jesucristo; apartad de nosotros, oh padre amantísimo, toda peste de error y corrupción; asistidnos propicio desde el cielo, oh fortísimo protector nuestro, en esta lucha contra el poder de las tinieblas; y como un día librasteis al Niño Jesús del peligro de la muerte, defended ahora a la santa Iglesia de Dios de las hostiles insidias y de toda adversidad; y a cada uno de nosotros protegednos con vuestro constante patrocinio, para que, a vuestro ejemplo y sostenidos por vuestro auxilio, podamos vivir santamente, morir piadosamente y alcanzar en los cielos la eterna bienaventuranza. Amén.',
    caption: 'San José con el Niño Jesús — Guido Reni, c. 1625–1630',
    history: 'Compuesta por el papa León XIII en su encíclica Quamquam pluries de 1889. El Santo Padre pidió que se añadiera al Rosario, especialmente durante el mes de octubre. Invoca al padre adoptivo de Jesús y patrono de la Iglesia universal como protector poderoso frente al error y a los poderes de las tinieblas.',
  },

  'prayer-to-st-anthony': {
    name: 'Oración a san Antonio',
    text: 'Oh glorioso san Antonio, el más amable de los santos, tu amor a Dios y tu caridad con sus criaturas te hicieron merecedor, cuando estabas en la tierra, de poseer poderes milagrosos. Los milagros aguardaban tu palabra, que siempre estabas dispuesto a pronunciar en favor de los que sufrían angustia o pena. Animado por este pensamiento, te suplico que me alcances el favor que te pido. La respuesta a mi oración puede requerir un milagro; aun así, tú eres el santo de los milagros. Oh amable y bondadoso san Antonio, cuyo corazón estuvo siempre lleno de compasión humana, susurra mi petición al oído del dulce Niño Jesús, a quien tanto le gustaba descansar en tus brazos, y la gratitud de mi corazón será siempre tuya. Amén.',
    caption: 'La aparición del Niño Jesús a san Antonio de Padua — atribuido a Francisco de Zurbarán, c. 1627–1630',
    history: 'Conocida como la "oración infalible a san Antonio", invoca a san Antonio de Padua (1195–1231), el franciscano llamado el Taumaturgo y patrono de las cosas perdidas. Canonizado menos de un año después de su muerte, se le representa a menudo sosteniendo al Niño Jesús, por una visión que se le atribuye.',
  },

  'prayer-to-st-therese-of-lisieux': {
    name: 'Oración a santa Teresita de Lisieux',
    text: 'Oh Teresita del Niño Jesús, escógeme una rosa de los jardines del cielo y envíamela como mensaje de amor. Oh Florecilla de Jesús, pide hoy a Dios que me conceda los favores que pongo con confianza en tus manos. Santa Teresita, ayúdame a creer siempre, como tú creíste, en el gran amor que Dios me tiene, para que pueda imitar cada día tu Caminito. Amén.',
    caption: 'Santa Teresa de Lisieux — fotografía, c. década de 1890',
    history: 'Invoca a la "Florecita" (1873–1897), la monja carmelita y Doctora de la Iglesia conocida por su "caminito" de infancia espiritual. Prometió "dejar caer una lluvia de rosas" desde el cielo, y las rosas se convirtieron en la señal de su intercesión.',
  },

  'prayer-to-st-padre-pio': {
    name: 'Oración a san Pío de Pietrelcina',
    text: 'Oh Dios, que concediste a san Pío de Pietrelcina, sacerdote capuchino, el gran privilegio de participar de un modo singular en la pasión de tu Hijo, concédeme por su intercesión la gracia que tanto deseo; y, sobre todo, concédeme la gracia de vivir conformado a la muerte de Jesús, para llegar a la gloria de la resurrección. Gloria al Padre... (tres veces)',
    caption: 'San Pío de Pietrelcina — fotografía',
    history: 'Invoca a san Pío de Pietrelcina (1887–1968), el fraile capuchino que llevó los estigmas durante cincuenta años. Conocido por sus dones de curación, por leer las almas en la confesión y por su profunda devoción a la Eucaristía, fue canonizado por el papa Juan Pablo II en 2002.',
  },

  'prayer-to-st-christopher': {
    name: 'Oración a san Cristóbal',
    text: 'Oh glorioso san Cristóbal, que recibiste un nombre hermoso, portador de Cristo, por aquella maravillosa tradición según la cual, al pasar a la gente por un río embravecido, llevaste también al Niño Jesús. Enséñanos a ser verdaderos portadores de Cristo para quienes no lo conocen. Protege a todos los que viajamos, cerca y lejos, y pide a Jesús que permanezca siempre con nosotros. Amén.',
    caption: 'San Cristóbal llevando al Niño Jesús — Hieronymus Bosch, c. 1500',
    history: 'Invoca al patrono de los viajeros, cuyo nombre significa "portador de Cristo". Según la leyenda, cruzó un río embravecido llevando a un niño que se volvía imposiblemente pesado: el Niño Jesús, que cargaba el peso del mundo. Se le invoca para los viajes seguros.',
  },

  'prayer-to-st-ann': {
    name: 'Oración a santa Ana',
    text: 'Buena santa Ana, tú fuiste elegida por Dios de manera especial para ser la madre de la santísima Virgen María, la Madre de nuestro Salvador. Por tu valimiento ante tu purísima hija y ante su divino Hijo, alcánzanos bondadosamente la gracia y el favor que ahora te pedimos. Consíguenos también el perdón de nuestros pecados pasados, la fuerza para cumplir fielmente nuestros deberes de cada día y la ayuda que necesitamos para perseverar en el amor de Jesús y de María. Amén.',
    caption: 'Santa Ana enseñando a leer a la Virgen — artista italiano anónimo, siglo XVII',
    history: 'Invoca a la madre de la Santísima Virgen María y abuela de Jesús. Aunque no aparece nombrada en la Escritura, una tradición antigua la honra como la mujer elegida para criar a la Madre de Dios. Es patrona de las madres, de las abuelas y de quienes desean concebir.',
  },

  'prayer-to-st-gerard': {
    name: 'Oración a san Gerardo',
    text: 'Oh buen san Gerardo, poderoso intercesor ante Dios y taumaturgo de nuestros días, a ti acudo y busco tu auxilio. Tú que en la tierra cumpliste siempre los designios de Dios, ayúdame a cumplir su santa voluntad. Ruega al Dueño de la vida, de quien procede toda paternidad, que me haga fecundo en hijos, para que pueda dar hijos a Dios en esta vida y herederos del Reino de su gloria en la vida futura. Amén.',
    caption: 'San Gerardo Mayela — artista desconocido, finales del siglo XIX o principios del XX',
    history: 'Invoca a san Gerardo Mayela (1726–1755), hermano lego redentorista y patrono de las mujeres embarazadas. Obrador de muchos milagros en su corta vida, quedó asociado a la maternidad tras un milagro relacionado con un parto feliz, y se le invoca por los embarazos sanos.',
  },

  // ---- Devocionales ----

  'anima-christi': {
    name: 'Alma de Cristo',
    text: 'Alma de Cristo, santifícame. Cuerpo de Cristo, sálvame. Sangre de Cristo, embriágame. Agua del costado de Cristo, lávame. Pasión de Cristo, confórtame. Oh buen Jesús, óyeme. Dentro de tus llagas, escóndeme. No permitas que me aparte de ti. Del maligno enemigo, defiéndeme. En la hora de mi muerte, llámame. Y mándame ir a ti, para que con tus santos te alabe, por los siglos de los siglos. Amén.',
    caption: 'La Última Cena — Leonardo da Vinci, c. 1495–1498',
    history: 'Del latín "Alma de Cristo", esta oración se remonta a principios del siglo XIV y era muy conocida mucho antes de que san Ignacio de Loyola la incluyera en sus Ejercicios Espirituales. Manuscritos medievales asociaban indulgencias a su recitación, aunque las afirmaciones posteriores que vinculan su origen o su indulgencia concretamente al papa Juan XXII son inciertas. La oración medita sobre el cuerpo, la sangre, las llagas y la Pasión de Cristo en una serie de peticiones íntimas.',
  },

  'suscipe': {
    name: 'Suscipe',
    text: 'Tomad, Señor, y recibid toda mi libertad, mi memoria, mi entendimiento y toda mi voluntad; todo mi haber y mi poseer. Vos me lo disteis, a Vos, Señor, lo torno. Todo es vuestro: disponed a toda vuestra voluntad. Dadme vuestro amor y gracia, que esto me basta.',
    caption: 'Milagros de san Ignacio de Loyola — Peter Paul Rubens, c. 1617–1618',
    history: 'Del latín "Toma y recibe", es la oración de entrega total de san Ignacio de Loyola, que se encuentra cerca del final de sus Ejercicios Espirituales, en la Contemplación para alcanzar amor. Se considera una de las oraciones de ofrecimiento de sí más completas de la tradición cristiana: entrega enteramente a Dios la memoria, el entendimiento y la voluntad, las tres facultades del alma.',
  },

  'prayer-before-a-crucifix': {
    name: 'Oración ante un crucifijo',
    text: 'Mírame, oh mi amado y buen Jesús, postrado ante tu santísima presencia. Te ruego con el mayor fervor que imprimas en mi corazón vivos sentimientos de fe, esperanza y caridad, verdadero dolor de mis pecados y firmísimo propósito de jamás ofenderte; mientras que yo, con todo el amor y con toda la compasión de que soy capaz, voy considerando tus cinco llagas, teniendo presente aquello que de ti, oh buen Jesús, dijo el profeta David: Han taladrado mis manos y mis pies, y se pueden contar todos mis huesos.',
    caption: 'La crucifixión de Jesús — Juan Sánchez Cotán, después de 1603',
    history: 'Esta oración se reza tradicionalmente después de recibir la sagrada Comunión, de rodillas ante una imagen de Cristo crucificado. Medita sobre las llagas de Cristo y hace eco del Salmo 22. Según la disciplina actual de la Iglesia, rezarla después de la Comunión ante un crucifijo lleva indulgencia parcial; los viernes de Cuaresma puede obtenerse indulgencia plenaria en las condiciones acostumbradas.',
  },

  // ---- Divina Misericordia ----

  'chaplet-opening-prayer': {
    name: 'Oración inicial de la Coronilla',
    caption: 'Jesús misericordioso (Divina Misericordia) — Eugeniusz Kazimirowski, 1934',
    history: 'La Coronilla a la Divina Misericordia fue dada por Jesús a santa Faustina Kowalska en los años treinta y quedó recogida en su Diario. Las oraciones iniciales meditan sobre la sangre y el agua que brotaron del costado traspasado de Cristo como fuente de misericordia para el mundo.',
  },

  'chaplet-main-prayer': {
    name: 'Oración principal de la Coronilla',
    text: 'Padre Eterno, te ofrezco el Cuerpo y la Sangre, el Alma y la Divinidad de tu amadísimo Hijo, nuestro Señor Jesucristo, como propiciación de nuestros pecados y los del mundo entero.',
    caption: 'El Sagrado Corazón de Jesús — José María Ibarrarán y Ponce, 1896',
    history: 'Se reza en las cuentas del Padrenuestro del Rosario y ofrece el Cuerpo, la Sangre, el Alma y la Divinidad de Cristo al Padre eterno en expiación por los pecados del mundo entero. Jesús prometió a santa Faustina grandes gracias a quienes recen la Coronilla.',
  },

  'chaplet-decade-prayer': {
    name: 'Oración de las decenas de la Coronilla',
    text: 'Por su dolorosa Pasión, ten misericordia de nosotros y del mundo entero.',
    caption: 'La coronación de espinas — Tiziano, c. 1540–1543',
    history: 'Se reza diez veces en las cuentas del Ave María y suplica misericordia "por su dolorosa Pasión". Cristo dijo a santa Faustina que por medio de la Coronilla el alma obtiene misericordia, especialmente en la hora de la muerte.',
  },

  'chaplet-closing-prayer': {
    name: 'Oración final de la Coronilla',
    text: 'Santo Dios, Santo Fuerte, Santo Inmortal, ten piedad de nosotros y del mundo entero.',
    caption: 'Cristo Pantocrátor — Catedral de Cefalù, 1148',
    history: 'El triple "Santo Dios, Santo Fuerte, Santo Inmortal" hace eco del antiguo himno Trisagio. La oración final pide que, confiando en la misericordia sin fin de Dios, los fieles no desesperen nunca y se sometan siempre a su santa voluntad.',
  },

  'o-blood-and-water': {
    name: 'Oh Sangre y Agua',
    text: 'Oh Sangre y Agua que brotaste del Corazón de Jesús como fuente de misericordia para nosotros, en ti confío.',
    caption: 'El martirio de Jesús de Nazaret — Aimé-Nicolas Morot, 1883',
    history: 'Esta breve jaculatoria, tomada del Diario de santa Faustina, honra la sangre y el agua que brotaron del Corazón de Jesús en la Cruz (Juan 19:34), que la Iglesia ha visto siempre como símbolos de la Eucaristía y del Bautismo, las fuentes de la misericordia divina.',
  },

  // ---- Penitenciales ----

  'confiteor': {
    name: 'Yo confieso',
    text: 'Yo confieso ante Dios todopoderoso y ante ustedes, hermanos, que he pecado mucho de pensamiento, palabra, obra y omisión. Por mi culpa, por mi culpa, por mi gran culpa. Por eso ruego a santa María, siempre Virgen, a los ángeles, a los santos y a ustedes, hermanos, que intercedan por mí ante Dios, nuestro Señor.',
    caption: 'San Pedro penitente — El Greco, c. 1590–1595',
    history: 'La oración del "yo confieso", que se reza al comienzo de la Misa en el acto penitencial. Al reconocer el pecado "por mi culpa, por mi culpa, por mi gran culpa", los fieles piden a toda la corte celestial y a la Iglesia reunida que rueguen por ellos. Su forma se remonta a la primera Edad Media.',
  },

  'de-profundis': {
    name: 'De Profundis',
    caption: 'Jonás y la ballena — Pieter Lastman, 1621',
    history: 'El Salmo 130, uno de los siete salmos penitenciales, que toma su nombre de sus primeras palabras latinas, "Desde lo más profundo". Se reza especialmente por los fieles difuntos y es un grito profundo de confianza en el perdón misericordioso de Dios desde lo más hondo del dolor y del pecado.',
  },

  'te-deum': {
    name: 'Te Deum',
    text: 'A ti, oh Dios, te alabamos, a ti, Señor, te reconocemos. A ti, eterno Padre, te venera toda la creación. Los ángeles todos, los cielos y todas las potestades te honran. Los querubines y serafines te cantan sin cesar: Santo, Santo, Santo es el Señor, Dios del universo; llenos están el cielo y la tierra de la majestad de tu gloria. A ti te ensalza el glorioso coro de los apóstoles, la multitud admirable de los profetas, el blanco ejército de los mártires. A ti la Iglesia santa, extendida por toda la tierra, te proclama: Padre de inmensa majestad, Hijo único y verdadero, Espíritu Santo, Defensor. Tú eres el Rey de la gloria, Cristo; Tú el Hijo único del Padre; Tú, para liberar al hombre, no has rehusado hacerte hombre en el seno de la Virgen; Tú, rotas las cadenas de la muerte, has abierto a los creyentes el reino de los cielos; Tú te sientas a la derecha de Dios en la gloria del Padre. Creemos que un día has de venir como juez. Ven, pues, en ayuda de tus siervos, a quienes redimiste con tu sangre preciosa, y cuéntanos entre tus santos en la gloria eterna.',
    caption: 'La adoración de la Santísima Trinidad — Alberto Durero, 1511',
    history: 'Antiguo himno de alabanza atribuido tradicionalmente a san Ambrosio y san Agustín en el siglo IV. Se canta en ocasiones de gran acción de gracias y solemnidad, y alaba al Padre, al Hijo y al Espíritu Santo junto con toda la corte celestial: ángeles, apóstoles, profetas y mártires.',
  },

  // ---- Letanías ----

  'litany-of-the-saints': {
    name: 'Letanía de los Santos',
    caption: 'Los precursores de Cristo con santos y mártires — Fra Angelico, c. 1423–1424',
    history: 'Una de las formas más antiguas de oración cristiana; las letanías se remontan al siglo V en la Iglesia de Oriente y estaban muy difundidas en Roma en el siglo VII. La Letanía de los Santos se canta en los Bautismos, en las Órdenes Sagradas y en la Vigilia Pascual. Expresa la fe en la Comunión de los Santos: que la Iglesia en la tierra, en el purgatorio y en el cielo está unida en la oración.',
  },
}

export default PRAYERS_ES
