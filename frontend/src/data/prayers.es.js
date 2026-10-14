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
}

export default PRAYERS_ES
