const PRAYERS = {
  "Daily Prayers": [
    {
      id: "sign-of-the-cross",
      name: "Sign of the Cross",
      text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
      image: "/prayer-cards/sign-of-cross.jpg",
      caption: "Christ on the Cross — El Greco, c. 1600–1610",
      history: "One of the oldest gestures in Christianity, dating back to at least the 2nd century. Tertullian wrote in 200 AD that Christians marked their foreheads with the cross in all daily actions. The trinitarian formula 'Father, Son, and Holy Spirit' comes directly from Matthew 28:19. It is both a profession of faith and a sacramental blessing."
    },
    {
      id: "glory-be",
      name: "Glory Be",
      text: "Glory be to the Father and to the Son and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
      image: "/prayer-cards/glory-be.jpg",
      caption: "The Holy Trinity — Antonio de Pereda, c. 1659",
      history: "Also called the Lesser Doxology, this short prayer of praise dates to the early Church. It was used in the Divine Office by the 4th century and was standardized in its current form by the Council of Nicaea (325 AD). It is prayed at the end of each decade of the Rosary and after every psalm in the Liturgy of the Hours."
    },
    {
      id: "our-father",
      name: "Our Father",
      text: "Our Father, who art in Heaven, hallowed be Thy name. Thy kingdom come, Thy will be done on earth as it is in Heaven. Give us this day our daily bread, and forgive us our trespasses as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen.",
      image: "/prayer-cards/our-father.jpg",
      caption: "The Lord's Prayer — James Tissot, c. 1886–1894",
      history: "Given directly by Jesus Christ when his disciples asked him how to pray (Matthew 6:9–13 and Luke 11:2–4). It is the fundamental Christian prayer and has held a central place in the Eucharistic liturgy since the early centuries of the Church. St. Thomas Aquinas called it 'the most perfect of prayers,' while St. Augustine taught that every prayer found in Scripture is contained within it."
    },
    {
      id: "hail-mary",
      name: "Hail Mary",
      text: "Hail Mary, full of grace, the Lord is with Thee. Blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
      image: "/prayer-cards/hail-mary.jpg",
      caption: "Sistine Madonna — Raphael, c. 1513–1514",
      history: "Composed from two scriptural greetings — the Angel Gabriel's words to Mary (Luke 1:28) and Elizabeth's greeting at the Visitation (Luke 1:42). The petition 'Holy Mary, Mother of God, pray for us sinners…' developed during the Middle Ages, and the prayer's present form was officially included in the Roman Breviary in 1568. It is the principal repeated prayer of the Rosary."
    },
    {
      id: "morning-offering",
      name: "Morning Offering",
      text: "My God, I thank you for protecting me through the night. I praise you and give you thanks for all the blessings you have bestowed on me. In union with Jesus, I consecrate to you all my thoughts, words, actions, joys, and sufferings of this day. Mary, my mother, bless me this day and protect me from dangers. My Guardian Angel and all my patrons, pray for me. Amen.",
      image: "/prayer-cards/morning-offering.jpg",
      caption: "Sacred Heart of Jesus — Pompeo Batoni, 1767",
      history: "This form of the Morning Offering was promoted by the Apostleship of Prayer, founded by Father François Gautrelet SJ in France in 1844. The prayer unites the day's joys and sufferings with the intentions of the Sacred Heart of Jesus, making ordinary daily life an act of prayer."
    },
    {
      id: "night-prayer",
      name: "Night Prayer",
      text: "Lord Jesus Christ, you have given your followers an example of gentleness and humility, a task that is easy, a burden that is light. Accept the prayers and work of this day, and give us the rest that will strengthen us to render more faithful service to you who live and reign forever and ever. Amen.",
      image: "/prayer-cards/night-prayer.jpg",
      caption: "Christ in Gethsemane — Heinrich Hofmann, 1886",
      history: "Drawn from the ancient tradition of Compline, the final prayer of the Church's daily Liturgy of the Hours. Monks and religious have prayed night prayers since the Rule of Saint Benedict (6th century). This form reflects the gentle, humble spirit of Christ that Benedict called his monks to imitate."
    },
    {
      id: "guardian-angel-prayer",
      name: "Guardian Angel Prayer",
      text: "Angel of God, my guardian dear, to whom God's love commits me here. Ever this day be at my side, to light and guard, to rule and guide. Amen.",
      image: "/prayer-cards/guardian-angel.jpg",
      caption: "The Guardian Angel — Gioacchino Assereto, c. 1630",
      history: "Belief in personal guardian angels is ancient and rooted in Scripture (Matthew 18:10; Psalm 91:11). This particular prayer developed during the medieval period and is often among the first prayers taught to Catholic children. The Memorial of the Holy Guardian Angels is celebrated on October 2."
    },
    {
      id: "grace-before-meals",
      name: "Grace Before Meals",
      text: "Bless us, O Lord, in these your gifts, which we are about to receive from your bounty through Christ our Lord. Amen.",
      image: "/prayer-cards/grace-before-meals.jpg",
      caption: "The Wedding at Cana — Garofalo (Benvenuto Tisi), 1531",
      history: "The practice of blessing God before eating is rooted in Jewish tradition and was continued by the earliest Christians. Saint Paul is described as giving thanks before eating in Acts 27:35. The familiar Catholic formula, 'Bless us, O Lord…,' developed within the Church's Latin prayer tradition and became a customary blessing in Catholic homes and communities."
    },
    {
      id: "grace-after-meals",
      name: "Grace After Meals",
      text: "We give you thanks, O Almighty God, for these your benefits, who lives and reigns, world without end. Amen.",
      image: "/prayer-cards/grace-after-meals.jpg",
      history: "The companion to Grace Before Meals, this prayer of thanksgiving after eating echoes Deuteronomy 8:10 — 'When you have eaten and are satisfied, praise the Lord your God.' The practice of blessing God after meals is one of the oldest forms of Jewish and Christian prayer."
    },
  ],
  "Creeds": [
    {
      id: "apostles-creed",
      name: "Apostles' Creed",
      text: "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried. He descended into hell. On the third day he rose again from the dead. He ascended into heaven, and is seated at the right hand of God the Father almighty. From there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
      image: "/prayer-cards/apostles-creed.jpg",
      caption: "The Forerunners of Christ with Saints and Martyrs — Fra Angelico, c. 1423–1424",
      history: "Though not written directly by the Apostles, this creed faithfully summarizes the apostolic faith. It developed from the ancient baptismal creed of the Church at Rome, whose roots reach back to the early centuries, and reached approximately its present form by the eighth century. It is used in Baptism, the Rosary, and, as an alternative to the Nicene Creed, at certain Masses."
    },
    {
      id: "nicene-creed",
      name: "Nicene Creed",
      text: "I believe in one God, the Father almighty, maker of heaven and earth, of all things visible and invisible. I believe in one Lord Jesus Christ, the Only Begotten Son of God, born of the Father before all ages. God from God, Light from Light, true God from true God, begotten, not made, consubstantial with the Father; through him all things were made. For us men and for our salvation he came down from heaven, and by the Holy Spirit was incarnate of the Virgin Mary, and became man. For our sake he was crucified under Pontius Pilate, he suffered death and was buried, and rose again on the third day in accordance with the Scriptures. He ascended into heaven and is seated at the right hand of the Father. He will come again in glory to judge the living and the dead and his kingdom will have no end. I believe in the Holy Spirit, the Lord, the giver of life, who proceeds from the Father and the Son, who with the Father and the Son is adored and glorified, who has spoken through the prophets. I believe in one, holy, catholic and apostolic Church. I confess one Baptism for the forgiveness of sins and I look forward to the resurrection of the dead and the life of the world to come. Amen.",
      image: "/prayer-cards/nicene-creed.jpg",
      caption: "First Council of Nicaea — Michael Damaskinos, 1591",
      history: "First formulated at the Council of Nicaea in AD 325 to affirm the full divinity of Christ against Arianism, it was developed further at the First Council of Constantinople in AD 381. It is the most widely shared creed among Catholic, Orthodox, and historic Protestant Christians, although differences exist in its wording and use. In the Roman Rite it is normally proclaimed at Mass on Sundays and solemnities, with the Apostles' Creed permitted as an alternative in certain circumstances."
    },
  ],
  "Marian Prayers": [
    {
      id: "hail-holy-queen",
      name: "Hail Holy Queen",
      text: "Hail, holy Queen, mother of mercy, our life, our sweetness, and our hope. To thee we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile show us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ. Amen.",
      image: "/prayer-cards/hail-holy-queen.jpg",
      caption: "The Coronation of the Virgin — Diego Velázquez, c. 1635–1636",
      history: "Composed during the Middle Ages, probably in the eleventh century, this Marian antiphon is traditionally attributed to figures including Hermann of Reichenau, although its actual author is unknown. It became part of the Church's liturgical tradition as one of the Marian antiphons and is traditionally prayed at the conclusion of the Rosary."
    },
    {
      id: "memorare",
      name: "Memorare",
      text: "Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thine intercession was left unaided. Inspired by this confidence, I fly to thee, O Virgin of virgins, my mother. To thee do I come, before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen.",
      image: "/prayer-cards/memorare.jpg",
      caption: "The Crowning of the Virgin (Oddi Altarpiece) — Raphael, c. 1502–1504",
      history: "Derived from a longer Marian prayer dating to the fifteenth century, the Memorare was popularized in seventeenth-century France by Father Claude Bernard. It is frequently misattributed to Saint Bernard of Clairvaux. Its title comes from the Latin word memorare, meaning 'remember,' and it remains one of the Church's most beloved prayers for Mary's intercession."
    },
    {
      id: "magnificat",
      name: "Magnificat",
      text: "My soul proclaims the greatness of the Lord, my spirit rejoices in God my Savior, for he has looked with favor on his lowly servant. From this day all generations will call me blessed: the Almighty has done great things for me, and holy is his Name. He has mercy on those who fear him in every generation. He has shown the strength of his arm, he has scattered the proud in their conceit. He has cast down the mighty from their thrones, and has lifted up the lowly. He has filled the hungry with good things, and the rich he has sent away empty. He has come to the help of his servant Israel, for he has remembered his promise of mercy, the promise he made to our fathers, to Abraham and his children forever.",
      image: "/prayer-cards/magnificat.jpg",
      caption: "The Annunciation — Fra Angelico, c. 1426",
      history: "Mary's own canticle, recorded in Luke 1:46–55, was spoken during her visit to her relative Elizabeth while pregnant with Jesus. It draws heavily upon Hannah's prayer in 1 Samuel 2:1–10. The Church has prayed the Magnificat daily at Evening Prayer, or Vespers, since ancient times, making it one of the most frequently prayed canticles in Christian history."
    },
    {
      id: "sub-tuum-praesidium",
      name: "Sub Tuum Praesidium",
      text: "We fly to thy protection, O holy Mother of God. Despise not our petitions in our necessities, but deliver us always from all dangers, O glorious and blessed Virgin. Amen.",
      image: "/prayer-cards/sub-tuum.jpg",
      caption: "Madonna della Misericordia — Piero della Francesca, c. 1460–1462",
      history: "The oldest known prayer to the Blessed Virgin Mary, found on a Greek papyrus (Papyrus Rylands 470) dated to around the 3rd century. It already addresses Mary as 'Theotokos' (Mother of God), confirming this title was in popular use long before the Council of Ephesus formally defined it in 431. The faithful have prayed these words for some seventeen centuries."
    },
    {
      id: "the-angelus",
      name: "The Angelus",
      text: "The Angel of the Lord declared unto Mary, and she conceived of the Holy Spirit. Hail Mary... Behold the handmaid of the Lord, be it done unto me according to thy word. Hail Mary... And the Word was made flesh, and dwelt among us. Hail Mary... Pray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ. Pour forth, we beseech thee, O Lord, thy grace into our hearts; that we, to whom the Incarnation of Christ thy Son was made known by the message of an Angel, may by his Passion and Cross be brought to the glory of his Resurrection. Through the same Christ our Lord. Amen.",
      image: "/prayer-cards/angelus.jpg",
      caption: "The Annunciation — Bartolomé Esteban Murillo, c. 1660",
      history: "A devotion commemorating the Incarnation, prayed traditionally three times daily — at 6 a.m., noon, and 6 p.m. — when church bells ring. It takes its name from its opening Latin words, 'Angelus Domini.' The practice dates to at least the 13th century and pairs versicles from Scripture with the Hail Mary."
    },
    {
      id: "regina-caeli",
      name: "Regina Caeli",
      text: "Queen of Heaven, rejoice, alleluia. For He whom you merited to bear, alleluia, has risen as he said, alleluia. Pray for us to God, alleluia. Rejoice and be glad, O Virgin Mary, alleluia, for the Lord has truly risen, alleluia. O God, who gave joy to the world through the Resurrection of thy Son our Lord Jesus Christ, grant we beseech thee that through the intercession of the Virgin Mary his Mother, we may obtain the joys of everlasting life. Through the same Christ our Lord. Amen.",
      image: "/prayer-cards/regina-caeli.jpg",
      caption: "The Glorification of the Virgin — Fra Angelico, c. 1431–1435",
      history: "The Marian antiphon prayed during the Easter season in place of the Angelus, from Holy Saturday through Pentecost. Dating to at least the 12th century, its joyful 'alleluia' refrains celebrate the Resurrection. Tradition holds that its opening lines were heard sung by angels."
    },
    {
      id: "prayer-to-our-lady-of-guadalupe",
      name: "Prayer to Our Lady of Guadalupe",
      text: "Our Lady of Guadalupe, mystical rose, make intercession for the holy Church, protect the Holy Father, help all those who invoke thee in their necessities, and since thou art the ever Virgin Mary and Mother of the true God, obtain for us from thy most holy Son the grace of keeping our faith, sweet hope in the midst of the bitterness of life, burning charity, and the precious gift of final perseverance. Amen.",
      image: "/prayer-cards/guadalupe.jpg",
      caption: "Virgin of Guadalupe — Antonio and Manuel de Arellano, 1691",
      history: "Honors the 1531 apparition of the Virgin Mary to St. Juan Diego on Tepeyac hill near Mexico City, where her image was miraculously imprinted on his tilma. Our Lady of Guadalupe is the patroness of the Americas and one of the most beloved Marian devotions in the world."
    },
  ],
  "Acts": [
    {
      id: "act-of-contrition",
      name: "Act of Contrition",
      text: "O My God, I am heartily sorry for having offended you, and I detest all my sins, because of your just punishments, but most of all, because they offend you, my God, who are all good and deserving of all my love. I firmly resolve, with the help of your grace, to sin no more, and to avoid the near occasions of sin. Amen.",
      image: "/prayer-cards/act-of-contrition.jpg",
      caption: "The Return of the Prodigal Son — Rembrandt, 1669",
      history: "An Act of Contrition expresses sorrow for sin and the resolution to amend one's life. Many forms have developed throughout Catholic history, including traditional and modern versions. During the Sacrament of Confession, the penitent ordinarily makes an Act of Contrition before receiving absolution. It is also commonly taught to children preparing for First Confession."
    },
    {
      id: "act-of-faith",
      name: "Act of Faith",
      text: "O my God, I firmly believe that you are one God in three divine Persons, Father, Son and Holy Spirit. I believe that your divine Son became flesh, died for our sins, and that he will come to judge the living and the dead. I believe these and all the truths that the Holy Catholic Church teaches because you have revealed them, who can neither deceive nor be deceived. Amen.",
      image: "/prayer-cards/act-of-faith.jpg",
      caption: "The Incredulity of Saint Thomas — Caravaggio, c. 1601–1602",
      history: "One of the traditional prayers corresponding to the three theological virtues, this prayer affirms belief in God and in the truths he has revealed through Christ and his Church. The virtues of faith, hope, and charity are rooted in Scripture and were explained systematically by theologians such as Saint Thomas Aquinas. Fixed devotional formulas for these acts became common in later Catholic prayer books and catechesis."
    },
    {
      id: "act-of-hope",
      name: "Act of Hope",
      text: "O my God, relying on your almighty power, infinite mercy and promises, I hope to obtain pardon for my sins, the help of your grace, and life everlasting through the merits of Jesus Christ, my Lord and Redeemer. Amen.",
      image: "/prayer-cards/act-of-hope.jpg",
      caption: "The Resurrection of Christ — Titian, c. 1542–1544",
      history: "The second of the traditional prayers corresponding to the theological virtues, it expresses trust in God's mercy, promises, and saving grace. Rooted in passages such as Romans 5:1–5 and Hebrews 10:23, it places the believer's hope in God and in the merits of Jesus Christ, through whose grace eternal life is promised."
    },
    {
      id: "act-of-love",
      name: "Act of Love",
      text: "O my God, I love you above all things, with my whole heart and soul, because you are all good and worthy of all love. I love my neighbor as myself for the love of you. I forgive all who have injured me and ask pardon of all whom I have injured. Amen.",
      image: "/prayer-cards/act-of-love.jpg",
      caption: "The Good Samaritan — Eugène Delacroix, 1849",
      history: "The third theological virtue prayer, fulfilling the Great Commandment (Matthew 22:37-39) in prayer form. Saint Thomas Aquinas taught that charity is the greatest of the virtues and the form of all virtues. This prayer expresses love of God above all things and love of neighbor as its necessary consequence."
    },
  ],
  "To the Holy Spirit": [
    {
      id: "prayer-to-the-holy-spirit",
      name: "Prayer to the Holy Spirit",
      text: "Breathe into me, Spirit of God, that I may think what is holy. Drive me, Spirit of God, that I may do what is holy. Draw me, Spirit of God, that I may love what is holy. Strengthen me, Spirit of God, that I may preserve what is holy. Guide me, Spirit of God, that I may never lose what is holy. Amen.",
      image: "/prayer-cards/holy-spirit.jpg",
      caption: "The Pentecost — El Greco, c. 1600",
      history: "Traditionally attributed to Saint Augustine of Hippo, although its authorship is uncertain, this prayer uses a meditative series of petitions asking the Holy Spirit to dwell within the believer, guide thoughts and actions, inspire love, give strength, and lead the soul toward holiness."
    },
    {
      id: "come-holy-spirit",
      name: "Come, Holy Spirit",
      text: "Come, Holy Spirit, fill the hearts of your faithful and enkindle in them the fire of your love. Send forth your Spirit and they shall be created, and you shall renew the face of the earth. O God, who has instructed the hearts of your faithful by the light of the Holy Spirit, grant that by the same Holy Spirit we may have a right judgment in all things and evermore rejoice in his consolations. Through Christ Our Lord. Amen.",
      image: "/prayer-cards/come-holy-spirit.jpg",
      caption: "Pentecost — Jean Restout, 1732",
      history: "Known in Latin as Veni Sancte Spiritus, this medieval sequence is traditionally attributed to Pope Innocent III or Archbishop Stephen Langton and dates to around the late twelfth or early thirteenth century. It is sung or recited at Mass on Pentecost. It should not be confused with the ninth-century hymn Veni Creator Spiritus, which is traditionally sung at ordinations, councils, and other important Church gatherings."
    },
    {
      id: "fatima-prayer",
      name: "Fatima Prayer",
      text: "O my Jesus, forgive us our sins, save us from the fire of hell, lead all souls to heaven, especially those who are in most need of Thy mercy.",
      image: "/prayer-cards/fatima.jpg",
      caption: "Our Lady of Fatima — Imp. FB Bonella, Milano",
      history: "According to Sister Lúcia's account of the approved apparitions at Fátima, this prayer was given by Our Lady to Lúcia, Francisco, and Jacinta on July 13, 1917. Our Lady instructed them to pray it after each mystery of the Rosary. It has since become a widely used, though optional, addition after each decade."
    },
  ],
  "Eucharistic": [
    {
      id: "act-of-spiritual-communion",
      name: "Act of Spiritual Communion",
      text: "My Jesus, I believe that you are present in the Most Holy Sacrament. I love you above all things, and I desire to receive you into my soul. Since I cannot at this moment receive you sacramentally, come at least spiritually into my heart. I embrace you as if you were already there and unite myself wholly to you. Never permit me to be separated from you. Amen.",
      image: "/prayer-cards/spiritual-communion.jpg",
      caption: "The Communion of the Apostles — Justus van Gent, c. 1473–1476",
      history: "Composed by St. Alphonsus Liguori (1696–1787), this prayer expresses a desire to receive Christ when one cannot receive Holy Communion sacramentally. St. Thomas Aquinas described spiritual communion as 'an ardent desire to receive Jesus.' Padre Pio prayed it many times throughout the day."
    },
    {
      id: "o-salutaris-hostia",
      name: "O Salutaris Hostia",
      text: "O saving Victim, opening wide the gate of Heaven to man below. Our foes press hard on every side; your aid supply, your strength bestow. To your great name be endless praise, immortal Godhead, One in Three. O grant us endless length of days in our true country. Amen.",
      image: "/prayer-cards/o-salutaris.jpg",
      caption: "The Disputation of the Holy Sacrament — Raphael, c. 1509–1510",
      history: "Written by St. Thomas Aquinas for the Feast of Corpus Christi, established in 1264. It comprises the final two stanzas of his hymn 'Verbum Supernum Prodiens' and is traditionally sung at Benediction of the Blessed Sacrament, most often when the monstrance is placed upon the altar."
    },
    {
      id: "prayer-of-st-thomas-aquinas-before-mass",
      name: "Prayer of St. Thomas Aquinas Before Mass",
      text: "Almighty and eternal God, behold I approach the Sacrament of your only-begotten Son, our Lord Jesus Christ. I come as one sick to the physician of life, as one unclean to the fountain of mercy, as one blind to the light of eternal brightness, as one poor and needy to the Lord of heaven and earth. I ask that you remedy the poverty of my nakedness, kindle the coldness of my heart, bring light to my blindness, and enrich my destitution. Grant that I may receive the bread of angels, the King of kings and Lord of lords, with such reverence and humility, with such contrition and devotion, with such purity and faith, with such purpose and intention, as may be profitable to my soul's salvation. Amen.",
      image: "/prayer-cards/aquinas-before-mass.jpg",
      caption: "Saint Thomas Aquinas — Carlo Crivelli, 1476",
      history: "A preparation prayer composed by the Angelic Doctor (1225–1274), the Church's preeminent theologian. It approaches the Eucharist with profound humility, presenting the soul as sick, unclean, blind, and poor before the physician, fountain, light, and Lord of heaven and earth."
    },
    {
      id: "prayer-of-st-thomas-aquinas-after-mass",
      name: "Prayer of St. Thomas Aquinas After Mass",
      text: "Lord, Father all-powerful and ever-living God, I thank you, for even though I am a sinner, your unprofitable servant, not because of my worth but in the kindness of your mercy, you have fed me with the Precious Body and Blood of your Son, our Lord Jesus Christ. I pray that this Holy Communion may not bring me condemnation and punishment but forgiveness and salvation. May it be a helmet of faith and a shield of good will. May it purify me from evil ways and put an end to my evil passions. May it bring me charity and patience, humility and obedience, and growth in the power to do good. May it be my strong defense against all my enemies, visible and invisible, and the perfect calming of all my evil impulses, bodily and spiritual. May it unite me more closely to you, the one true God, and lead me safely through death to everlasting happiness with you. And I pray that you will lead me, a sinner, to the banquet where you, with your Son and Holy Spirit, are true and perfect light, total fulfillment, everlasting joy, gladness without end, and perfect happiness to your saints. Grant this through Christ our Lord. Amen.",
      image: "/prayer-cards/aquinas-after-mass.jpg",
      caption: "The Triumph of Saint Thomas Aquinas — Benozzo Gozzoli, c. 1471",
      history: "St. Thomas Aquinas's prayer of thanksgiving after receiving Holy Communion. It asks that the Eucharist received be a source of forgiveness, protection, and virtue, uniting the soul ever more closely to God and leading it safely to eternal happiness."
    },
  ],
  "Saint Prayers": [
    {
      id: "prayer-to-st-michael",
      name: "Prayer to St. Michael",
      text: "Saint Michael the Archangel, defend us in battle. Be our defense against the wickedness and snares of the devil. May God rebuke him, we humbly pray; and do thou, O Prince of the heavenly host, by the power of God, thrust into Hell Satan and all the evil spirits who prowl about the world for the ruin of souls. Amen.",
      image: "/prayer-cards/st-michael.jpg",
      caption: "St. Michael the Archangel Defeating Satan — Guido Reni, c. 1630–1635",
      history: "Pope Leo XIII added this prayer to the Leonine Prayers in 1886, two years after those prayers had been instituted for recitation after Low Mass. A later tradition connects its composition with a frightening vision reportedly experienced by the Pope, although the historical evidence for that account is uncertain. The Leonine Prayers ceased to be required after Mass in 1964, though the Prayer to St. Michael remains a popular Catholic prayer for spiritual protection."
    },
    {
      id: "prayer-of-st-francis",
      name: "Prayer of St. Francis",
      text: "Lord, make me an instrument of Your peace. Where there is hatred, let me sow love; where there is injury, pardon; where there is doubt, faith; where there is despair, hope; where there is darkness, light; and where there is sadness, joy. O Divine Master, grant that I may not so much seek to be consoled as to console; to be understood as to understand; to be loved as to love; for it is in giving that we receive; it is in pardoning that we are pardoned; and it is in dying that we are born to eternal life. Amen.",
      image: "/prayer-cards/st-francis.jpg",
      caption: "Saint Francis of Assisi — School of Francisco de Zurbarán, c. 1600–1644",
      history: "Though attributed to Saint Francis of Assisi, this anonymous prayer first appeared in France in 1912 and was popularized during World War I. Its earliest known publication was in the French spiritual magazine La Clochette. Although Saint Francis did not compose it, its message of peace, forgiveness, and self-giving is consistent with Franciscan spirituality."
    },
    {
      id: "prayer-to-st-jude",
      name: "Prayer to St. Jude",
      text: "Most holy apostle, Saint Jude, faithful servant and friend of Jesus, the Church honors and invokes you universally as the patron of hopeless cases, of things almost despaired of. Pray for me, I am so helpless and alone. Make use, I implore you, of that particular privilege given to you, to bring visible and speedy help where help is almost despaired of. Come to my assistance in this great need, that I may receive the consolation and help of heaven in all my necessities, tribulations, and sufferings, particularly (here make your request), and that I may praise God with you and all the elect forever. Amen.",
      image: "/prayer-cards/st-jude.jpg",
      caption: "Saint Jude Thaddaeus — Jusepe de Ribera, c. 1607–1609",
      history: "Saint Jude Thaddaeus was one of the Twelve Apostles and is traditionally identified with Jude, the author named in the New Testament Epistle of Jude. He became widely invoked as the patron saint of desperate or seemingly hopeless causes. One popular explanation is that Christians were once hesitant to invoke him because his name resembled that of Judas Iscariot, although the historical origin of his patronage is uncertain. His feast is celebrated on October 28."
    },
    {
      id: "prayer-to-st-joseph",
      name: "Prayer to St. Joseph",
      text: "To you, O blessed Joseph, do we come in our tribulation, and having implored the help of your most holy Spouse, we confidently invoke your patronage also. Through that charity which bound you to the Immaculate Virgin Mother of God and through the paternal love with which you embraced the Child Jesus, we humbly beg you graciously to regard the inheritance which Jesus Christ has purchased by his Blood, and with your power and strength to aid us in our necessities. O most watchful guardian of the Holy Family, defend the chosen children of Jesus Christ; O most loving father, ward off from us every contagion of error and corrupting influence; O our most mighty protector, be kind to us and from heaven assist us in our struggle with the power of darkness. As once you rescued the Child Jesus from deadly peril, so now protect God's Holy Church from the snares of the enemy and from all adversity; shield, too, each one of us by your constant protection, so that, supported by your example and your aid, we may be able to live piously, to die in holiness, and to obtain eternal happiness in heaven. Amen.",
      image: "/prayer-cards/st-joseph.jpg",
      caption: "Saint Joseph with the Infant Jesus — Guido Reni, c. 1625–1630",
      history: "Composed by Pope Leo XIII in his 1889 encyclical Quamquam pluries. The Holy Father asked that it be added to the Rosary, especially during October. It invokes the foster father of Jesus and patron of the universal Church as a powerful protector against error and the powers of darkness."
    },
    {
      id: "prayer-to-st-anthony",
      name: "Prayer to St. Anthony",
      text: "O Holy St. Anthony, gentlest of Saints, your love for God and charity for His creatures made you worthy, when on earth, to possess miraculous powers. Miracles waited on your word, which you were ever ready to speak for those in trouble or anxiety. Encouraged by this thought, I implore you to obtain for me the favor I seek. The answer to my prayer may require a miracle; even so, you are the Saint of Miracles. O gentle and loving St. Anthony, whose heart was ever full of human sympathy, whisper my petition into the ears of the sweet Infant Jesus, who loved to be folded in your arms, and the gratitude of my heart will ever be yours. Amen.",
      image: "/prayer-cards/st-anthony.jpg",
      caption: "The Apparition of the Child Jesus to Saint Anthony of Padua — attributed to Francisco de Zurbarán, c. 1627–1630",
      history: "Known as the 'Unfailing Prayer to St. Anthony,' this invokes St. Anthony of Padua (1195–1231), the Franciscan 'Wonder Worker' and patron of lost things. Canonized less than a year after his death, he is often depicted holding the Infant Jesus, based on a reported vision."
    },
    {
      id: "prayer-to-st-therese-of-lisieux",
      name: "Prayer to St. Therese of Lisieux",
      text: "O Little Therese of the Child Jesus, please pick for me a rose from the heavenly gardens and send it to me as a message of love. O Little Flower of Jesus, ask God today to grant the favors I now place with confidence in your hands. St. Therese, help me to always believe as you did, in God's great love for me, so that I might imitate your Little Way each day. Amen.",
      image: "/prayer-cards/st-therese.jpg",
      caption: "Saint Thérèse of Lisieux — photograph, c. 1890s",
      history: "Invokes the 'Little Flower' (1873–1897), the Carmelite nun and Doctor of the Church known for her 'Little Way' of spiritual childhood. She promised to 'let fall a shower of roses' from heaven, and roses became the sign of her intercession."
    },
    {
      id: "prayer-to-st-padre-pio",
      name: "Prayer to St. Padre Pio",
      text: "O God, you gave Saint Pio of Pietrelcina, Capuchin priest, the great privilege of participating in a unique way in the passion of your Son, grant me through his intercession the grace which I ardently desire; and above all grant me the grace of living in conformity with the death of Jesus, to arrive at the glory of the resurrection. Glory be to the Father... (three times)",
      image: "/prayer-cards/padre-pio.jpg",
      caption: "Saint Pio of Pietrelcina — photograph",
      history: "Invokes St. Pio of Pietrelcina (1887–1968), the Capuchin friar who bore the stigmata for fifty years. Known for his gifts of healing, reading souls in confession, and profound devotion to the Eucharist, he was canonized by Pope John Paul II in 2002."
    },
    {
      id: "prayer-to-st-christopher",
      name: "Prayer to St. Christopher",
      text: "O Glorious St. Christopher, you inherited a beautiful name, Christ-bearer, as a result of the wonderful legend that while carrying people across a raging stream you also carried the Child Jesus. Teach us to be true Christ-bearers to those who do not know Him. Protect all of us who travel both near and far and petition Jesus to remain with us always. Amen.",
      image: "/prayer-cards/st-christopher.jpg",
      caption: "Saint Christopher Carrying the Christ Child — Hieronymus Bosch, c. 1500",
      history: "Invokes the patron saint of travelers, whose name means 'Christ-bearer.' According to legend, he carried a child across a raging river who grew impossibly heavy — the Christ Child bearing the weight of the world. He is invoked for safe journeys."
    },
    {
      id: "prayer-to-st-ann",
      name: "Prayer to St. Ann",
      text: "Good St. Ann, you were especially chosen by God to be the mother of the most holy Virgin Mary, the Mother of our Savior. By your power with your most pure daughter and with her divine Son, kindly obtain for us the grace and the favor we now seek. Please secure for us also forgiveness of our past sins, the strength to perform faithfully our daily duties and the help we need to persevere in the love of Jesus and Mary. Amen.",
      image: "/prayer-cards/st-ann.jpg",
      caption: "Saint Anne Teaching the Virgin to Read — anonymous Italian artist, 17th century",
      history: "Invokes the mother of the Blessed Virgin Mary and grandmother of Jesus. Though not named in Scripture, ancient tradition honors her as the woman chosen to raise the Mother of God. She is a patroness of mothers, grandmothers, and those seeking to conceive."
    },
    {
      id: "prayer-to-st-gerard",
      name: "Prayer to St. Gerard",
      text: "O good St. Gerard, powerful intercessor before God and Wonder-worker of our day, I call upon thee and seek thy aid. Thou who on earth didst always fulfill God's designs, help me to do the holy will of God. Beseech the Master of Life, from Whom all paternity proceedeth, to render me fruitful in offspring, that I may raise up children to God in this life and heirs to the Kingdom of His glory in the world to come. Amen.",
      image: "/prayer-cards/st-gerard.jpg",
      caption: "Saint Gerard Majella — artist unknown, late 19th–early 20th century",
      history: "Invokes St. Gerard Majella (1726–1755), a Redemptorist lay brother and the patron saint of expectant mothers. A worker of many miracles in his short life, he became associated with motherhood after a miracle involving a safe childbirth, and is invoked for healthy pregnancies."
    },
  ],
  "Devotional": [
    {
      id: "anima-christi",
      name: "Anima Christi",
      text: "Soul of Christ, sanctify me. Body of Christ, save me. Water from the side of Christ, wash me. Passion of Christ, strengthen me. Good Jesus, hear me. Within your wounds, shelter me. From turning away, keep me. From the evil one, protect me. At the hour of my death, call me. Into your presence lead me, to praise you with all your saints, forever and ever. Amen.",
      image: "/prayer-cards/anima-christi.jpg",
      caption: "The Last Supper — Leonardo da Vinci, c. 1495–1498",
      history: "Latin for 'Soul of Christ,' this prayer dates to the early fourteenth century and was already well known long before Saint Ignatius of Loyola included it in his Spiritual Exercises. Medieval manuscripts associated indulgences with its recitation, although later claims connecting its origin or indulgence specifically to Pope John XXII are uncertain. The prayer meditates upon Christ's body, blood, wounds, and Passion through a series of intimate petitions."
    },
    {
      id: "suscipe",
      name: "Suscipe",
      text: "Take, Lord, and receive all my liberty, my memory, my understanding, and my entire will, all that I have and possess. You have given all to me; to you, Lord, I return it. All is yours; dispose of it wholly according to your will. Give me your love and your grace, for this is sufficient for me.",
      image: "/prayer-cards/st-ignatius.jpg",
      caption: "Miracles of Saint Ignatius of Loyola — Peter Paul Rubens, c. 1617–1618",
      history: "Latin for 'Take and receive,' this is Saint Ignatius of Loyola's prayer of total surrender, found near the conclusion of his Spiritual Exercises in the Contemplation to Attain Love. It is considered one of the most complete prayers of self-offering in Christian tradition, surrendering memory, understanding, and will — the three faculties of the soul — entirely to God."
    },
    {
      id: "prayer-before-a-crucifix",
      name: "Prayer Before a Crucifix",
      text: "Behold, O kind and most sweet Jesus, I cast myself upon my knees in your sight, and with the most fervent desire of my soul I pray and beseech you to impress upon my heart lively sentiments of faith, hope, and charity, true repentance for my sins, and a firm purpose of amendment, while with deep affection and grief of soul I ponder within myself and mentally contemplate your five most precious wounds, having before my eyes that which David spoke in prophecy of you, O good Jesus: 'They have pierced my hands and feet, they have numbered all my bones.' Amen.",
      image: "/prayer-cards/christ-crucified.jpg",
      caption: "Crucifixion of Jesus — Juan Sánchez Cotán, after 1603",
      history: "This prayer is traditionally prayed after receiving Holy Communion while kneeling before an image of Christ crucified. It meditates upon Christ's wounds and echoes Psalm 22. Under the Church's current discipline, praying it after Communion before a crucifix carries a partial indulgence; on Fridays during Lent, a plenary indulgence may be obtained under the usual conditions."
    },
  ],
  "Divine Mercy": [
    {
      id: "chaplet-opening-prayer",
      name: "Chaplet Opening Prayer",
      text: "You expired, Jesus, but the source of life gushed forth for souls, and the ocean of mercy opened up for the whole world. O Fount of Life, unfathomable Divine Mercy, envelop the whole world and empty yourself out upon us. O Blood and Water, which gushed forth from the Heart of Jesus as a fountain of mercy for us, I trust in you.",
      image: "/prayer-cards/divine-mercy.jpg",
      caption: "The Merciful Jesus (Divine Mercy) — Eugeniusz Kazimirowski, 1934",
      history: "The Chaplet of Divine Mercy was given by Jesus to St. Faustina Kowalska in the 1930s, recorded in her Diary. The opening prayers meditate on the blood and water that flowed from the pierced side of Christ as the fountain of mercy for the world."
    },
    {
      id: "chaplet-main-prayer",
      name: "Chaplet Main Prayer",
      text: "Eternal Father, I offer you the Body and Blood, Soul and Divinity of your dearly beloved Son, our Lord Jesus Christ, in atonement for our sins and those of the whole world.",
      image: "/prayer-cards/divine-mercy-main.jpg",
      caption: "The Sacred Heart of Jesus — José María Ibarrarán y Ponce, 1896",
      history: "Prayed on the 'Our Father' beads of the Rosary, this offers the Body, Blood, Soul, and Divinity of Christ to the Eternal Father in atonement for the sins of the whole world. Jesus promised St. Faustina great graces to those who recite the chaplet."
    },
    {
      id: "chaplet-decade-prayer",
      name: "Chaplet Decade Prayer",
      text: "For the sake of his sorrowful Passion, have mercy on us and on the whole world.",
      image: "/prayer-cards/divine-mercy-decade.jpg",
      caption: "The Crowning with Thorns — Titian, c. 1540–1543",
      history: "Prayed ten times on the 'Hail Mary' beads, this petition pleads for mercy 'for the sake of His sorrowful Passion.' Christ told St. Faustina that through the chaplet the soul obtains mercy, especially at the hour of death."
    },
    {
      id: "chaplet-closing-prayer",
      name: "Chaplet Closing Prayer",
      text: "Holy God, Holy Mighty One, Holy Immortal One, have mercy on us and on the whole world. Eternal God, in whom mercy is endless and the treasury of compassion inexhaustible, look kindly upon us and increase your mercy in us, that in difficult moments we might not despair nor become despondent, but with great confidence submit ourselves to your holy will, which is Love and Mercy itself.",
      image: "/prayer-cards/divine-mercy-closing.jpg",
      caption: "Christ Pantocrator — Cefalù Cathedral, 1148",
      history: "The threefold 'Holy God, Holy Mighty One, Holy Immortal One' echoes the ancient Trisagion hymn. The concluding prayer asks that, trusting in God's endless mercy, the faithful may never despair but submit always to His holy will."
    },
    {
      id: "o-blood-and-water",
      name: "O Blood and Water",
      text: "O Blood and Water, which gushed forth from the Heart of Jesus as a fountain of mercy for us, I trust in you.",
      image: "/prayer-cards/blood-and-water.jpg",
      caption: "The Martyrdom of Jesus of Nazareth — Aimé-Nicolas Morot, 1883",
      history: "This short aspiration, drawn from St. Faustina's Diary, honors the blood and water that gushed from the Heart of Jesus on the Cross (John 19:34), which the Church has always seen as symbols of the Eucharist and Baptism, the fonts of divine mercy."
    },
  ],
  "Penitential": [
    {
      id: "confiteor",
      name: "Confiteor",
      text: "I confess to almighty God and to you, my brothers and sisters, that I have greatly sinned in my thoughts and in my words, in what I have done and in what I have failed to do, through my fault, through my fault, through my most grievous fault; therefore I ask blessed Mary ever-Virgin, all the Angels and Saints, and you, my brothers and sisters, to pray for me to the Lord our God.",
      image: "/prayer-cards/confiteor.jpg",
      caption: "The Penitent Saint Peter — El Greco, c. 1590–1595",
      history: "The 'I confess' prayer, prayed at the beginning of Mass in the Penitential Act. In acknowledging sin 'through my fault, through my fault, through my most grievous fault,' the faithful ask the whole company of heaven and the gathered Church to pray for them. Its form dates to the early medieval period."
    },
    {
      id: "de-profundis",
      name: "De Profundis",
      text: "Out of the depths I have cried to thee, O Lord: Lord, hear my voice. Let thine ears be attentive to the voice of my supplication. If thou, O Lord, wilt mark iniquities: Lord, who shall stand it? For with thee there is merciful forgiveness: and by reason of thy law, I have waited for thee, O Lord. My soul hath relied on his word: my soul hath hoped in the Lord. From the morning watch even until night, let Israel hope in the Lord. Because with the Lord there is mercy: and with him plentiful redemption. And he shall redeem Israel from all his iniquities.",
      image: "/prayer-cards/de-profundis.jpg",
      caption: "Jonah and the Whale — Pieter Lastman, 1621",
      history: "Psalm 130, one of the seven Penitential Psalms, taking its name from its opening Latin words, 'Out of the depths.' It is prayed especially for the faithful departed and is a profound cry of trust in God's merciful forgiveness from the depths of sorrow and sin."
    },
    {
      id: "te-deum",
      name: "Te Deum",
      text: "You are God: we praise you. You are the Lord: we acclaim you. You are the eternal Father: all creation worships you. To you all angels, all the powers of heaven, cherubim and seraphim, sing in endless praise: Holy, holy, holy Lord, God of power and might, heaven and earth are full of your glory. The glorious company of apostles praise you. The noble fellowship of prophets praise you. The white-robed army of martyrs praise you. Throughout the world the holy Church acclaims you: Father of majesty unbounded, your true and only Son worthy of all worship, and the Holy Spirit advocate and guide. You Christ are the King of glory, the eternal Son of the Father. When you took our flesh to set us free you humbly chose the Virgin's womb. You overcame the sting of death and opened the kingdom of heaven to all believers. You are seated at God's right hand in glory. We believe that you will come to be our judge. Come then Lord and help your people, bought with the price of your own blood, and bring us with your saints to glory everlasting.",
      image: "/prayer-cards/te-deum.jpg",
      caption: "The Adoration of the Holy Trinity — Albrecht Dürer, 1511",
      history: "An ancient hymn of praise traditionally attributed to Saints Ambrose and Augustine in the 4th century. Sung on occasions of great thanksgiving and solemnity, it praises the Father, Son, and Holy Spirit alongside the whole company of heaven — angels, apostles, prophets, and martyrs."
    },
  ],
  "Litany": [
    {
      id: "litany-of-the-saints",
      name: "Litany of the Saints",
      text: "Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us. God the Father of Heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us. Holy Mary, pray for us. Holy Mother of God, pray for us. Holy Virgin of Virgins, pray for us. Saint Michael, pray for us. Saint Gabriel, pray for us. Saint Raphael, pray for us. All you holy Angels and Archangels, pray for us. Saint John the Baptist, pray for us. Saint Joseph, pray for us. All you holy Patriarchs and Prophets, pray for us. Saint Peter, pray for us. Saint Paul, pray for us. Saint Andrew, pray for us. Saint John, pray for us. All you holy Apostles and Evangelists, pray for us. All you holy Disciples of the Lord, pray for us. All you holy Innocents, pray for us. Saint Stephen, pray for us. All you holy Martyrs, pray for us. Saint Gregory, pray for us. Saint Augustine, pray for us. All you holy Bishops and Confessors, pray for us. Saint Benedict, pray for us. Saint Francis, pray for us. All you holy Priests and Levites, pray for us. Saint Mary Magdalene, pray for us. Saint Agnes, pray for us. Saint Cecilia, pray for us. Saint Clare, pray for us. All you holy Virgins and Widows, pray for us. All you holy Saints of God, pray for us. Christ, hear us. Christ, graciously hear us. Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us.",
      image: "/prayer-cards/litany-saints.jpg",
      caption: "The Forerunners of Christ with Saints and Martyrs — Fra Angelico, c. 1423–1424",
      history: "One of the oldest forms of Christian prayer, litanies date to the 5th century in the Eastern Church and were widespread in Rome by the 7th century. The Litany of the Saints is sung at Baptisms, Holy Orders, and the Easter Vigil. It expresses the belief in the Communion of Saints — that the Church on earth, in purgatory, and in heaven are united in prayer."
    },
  ],
}

export default PRAYERS
