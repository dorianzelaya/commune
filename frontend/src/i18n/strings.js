// UI strings in English and Spanish.
//
// Deliberately a plain object and not react-i18next: there are about a
// hundred strings, no pluralisation rules worth the name, no date or
// number formatting beyond what Intl already does, and no translators to
// hand files to. A library here would be more machinery than the problem.
//
// WHAT BELONGS IN HERE
//
// Interface text only: labels, buttons, headings, placeholders, empty
// states. The devotional content does NOT live here. Prayers, the rosary
// mysteries and the examination of conscience have their own Spanish in
// their own data files, because a prayer is not a translated string, it is
// the received text that Spanish-speaking Catholics already know by heart.
// Running the Our Father through a translation function would produce
// something subtly and embarrassingly wrong.
//
// KEYS
//
// Namespaced by where they appear. A key is never reused across two
// screens even when the English happens to match, because the two can
// need different Spanish later and chasing that down afterwards is worse
// than a duplicate now.

export const STRINGS = {
  en: {
    // shared
    'common.loading': 'Loading...',
    'common.continue': 'Continue',

    // nav
    'nav.home': 'Home',
    'nav.readings': 'Readings',
    'nav.bible': 'Bible',
    'nav.rosary': 'Rosary',
    'nav.profile': 'Profile',

    // home
    'home.readings': "Today's Readings",

    // readings
    'readings.eyebrow': 'Daily Mass Readings',
    'readings.midnight': 'Readings update at midnight',
    'readings.first': 'First Reading',
    'readings.psalm': 'Psalm',
    'readings.second': 'Second Reading',
    'readings.gospel': 'Gospel',

    // saint of the day
    'saint.title': 'Saint of the Day',
    'saint.fromWikipedia': 'From Wikipedia',
    'saint.noSaint': 'This day is not yet dedicated to a Saint recognized by the Catholic Church.',
    'saint.resurrectionCaption': 'The Resurrection of Christ — Titian, c. 1542–1544',
    'saint.resurrectionVerse': 'Psalm 117:24',
    'saint.christCaption': 'Figure of Christ · Heinrich Hofmann',
    'saint.perfectVerse': 'Matthew 5:48',

    // bible
    'bible.edition': 'Douay-Rheims Bible',
    'bible.title': 'The Holy Bible',
    'bible.old': 'Old Testament',
    'bible.new': 'New Testament',
    'bible.continueReading': 'Continue Reading',
    'bible.chaptersRead': 'Chapters Read',
    'bible.booksStarted': 'Books Started',

    // rosary
    'rosary.title': 'The Holy Rosary',
    'rosary.set.joyful': 'Joyful Mysteries',
    'rosary.set.sorrowful': 'Sorrowful Mysteries',
    'rosary.set.glorious': 'Glorious Mysteries',
    'rosary.set.luminous': 'Luminous Mysteries',
    'rosary.completed': 'You have completed the {set} of the Holy Rosary.',
    'rosary.howToTitle': 'How to Pray the Rosary',
    'rosary.howToLink': 'How to pray the Rosary',
    'rosary.choose': 'Choose your mysteries',
    'rosary.suggested': 'Suggested for today',
    'rosary.closing': 'May Our Lady intercede for you and bring your prayers before her Son.',
    'rosary.again': 'Pray again',

    // prayers
    'prayers.title': 'Prayers',
    'prayers.traditional': 'Traditional Prayers',
    'prayers.about': 'About this Prayer',
    'prayers.cat.daily': 'Daily Prayers',
    'prayers.cat.creeds': 'Creeds',
    'prayers.cat.marian': 'Marian Prayers',
    'prayers.cat.acts': 'Acts',
    'prayers.cat.spirit': 'To the Holy Spirit',
    'prayers.cat.eucharist': 'Eucharistic',
    'prayers.cat.saints': 'Saint Prayers',
    'prayers.cat.devotional': 'Devotional',
    'prayers.cat.mercy': 'Divine Mercy',
    'prayers.cat.penitential': 'Penitential',
    'prayers.cat.litany': 'Litany',

    // examination of conscience
    'exam.eyebrow': 'Before Confession',
    'exam.title': 'Examination of Conscience',
    'exam.instructions': 'Reflect quietly on each commandment. Tap to expand.',
    'exam.opening': 'Begin with a prayer to the Holy Spirit, asking for the grace to know your sins clearly and to be truly sorry for them.',
    'exam.contrition': 'Act of Contrition',

    // seek
    'seek.title': 'Seek',
    'seek.finding': 'Finding scripture...',
    'seek.scriptureFor': 'Scripture for...',
    'seek.scripture': 'Scripture',
    'seek.saint': 'A saint who understands',
    'seek.figure': 'A biblical figure who understands',
    'seek.readStory': 'Read their story in the Bible →',
    'seek.prayer': 'Prayer',
    'seek.searching': 'Searching...',
    'seek.quoteHint': 'Put words in quotes to search for an exact phrase.',
    'seek.anotherVerse': 'Show another verse',
    'seek.searchPlaceholder': 'Search the Bible by keyword...',
    'seek.clearSearch': 'Clear search',
    'seek.verse': 'verse',
    'seek.verses': 'verses',
    'seek.exactPhrase': 'exact phrase',
    'seek.showing': 'showing {n}',
    'seek.loading': 'Loading...',
    'seek.loadMore': 'Load {n} more',
    'seek.crisisNote': 'If you are in crisis or experiencing thoughts of self-harm, please reach out to the 988 Suicide and Crisis Lifeline by calling or texting 988. You may also speak with a priest or trusted person in your life.',
    'home.tile.bible': 'Bible',
    'home.tile.bible.sub': 'Douay-Rheims Catholic Bible',
    'home.tile.saint': 'Saint of the Day',
    'home.tile.saint.sub': "Meet today's saint",
    'home.tile.seek': 'Seek',
    'home.tile.seek.sub': 'Scripture for every season',
    'home.tile.rosary': 'Rosary',
    'home.tile.rosary.sub': 'Pray the mysteries',
    'home.tile.examination': 'Examination of Conscience',
    'home.tile.examination.sub': 'Prepare for confession',
    'home.tile.prayers': 'Prayers',
    'home.tile.prayers.sub': 'Traditional Catholic prayers',
    'home.season.ordinary': 'Ordinary Time',
    'seek.heroTitle': 'Find Scripture For...',
    'seek.heroSub': "What's on your heart?",
    'seek.searchTitle': 'Search the Bible',
    'seek.searchSub': 'All 73 books, Douay-Rheims',

    // profile
    'profile.yourAccount': 'Your Account',
    'profile.title': 'Profile',
    'profile.logOut': 'Log Out',
    'profile.streak': 'Daily Streak',
    'profile.resetStreak': 'Reset streak',
    'profile.features': 'Features',
    'profile.journal': 'Prayer Journal',
    'profile.readingPlan': 'Reading Plan',
    'profile.myPrayers': 'My Prayers',
    'profile.myVerses': 'My Verses',
    'profile.glossary': 'Glossary',
    'profile.noTerms': 'No terms match "{query}".',
    'profile.noPrayers': 'No saved prayers yet. Bookmark a prayer from the Prayers page by tapping the ☆ icon.',
    'profile.noVerses': 'No saved verses yet. Tap a verse in the Bible reader, then tap "Save Verse."',
    'profile.emptyJournal': 'Your journal is empty. Write your first entry above.',
    'profile.noProgress': 'Start reading the Bible to track your progress here.',
    'profile.removePrayer': 'Remove from saved prayers',
    'profile.searchTerms': 'Search terms...',
    'profile.journalPlaceholder': 'Write a prayer intention, a thanksgiving, or whatever is on your heart...',
    'profile.deleteEntry': 'Delete entry',

    // appearance
    'theme.heading': 'Appearance',
    'theme.season': 'Follow the liturgical season',
    'theme.seasonDesc': 'The app takes the colour worn at Mass today. Green in Ordinary Time, violet in Advent and Lent, white at Christmas and Easter, red for Pentecost and the martyrs.',
    'theme.crimson': 'Crimson',
    'theme.blue': 'Blue',
    'theme.green': 'Green',
    'theme.violet': 'Violet',
    'theme.white': 'White',
    'theme.red': 'Red',
    'theme.rose': 'Rose',

    // language
    'lang.heading': 'Language',
    'lang.desc': 'Changes the app’s text. Scripture and the daily readings are in English for now.',
    'lang.en': 'English',
    'lang.es': 'Español',

    // auth
    'auth.welcomeBack': 'Welcome back',
    'auth.createAccount': 'Create your account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.firstName': 'First name',
    'auth.logIn': 'Log in',
    'auth.haveAccount': 'Already have an account?',
    'auth.noAccount': "Don't have an account?",
    'auth.createOne': 'Create one',
    'auth.forgot': 'Forgot your password?',
    'auth.lookingAround': 'Just looking around?',
    'auth.demo': 'Explore with a demo account',
    'auth.checkEmail': 'Check your email',
    'auth.forgotBlurb': "Enter the email on your account and we'll send you a link to reset it.",
    'auth.invalidLink': 'Invalid link',
    'auth.missingToken': 'This password reset link is missing its token. Please request a new one.',
    'auth.requestNew': 'Request a new link',
    'auth.resetDone': 'Password reset',
    'auth.resetDoneBlurb': 'Your password has been changed. Taking you to log in...',
    'auth.chooseNew': 'Choose a new password',
    'auth.newPassword': 'New password',
    'auth.confirmNew': 'Confirm new password',
  },

  es: {
    // shared
    'common.loading': 'Cargando...',
    'common.continue': 'Continuar',

    // nav
    'nav.home': 'Inicio',
    'nav.readings': 'Lecturas',
    'nav.bible': 'Biblia',
    'nav.rosary': 'Rosario',
    'nav.profile': 'Perfil',

    // home
    'home.readings': 'Lecturas de hoy',

    // readings
    'readings.eyebrow': 'Lecturas de la Misa diaria',
    'readings.midnight': 'Las lecturas se actualizan a medianoche',
    'readings.first': 'Primera lectura',
    'readings.psalm': 'Salmo',
    'readings.second': 'Segunda lectura',
    'readings.gospel': 'Evangelio',

    // saint of the day
    'saint.title': 'Santo del día',
    'saint.fromWikipedia': 'De Wikipedia',
    'saint.noSaint': 'Este día aún no está dedicado a un santo reconocido por la Iglesia católica.',
    'saint.resurrectionCaption': 'La Resurrección de Cristo — Tiziano, c. 1542–1544',
    'saint.resurrectionVerse': 'Salmo 117:24',
    'saint.christCaption': 'Figura de Cristo · Heinrich Hofmann',
    'saint.perfectVerse': 'Mateo 5:48',

    // bible
    'bible.edition': 'Biblia Douay-Rheims',
    'bible.title': 'La Sagrada Biblia',
    'bible.old': 'Antiguo Testamento',
    'bible.new': 'Nuevo Testamento',
    'bible.continueReading': 'Seguir leyendo',
    'bible.chaptersRead': 'Capítulos leídos',
    'bible.booksStarted': 'Libros comenzados',

    // rosary
    'rosary.title': 'El Santo Rosario',
    'rosary.set.joyful': 'Misterios gozosos',
    'rosary.set.sorrowful': 'Misterios dolorosos',
    'rosary.set.glorious': 'Misterios gloriosos',
    'rosary.set.luminous': 'Misterios luminosos',
    'rosary.completed': 'Has completado los {set} del Santo Rosario.',
    'rosary.howToTitle': 'Cómo rezar el Rosario',
    'rosary.howToLink': 'Cómo rezar el Rosario',
    'rosary.choose': 'Elige tus misterios',
    'rosary.suggested': 'Sugeridos para hoy',
    'rosary.closing': 'Que Nuestra Señora interceda por ti y presente tus oraciones ante su Hijo.',
    'rosary.again': 'Rezar de nuevo',

    // prayers
    'prayers.title': 'Oraciones',
    'prayers.traditional': 'Oraciones tradicionales',
    'prayers.about': 'Sobre esta oración',
    'prayers.cat.daily': 'Oraciones diarias',
    'prayers.cat.creeds': 'Credos',
    'prayers.cat.marian': 'Oraciones marianas',
    'prayers.cat.acts': 'Actos',
    'prayers.cat.spirit': 'Al Espíritu Santo',
    'prayers.cat.eucharist': 'Eucarísticas',
    'prayers.cat.saints': 'Oraciones a los santos',
    'prayers.cat.devotional': 'Devocionales',
    'prayers.cat.mercy': 'Divina Misericordia',
    'prayers.cat.penitential': 'Penitenciales',
    'prayers.cat.litany': 'Letanías',

    // examination of conscience
    'exam.eyebrow': 'Antes de la confesión',
    'exam.title': 'Examen de conciencia',
    'exam.instructions': 'Reflexiona en silencio sobre cada mandamiento. Toca para desplegar.',
    'exam.opening': 'Comienza con una oración al Espíritu Santo, pidiendo la gracia de conocer tus pecados con claridad y de arrepentirte de verdad.',
    'exam.contrition': 'Acto de contrición',

    // seek
    'seek.title': 'Busca',
    'seek.finding': 'Buscando en la Escritura...',
    'seek.scriptureFor': 'Escritura para...',
    'seek.scripture': 'Escritura',
    'seek.saint': 'Un santo que comprende',
    'seek.figure': 'Una figura bíblica que comprende',
    'seek.readStory': 'Lee su historia en la Biblia →',
    'seek.prayer': 'Oración',
    'seek.searching': 'Buscando...',
    'seek.quoteHint': 'Pon las palabras entre comillas para buscar una frase exacta.',
    'seek.anotherVerse': 'Mostrar otro versículo',
    'seek.searchPlaceholder': 'Busca en la Biblia por palabra clave...',
    'seek.clearSearch': 'Borrar la búsqueda',
    'seek.verse': 'versículo',
    'seek.verses': 'versículos',
    'seek.exactPhrase': 'frase exacta',
    'seek.showing': 'mostrando {n}',
    'seek.loading': 'Cargando...',
    'seek.loadMore': 'Cargar {n} más',
    'seek.crisisNote': 'Si estás en crisis o tienes pensamientos de hacerte daño, comunícate con la Línea 988 de Prevención del Suicidio y Crisis llamando o enviando un mensaje de texto al 988. También puedes hablar con un sacerdote o con una persona de confianza en tu vida.',
    'home.tile.bible': 'Biblia',
    'home.tile.bible.sub': 'Biblia católica Douay-Rheims',
    'home.tile.saint': 'Santo del día',
    'home.tile.saint.sub': 'Conoce al santo de hoy',
    'home.tile.seek': 'Busca',
    'home.tile.seek.sub': 'Escritura para cada momento',
    'home.tile.rosary': 'Rosario',
    'home.tile.rosary.sub': 'Reza los misterios',
    'home.tile.examination': 'Examen de conciencia',
    'home.tile.examination.sub': 'Prepárate para la confesión',
    'home.tile.prayers': 'Oraciones',
    'home.tile.prayers.sub': 'Oraciones católicas tradicionales',
    'home.season.ordinary': 'Tiempo Ordinario',
    'seek.heroTitle': 'Busca Escritura para...',
    'seek.heroSub': '¿Qué llevas en el corazón?',
    'seek.searchTitle': 'Busca en la Biblia',
    'seek.searchSub': 'Los 73 libros, Douay-Rheims',

    // profile
    'profile.yourAccount': 'Tu cuenta',
    'profile.title': 'Perfil',
    'profile.logOut': 'Cerrar sesión',
    'profile.streak': 'Racha diaria',
    'profile.resetStreak': 'Reiniciar la racha',
    'profile.features': 'Funciones',
    'profile.journal': 'Diario de oración',
    'profile.readingPlan': 'Plan de lectura',
    'profile.myPrayers': 'Mis oraciones',
    'profile.myVerses': 'Mis versículos',
    'profile.glossary': 'Glosario',
    'profile.noTerms': 'Ningún término coincide con «{query}».',
    'profile.noPrayers': 'Aún no tienes oraciones guardadas. Guarda una desde la página de Oraciones tocando el icono ☆.',
    'profile.noVerses': 'Aún no tienes versículos guardados. Toca un versículo en el lector de la Biblia y luego toca «Guardar versículo».',
    'profile.emptyJournal': 'Tu diario está vacío. Escribe tu primera entrada arriba.',
    'profile.noProgress': 'Empieza a leer la Biblia para ver aquí tu progreso.',
    'profile.removePrayer': 'Quitar de las oraciones guardadas',
    'profile.searchTerms': 'Buscar términos...',
    'profile.journalPlaceholder': 'Escribe una intención, un agradecimiento o lo que lleves en el corazón...',
    'profile.deleteEntry': 'Eliminar la entrada',

    // appearance
    'theme.heading': 'Apariencia',
    'theme.season': 'Seguir el tiempo litúrgico',
    'theme.seasonDesc': 'La aplicación toma el color que se usa hoy en la Misa. Verde en el Tiempo Ordinario, violeta en Adviento y Cuaresma, blanco en Navidad y Pascua, rojo en Pentecostés y en las fiestas de los mártires.',
    'theme.crimson': 'Carmesí',
    'theme.blue': 'Azul',
    'theme.green': 'Verde',
    'theme.violet': 'Violeta',
    'theme.white': 'Blanco',
    'theme.red': 'Rojo',
    'theme.rose': 'Rosa',

    // language
    'lang.heading': 'Idioma',
    'lang.desc': 'Cambia el texto de la aplicación. La Escritura y las lecturas del día están en inglés por ahora.',
    'lang.en': 'English',
    'lang.es': 'Español',

    // auth
    'auth.welcomeBack': 'Bienvenido de nuevo',
    'auth.createAccount': 'Crea tu cuenta',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.firstName': 'Nombre',
    'auth.logIn': 'Iniciar sesión',
    'auth.haveAccount': '¿Ya tienes una cuenta?',
    'auth.noAccount': '¿No tienes una cuenta?',
    'auth.createOne': 'Crea una',
    'auth.forgot': '¿Olvidaste tu contraseña?',
    'auth.lookingAround': '¿Solo estás explorando?',
    'auth.demo': 'Explora con una cuenta de prueba',
    'auth.checkEmail': 'Revisa tu correo',
    'auth.forgotBlurb': 'Escribe el correo de tu cuenta y te enviaremos un enlace para restablecer la contraseña.',
    'auth.invalidLink': 'Enlace no válido',
    'auth.missingToken': 'A este enlace para restablecer la contraseña le falta su token. Solicita uno nuevo.',
    'auth.requestNew': 'Solicitar un enlace nuevo',
    'auth.resetDone': 'Contraseña restablecida',
    'auth.resetDoneBlurb': 'Tu contraseña ha sido cambiada. Te llevamos a iniciar sesión...',
    'auth.chooseNew': 'Elige una contraseña nueva',
    'auth.newPassword': 'Contraseña nueva',
    'auth.confirmNew': 'Confirma la contraseña nueva',
  },
}

export const LANGUAGES = [
  { key: 'en', label: 'English' },
  { key: 'es', label: 'Español' },
]

export const DEFAULT_LANG = 'en'
