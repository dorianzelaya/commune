"""
Seed missing saints, prayers, and biblical figures for virtue categories.

Run from backend/:
    source venv/bin/activate
    python3 seed_virtue_extras.py

Idempotent: skips anything already present.
"""

from database import SessionLocal
from models import StruggleSaint, StrugglePrayer, StruggleBiblicalFigure

SAINTS = {
    "Humility": ("St. Thérèse of Lisieux", "She called her way the Little Way: doing small things with great love, never seeking recognition. She died at 24 in obscurity and became a Doctor of the Church."),
    "Charity": ("St. Vincent de Paul", "A French priest who devoted his life to serving the poor, founding hospitals, orphanages, and organizations that still bear his name. He saw Christ in every suffering face."),
    "Patience": ("St. Monica", "She prayed for her son Augustine for seventeen years without seeing any change. Her patience outlasted his resistance, and he became one of the greatest theologians in Church history."),
    "Courage": ("St. Joan of Arc", "A teenage peasant girl who led the French army into battle at the direction of heavenly voices. She was captured, tried for heresy, and burned at the stake at nineteen, never recanting."),
    "Gratitude": ("St. Francis of Assisi", "He gave thanks for everything, including suffering, poverty, and death itself. His Canticle of the Sun is one of the oldest and most beautiful prayers of thanksgiving in Christian history."),
    "Forgiveness": ("St. Maria Goretti", "Stabbed fourteen times by a young man who attacked her, she forgave him from her deathbed. He converted in prison, attended her canonization, and stood beside her mother."),
    "Faith": ("St. Thomas More", "The Lord Chancellor of England refused to sign the Act of Supremacy, knowing it would cost him his life. He went to his execution calling himself the king's good servant, but God's first."),
    "Fortitude": ("St. Paul", "Shipwrecked, beaten, imprisoned, and left for dead multiple times, Paul never stopped preaching. He wrote his most joyful letter from a prison cell."),
    "Prudence": ("St. Thomas Aquinas", "The greatest theological mind of the Middle Ages, he spent his life carefully reasoning through the truths of faith, always distinguishing what is known from what is speculated."),
    "Justice": ("St. Oscar Romero", "Archbishop of El Salvador who spoke out against the murder of the poor when it was dangerous to do so. He was shot while celebrating Mass."),
    "Temperance": ("St. John the Baptist", "From before his birth he was set apart: no wine, no strong drink, a diet of locusts and honey, a life in the desert. His entire existence was an act of temperance in service of something greater."),
    "Chastity": ("St. Maria Goretti", "At eleven years old she resisted an attack and died defending her purity. She is the patron of youth, purity, and victims of rape, and her forgiveness of her attacker is inseparable from her chastity."),
    "Generosity": ("St. Nicholas of Myra", "He secretly gave bags of gold to three poor sisters who could not afford dowries, saving them from destitution. His generosity became the origin of the Santa Claus legend."),
    "Diligence": ("St. Benedict of Nursia", "His rule, Ora et Labora, pray and work, shaped Western monasticism. He built communities where every hour was ordered, every task done as for God, and nothing was wasted."),
    "Resilience": ("St. Paul", "Beaten, stoned, shipwrecked, imprisoned, and abandoned, Paul pressed on. He described himself as hard-pressed but not crushed, perplexed but not despairing, struck down but not destroyed."),
    "Discipline": ("St. Ignatius of Loyola", "A soldier turned mystic who brought military discipline to the spiritual life. His Spiritual Exercises are a rigorous structured retreat still used worldwide five centuries later."),
}

PRAYERS = {
    "Humility": ("Prayer for Humility", "St. Bernard of Clairvaux", "O Jesus, meek and humble of heart, hear me. From the desire of being esteemed, deliver me. From the desire of being loved, deliver me. From the fear of being humiliated, deliver me. That others may be loved more than I, Jesus, grant me the grace to desire it."),
    "Charity": ("Prayer for Charity", "St. Thomas Aquinas", "Grant me, O Lord my God, a heart to love you above all things, and a love of neighbor that flows from you. Let my charity be not in word and tongue only, but in deed and in truth. May I love as you have loved me."),
    "Patience": ("Prayer for Patience", "Traditional", "Lord, grant me the patience to endure what I cannot change, the courage to change what I can, and the wisdom to know the difference. Teach me to wait on you, for those who wait on the Lord shall renew their strength."),
    "Courage": ("Prayer for Courage", "St. Augustine", "Lord, you have made us for yourself, and our heart is restless until it rests in you. Give me courage to follow wherever you lead, to speak when silence would be easier, and to stand when it would be simpler to fall. I trust not in my own strength but in yours."),
    "Gratitude": ("Prayer of Thanksgiving", "Traditional", "Thank you, Lord, for life and health, for friendship and family, for the beauty of creation and the gift of faith. You have given me more than I deserve and more than I can count. May gratitude be the rhythm of my heart this day and every day."),
    "Forgiveness": ("Prayer for the Grace to Forgive", "Traditional", "Lord, you know how hard it is to forgive. I bring before you those who have hurt me and ask for the grace to release them. Free me from bitterness and resentment. Help me to forgive as you have forgiven me, freely and from the heart."),
    "Faith": ("Act of Faith", "Traditional Catholic", "O my God, I firmly believe that you are one God in three divine Persons, Father, Son, and Holy Spirit. I believe that your divine Son became man and died for our sins, and that he will come to judge the living and the dead. I believe these and all the truths which the holy Catholic Church teaches, because you have revealed them, who can neither deceive nor be deceived."),
    "Fortitude": ("Prayer for Strength", "St. Patrick", "Christ with me, Christ before me, Christ behind me. Christ in me, Christ beneath me, Christ above me. Christ on my right, Christ on my left. Christ when I lie down, Christ when I sit down, Christ when I arise. I arise today through the strength of Christ's resurrection."),
    "Prudence": ("Prayer for Wisdom and Prudence", "St. Thomas Aquinas", "Grant me, O Lord my God, a mind to know you, a heart to seek you, wisdom to find you, conduct pleasing to you, faithful perseverance in waiting for you, and a hope of finally embracing you. Amen."),
    "Justice": ("Prayer for Justice", "Traditional", "Lord God, you are justice itself. Give us the courage to defend the poor and the weak, to speak for those who have no voice, and to live with integrity. May your justice flow like a river through all we do, that your kingdom may come on earth as it is in heaven."),
    "Temperance": ("Prayer for Temperance", "Traditional", "Lord, teach me moderation in all things. Where I grasp too tightly, open my hands. Where I desire too much, quiet my heart. Help me to use the good things of this life without being mastered by them, and to find in you alone the satisfaction that nothing else can give."),
    "Chastity": ("Prayer for Purity", "Traditional", "Lord Jesus, you are the purity of the Father made flesh. Cleanse my heart of all that does not honor you. Guard my eyes, my mind, and my desires. Help me to love others as you love them: truly, selflessly, and well. Make me holy as you are holy."),
    "Generosity": ("Prayer for Generosity", "St. Ignatius of Loyola", "Lord, teach me to be generous. Teach me to serve you as you deserve, to give and not to count the cost, to fight and not to heed the wounds, to toil and not to seek for rest, to labor and not to ask for any reward, save that of knowing that I do your holy will."),
    "Diligence": ("Prayer for Diligence", "Traditional", "Lord, you have given each of us work to do. Help me to do it well, without complaint and without cutting corners. Let me see in my daily work an offering to you, and may I never waste the gifts you have entrusted to me. Whatever I do, let me do it as for you."),
    "Resilience": ("Prayer in Suffering", "St. Francis de Sales", "Do not look forward to what might happen tomorrow. The same everlasting Father who cares for you today will take care of you tomorrow and every day. Either he will shield you from suffering, or he will give you unfailing strength to bear it. Be at peace then, and put aside all anxious thoughts."),
    "Discipline": ("Prayer for Self-Mastery", "Traditional", "Lord, help me to master myself before I seek to master anything else. Teach me the discipline of daily prayer, of guarding my thoughts, of ordering my desires. Let me be a good steward of the time and strength you have given me, and may every act of self-discipline be an act of love for you."),
}

FIGURES = {
    "Prudence": ("Abigail", "When her husband Nabal insulted David and provoked him to war, Abigail acted without hesitation — gathering provisions, riding out to meet the army, and defusing the conflict with words of wisdom. David blessed her judgment and she saved her entire household.", "samuel-1", 25),
    "Justice": ("Deborah", "The only female judge in Israel, Deborah settled disputes under her palm tree and led her people to freedom from oppression. She governed with wisdom, acted with courage, and gave the glory of victory to God.", "judges", 4),
    "Discipline": ("John the Baptist", "From his mother's womb he was set apart: no wine, no strong drink, a life in the desert on locusts and honey. His radical self-denial was not austerity for its own sake but preparation for a mission greater than himself.", "mark", 1),
    "Chastity": ("Joseph of Nazareth", "Betrothed to Mary and told by an angel that her child was of the Holy Spirit, Joseph accepted a life of faithful, protective love. He guarded what was entrusted to him without grasping for what was not his.", "matthew", 1),
    "Temperance": ("John the Baptist", "He could have enjoyed the food and comfort of the towns but lived instead in the desert, eating locusts and wild honey. His moderation was total: not because life was bad, but because his purpose demanded it.", "luke", 1),
}


def main():
    db = SessionLocal()
    try:
        saint_existing = {s.category for s in db.query(StruggleSaint).all()}
        prayer_existing = {p.category for p in db.query(StrugglePrayer).all()}
        figure_existing = {f.category for f in db.query(StruggleBiblicalFigure).all()}

        saints_added = prayers_added = figures_added = 0

        for category, (name, desc) in SAINTS.items():
            if category not in saint_existing:
                db.add(StruggleSaint(category=category, saint_name=name, description=desc))
                saints_added += 1

        for category, (pname, attr, text) in PRAYERS.items():
            if category not in prayer_existing:
                db.add(StrugglePrayer(category=category, prayer_name=pname, attribution=attr, text=text))
                prayers_added += 1

        for category, (fname, desc, slug, ch) in FIGURES.items():
            if category not in figure_existing:
                db.add(StruggleBiblicalFigure(
                    category=category, figure_name=fname,
                    description=desc, book_slug=slug, chapter=ch
                ))
                figures_added += 1

        db.commit()
        print(f"Saints inserted: {saints_added}")
        print(f"Prayers inserted: {prayers_added}")
        print(f"Figures inserted: {figures_added}")

    except Exception as e:
        db.rollback()
        print(f"Failed: {type(e).__name__}: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
