"""
Seed the biblical figures for the Seek section.

One figure per topic, only where the match is strong and clear.
Run ONCE from the backend directory:

    source venv/bin/activate
    python3 biblical_figures_data.py
"""

from database import SessionLocal
from models import StruggleBiblicalFigure

FIGURES = {
    # --- GROWTH ---
    "Discernment": {
        "name": "Solomon",
        "description": "When God offered him anything he wished, Solomon asked not for wealth or power but for wisdom to govern his people well. His prayer became the model of discernment.",
        "book_slug": "kings-1",
        "chapter": 3,
    },
    "Wisdom": {
        "name": "Solomon",
        "description": "Renowned throughout the ancient world for a wisdom God himself granted, Solomon's life shows both the height of divine wisdom and what is lost when it is abandoned.",
        "book_slug": "kings-1",
        "chapter": 3,
    },
    "Knowledge": {
        "name": "Daniel",
        "description": "Taken captive to Babylon as a young man, Daniel devoted himself to God and was given understanding of visions and dreams that surpassed all the wise men of the kingdom.",
        "book_slug": "daniel",
        "chapter": 1,
    },

    # --- EMOTIONS ---
    "Anxiety": {
        "name": "Elijah",
        "description": "After his greatest victory he collapsed in fear and exhaustion, fleeing into the desert and asking God to let him die. An angel came twice with food, and God spoke to him not in wind or earthquake but in a still small voice.",
        "book_slug": "kings-1",
        "chapter": 19,
    },
    "Fear": {
        "name": "Gideon",
        "description": "Called by God while hiding from the enemy, Gideon protested that he was the least of his family. Yet God used him to deliver Israel, proving that his strength lay not in himself but in God.",
        "book_slug": "judges",
        "chapter": 6,
    },
    "Sadness": {
        "name": "Jeremiah",
        "description": "Called the weeping prophet, Jeremiah preached to a people who refused to listen, watched his city fall, and poured his grief into the pages of Lamentations. Yet he never stopped trusting God.",
        "book_slug": "lamentations",
        "chapter": 3,
    },
    "Loneliness": {
        "name": "Elijah",
        "description": "Alone in the desert after fleeing Jezebel, he told God he was the only faithful one left. God's answer was to feed him, let him rest, and reveal that he was never as alone as he believed.",
        "book_slug": "kings-1",
        "chapter": 19,
    },
    "Grief": {
        "name": "David",
        "description": "When his son Absalom died, David wept openly and without shame, crying out his name again and again. His grief shows that mourning deeply is not weakness but love.",
        "book_slug": "kings-2",
        "chapter": 18,
    },
    "Anger": {
        "name": "Moses",
        "description": "Great as he was, Moses struggled with anger throughout his life. When the people tested him at Meribah, his fury led him to strike the rock twice rather than speak to it, a moment that cost him dearly.",
        "book_slug": "numbers",
        "chapter": 20,
    },
    "Shame": {
        "name": "Peter",
        "description": "After denying Jesus three times, Peter wept bitterly. But his story did not end there. The risen Christ sought him out personally and restored him with the same question three times: 'Do you love me?'",
        "book_slug": "john",
        "chapter": 21,
    },

    # --- FAITH STRUGGLES ---
    "Doubt": {
        "name": "Thomas",
        "description": "He refused to believe the resurrection without seeing for himself. When Jesus appeared and invited him to touch his wounds, Thomas's doubt became the most profound confession in the Gospels: 'My Lord and my God.'",
        "book_slug": "john",
        "chapter": 20,
    },
    "Despair": {
        "name": "Job",
        "description": "He lost everything and sat in ashes while his friends insisted his suffering was punishment. Job refused to curse God but did not pretend to be fine. God's answer came not as an explanation but as a presence.",
        "book_slug": "job",
        "chapter": 3,
    },
    "Feeling distant from God": {
        "name": "David",
        "description": "The Psalms preserve his raw cries when God felt absent: 'My God, my God, why hast thou forsaken me?' He did not perform contentment. He brought his honest emptiness to God and kept praying.",
        "book_slug": "psalms",
        "chapter": 22,
    },
    "Temptation": {
        "name": "Jesus",
        "description": "Before his public ministry, Jesus was led into the desert and tempted by the devil in every form: comfort, power, and glory. He met each temptation with Scripture and emerged ready to serve.",
        "book_slug": "matthew",
        "chapter": 4,
    },
    "Lukewarmness": {
        "name": "Solomon",
        "description": "The wisest of men drifted. His many wives turned his heart toward other gods, and the kingdom he had built began to fracture. His story is the clearest warning in Scripture of what spiritual indifference costs.",
        "book_slug": "kings-1",
        "chapter": 11,
    },

    # --- SINS & VICES ---
    "Lust": {
        "name": "David",
        "description": "From the roof of his palace he saw Bathsheba and took her, then arranged her husband's death to cover it. Nathan's confrontation and David's Psalm 51 show the full arc: sin, exposure, and the hard road of repentance.",
        "book_slug": "kings-2",
        "chapter": 11,
    },
    "Pride": {
        "name": "Nebuchadnezzar",
        "description": "The most powerful king of his age declared himself the author of his own greatness. God humbled him completely, driving him to live among animals, until he lifted his eyes to heaven and his reason returned.",
        "book_slug": "daniel",
        "chapter": 4,
    },
    "Envy": {
        "name": "Cain",
        "description": "When God accepted Abel's offering and not his, Cain's face fell. God warned him that sin was crouching at the door. He did not heed the warning, and the first murder in Scripture was born of envy.",
        "book_slug": "genesis",
        "chapter": 4,
    },
    "Gluttony": {
        "name": "Esau",
        "description": "Returning from the field famished, Esau sold his entire birthright for a single meal. The writer of Hebrews holds him up as the example of one who traded what was sacred for what was immediate.",
        "book_slug": "genesis",
        "chapter": 25,
    },
    "Sloth": {
        "name": "Jonah",
        "description": "Called to preach to Nineveh, Jonah went the opposite direction and slept in the hull of a ship during a storm. Even after being delivered, he sat outside the city sulking rather than rejoicing at its repentance.",
        "book_slug": "jonah",
        "chapter": 1,
    },
    "Greed": {
        "name": "Gehazi",
        "description": "Servant to the prophet Elisha, Gehazi ran after Naaman in secret and took the gifts his master had refused. The leprosy Elisha had refused to take on Naaman fell on Gehazi and his descendants instead.",
        "book_slug": "kings-2",
        "chapter": 5,
    },
    "Wrath": {
        "name": "Moses",
        "description": "Coming down from Sinai with the tablets of the law, Moses saw the golden calf and smashed the very commandments God had written. His anger was not entirely without cause, but its cost was real.",
        "book_slug": "exodus",
        "chapter": 32,
    },

    # --- LIFE SITUATIONS ---
    "Family conflict": {
        "name": "Joseph",
        "description": "Thrown into a pit by his own brothers and sold into slavery, Joseph spent years separated from his family. Yet when the moment came, he wept and forgave rather than took revenge, seeing God's hand in what they had meant for harm.",
        "book_slug": "genesis",
        "chapter": 45,
    },
    "Relationship trouble": {
        "name": "Ruth",
        "description": "A foreign widow who chose loyalty over convenience, Ruth followed her mother-in-law into an unfamiliar land and people. Her faithfulness in a broken situation became the foundation of an unexpected blessing.",
        "book_slug": "ruth",
        "chapter": 1,
    },
    "Loss": {
        "name": "Naomi",
        "description": "She lost her husband and both sons in a foreign land and returned home asking to be called Mara, meaning bitter. Her honesty about grief did not disqualify her from redemption. It was the beginning of it.",
        "book_slug": "ruth",
        "chapter": 1,
    },
    "Death of a loved one": {
        "name": "Mary and Martha",
        "description": "When their brother Lazarus died, both sisters told Jesus the same thing: if you had been here, he would not have died. Jesus did not correct them. He wept with them before he raised him.",
        "book_slug": "john",
        "chapter": 11,
    },
    "Illness": {
        "name": "Job",
        "description": "Afflicted from head to foot with sores, Job sat in ashes while those closest to him urged him to curse God and die. He refused, and his long suffering became one of Scripture's deepest meditations on faith.",
        "book_slug": "job",
        "chapter": 2,
    },
    "Financial worry": {
        "name": "Elijah",
        "description": "During the famine God sent him to a widow who had only enough flour and oil for one last meal. She shared it anyway, and neither ran out until the famine ended. The story is about trust when resources are gone.",
        "book_slug": "kings-1",
        "chapter": 17,
    },

    # --- VIRTUES ---
    "Humility": {
        "name": "John the Baptist",
        "description": "At the height of his fame, when his disciples were concerned that Jesus was drawing larger crowds, John said only: 'He must increase, but I must decrease.' It is the perfect statement of humility.",
        "book_slug": "john",
        "chapter": 3,
    },
    "Patience": {
        "name": "Abraham",
        "description": "He waited twenty-five years between God's promise of a son and its fulfillment. When he faltered and tried to manufacture the outcome himself, it complicated everything. But he held on, and Isaac was born.",
        "book_slug": "genesis",
        "chapter": 21,
    },
    "Forgiveness": {
        "name": "Joseph",
        "description": "Sold into slavery by his brothers, imprisoned falsely, and forgotten, Joseph had every human reason for bitterness. When he finally revealed himself to them, he wept and said: 'It was not you who sent me here, but God.'",
        "book_slug": "genesis",
        "chapter": 45,
    },
    "Courage": {
        "name": "Esther",
        "description": "Told that she would die for approaching the king uninvited, Esther asked her people to fast for three days, then went anyway. 'If I perish, I perish.' Her courage saved an entire people.",
        "book_slug": "esther",
        "chapter": 4,
    },
    "Faith": {
        "name": "Abraham",
        "description": "He left his homeland not knowing where he was going. He trusted a promise for twenty-five years. He raised the knife over his own son. Hebrews calls him the father of faith because he kept believing when nothing visible supported it.",
        "book_slug": "hebrews",
        "chapter": 11,
    },
    "Resilience": {
        "name": "Paul",
        "description": "Shipwrecked, beaten, imprisoned, and left for dead, Paul wrote his most joyful letter from a prison cell. His resilience was not toughness — it was the conviction that nothing could separate him from the love of Christ.",
        "book_slug": "philippians",
        "chapter": 4,
    },
    "Gratitude": {
        "name": "Mary",
        "description": "When Elizabeth greeted her, Mary broke into the Magnificat, a song of pure thanksgiving that has been prayed every evening in the Church for two thousand years. She gave thanks before the promise was even visible.",
        "book_slug": "luke",
        "chapter": 1,
    },
    "Generosity": {
        "name": "The Widow of Zarephath",
        "description": "With only enough for one last meal, she gave her flour and oil to Elijah first. Her generosity at the edge of starvation is the story Jesus himself cited as the model of giving.",
        "book_slug": "kings-1",
        "chapter": 17,
    },
    "Charity": {
        "name": "The Good Samaritan",
        "description": "He stopped for a stranger his culture taught him to despise, dressed his wounds, paid for his care, and promised to return. Jesus told this story when asked to define the word 'neighbor.'",
        "book_slug": "luke",
        "chapter": 10,
    },
    "Fortitude": {
        "name": "Shadrach, Meshach, and Abednego",
        "description": "Told to bow to the golden statue or be thrown into the furnace, they refused. 'Our God is able to deliver us. But even if he does not, we will not serve your gods.' They were thrown in and came out unburned.",
        "book_slug": "daniel",
        "chapter": 3,
    },
    "Diligence": {
        "name": "Nehemiah",
        "description": "Rebuilding the walls of Jerusalem against open opposition, Nehemiah had his workers build with a tool in one hand and a sword in the other. He refused to be drawn away from the work even by threats.",
        "book_slug": "nehemiah",
        "chapter": 4,
    },
}


def main():
    db = SessionLocal()
    try:
        existing = {
            f.category
            for f in db.query(StruggleBiblicalFigure).all()
        }

        added = skipped = 0
        for category, data in FIGURES.items():
            if category in existing:
                skipped += 1
                continue
            db.add(StruggleBiblicalFigure(
                category=category,
                figure_name=data["name"],
                description=data["description"],
                book_slug=data["book_slug"],
                chapter=data["chapter"],
            ))
            added += 1

        db.commit()
        print(f"Inserted {added} figures. Skipped {skipped} already present.")
        print(f"Total categories covered: {len(FIGURES)}")

    except Exception as e:
        db.rollback()
        print(f"Failed: {type(e).__name__}: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
