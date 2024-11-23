from lib import SingleObject, ListOfObjects, Multiply, get_model
from dotenv import load_dotenv

load_dotenv()

model = get_model(model_provider='groq', model='llama3-70b-8192')
# model = get_model(model_provider='ollama')
languages = [
    #{"language": "English"},
    {"language": "Spanish"},
    #{"language": "French"},
    {"language": "Portuguese"},
]

base_languages = [
    {"destination_language": "Ukrainian"},
    #{"destination_language": "Russian"},
    #{"destination_language": "Polish"},
    #{"destination_language": "English"},
]

for language in languages:
    subjective_pronouns_translation = SingleObject(
        """Translate given sentence to {language} language: 'Subject Pronouns'.""", 
        model, 
        language, 
        {"translation": "..."})

    language_tenses = ListOfObjects(
        "Provide a list of the names of all the tenses in {language} language. Use only the names, not the full names with the language.", 
        model, 
        language, 
        {"tense": "..."})
    
    language_tense_cases = ListOfObjects(
        "Provide a list of all the typical cases when '{tense}' tense is used in {language} language.", 
        model, 
        language_tenses, 
        {"case": "..."})
    
    # provide list of pronouns
    pronouns = ListOfObjects("Provide a list of all the '{translation}' in {language} language.", 
        model, 
        subjective_pronouns_translation,
        output_example_variables = { "pronoun": "\"he\"" },
        exclude_fields_from_output = ["translation"])

    combo_list = Multiply(language_tense_cases, pronouns)

    # cut the list
    combo_list = combo_list[:4]

    final_list = ListOfObjects(
        """Provide few sentence examples where '{tense}' tense is used in {language} language with a pronoun '{pronoun}'. 
        Use '{tense}' tense for this use case: '{case}'.""", 
        model, 
        combo_list, 
        {"sentence": "..."})

for item in final_list:
    print(item)

