"""
Ingredient Substitution Database (T127)
Phase 9: Conversational Chef AI — 100+ common substitutions with Halal compliance enforcement.

Architectural decisions:
  - Halal filter: blocklist-first (deterministic). Entries marked halal_concern=True are
    BLOCKED unless the query explicitly requests non-halal content (never permitted).
  - Structure: SUBSTITUTIONS dict keyed by normalized ingredient name.
  - Each entry contains: alternatives list, ratio, note, halal_concern flag.
  - Used by ChefAIService to answer "What can I substitute for X?" without an LLM call,
    improving latency and determinism.
"""
from typing import Dict, List, Optional
from dataclasses import dataclass, field


# ─── Halal Blocklist ────────────────────────────────────────────────────────
# Ingredients that are haram (forbidden) under Islamic law.
# Chef AI will NEVER suggest these as substitutions or include them in responses
# unless the Halal filter is explicitly disabled (not permitted in this MVP).
HALAL_BLOCKLIST: frozenset = frozenset({
    "pork", "ham", "bacon", "lard", "prosciutto", "pancetta", "chorizo",
    "salami", "pepperoni", "pork belly", "pork rinds", "pork shoulder",
    "wine", "red wine", "white wine", "beer", "alcohol", "vodka", "rum",
    "whiskey", "brandy", "sake", "mirin", "sherry", "port",
    "wine vinegar", "red wine vinegar", "white wine vinegar",
    "gelatin", "pork gelatin", "lard shortening",
})


@dataclass
class SubstitutionEntry:
    """
    A single ingredient substitution record.

    Attributes:
        alternatives: List of substitute ingredients, each with a ratio string and note.
        category: Broad category for grouping (e.g. 'dairy', 'egg', 'fat').
        halal_concern: If True, the *original* ingredient is haram and a Halal-safe
                       alternative is strongly recommended instead.
    """
    alternatives: List[Dict]  # [{"name": str, "ratio": str, "note": str}]
    category: str
    halal_concern: bool = False


# ─── Master Substitution Database ───────────────────────────────────────────
# Keys are lowercase normalized ingredient names.
# All alternatives are vetted for Halal compliance.
SUBSTITUTIONS: Dict[str, SubstitutionEntry] = {

    # ── DAIRY ────────────────────────────────────────────────────────────────
    "buttermilk": SubstitutionEntry(
        category="dairy",
        alternatives=[
            {"name": "milk + lemon juice", "ratio": "1 cup milk + 1 tbsp lemon juice (let sit 5 min)", "note": "Best all-purpose substitute; creates same acidity"},
            {"name": "milk + white vinegar", "ratio": "1 cup milk + 1 tbsp white vinegar (let sit 5 min)", "note": "Slightly sharper flavor"},
            {"name": "plain yogurt", "ratio": "3/4 cup yogurt + 1/4 cup water", "note": "Richer result; works well in baking"},
            {"name": "sour cream + water", "ratio": "3/4 cup sour cream + 1/4 cup water", "note": "Very thick; thin if needed"},
            {"name": "kefir", "ratio": "1:1", "note": "Closest in flavor and texture"},
        ]
    ),
    "heavy cream": SubstitutionEntry(
        category="dairy",
        alternatives=[
            {"name": "coconut cream", "ratio": "1:1", "note": "Dairy-free; adds slight coconut flavor"},
            {"name": "evaporated milk", "ratio": "1:1", "note": "Lower fat; use for sauces, not whipping"},
            {"name": "whole milk + butter", "ratio": "3/4 cup milk + 1/4 cup melted butter", "note": "Good for cooking, not for whipping"},
            {"name": "cashew cream", "ratio": "1:1 (blend soaked cashews with water)", "note": "Vegan and rich; neutral flavor"},
        ]
    ),
    "milk": SubstitutionEntry(
        category="dairy",
        alternatives=[
            {"name": "oat milk", "ratio": "1:1", "note": "Closest to cow's milk in baking; slightly sweet"},
            {"name": "almond milk", "ratio": "1:1", "note": "Lower protein; avoid in custards"},
            {"name": "soy milk", "ratio": "1:1", "note": "Highest protein among plant milks; best for baking"},
            {"name": "coconut milk (canned, full fat)", "ratio": "1:1", "note": "Richer; adds coconut flavor"},
            {"name": "rice milk", "ratio": "1:1", "note": "Thinnest; avoid in cream sauces"},
        ]
    ),
    "sour cream": SubstitutionEntry(
        category="dairy",
        alternatives=[
            {"name": "plain Greek yogurt", "ratio": "1:1", "note": "Best substitute; similar tang and texture"},
            {"name": "plain yogurt", "ratio": "1:1", "note": "Thinner; drain through cheesecloth if needed"},
            {"name": "labneh", "ratio": "1:1", "note": "Strained yogurt; richer and thicker"},
            {"name": "crème fraîche", "ratio": "1:1", "note": "Milder tang; doesn't curdle when heated"},
        ]
    ),
    "cream cheese": SubstitutionEntry(
        category="dairy",
        alternatives=[
            {"name": "labneh", "ratio": "1:1", "note": "Tangier; excellent in Middle Eastern-style recipes"},
            {"name": "ricotta", "ratio": "1:1", "note": "Lighter and grainier; best in baked dishes"},
            {"name": "mascarpone", "ratio": "1:1", "note": "Richer and less tangy"},
            {"name": "tofu (firm, blended)", "ratio": "1:1", "note": "Vegan; add lemon juice for tang"},
        ]
    ),
    "butter": SubstitutionEntry(
        category="fat",
        alternatives=[
            {"name": "ghee", "ratio": "1:1", "note": "Higher smoke point; richer flavor; Halal-certified preferred"},
            {"name": "coconut oil", "ratio": "1:1", "note": "Solid at room temperature; adds slight coconut note"},
            {"name": "olive oil", "ratio": "3/4 cup per 1 cup butter", "note": "For sautéing only; not for baking pastry"},
            {"name": "vegetable oil", "ratio": "3/4 cup per 1 cup butter", "note": "Neutral; good for moist cakes"},
            {"name": "avocado", "ratio": "1:1 (mashed)", "note": "For brownies/dense baked goods; adds creaminess"},
            {"name": "applesauce (unsweetened)", "ratio": "1:1", "note": "Reduces fat; best in muffins and quick breads"},
        ]
    ),

    # ── EGGS ─────────────────────────────────────────────────────────────────
    "egg": SubstitutionEntry(
        category="egg",
        alternatives=[
            {"name": "flax egg", "ratio": "1 tbsp ground flaxseed + 3 tbsp water (let sit 5 min)", "note": "Best for dense baked goods; adds earthy flavor"},
            {"name": "chia egg", "ratio": "1 tbsp chia seeds + 3 tbsp water (let sit 10 min)", "note": "Similar to flax egg; slightly more gelatinous"},
            {"name": "banana (mashed)", "ratio": "1/4 cup mashed banana per egg", "note": "Adds sweetness and banana flavor; good in muffins"},
            {"name": "applesauce", "ratio": "1/4 cup per egg", "note": "Neutral binder; good in muffins and cakes"},
            {"name": "aquafaba", "ratio": "3 tbsp per egg", "note": "Liquid from canned chickpeas; best for meringues/macarons"},
            {"name": "silken tofu (blended)", "ratio": "1/4 cup per egg", "note": "Dense baked goods; quiches"},
            {"name": "yogurt", "ratio": "1/4 cup per egg", "note": "Adds moisture and tang"},
        ]
    ),
    "egg yolk": SubstitutionEntry(
        category="egg",
        alternatives=[
            {"name": "extra whole egg", "ratio": "1 yolk = 1/2 whole egg", "note": "Use for richness in custards"},
            {"name": "coconut milk (full fat)", "ratio": "2 tbsp per yolk", "note": "Dairy-free richness"},
        ]
    ),
    "egg white": SubstitutionEntry(
        category="egg",
        alternatives=[
            {"name": "aquafaba", "ratio": "2 tbsp per egg white", "note": "Best for meringues and macarons"},
            {"name": "agar powder + water", "ratio": "1 tbsp agar + 1 tbsp water, whipped", "note": "For structure in baked goods"},
        ]
    ),

    # ── FLOUR & STARCHES ─────────────────────────────────────────────────────
    "all-purpose flour": SubstitutionEntry(
        category="starch",
        alternatives=[
            {"name": "bread flour", "ratio": "1:1", "note": "Higher protein; chewier texture"},
            {"name": "whole wheat flour", "ratio": "1:1 (may need more liquid)", "note": "Denser; nuttier flavor"},
            {"name": "almond flour", "ratio": "1:1 (add 1 extra egg)", "note": "Gluten-free; moister, denser result"},
            {"name": "oat flour", "ratio": "1:1", "note": "Gluten-free; slightly gummy; best in pancakes"},
            {"name": "rice flour", "ratio": "7/8 cup per 1 cup", "note": "Lighter; good in tempura batters"},
            {"name": "chickpea flour (besan)", "ratio": "1:1", "note": "High protein; nutty; great in savory dishes"},
            {"name": "cornstarch (as thickener)", "ratio": "1 tbsp per 2 tbsp flour", "note": "For sauces and gravies only; not for baking"},
        ]
    ),
    "cornstarch": SubstitutionEntry(
        category="starch",
        alternatives=[
            {"name": "arrowroot powder", "ratio": "1:1", "note": "Clearer finish; don't use with dairy"},
            {"name": "tapioca starch", "ratio": "2 tbsp per 1 tbsp cornstarch", "note": "Chewier texture; great in pie fillings"},
            {"name": "potato starch", "ratio": "1:1", "note": "Neutral flavor; good in gravies"},
            {"name": "all-purpose flour", "ratio": "2 tbsp per 1 tbsp cornstarch", "note": "Slightly cloudy; good in gravies"},
        ]
    ),

    # ── SUGARS & SWEETENERS ──────────────────────────────────────────────────
    "white sugar": SubstitutionEntry(
        category="sweetener",
        alternatives=[
            {"name": "brown sugar", "ratio": "1:1", "note": "Adds molasses flavor; more moisture"},
            {"name": "honey", "ratio": "3/4 cup per 1 cup sugar (reduce liquid by 1/4 cup)", "note": "Sweeter; adds floral notes; lower oven temp by 25°F"},
            {"name": "maple syrup", "ratio": "3/4 cup per 1 cup sugar (reduce liquid by 3 tbsp)", "note": "Distinct flavor; best in pancakes and muffins"},
            {"name": "coconut sugar", "ratio": "1:1", "note": "Lower GI; caramel notes; slight moisture retention"},
            {"name": "date sugar", "ratio": "1:1", "note": "Doesn't dissolve well; best in dry applications"},
        ]
    ),
    "brown sugar": SubstitutionEntry(
        category="sweetener",
        alternatives=[
            {"name": "white sugar + molasses", "ratio": "1 cup white sugar + 1 tbsp molasses", "note": "Exact replica of brown sugar"},
            {"name": "coconut sugar", "ratio": "1:1", "note": "Similar caramel notes; less moisture"},
            {"name": "muscovado sugar", "ratio": "1:1", "note": "Stronger molasses flavor; very moist"},
        ]
    ),
    "honey": SubstitutionEntry(
        category="sweetener",
        alternatives=[
            {"name": "maple syrup", "ratio": "1:1", "note": "Thinner; distinct maple flavor"},
            {"name": "agave nectar", "ratio": "1:1", "note": "Neutral flavor; very sweet"},
            {"name": "date syrup", "ratio": "1:1", "note": "Rich caramel-like flavor; popular in Middle Eastern cuisine"},
            {"name": "molasses", "ratio": "3/4 cup per 1 cup honey", "note": "Very strong flavor; use sparingly"},
        ]
    ),

    # ── OILS & FATS ──────────────────────────────────────────────────────────
    "olive oil": SubstitutionEntry(
        category="fat",
        alternatives=[
            {"name": "avocado oil", "ratio": "1:1", "note": "Higher smoke point; neutral flavor; great for high-heat cooking"},
            {"name": "sunflower oil", "ratio": "1:1", "note": "Neutral; good for frying"},
            {"name": "vegetable oil", "ratio": "1:1", "note": "Neutral; good all-purpose substitute"},
            {"name": "ghee", "ratio": "3/4 cup per 1 cup oil", "note": "Richer; adds buttery flavor"},
        ]
    ),
    "vegetable oil": SubstitutionEntry(
        category="fat",
        alternatives=[
            {"name": "canola oil", "ratio": "1:1", "note": "Very neutral; good for baking and frying"},
            {"name": "sunflower oil", "ratio": "1:1", "note": "Light flavor; high smoke point"},
            {"name": "avocado oil", "ratio": "1:1", "note": "Best for high-heat; mild flavor"},
            {"name": "melted coconut oil", "ratio": "1:1", "note": "Adds slight coconut flavor when used in large amounts"},
            {"name": "applesauce", "ratio": "1:1 (in baking only)", "note": "Fat-free option; adds moisture"},
        ]
    ),

    # ── ACIDS & VINEGARS ─────────────────────────────────────────────────────
    "lemon juice": SubstitutionEntry(
        category="acid",
        alternatives=[
            {"name": "lime juice", "ratio": "1:1", "note": "Slightly more bitter; works in most recipes"},
            {"name": "white vinegar", "ratio": "1/2 tbsp per 1 tbsp lemon juice", "note": "More acidic; use in marinades and dressings"},
            {"name": "apple cider vinegar", "ratio": "1/2 tbsp per 1 tbsp lemon juice", "note": "Fruity undertone; good in dressings"},
            {"name": "orange juice", "ratio": "1:1", "note": "Less acidic; sweeter; good in desserts"},
            {"name": "tamarind paste + water", "ratio": "1 tsp paste + 2 tsp water per 1 tbsp", "note": "Deeper sour flavor; popular in South Asian cuisine"},
        ]
    ),
    "white vinegar": SubstitutionEntry(
        category="acid",
        alternatives=[
            {"name": "apple cider vinegar", "ratio": "1:1", "note": "Slightly fruity; good in dressings and marinades"},
            {"name": "lemon juice", "ratio": "2 tbsp per 1 tbsp vinegar", "note": "Milder acidity; adds citrus note"},
            {"name": "rice vinegar", "ratio": "1:1", "note": "Milder and sweeter; great in Asian dishes"},
        ]
    ),

    # ── PROTEINS ─────────────────────────────────────────────────────────────
    "chicken breast": SubstitutionEntry(
        category="protein",
        alternatives=[
            {"name": "chicken thighs", "ratio": "1:1", "note": "Juicier and more forgiving of overcooking"},
            {"name": "turkey breast", "ratio": "1:1", "note": "Leaner; drier; cook to 165°F"},
            {"name": "firm tofu", "ratio": "1:1 (press and marinate)", "note": "Vegan; absorbs flavors well when marinated"},
            {"name": "chickpeas", "ratio": "1 can (400g) per 300g chicken", "note": "Vegan; great in curries and stews"},
            {"name": "jackfruit (young, canned in brine)", "ratio": "1:1 (shredded)", "note": "Vegan; fibrous texture mimics pulled meat"},
        ]
    ),
    "ground beef": SubstitutionEntry(
        category="protein",
        alternatives=[
            {"name": "ground lamb", "ratio": "1:1", "note": "Richer flavor; common in Middle Eastern cuisine; ensure Halal-certified"},
            {"name": "ground chicken", "ratio": "1:1", "note": "Leaner; lighter flavor"},
            {"name": "ground turkey", "ratio": "1:1", "note": "Very lean; add a little olive oil to prevent dryness"},
            {"name": "lentils (cooked)", "ratio": "1 cup lentils per 200g beef", "note": "Vegan; great in Bolognese and tacos"},
            {"name": "mushrooms (finely chopped)", "ratio": "1:1 by weight", "note": "Vegan; adds umami; combine with lentils for best texture"},
        ]
    ),

    # ── HERBS & AROMATICS ────────────────────────────────────────────────────
    "fresh garlic": SubstitutionEntry(
        category="aromatics",
        alternatives=[
            {"name": "garlic powder", "ratio": "1/4 tsp per clove", "note": "Weaker flavor; add at start of cooking"},
            {"name": "garlic paste", "ratio": "1/2 tsp per clove", "note": "More pungent; use in marinades"},
            {"name": "dried minced garlic", "ratio": "1/2 tsp per clove", "note": "Rehydrate in water for 15 min first"},
            {"name": "shallots", "ratio": "1 small shallot per 2 cloves", "note": "Milder and sweeter; different but complementary"},
        ]
    ),
    "fresh ginger": SubstitutionEntry(
        category="aromatics",
        alternatives=[
            {"name": "ground ginger", "ratio": "1/4 tsp per 1 tsp fresh", "note": "Less pungent; add early in cooking"},
            {"name": "ginger paste", "ratio": "1:1", "note": "Closest substitute; slightly more concentrated"},
            {"name": "galangal", "ratio": "1:1", "note": "Pinier and more citrusy; used in Thai cuisine"},
        ]
    ),
    "fresh cilantro": SubstitutionEntry(
        category="herb",
        alternatives=[
            {"name": "fresh parsley", "ratio": "1:1", "note": "Milder; no controversy; different but fresh"},
            {"name": "fresh mint", "ratio": "1:1 (use sparingly)", "note": "Very different; works in South Asian dishes"},
            {"name": "basil", "ratio": "1:1", "note": "Sweet; works in tomato-based dishes"},
            {"name": "dried coriander leaves", "ratio": "1/3 of fresh amount", "note": "Weaker; use as garnish only"},
        ]
    ),

    # ── LIQUIDS ──────────────────────────────────────────────────────────────
    "coconut milk": SubstitutionEntry(
        category="liquid",
        alternatives=[
            {"name": "evaporated milk", "ratio": "1:1", "note": "Richer; no coconut flavor; not dairy-free"},
            {"name": "cashew cream", "ratio": "1:1", "note": "Neutral; very rich; vegan"},
            {"name": "oat milk (full fat)", "ratio": "1:1", "note": "Lighter; less rich"},
            {"name": "almond milk + coconut extract", "ratio": "1 cup almond milk + 1/4 tsp coconut extract", "note": "Light coconut flavor; dairy-free"},
        ]
    ),
    "stock (chicken)": SubstitutionEntry(
        category="liquid",
        alternatives=[
            {"name": "vegetable stock", "ratio": "1:1", "note": "Vegan; slightly lighter flavor"},
            {"name": "mushroom broth", "ratio": "1:1", "note": "Deeper umami; good in gravies"},
            {"name": "water + soy sauce", "ratio": "1 cup water + 1 tsp soy sauce", "note": "Emergency substitute; adds umami"},
            {"name": "water", "ratio": "1:1", "note": "Season generously when using plain water"},
        ]
    ),
    "stock (beef)": SubstitutionEntry(
        category="liquid",
        alternatives=[
            {"name": "lamb stock", "ratio": "1:1", "note": "Halal-friendly; richer flavor"},
            {"name": "vegetable stock", "ratio": "1:1", "note": "Lighter; add soy sauce for depth"},
            {"name": "mushroom broth", "ratio": "1:1", "note": "Best vegan substitute for richness"},
        ]
    ),

    # ── BAKING AGENTS ────────────────────────────────────────────────────────
    "baking powder": SubstitutionEntry(
        category="leavening",
        alternatives=[
            {"name": "baking soda + cream of tartar", "ratio": "1/4 tsp baking soda + 1/2 tsp cream of tartar per 1 tsp baking powder", "note": "Exact chemical equivalent"},
            {"name": "baking soda + lemon juice", "ratio": "1/4 tsp baking soda + 1 tsp lemon juice per 1 tsp baking powder", "note": "Adjust liquid in recipe accordingly"},
            {"name": "baking soda + plain yogurt", "ratio": "1/4 tsp baking soda per 1 tsp baking powder (add 1/2 cup yogurt)", "note": "For pancakes and quick breads"},
            {"name": "self-rising flour", "ratio": "Replace 1 cup flour + 1 tsp baking powder with 1 cup self-rising flour (remove salt)", "note": "Easiest substitution for baked goods"},
        ]
    ),
    "baking soda": SubstitutionEntry(
        category="leavening",
        alternatives=[
            {"name": "baking powder", "ratio": "3 tsp per 1 tsp baking soda", "note": "Less effective; recipe may be slightly denser"},
            {"name": "potassium bicarbonate", "ratio": "1:1", "note": "Sodium-free; exact substitute"},
            {"name": "baker's ammonia", "ratio": "1:1", "note": "Only for thin, crispy cookies; smells during baking"},
        ]
    ),
    "yeast (active dry)": SubstitutionEntry(
        category="leavening",
        alternatives=[
            {"name": "instant yeast", "ratio": "25% less (0.75 tsp per 1 tsp active dry)", "note": "No need to proof; add directly to flour"},
            {"name": "baking powder", "ratio": "1 tsp per cup flour (no rise time)", "note": "Quick breads only; no yeast flavor"},
            {"name": "sourdough starter", "ratio": "1 cup starter per 2.25 tsp yeast (reduce flour by 1/2 cup, liquid by 1/4 cup)", "note": "Long fermentation; complex flavor"},
        ]
    ),

    # ── CONDIMENTS & SAUCES ──────────────────────────────────────────────────
    "soy sauce": SubstitutionEntry(
        category="condiment",
        alternatives=[
            {"name": "tamari", "ratio": "1:1", "note": "Gluten-free; richer and less salty"},
            {"name": "coconut aminos", "ratio": "1:1 (slightly sweeter)", "note": "Soy-free; lower sodium; slightly sweet"},
            {"name": "worcestershire sauce (Halal)", "ratio": "1:1", "note": "Different flavor profile; check label for Halal certification"},
            {"name": "fish sauce", "ratio": "1/2 tsp per 1 tbsp soy sauce", "note": "Stronger umami; check Halal certification"},
        ]
    ),
    "tomato paste": SubstitutionEntry(
        category="condiment",
        alternatives=[
            {"name": "tomato sauce", "ratio": "3 tbsp per 1 tbsp paste (reduce other liquids)", "note": "Simmer to concentrate if needed"},
            {"name": "crushed tomatoes (strained)", "ratio": "1/4 cup per 1 tbsp paste", "note": "Simmer down to concentrate flavor"},
            {"name": "sun-dried tomatoes (blended)", "ratio": "2 tbsp per 1 tbsp paste", "note": "Intense flavor; soak in water first"},
            {"name": "ketchup", "ratio": "3 tbsp per 1 tbsp paste", "note": "Sweeter; use only as last resort"},
        ]
    ),
    "tahini": SubstitutionEntry(
        category="condiment",
        alternatives=[
            {"name": "sunflower seed butter", "ratio": "1:1", "note": "Nut-free; similar consistency; slightly sweeter"},
            {"name": "peanut butter (unsweetened)", "ratio": "1:1", "note": "Stronger flavor; works in sauces and dressings"},
            {"name": "almond butter", "ratio": "1:1", "note": "Milder than peanut butter; close texture"},
            {"name": "sesame oil (toasted)", "ratio": "1 tsp per 1 tbsp tahini (add liquid)", "note": "More liquid; intense sesame flavor"},
        ]
    ),

    # ── CHEESES ──────────────────────────────────────────────────────────────
    "parmesan": SubstitutionEntry(
        category="dairy",
        alternatives=[
            {"name": "pecorino romano", "ratio": "1:1", "note": "Saltier and sharper; use slightly less"},
            {"name": "grana padano", "ratio": "1:1", "note": "Milder; close substitute"},
            {"name": "nutritional yeast", "ratio": "1:1", "note": "Vegan; nutty and cheesy flavor; add to pasta and soups"},
            {"name": "aged manchego", "ratio": "1:1 (grated)", "note": "Different but works in most Italian dishes"},
        ]
    ),
    "mozzarella": SubstitutionEntry(
        category="dairy",
        alternatives=[
            {"name": "string cheese", "ratio": "1:1 (shredded)", "note": "Emergency substitute; mild flavor"},
            {"name": "provolone", "ratio": "1:1", "note": "Slightly stronger; melts well"},
            {"name": "vegan mozzarella", "ratio": "1:1", "note": "Plant-based; check melt properties"},
            {"name": "fresh cheese (fromage frais)", "ratio": "1:1 (for fresh applications)", "note": "Very mild; no melt; use in salads"},
        ]
    ),

    # ── SPICES ───────────────────────────────────────────────────────────────
    "cumin": SubstitutionEntry(
        category="spice",
        alternatives=[
            {"name": "caraway seeds", "ratio": "1:1", "note": "Similar earthiness; slightly anise-like"},
            {"name": "coriander", "ratio": "1:1", "note": "Related; citrusy; milder"},
            {"name": "chili powder", "ratio": "1:1", "note": "Contains cumin + other spices; adds heat"},
            {"name": "garam masala", "ratio": "1/2 tsp per 1 tsp cumin", "note": "Complex blend; use less"},
        ]
    ),
    "paprika": SubstitutionEntry(
        category="spice",
        alternatives=[
            {"name": "cayenne pepper", "ratio": "1/4 tsp per 1 tsp paprika", "note": "Much hotter; use very sparingly"},
            {"name": "chili powder", "ratio": "1:1", "note": "Slightly different blend; adds heat"},
            {"name": "ancho chili powder", "ratio": "1:1", "note": "Smoky and mild; closest to smoked paprika"},
            {"name": "tomato powder", "ratio": "1:1", "note": "For color only; no heat"},
        ]
    ),
    "turmeric": SubstitutionEntry(
        category="spice",
        alternatives=[
            {"name": "saffron", "ratio": "1/4 tsp saffron steeped in 2 tbsp water", "note": "Expensive; far more complex flavor; use for color"},
            {"name": "curry powder", "ratio": "1:1", "note": "Contains turmeric + other spices"},
            {"name": "annatto powder", "ratio": "1:1", "note": "Similar golden color; earthy flavor"},
        ]
    ),
    "cardamom": SubstitutionEntry(
        category="spice",
        alternatives=[
            {"name": "allspice", "ratio": "1/2 tsp per 1 tsp cardamom", "note": "Warm spice notes; not as floral"},
            {"name": "cinnamon + ginger", "ratio": "1/4 tsp each per 1 tsp cardamom", "note": "Approximates warmth without floral note"},
            {"name": "nutmeg", "ratio": "1/2 tsp per 1 tsp cardamom", "note": "Warmer; less complex"},
        ]
    ),

    # ── NUTS & SEEDS ─────────────────────────────────────────────────────────
    "pine nuts": SubstitutionEntry(
        category="nut",
        alternatives=[
            {"name": "toasted pumpkin seeds (pepitas)", "ratio": "1:1", "note": "Nut-free; similar mild flavor; great in pesto"},
            {"name": "chopped cashews", "ratio": "1:1", "note": "Creamy; slightly sweeter"},
            {"name": "blanched almonds (slivered)", "ratio": "1:1", "note": "More texture; good in pasta and salads"},
            {"name": "sunflower seeds", "ratio": "1:1", "note": "Nut-free; earthy; toast first for best flavor"},
        ]
    ),
    "almonds": SubstitutionEntry(
        category="nut",
        alternatives=[
            {"name": "cashews", "ratio": "1:1", "note": "Softer; creamier; good for sauces"},
            {"name": "sunflower seeds", "ratio": "1:1", "note": "Nut-free alternative"},
            {"name": "macadamia nuts", "ratio": "1:1", "note": "Richer; buttery flavor"},
            {"name": "pumpkin seeds", "ratio": "1:1", "note": "Nut-free; earthy; toast for crunch"},
        ]
    ),

    # ── GRAINS & PASTA ───────────────────────────────────────────────────────
    "basmati rice": SubstitutionEntry(
        category="grain",
        alternatives=[
            {"name": "jasmine rice", "ratio": "1:1", "note": "Slightly stickier and more fragrant"},
            {"name": "long-grain white rice", "ratio": "1:1", "note": "Neutral; less aromatic"},
            {"name": "quinoa", "ratio": "1:1 (use 2 cups liquid per 1 cup quinoa)", "note": "Higher protein; nutty flavor; gluten-free"},
            {"name": "cauliflower rice", "ratio": "1:1", "note": "Low-carb; different texture; cook briefly"},
        ]
    ),
    "pasta": SubstitutionEntry(
        category="grain",
        alternatives=[
            {"name": "rice noodles", "ratio": "1:1 (cook shorter time)", "note": "Gluten-free; lighter texture"},
            {"name": "zucchini noodles (zoodles)", "ratio": "1:1", "note": "Low-carb; don't overcook"},
            {"name": "soba noodles", "ratio": "1:1", "note": "Buckwheat; nutty; slightly shorter cook time"},
            {"name": "shirataki noodles", "ratio": "1:1", "note": "Zero-calorie; rinse well before using"},
        ]
    ),

    # ── HALAL-CONCERN INGREDIENTS (haram replacements) ────────────────────────
    "bacon": SubstitutionEntry(
        category="protein",
        halal_concern=True,
        alternatives=[
            {"name": "beef strips (seasoned)", "ratio": "1:1", "note": "Halal-certified beef; season with smoked paprika for similar flavor"},
            {"name": "turkey rashers (Halal)", "ratio": "1:1", "note": "Check Halal certification; closest texture"},
            {"name": "coconut bacon", "ratio": "1:1 (by volume)", "note": "Vegan; crispy; toss coconut flakes with soy sauce, smoke, maple; bake at 325°F"},
            {"name": "eggplant (thinly sliced, smoked)", "ratio": "1:1", "note": "Vegan; marinate in liquid smoke and soy sauce"},
        ]
    ),
    "pork": SubstitutionEntry(
        category="protein",
        halal_concern=True,
        alternatives=[
            {"name": "lamb (Halal-certified)", "ratio": "1:1", "note": "Richest alternative; similar fat content"},
            {"name": "beef (Halal-certified)", "ratio": "1:1", "note": "Excellent substitute in most dishes"},
            {"name": "chicken thighs", "ratio": "1:1", "note": "Leaner; still juicy and versatile"},
            {"name": "jackfruit (young, canned)", "ratio": "1:1 (shredded)", "note": "Vegan pulled-pork alternative"},
        ]
    ),
    "lard": SubstitutionEntry(
        category="fat",
        halal_concern=True,
        alternatives=[
            {"name": "ghee", "ratio": "1:1", "note": "Best Halal substitute for pastry and frying; high smoke point"},
            {"name": "vegetable shortening", "ratio": "1:1", "note": "Neutral flavor; good for pastry"},
            {"name": "coconut oil (refined)", "ratio": "1:1", "note": "High smoke point; neutral flavor"},
            {"name": "butter", "ratio": "1:1", "note": "Best for flavor in baked goods"},
        ]
    ),
    "wine (cooking)": SubstitutionEntry(
        category="liquid",
        halal_concern=True,
        alternatives=[
            {"name": "grape juice + splash of white vinegar", "ratio": "1 cup grape juice + 1 tbsp vinegar per 1 cup wine", "note": "Best non-alcoholic substitute for white wine"},
            {"name": "pomegranate juice", "ratio": "1:1", "note": "Good for red wine in braises and stews"},
            {"name": "chicken or vegetable stock", "ratio": "1:1", "note": "Neutral; adds depth without acidity"},
            {"name": "tamarind water", "ratio": "1:1", "note": "Adds sourness; popular in South Asian cooking"},
            {"name": "non-alcoholic wine", "ratio": "1:1", "note": "Check Halal certification; closest flavor profile"},
        ]
    ),
    "gelatin": SubstitutionEntry(
        category="thickener",
        halal_concern=True,
        alternatives=[
            {"name": "agar-agar", "ratio": "1 tsp agar per 1 tbsp gelatin powder", "note": "Plant-based; sets firmer; no need to bloom"},
            {"name": "pectin", "ratio": "Use per package instructions", "note": "Plant-based; best for jams and jellies"},
            {"name": "carrageenan", "ratio": "1 tsp per 2 cups liquid", "note": "Seaweed-based; very firm set"},
            {"name": "Halal-certified beef/fish gelatin", "ratio": "1:1", "note": "Check certification carefully"},
        ]
    ),
}


# ─── Lookup Utilities ────────────────────────────────────────────────────────

def normalize_ingredient_name(name: str) -> str:
    """Normalize an ingredient name for consistent lookup."""
    return name.lower().strip()


def get_substitution(ingredient: str) -> Optional[SubstitutionEntry]:
    """
    Retrieve substitution entry for a given ingredient.
    Returns None if the ingredient is not in the database.
    """
    return SUBSTITUTIONS.get(normalize_ingredient_name(ingredient))


def is_halal_blocked(ingredient: str) -> bool:
    """
    Check if an ingredient is on the Halal blocklist.
    Used by ChefAIService to guard all outbound responses.
    """
    return normalize_ingredient_name(ingredient) in HALAL_BLOCKLIST


def get_halal_safe_alternatives(ingredient: str) -> Optional[List[Dict]]:
    """
    If the ingredient is haram, return Halal-safe alternatives from the substitution DB.
    Returns None if no entry exists for the ingredient.
    """
    entry = get_substitution(ingredient)
    if entry and entry.halal_concern:
        return entry.alternatives
    return None


def search_substitutions(query: str) -> List[Dict]:
    """
    Fuzzy search across substitution keys.
    Returns a list of matching entries with their ingredient name and alternatives.
    """
    query_norm = normalize_ingredient_name(query)
    results = []
    for ingredient, entry in SUBSTITUTIONS.items():
        if query_norm in ingredient or ingredient in query_norm:
            results.append({
                "ingredient": ingredient,
                "category": entry.category,
                "halal_concern": entry.halal_concern,
                "alternatives": entry.alternatives,
            })
    return results


if __name__ == "__main__":
    # Quick smoke test
    print(f"Total substitution entries: {len(SUBSTITUTIONS)}")
    print(f"Halal blocklist size: {len(HALAL_BLOCKLIST)}")
    entry = get_substitution("buttermilk")
    if entry:
        print(f"\nButtermilk alternatives ({len(entry.alternatives)}):")
        for alt in entry.alternatives:
            print(f"  • {alt['name']}: {alt['ratio']}")
    print(f"\nis_halal_blocked('bacon'): {is_halal_blocked('bacon')}")
    print(f"is_halal_blocked('chicken'): {is_halal_blocked('chicken')}")
