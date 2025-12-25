"""seed_five_global_recipes

Revision ID: c108a9e62138
Revises: b383e4ba4f8c
Create Date: 2025-12-25 11:59:03.372668

T027-T029: Seed database with 5 global masterpieces in all 6 languages
- Pasta (Italy)
- Sajji (Pakistan)
- Guacamole (Mexico)
- Shakshuka (Middle East)
- Gomen (Ethiopia)
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text
import uuid
from datetime import datetime

revision = 'c108a9e62138'
down_revision = 'b383e4ba4f8c'
branch_labels = None
depends_on = None

def upgrade():
    conn = op.get_bind()

    # Recipe 1: Pasta (Italy)
    pasta_id = str(uuid.uuid4())
    conn.execute(text("""
        INSERT INTO recipes (recipe_id, name, origin_country, difficulty, prep_time, cook_time, total_time, servings, is_active)
        VALUES (:id, 'Simple Pasta', 'Italy', 'Absolute Beginner', 5, 15, 20, 4, true)
    """), {"id": pasta_id})

    # Pasta translations (6 languages)
    pasta_translations = [
        ("EN", "Simple Pasta", "Be careful when handling hot water and boiling pasta. Use pot holders and keep children away from the stove.",
         '{"pasta": "400g", "water": "4 liters", "salt": "2 tablespoons", "olive_oil": "2 tablespoons", "cheese": "50g grated parmesan"}'),
        ("UR", "سادہ پاستا", "گرم پانی اور ابلتے پاستا کو سنبھالتے وقت محتاط رہیں۔ برتن کے ہولڈر استعمال کریں اور بچوں کو چولہے سے دور رکھیں۔",
         '{"pasta": "400 گرام", "water": "4 لیٹر پانی", "salt": "2 چمچ نمک", "olive_oil": "2 چمچ زیتون کا تیل", "cheese": "50 گرام پنیر"}'),
        ("AR", "معكرونة بسيطة", "كن حذرا عند التعامل مع الماء الساخن والمعكرونة المغلية. استخدم قفازات الفرن وأبعد الأطفال عن الموقد.",
         '{"pasta": "400 جرام", "water": "4 لتر ماء", "salt": "2 ملعقة ملح", "olive_oil": "2 ملعقة زيت زيتون", "cheese": "50 جرام جبن"}'),
        ("ES", "Pasta Simple", "Tenga cuidado al manipular agua caliente y pasta hirviendo. Use agarraderas y mantenga a los niños alejados de la estufa.",
         '{"pasta": "400g", "water": "4 litros de agua", "salt": "2 cucharadas de sal", "olive_oil": "2 cucharadas de aceite de oliva", "cheese": "50g de queso parmesano"}'),
        ("FR", "Pâtes Simples", "Soyez prudent lorsque vous manipulez de l'eau chaude et des pâtes bouillantes. Utilisez des maniques et gardez les enfants éloignés de la cuisinière.",
         '{"pasta": "400g", "water": "4 litres d\'eau", "salt": "2 cuillères à soupe de sel", "olive_oil": "2 cuillères à soupe d\'huile d\'olive", "cheese": "50g de parmesan"}'),
        ("FA", "پاستای ساده", "هنگام کار با آب داغ و پاستای در حال جوش مراقب باشید. از دستکش فر استفاده کنید و کودکان را از اجاق گاز دور نگه دارید.",
         '{"pasta": "400 گرم", "water": "4 لیتر آب", "salt": "2 قاشق نمک", "olive_oil": "2 قاشق روغن زیتون", "cheese": "50 گرام پنیر پارمزان"}')
    ]

    for lang, name, kitchen_guard, ingredients in pasta_translations:
        conn.execute(text("""
            INSERT INTO recipe_translations (translation_id, recipe_id, language_code, name, kitchen_guard, ingredients)
            VALUES (:tid, :rid, :lang, :name, :kg, :ing)
        """), {"tid": str(uuid.uuid4()), "rid": pasta_id, "lang": lang, "name": name, "kg": kitchen_guard, "ing": ingredients})

    # Pasta steps (5 steps in English, then translations)
    pasta_steps = [
        (1, "Boil water in a large pot with salt."),
        (2, "Add pasta and cook for 8-10 minutes."),
        (3, "Drain pasta using a colander."),
        (4, "Add olive oil and toss gently."),
        (5, "Serve hot with grated parmesan cheese.")
    ]

    pasta_step_ids = []
    for step_num, instruction in pasta_steps:
        step_id = str(uuid.uuid4())
        pasta_step_ids.append((step_id, step_num))
        conn.execute(text("""
            INSERT INTO recipe_steps (step_id, recipe_id, step_number, instruction)
            VALUES (:sid, :rid, :num, :inst)
        """), {"sid": step_id, "rid": pasta_id, "num": step_num, "inst": instruction})

    # Pasta step translations
    pasta_step_trans = {
        1: {"UR": "ایک بڑے برتن میں نمک کے ساتھ پانی ابالیں۔", "AR": "اغلي الماء في قدر كبير مع الملح.", "ES": "Hierva agua en una olla grande con sal.", "FR": "Faites bouillir de l'eau dans une grande casserole avec du sel.", "FA": "آب را در یک قابلمه بزرگ با نمک بجوشانید."},
        2: {"UR": "پاستا ڈالیں اور 8-10 منٹ پکائیں۔", "AR": "أضف المعكرونة واطبخها لمدة 8-10 دقائق.", "ES": "Agregue la pasta y cocine por 8-10 minutos.", "FR": "Ajoutez les pâtes et faites cuire 8-10 minutes.", "FA": "پاستا را اضافه کنید و به مدت 8-10 دقیقه بپزید."},
        3: {"UR": "چھلنی استعمال کر کے پاستا کا پانی نکالیں۔", "AR": "صفّي المعكرونة باستخدام مصفاة.", "ES": "Escurra la pasta usando un colador.", "FR": "Égouttez les pâtes à l'aide d'une passoire.", "FA": "پاستا را با استفاده از صافی آبکش کنید."},
        4: {"UR": "زیتون کا تیل ڈالیں اور آہستہ سے ملائیں۔", "AR": "أضف زيت الزيتون وقلّب بلطف.", "ES": "Agregue aceite de oliva y mezcle suavemente.", "FR": "Ajoutez l'huile d'olive et mélangez doucement.", "FA": "روغن زیتون اضافه کنید و به آرامی مخلوط کنید."},
        5: {"UR": "گرم حالت میں پنیر کے ساتھ سرو کریں۔", "AR": "قدّم ساخناً مع جبن البارميزان المبشور.", "ES": "Sirva caliente con queso parmesano rallado.", "FR": "Servez chaud avec du parmesan râpé.", "FA": "گرم با پنیر پارمزان رنده شده سرو کنید."}
    }

    for step_id, step_num in pasta_step_ids:
        if step_num in pasta_step_trans:
            for lang, trans in pasta_step_trans[step_num].items():
                conn.execute(text("""
                    INSERT INTO recipe_step_translations (step_translation_id, step_id, language_code, instruction)
                    VALUES (:stid, :sid, :lang, :inst)
                """), {"stid": str(uuid.uuid4()), "sid": step_id, "lang": lang, "inst": trans})

    # Recipe 2: Sajji (Pakistan)
    sajji_id = str(uuid.uuid4())
    conn.execute(text("""
        INSERT INTO recipes (recipe_id, name, origin_country, difficulty, prep_time, cook_time, total_time, servings, is_active)
        VALUES (:id, 'Sajji', 'Pakistan', 'Beginner+', 120, 45, 165, 6, true)
    """), {"id": sajji_id})

    sajji_translations = [
        ("EN", "Sajji (Pakistani Grilled Chicken)", "Ensure meat is cooked through to internal temperature of 165°F. Handle hot coals carefully with proper tools.",
         '{"chicken": "1 whole chicken (1.5kg)", "salt": "2 tablespoons", "papaya_paste": "3 tablespoons", "yogurt": "1 cup", "spices": "2 tablespoons sajji masala"}'),
        ("UR", "ساجی", "یقینی بنائیں کہ گوشت 165°F کے اندرونی درجہ حرارت تک پکا ہو۔ گرم کوئلوں کو مناسب اوزار سے احتیاط سے سنبھالیں۔",
         '{"chicken": "1 مکمل مرغی (1.5 کلو)", "salt": "2 چمچ نمک", "papaya_paste": "3 چمچ پپیتا کا پیسٹ", "yogurt": "1 کپ دہی", "spices": "2 چمچ ساجی مصالحہ"}'),
        ("AR", "ساجي (دجاج باكستاني مشوي)", "تأكد من طهي اللحم حتى درجة حرارة داخلية 75°C. تعامل مع الفحم الساخن بحذر باستخدام أدوات مناسبة.",
         '{"chicken": "دجاجة كاملة 1.5 كجم", "salt": "2 ملعقة ملح", "papaya_paste": "3 ملاعق معجون بابايا", "yogurt": "كوب زبادي", "spices": "2 ملعقة بهارات ساجي"}'),
        ("ES", "Sajji (Pollo Paquistaní a la Parrilla)", "Asegúrese de que la carne esté cocida a una temperatura interna de 75°C. Maneje las brasas calientes con cuidado usando herramientas apropiadas.",
         '{"chicken": "1 pollo entero (1.5kg)", "salt": "2 cucharadas de sal", "papaya_paste": "3 cucharadas de pasta de papaya", "yogurt": "1 taza de yogur", "spices": "2 cucharadas de especias sajji"}'),
        ("FR", "Sajji (Poulet Grillé Pakistanais)", "Assurez-vous que la viande est cuite à une température interne de 75°C. Manipulez les charbons chauds avec précaution en utilisant des outils appropriés.",
         '{"chicken": "1 poulet entier (1.5kg)", "salt": "2 cuillères à soupe de sel", "papaya_paste": "3 cuillères à soupe de pâte de papaye", "yogurt": "1 tasse de yaourt", "spices": "2 cuillères à soupe d\'épices sajji"}'),
        ("FA", "ساجی (مرغ پاکستانی کبابی)", "اطمینان حاصل کنید که گوشت تا دمای داخلی 75 درجه سانتیگراد پخته شده است. زغال های داغ را با احتیاط با ابزار مناسب جابجا کنید.",
         '{"chicken": "1 مرغ کامل (1.5 کیلوگرم)", "salt": "2 قاشق نمک", "papaya_paste": "3 قاشق خمیر پاپایا", "yogurt": "1 پیاله ماست", "spices": "2 قاشق ادویه ساجی"}')
    ]

    for lang, name, kitchen_guard, ingredients in sajji_translations:
        conn.execute(text("""
            INSERT INTO recipe_translations (translation_id, recipe_id, language_code, name, kitchen_guard, ingredients)
            VALUES (:tid, :rid, :lang, :name, :kg, :ing)
        """), {"tid": str(uuid.uuid4()), "rid": sajji_id, "lang": lang, "name": name, "kg": kitchen_guard, "ing": ingredients})

    sajji_steps = [
        (1, "Marinate whole chicken with salt, papaya paste, yogurt, and sajji masala for 2 hours."),
        (2, "Prepare charcoal fire in a tandoor or outdoor grill."),
        (3, "Skewer the marinated chicken onto a large rod."),
        (4, "Cook over hot coals for 40-45 minutes, rotating occasionally."),
        (5, "Serve hot with naan bread and chutney.")
    ]

    sajji_step_ids = []
    for step_num, instruction in sajji_steps:
        step_id = str(uuid.uuid4())
        sajji_step_ids.append((step_id, step_num))
        conn.execute(text("""
            INSERT INTO recipe_steps (step_id, recipe_id, step_number, instruction)
            VALUES (:sid, :rid, :num, :inst)
        """), {"sid": step_id, "rid": sajji_id, "num": step_num, "inst": instruction})

    sajji_step_trans = {
        1: {"UR": "مکمل مرغی کو نمک، پپیتا کا پیسٹ، دہی اور ساجی مصالحے سے 2 گھنٹے کے لیے میرینیٹ کریں۔", "AR": "تتبّل الدجاجة الكاملة بالملح ومعجون البابايا والزبادي وبهارات ساجي لمدة ساعتين.", "ES": "Marine el pollo entero con sal, pasta de papaya, yogur y especias sajji durante 2 horas.", "FR": "Marinez le poulet entier avec du sel, de la pâte de papaye, du yaourt et des épices sajji pendant 2 heures.", "FA": "مرغ کامل را با نمک، خمیر پاپایا، ماست و ادویه ساجی به مدت 2 ساعت مزه دار کنید."},
        2: {"UR": "تندور یا باہری گرل میں کوئلے کی آگ تیار کریں۔", "AR": "جهّز نار الفحم في التندور أو الشواية الخارجية.", "ES": "Prepare fuego de carbón en un tandoor o parrilla al aire libre.", "FR": "Préparez un feu de charbon dans un tandoor ou un gril extérieur.", "FA": "آتش زغال را در تندور یا گریل بیرونی آماده کنید."},
        3: {"UR": "میرینیٹ شدہ مرغی کو بڑی سیخ پر لگائیں۔", "AR": "اغرز الدجاج المتبل على سيخ كبير.", "ES": "Ensarte el pollo marinado en una brocheta grande.", "FR": "Embrochez le poulet mariné sur une grande broche.", "FA": "مرغ مزه دار شده را روی سیخ بزرگ قرار دهید."},
        4: {"UR": "گرم کوئلوں پر 40-45 منٹ تک پکائیں، کبھی کبھار گھماتے رہیں۔", "AR": "اطبخ فوق الفحم الساخن لمدة 40-45 دقيقة مع التدوير من حين لآخر.", "ES": "Cocine sobre brasas calientes durante 40-45 minutos, rotando ocasionalmente.", "FR": "Faites cuire sur des charbons chauds pendant 40-45 minutes en tournant occasionnellement.", "FA": "روی زغال های داغ به مدت 40-45 دقیقه بپزید و گاهی بچرخانید."},
        5: {"UR": "گرم حالت میں نان اور چٹنی کے ساتھ سرو کریں۔", "AR": "قدّم ساخناً مع خبز النان والصلصة.", "ES": "Sirva caliente con pan naan y chutney.", "FR": "Servez chaud avec du pain naan et du chutney.", "FA": "گرم با نان و چاتنی سرو کنید."}
    }

    for step_id, step_num in sajji_step_ids:
        if step_num in sajji_step_trans:
            for lang, trans in sajji_step_trans[step_num].items():
                conn.execute(text("""
                    INSERT INTO recipe_step_translations (step_translation_id, step_id, language_code, instruction)
                    VALUES (:stid, :sid, :lang, :inst)
                """), {"stid": str(uuid.uuid4()), "sid": step_id, "lang": lang, "inst": trans})

    # Recipe 3: Guacamole (Mexico)
    guac_id = str(uuid.uuid4())
    conn.execute(text("""
        INSERT INTO recipes (recipe_id, name, origin_country, difficulty, prep_time, cook_time, total_time, servings, is_active)
        VALUES (:id, 'Guacamole', 'Mexico', 'Absolute Beginner', 10, 0, 10, 4, true)
    """), {"id": guac_id})

    guac_translations = [
        ("EN", "Fresh Guacamole", "Use a sharp knife carefully when cutting avocados. Remove pit safely by tapping with knife edge, not your hand.",
         '{"avocados": "3 ripe avocados", "lime": "2 limes", "salt": "1 teaspoon", "cilantro": "3 tablespoons chopped", "onion": "1/4 cup diced red onion"}'),
        ("UR", "تازہ گواکامولے", "ایوکاڈو کاٹتے وقت تیز چاقو کو احتیاط سے استعمال کریں۔ گٹھلی کو چاقو کے کنارے سے ٹیپ کر کے محفوظ طریقے سے نکالیں، ہاتھ سے نہیں۔",
         '{"avocados": "3 پکے ایوکاڈو", "lime": "2 لیموں", "salt": "1 چائے کا چمچ نمک", "cilantro": "3 چمچ کٹا ہرا دھنیا", "onion": "1/4 کپ کٹا لال پیاز"}'),
        ("AR", "جواكامولي طازج", "استخدم سكيناً حادة بحذر عند تقطيع الأفوكادو. أزل النواة بأمان بالنقر بحافة السكين، وليس بيدك.",
         '{"avocados": "3 حبات أفوكادو ناضجة", "lime": "2 ليمونة", "salt": "ملعقة شاي ملح", "cilantro": "3 ملاعق كزبرة مفرومة", "onion": "ربع كوب بصل أحمر مقطع"}'),
        ("ES", "Guacamole Fresco", "Use un cuchillo afilado con cuidado al cortar aguacates. Retire el hueso de forma segura golpeando con el filo del cuchillo, no con la mano.",
         '{"avocados": "3 aguacates maduros", "lime": "2 limones", "salt": "1 cucharadita de sal", "cilantro": "3 cucharadas de cilantro picado", "onion": "1/4 taza de cebolla morada picada"}'),
        ("FR", "Guacamole Frais", "Utilisez un couteau bien aiguisé avec précaution lors de la coupe des avocats. Retirez le noyau en toute sécurité en tapotant avec le tranchant du couteau, pas avec votre main.",
         '{"avocados": "3 avocats mûrs", "lime": "2 citrons verts", "salt": "1 cuillère à café de sel", "cilantro": "3 cuillères à soupe de coriandre hachée", "onion": "1/4 tasse d\'oignon rouge haché"}'),
        ("FA", "گواکامولی تازه", "هنگام بریدن آووکادو از چاقوی تیز با احتیاط استعمال کنید. هسته را با ضربه زدن با لبه چاقو به صورت ایمن خارج کنید، نه با دست.",
         '{"avocados": "3 آووکادوی رسیده", "lime": "2 لیمو ترش", "salt": "1 قاشق چایخوری نمک", "cilantro": "3 قاشق گشنیز خرد شده", "onion": "1/4 پیاله پیاز قرمز خرد شده"}')
    ]

    for lang, name, kitchen_guard, ingredients in guac_translations:
        conn.execute(text("""
            INSERT INTO recipe_translations (translation_id, recipe_id, language_code, name, kitchen_guard, ingredients)
            VALUES (:tid, :rid, :lang, :name, :kg, :ing)
        """), {"tid": str(uuid.uuid4()), "rid": guac_id, "lang": lang, "name": name, "kg": kitchen_guard, "ing": ingredients})

    guac_steps = [
        (1, "Cut avocados in half and remove pits carefully."),
        (2, "Scoop avocado flesh into a bowl and mash with a fork."),
        (3, "Add lime juice and salt, mix well."),
        (4, "Fold in chopped cilantro and diced onion."),
        (5, "Serve immediately with tortilla chips.")
    ]

    guac_step_ids = []
    for step_num, instruction in guac_steps:
        step_id = str(uuid.uuid4())
        guac_step_ids.append((step_id, step_num))
        conn.execute(text("""
            INSERT INTO recipe_steps (step_id, recipe_id, step_number, instruction)
            VALUES (:sid, :rid, :num, :inst)
        """), {"sid": step_id, "rid": guac_id, "num": step_num, "inst": instruction})

    guac_step_trans = {
        1: {"UR": "ایوکاڈو کو آدھا کاٹیں اور گٹھلیوں کو احتیاط سے نکالیں۔", "AR": "اقطع الأفوكادو إلى نصفين وأزل النوى بحذر.", "ES": "Corte los aguacates por la mitad y retire los huesos con cuidado.", "FR": "Coupez les avocats en deux et retirez les noyaux avec précaution.", "FA": "آووکادوها را نصف کنید و هسته ها را با احتیاط خارج کنید."},
        2: {"UR": "ایوکاڈو کا گودا چمچ سے نکال کر پیالے میں ڈالیں اور کانٹے سے میش کریں۔", "AR": "اغرف لب الأفوكادو في وعاء واهرسه بالشوكة.", "ES": "Saque la pulpa del aguacate en un tazón y tritúrela con un tenedor.", "FR": "Retirez la chair de l'avocat dans un bol et écrasez-la avec une fourchette.", "FA": "گوشت آووکادو را با قاشق خارج کرده و در کاسه بریزید و با چنگال له کنید."},
        3: {"UR": "لیموں کا رس اور نمک ڈالیں، اچھی طرح ملائیں۔", "AR": "أضف عصير الليمون والملح، وامزج جيداً.", "ES": "Agregue jugo de limón y sal, mezcle bien.", "FR": "Ajoutez le jus de citron vert et le sel, mélangez bien.", "FA": "آب لیمو و نمک اضافه کنید، خوب مخلوط کنید."},
        4: {"UR": "کٹا ہوا دھنیا اور پیاز ملائیں۔", "AR": "أضف الكزبرة المفرومة والبصل المقطع.", "ES": "Incorpore el cilantro picado y la cebolla cortada en cubitos.", "FR": "Incorporez la coriandre hachée et l'oignon en dés.", "FA": "گشنیز خرد شده و پیاز خرد شده را اضافه کنید."},
        5: {"UR": "فوری طور پر ٹارٹیلا چپس کے ساتھ سرو کریں۔", "AR": "قدّم فوراً مع رقائق التورتيلا.", "ES": "Sirva inmediatamente con totopos.", "FR": "Servez immédiatement avec des chips de tortilla.", "FA": "فوراً با چیپس تورتیلا سرو کنید."}
    }

    for step_id, step_num in guac_step_ids:
        if step_num in guac_step_trans:
            for lang, trans in guac_step_trans[step_num].items():
                conn.execute(text("""
                    INSERT INTO recipe_step_translations (step_translation_id, step_id, language_code, instruction)
                    VALUES (:stid, :sid, :lang, :inst)
                """), {"stid": str(uuid.uuid4()), "sid": step_id, "lang": lang, "inst": trans})

    # Recipe 4: Shakshuka (Middle East)
    shak_id = str(uuid.uuid4())
    conn.execute(text("""
        INSERT INTO recipes (recipe_id, name, origin_country, difficulty, prep_time, cook_time, total_time, servings, is_active)
        VALUES (:id, 'Shakshuka', 'Middle East', 'Beginner', 10, 25, 35, 4, true)
    """), {"id": shak_id})

    shak_translations = [
        ("EN", "Shakshuka (Eggs in Tomato Sauce)", "Be careful of hot oil splatter when adding tomatoes. Keep face away from pan when adding liquids.",
         '{"eggs": "6 large eggs", "tomatoes": "800g canned crushed tomatoes", "onion": "1 large onion diced", "bell_pepper": "1 red bell pepper diced", "spices": "1 tablespoon cumin and paprika"}'),
        ("UR", "شکشوکہ (ٹماٹر کی چٹنی میں انڈے)", "ٹماٹر ڈالتے وقت گرم تیل کے چھینٹوں سے محتاط رہیں۔ مائع ڈالتے وقت چہرے کو پین سے دور رکھیں۔",
         '{"eggs": "6 بڑے انڈے", "tomatoes": "800 گرام ٹماٹر", "onion": "1 بڑا پیاز", "bell_pepper": "1 لال شملہ مرچ", "spices": "1 چمچ زیرہ اور پاپریکا"}'),
        ("AR", "شكشوكة (بيض في صلصة الطماطم)", "احذر من تطاير الزيت الساخن عند إضافة الطماطم. أبعد وجهك عن المقلاة عند إضافة السوائل.",
         '{"eggs": "6 بيضات كبيرة", "tomatoes": "800 جرام طماطم مهروسة", "onion": "بصلة كبيرة مقطعة", "bell_pepper": "فلفل رومي أحمر مقطع", "spices": "ملعقة كمون وبابريكا"}'),
        ("ES", "Shakshuka (Huevos en Salsa de Tomate)", "Tenga cuidado con las salpicaduras de aceite caliente al agregar tomates. Mantenga la cara alejada de la sartén al agregar líquidos.",
         '{"eggs": "6 huevos grandes", "tomatoes": "800g de tomates triturados", "onion": "1 cebolla grande picada", "bell_pepper": "1 pimiento rojo picado", "spices": "1 cucharada de comino y pimentón"}'),
        ("FR", "Shakshuka (Œufs dans une Sauce Tomate)", "Attention aux éclaboussures d'huile chaude lors de l'ajout de tomates. Gardez le visage éloigné de la poêle lors de l'ajout de liquides.",
         '{"eggs": "6 gros œufs", "tomatoes": "800g de tomates concassées", "onion": "1 gros oignon haché", "bell_pepper": "1 poivron rouge haché", "spices": "1 cuillère à soupe de cumin et paprika"}'),
        ("FA", "شکشوکا (تخم مرغ در سس گوجه)", "هنگام اضافه کردن گوجه فرنگی مراقب پاشیدن روغن داغ باشید. هنگام اضافه کردن مایعات صورت را از تابه دور نگه دارید.",
         '{"eggs": "6 تخم مرغ بزرگ", "tomatoes": "800 گرم گوجه فرنگی له شده", "onion": "1 پیاز بزرگ خرد شده", "bell_pepper": "1 فلفل دلمه ای قرمز خرد شده", "spices": "1 قاشق زیره و پاپریکا"}')
    ]

    for lang, name, kitchen_guard, ingredients in shak_translations:
        conn.execute(text("""
            INSERT INTO recipe_translations (translation_id, recipe_id, language_code, name, kitchen_guard, ingredients)
            VALUES (:tid, :rid, :lang, :name, :kg, :ing)
        """), {"tid": str(uuid.uuid4()), "rid": shak_id, "lang": lang, "name": name, "kg": kitchen_guard, "ing": ingredients})

    shak_steps = [
        (1, "Sauté diced onions and bell peppers in olive oil until soft."),
        (2, "Add crushed tomatoes, cumin, and paprika, simmer for 15 minutes."),
        (3, "Make 6 wells in the sauce with a spoon."),
        (4, "Crack one egg into each well carefully."),
        (5, "Cover and cook until eggs are set, about 8 minutes.")
    ]

    shak_step_ids = []
    for step_num, instruction in shak_steps:
        step_id = str(uuid.uuid4())
        shak_step_ids.append((step_id, step_num))
        conn.execute(text("""
            INSERT INTO recipe_steps (step_id, recipe_id, step_number, instruction)
            VALUES (:sid, :rid, :num, :inst)
        """), {"sid": step_id, "rid": shak_id, "num": step_num, "inst": instruction})

    shak_step_trans = {
        1: {"UR": "زیتون کے تیل میں کٹے ہوئے پیاز اور شملہ مرچ کو نرم ہونے تک بھونیں۔", "AR": "اقلِ البصل المفروم والفلفل الرومي في زيت الزيتون حتى يلين.", "ES": "Saltee las cebollas y los pimientos picados en aceite de oliva hasta que estén suaves.", "FR": "Faites revenir les oignons et les poivrons hachés dans l'huile d'olive jusqu'à ce qu'ils soient tendres.", "FA": "پیاز و فلفل دلمه ای خرد شده را در روغن زیتون تا نرم شدن تفت دهید."},
        2: {"UR": "ٹماٹر، زیرہ اور پاپریکا ڈالیں، 15 منٹ ابالیں۔", "AR": "أضف الطماطم المهروسة والكمون والبابريكا، واترك على نار هادئة لمدة 15 دقيقة.", "ES": "Agregue los tomates triturados, el comino y el pimentón, cocine a fuego lento durante 15 minutos.", "FR": "Ajoutez les tomates concassées, le cumin et le paprika, laissez mijoter 15 minutes.", "FA": "گوجه فرنگی له شده، زیره و پاپریکا اضافه کنید و به مدت 15 دقیقه بجوشانید."},
        3: {"UR": "چمچ سے چٹنی میں 6 گڑھے بنائیں۔", "AR": "اصنع 6 حفر في الصلصة بالملعقة.", "ES": "Haga 6 huecos en la salsa con una cuchara.", "FR": "Faites 6 puits dans la sauce avec une cuillère.", "FA": "با قاشق 6 چاله در سس ایجاد کنید."},
        4: {"UR": "ہر گڑھے میں احتیاط سے ایک انڈا توڑیں۔", "AR": "اكسر بيضة واحدة في كل حفرة بحذر.", "ES": "Rompa un huevo en cada hueco con cuidado.", "FR": "Cassez un œuf dans chaque puits avec précaution.", "FA": "یک تخم مرغ را با احتیاط در هر چاله بشکنید."},
        5: {"UR": "ڈھانپیں اور انڈے پکنے تک 8 منٹ پکائیں۔", "AR": "غطِّ واطبخ حتى ينضج البيض، حوالي 8 دقائق.", "ES": "Cubra y cocine hasta que los huevos estén cocidos, unos 8 minutos.", "FR": "Couvrez et faites cuire jusqu'à ce que les œufs soient pris, environ 8 minutes.", "FA": "بپوشانید و تا پخته شدن تخم مرغ ها، حدود 8 دقیقه بپزید."}
    }

    for step_id, step_num in shak_step_ids:
        if step_num in shak_step_trans:
            for lang, trans in shak_step_trans[step_num].items():
                conn.execute(text("""
                    INSERT INTO recipe_step_translations (step_translation_id, step_id, language_code, instruction)
                    VALUES (:stid, :sid, :lang, :inst)
                """), {"stid": str(uuid.uuid4()), "sid": step_id, "lang": lang, "inst": trans})

    # Recipe 5: Gomen (Ethiopia)
    gomen_id = str(uuid.uuid4())
    conn.execute(text("""
        INSERT INTO recipes (recipe_id, name, origin_country, difficulty, prep_time, cook_time, total_time, servings, is_active)
        VALUES (:id, 'Gomen', 'Ethiopia', 'Beginner', 10, 20, 30, 4, true)
    """), {"id": gomen_id})

    gomen_translations = [
        ("EN", "Gomen (Ethiopian Collard Greens)", "Be careful when handling hot steam from covered pot. Use oven mitts when lifting lid.",
         '{"collard_greens": "1kg collard greens", "onion": "2 large onions diced", "garlic": "4 cloves minced", "ginger": "1 tablespoon minced", "spices": "1 teaspoon turmeric and cumin"}'),
        ("UR", "گومن (ایتھوپیائی ساگ)", "ڈھکے ہوئے برتن سے نکلنے والی گرم بھاپ سے محتاط رہیں۔ ڈھکن اٹھاتے وقت اوون کے دستانے استعمال کریں۔",
         '{"collard_greens": "1 کلو ساگ", "onion": "2 بڑے پیاز", "garlic": "4 لہسن کی کلیاں", "ginger": "1 چمچ ادرک", "spices": "1 چائے کا چمچ ہلدی اور زیرہ"}'),
        ("AR", "جومن (كرنب إثيوبي)", "كن حذراً عند التعامل مع البخار الساخن من القدر المغطى. استخدم قفازات الفرن عند رفع الغطاء.",
         '{"collard_greens": "1 كجم كرنب أخضر", "onion": "بصلتان كبيرتان مقطعتان", "garlic": "4 فصوص ثوم مفرومة", "ginger": "ملعقة زنجبيل مفروم", "spices": "ملعقة شاي كركم وكمون"}'),
        ("ES", "Gomen (Coles Etíopes)", "Tenga cuidado al manipular el vapor caliente de la olla cubierta. Use guantes de horno al levantar la tapa.",
         '{"collard_greens": "1kg de col rizada", "onion": "2 cebollas grandes picadas", "garlic": "4 dientes de ajo picados", "ginger": "1 cucharada de jengibre picado", "spices": "1 cucharadita de cúrcuma y comino"}'),
        ("FR", "Gomen (Choux Éthiopiens)", "Attention à la vapeur chaude provenant de la marmite couverte. Utilisez des gants de four pour soulever le couvercle.",
         '{"collard_greens": "1kg de chou vert", "onion": "2 gros oignons hachés", "garlic": "4 gousses d\'ail hachées", "ginger": "1 cuillère à soupe de gingembre haché", "spices": "1 cuillère à café de curcuma et cumin"}'),
        ("FA", "گومن (کلم اتیوپیایی)", "هنگام برخورد با بخار داغ از قابلمه سرپوش دار مراقب باشید. هنگام برداشتن درب از دستکش فر استفاده کنید.",
         '{"collard_greens": "1 کیلوگرم کلم سبز", "onion": "2 پیاز بزرگ خرد شده", "garlic": "4 حبه سیر خرد شده", "ginger": "1 قاشق زنجبیل خرد شده", "spices": "1 قاشق چایخوری زردچوبه و زیره"}')
    ]

    for lang, name, kitchen_guard, ingredients in gomen_translations:
        conn.execute(text("""
            INSERT INTO recipe_translations (translation_id, recipe_id, language_code, name, kitchen_guard, ingredients)
            VALUES (:tid, :rid, :lang, :name, :kg, :ing)
        """), {"tid": str(uuid.uuid4()), "rid": gomen_id, "lang": lang, "name": name, "kg": kitchen_guard, "ing": ingredients})

    gomen_steps = [
        (1, "Wash collard greens thoroughly and chop into strips."),
        (2, "Sauté onions, garlic, and ginger until fragrant."),
        (3, "Add chopped greens and spices, stir well."),
        (4, "Add half cup water, cover and simmer for 15 minutes."),
        (5, "Serve hot with injera bread or rice.")
    ]

    gomen_step_ids = []
    for step_num, instruction in gomen_steps:
        step_id = str(uuid.uuid4())
        gomen_step_ids.append((step_id, step_num))
        conn.execute(text("""
            INSERT INTO recipe_steps (step_id, recipe_id, step_number, instruction)
            VALUES (:sid, :rid, :num, :inst)
        """), {"sid": step_id, "rid": gomen_id, "num": step_num, "inst": instruction})

    gomen_step_trans = {
        1: {"UR": "ساگ کو اچھی طرح دھوئیں اور پٹیوں میں کاٹیں۔", "AR": "اغسل الكرنب الأخضر جيداً وقطّعه إلى شرائح.", "ES": "Lave bien las coles rizadas y córtelas en tiras.", "FR": "Lavez soigneusement les choux verts et coupez-les en lanières.", "FA": "کلم سبز را کاملاً بشویید و به صورت نواری خرد کنید."},
        2: {"UR": "پیاز، لہسن اور ادرک کو خوشبو آنے تک بھونیں۔", "AR": "اقلِ البصل والثوم والزنجبيل حتى تفوح رائحته.", "ES": "Saltee las cebollas, el ajo y el jengibre hasta que estén fragantes.", "FR": "Faites revenir les oignons, l'ail et le gingembre jusqu'à ce qu'ils soient parfumés.", "FA": "پیاز، سیر و زنجبیل را تا خوشبو شدن تفت دهید."},
        3: {"UR": "کٹے ہوئے ساگ اور مصالحے ڈالیں، اچھی طرح ہلائیں۔", "AR": "أضف الخضروات المفرومة والتوابل، وقلّب جيداً.", "ES": "Agregue las verduras picadas y las especias, revuelva bien.", "FR": "Ajoutez les légumes verts hachés et les épices, mélangez bien.", "FA": "سبزیجات خرد شده و ادویه ها را اضافه کنید و خوب هم بزنید."},
        4: {"UR": "آدھا کپ پانی ڈالیں، ڈھانپیں اور 15 منٹ ابالیں۔", "AR": "أضف نصف كوب ماء، غطِّ واترك على نار هادئة لمدة 15 دقيقة.", "ES": "Agregue media taza de agua, cubra y cocine a fuego lento durante 15 minutos.", "FR": "Ajoutez une demi-tasse d'eau, couvrez et laissez mijoter 15 minutes.", "FA": "نیم پیاله آب اضافه کنید، بپوشانید و به مدت 15 دقیقه بجوشانید."},
        5: {"UR": "گرم حالت میں انجیرا روٹی یا چاول کے ساتھ سرو کریں۔", "AR": "قدّم ساخناً مع خبز الإنجيرا أو الأرز.", "ES": "Sirva caliente con pan injera o arroz.", "FR": "Servez chaud avec du pain injera ou du riz.", "FA": "گرم با نان اینجرا یا برنج سرو کنید."}
    }

    for step_id, step_num in gomen_step_ids:
        if step_num in gomen_step_trans:
            for lang, trans in gomen_step_trans[step_num].items():
                conn.execute(text("""
                    INSERT INTO recipe_step_translations (step_translation_id, step_id, language_code, instruction)
                    VALUES (:stid, :sid, :lang, :inst)
                """), {"stid": str(uuid.uuid4()), "sid": step_id, "lang": lang, "inst": trans})

def downgrade():
    # Delete in reverse order due to foreign keys
    conn = op.get_bind()
    conn.execute(text("DELETE FROM recipe_step_translations"))
    conn.execute(text("DELETE FROM recipe_steps"))
    conn.execute(text("DELETE FROM recipe_translations"))
    conn.execute(text("DELETE FROM recipes"))
