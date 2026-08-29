"""
Explicit calendar-name -> Wikipedia-article-title mappings.

The liturgical calendar names saints the way the Roman Missal does, which
often is not what Wikipedia titles the article. No amount of string cleaning
fixes cases like "Saint Vincent, Deacon and Martyr" -> "Vincent of Saragossa",
or feast days that aren't people at all. These are stated outright so they
cannot silently fail.

Where a day commemorates several saints, the FIRST one named in the calendar
entry is used, since that is the one the liturgy leads with.

Keys must match the calendar's `celebration.name` exactly.
"""

SAINT_TITLES = {
    # --- Feasts of the Lord / the Church, not individual people ---
    "The Most Holy Name of Jesus": "Holy Name of Jesus",
    "Transfiguration": "Transfiguration of Jesus",
    "All Souls": "All Souls' Day",
    "Queenship of Blessed Virgin Mary": "Queenship of Mary",
    "Presentation of The Blessed Virgin Mary": "Presentation of Mary",
    "Dedication of the basilicas of Saints Peter and Paul, Apostles": "St. Peter's Basilica",
    "Passion of Saint John the Baptist": "Beheading of John the Baptist",
    # Wikipedia's article is "Assumption of Mary" — no "The", no "Blessed
    # Virgin". The leading article and extra words break both the direct
    # title lookup and the search-scoring logic, which requires every
    # significant word in the calendar name to appear in the candidate
    # title, and the real article doesn't contain "blessed" or "virgin".
    "The Assumption of the Blessed Virgin Mary": "Assumption of Mary",

    # --- Wikipedia uses a different name for the same person ---
    "Saint Apollinaris": "Apollinaris of Ravenna",
    "Saint James, Apostle": "James the Great",
    "Saint Bruno, Priest": "Bruno of Cologne",
    "Saint John of Kenty, Priest": "John Cantius",
    "Saint Barnabas the Apostle": "Barnabas",
    "Saint Clare, Virgin": "Clare of Assisi",
    "Saint Maximilian Mary Kolbe, Priest and Martyr": "Maximilian Kolbe",
    "Saint Jean Vianney (the Cure of Ars), Priest": "John Vianney",
    "Saint Pio of Pietrelcina (Padre Pio), Priest": "Padre Pio",
    "Saint Paul Miki and Companions, Martyrs": "Paul Miki",
    "Saint Charles Lwanga and Companions, Martyrs": "Charles Lwanga",
    "Saints Charles Lwanga and Companions, Martyrs": "Charles Lwanga",
    "Saint Andrew Dung-Lac and Companions, Martyrs": "Andrew Dũng-Lạc",
    "Saint Christopher Magallanes and Companions, Martyrs": "Cristóbal Magallanes Jara",
    "Saints Augustine Zhao Rong, Priest, and Companions, Martyrs": "Augustine Zhao Rong",
    "Saint Margaret of Scotland/Saint Gertrude the Great, Virgin": "Saint Margaret of Scotland",

    # --- The calendar entry lists two or more saints ---
    "Saints Fabian, Pope, and Sebastian, Martyrs": "Pope Fabian",
    "Saints Perpetua and Felicity, Martyrs": "Perpetua and Felicity",
    "Saints Pontian, Pope and Hippolytus, Priest, Martyrs": "Pope Pontian",
    "Saints Michael, Gabriel and Raphael, Archangels": "Michael (archangel)",
    "Saints Simon and Jude, Apostles": "Simon the Zealot",
    "Saints Basil the Great and Gregory Nazianzen, Bishops and Doctors": "Basil of Caesarea",
    "Saints Timothy and Titus, Bishops": "Saint Timothy",
    "Saints Cyril, Monk and Methodius, Bishop": "Saints Cyril and Methodius",
    "Saints Cornelius, Pope, and Cyprian, Bishop, Martyrs": "Pope Cornelius",
    "Saint Louis/Saint Joseph of Calasanz, Priest": "Louis IX of France",
    "Saint Denis and Companions Martyrs/Saint John Leonardi, Priest": "Denis of Paris",
    "Saint Hedwig, Religious/Saint Margaret Mary Alacoque, Virgin": "Hedwig of Silesia",
    "Saints Jean de Brebeuf and Isaac Jogues, Priests and Companions, Martyrs/Saint Paul of the Cross, Priest": "Jean de Brébeuf",

    # --- The calendar's own data is wrong here ---
    # July 13 is Henry II, Holy Roman Emperor. The calendar labels him
    # "Bishop and Martyr", which describes a different Henry entirely.
    "Saint Henry, Bishop and Martyr": "Henry II, Holy Roman Emperor",
}


def lookup_title(calendar_name: str):
    """Return an explicit Wikipedia title for this calendar entry, or None."""
    if not calendar_name:
        return None
    return SAINT_TITLES.get(calendar_name.strip())