// The ten commandments and the questions under each, as used by the
// Examination of Conscience page.
//
// Lifted out of ExaminationOfConscience.jsx so a translation can sit
// beside it, the same way prayers and the rosary work. Each entry has a
// stable id from its Roman numeral, which is what examination.es.js keys
// on - the numerals do not change between languages.

const EXAMINATION = [
  {
    id: "i",
    commandment: "I. I am the Lord your God: you shall not have strange gods before me.",
    questions: [
      "Have I doubted or denied the existence of God?",
      "Have I refused to believe what God has revealed to us through the Catholic Church?",
      "Have I put my faith in superstition, horoscopes, or the occult?",
      "Have I neglected prayer for a long period of time?",
      "Have I received Holy Communion or another sacrament while in a state of mortal sin?",
      "Have I put anything — money, comfort, career, another person — before God in my heart?",
    ]
  },
  {
    id: "ii",
    commandment: "II. You shall not take the name of the Lord your God in vain.",
    questions: [
      "Have I used God's name carelessly, in anger, or as a curse?",
      "Have I spoken irreverently about God, the Virgin Mary, the saints, or sacred things?",
      "Have I broken an oath or vow made in God's name?",
      "Have I blasphemed?",
    ]
  },
  {
    id: "iii",
    commandment: "III. Remember to keep holy the Lord's Day.",
    questions: [
      "Have I missed Mass on a Sunday or Holy Day of Obligation without a serious reason?",
      "Have I arrived late to Mass or left early without necessity?",
      "Have I done unnecessary servile work on Sunday?",
      "Have I allowed unnecessary business or entertainment to crowd out time for God and family?",
    ]
  },
  {
    id: "iv",
    commandment: "IV. Honor your father and your mother.",
    questions: [
      "Have I been disobedient, disrespectful, or ungrateful to my parents?",
      "Have I neglected to care for elderly or sick family members?",
      "Have I failed in my duties to my spouse or children?",
      "Have I failed to provide for my family's material and spiritual needs?",
      "Have I been disobedient to legitimate authority — employers, civil law, the Church?",
    ]
  },
  {
    id: "v",
    commandment: "V. You shall not kill.",
    questions: [
      "Have I taken a human life, or cooperated in doing so?",
      "Have I had an abortion, or encouraged or helped someone to have one?",
      "Have I deliberately endangered my health or life through recklessness?",
      "Have I abused alcohol or drugs?",
      "Have I harbored hatred or desire for revenge against another?",
      "Have I caused serious harm to another through my anger?",
      "Have I given scandal that led another into serious sin?",
    ]
  },
  {
    id: "vi",
    commandment: "VI. You shall not commit adultery.",
    questions: [
      "Have I been unfaithful to my spouse in thought, word, or deed?",
      "Have I engaged in sexual activity outside of marriage?",
      "Have I used artificial contraception?",
      "Have I deliberately looked at impure images or entertainment?",
      "Have I entertained impure thoughts or desires willfully?",
      "Have I been immodest in dress or behavior?",
    ]
  },
  {
    id: "vii",
    commandment: "VII. You shall not steal.",
    questions: [
      "Have I taken what belongs to another?",
      "Have I damaged another's property?",
      "Have I cheated in business dealings, in taxes, or in school?",
      "Have I failed to make restitution for something I took or damaged?",
      "Have I wasted money on gambling or unnecessary luxuries while neglecting obligations?",
    ]
  },
  {
    id: "viii",
    commandment: "VIII. You shall not bear false witness against your neighbor.",
    questions: [
      "Have I told lies?",
      "Have I told lies that damaged another's reputation?",
      "Have I revealed secrets I was obligated to keep?",
      "Have I made rash judgments about another's character?",
      "Have I gossiped or spread rumors?",
      "Have I flattered others insincerely for personal gain?",
    ]
  },
  {
    id: "ix",
    commandment: "IX. You shall not covet your neighbor's wife.",
    questions: [
      "Have I consented to impure thoughts or desires concerning another person?",
      "Have I sought out occasions of impurity?",
      "Have I failed to guard my eyes and imagination against temptation?",
    ]
  },
  {
    id: "x",
    commandment: "X. You shall not covet your neighbor's goods.",
    questions: [
      "Have I been envious of another's success, possessions, or relationships?",
      "Have I been ungrateful for what God has given me?",
      "Have I been greedy or hoarded more than I need while others are in want?",
      "Have I allowed envy to damage my relationship with another?",
    ]
  },
]

export default EXAMINATION
