RE_KEYWORDS = {
    "Food": ["zomato", "swiggy", "restaurant", "cafe", "food", "pizza", "burger", "hotel", "biryani", "chai", "coffee"],
    "Fuel": ["petrol", "diesel", "fuel", "pump", "hp", "bpcl", "iocl", "shell", "cng"],
    "Shopping": ["amazon", "flipkart", "myntra", "ajio", "mall", "shop", "store", "mart", "bazaar", "retail"],
    "Entertainment": ["netflix", "spotify", "hotstar", "prime", "youtube", "gaming", "movie", "cinema", "theatre", "inox", "pvr"],
    "Travel": ["uber", "ola", "rapido", "irctc", "flight", "bus", "train", "metro", "auto", "cab", "makemytrip", "goibibo"],
    "Health": ["pharmacy", "hospital", "clinic", "doctor", "medicine", "apollo", "medplus", "health", "gym", "fitness"],
    "Bills": ["electricity", "water", "gas", "internet", "wifi", "airtel", "jio", "vi", "bsnl", "recharge", "bill", "emi"],
}


def categorize(merchant: str, notes: str = "") -> str:
    text = f"{merchant} {notes or ''}".lower()
    for category, keywords in RE_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return category
    return "Others"
