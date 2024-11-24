from lib import SingleObject, ListOfObjects, Multiply, get_model
from dotenv import load_dotenv
import json
import random

load_dotenv()

def filter_by_field(k, v, combos):
    return [combo for combo in combos if combo[k] == v]

def serialize_keys(k, combos):
    return [combo[k] for combo in combos]

def extract_language_exercises(
        model, 
        learning_languages: list[str], 
        native_speaker_languages: list[str], 
        limit_output = 0,
        do_shuffle = False):
    
    learning_language_list = [ {"language": language} for language in learning_languages     ]
    #native_speaker_language_list = [ {"language": language} for language in native_speaker_languages ]

    all = []
    for language in learning_language_list:
        # extract verbs
        verb_list = ListOfObjects(
            """Generate list of 30 most used verbs of {language}. Do not provide translation.""",
            model,
            language,
            {"verb": "..."}
        )

        if do_shuffle:
            random.shuffle(verb_list)

        if (limit_output > 0) and (len(verb_list) > limit_output):
            verb_list = verb_list[len(verb_list)-limit_output:]

        # translate the phrase "Subject Pronouns" to the language we learn
        subjective_pronouns_translation = SingleObject(
            """Translate given sentence to {language} language: 'Subject Pronouns'.""", 
            model, 
            language, 
            {"translation": "..."})
        
        # extract tense names
        language_tenses = ListOfObjects(
            "Provide a list of the names of all the tenses in {language} language. Use only the names, not the full names with the language.", 
            model, 
            language, 
            {"tense": "..."})
        
        if do_shuffle:
            random.shuffle(language_tenses)
        
        if (limit_output > 0) and (len(language_tenses) > limit_output):
            language_tenses = language_tenses[:limit_output]
        
        # extact tense use cases
        language_tense_cases = ListOfObjects(
            "Provide a list of all the typical cases when '{tense}' tense is used in {language} language.", 
            model, 
            language_tenses, 
            {"case": "..."})
        
        if do_shuffle:
            random.shuffle(language_tense_cases)
        
        if limit_output > 0 and len(language_tense_cases) > limit_output:
            language_tense_cases = language_tense_cases[:limit_output]
        
        # extract list of pronouns
        pronouns = ListOfObjects("Provide a list of all the '{translation}' in {language} language.", 
            model, 
            subjective_pronouns_translation,
            output_example_variables = { "pronoun": "\"he\"" },
            exclude_fields_from_output = ["translation"])
        
        if limit_output > 0 and len(pronouns) > limit_output:
            pronouns = pronouns[:limit_output]

        combo_list = Multiply(language_tense_cases, pronouns)

        combo_list = Multiply(combo_list, verb_list)

        if limit_output > 0 and len(combo_list) > limit_output:
            combo_list = combo_list[:limit_output]

        # extract sentences
        final_list = ListOfObjects(
            """Provide few sentence examples where '{tense}' tense is used in {language} language with a pronoun '{pronoun}'. 
            Use '{tense}' tense for this use case: '{case}'. Use verb {verb}.""", 
            model, 
            combo_list, 
            {"sentence": "..."})
        
        enriched_list = ListOfObjects(
            """Put the verb {verb} into '{tense}' tense in {language} language with a pronoun '{pronoun}'.
            Only provide single word!""", 
            model, 
            final_list, 
            {"correct_verb_form": "..."})
        
        if do_shuffle:
            random.shuffle(enriched_list)
        
        # enrich with fake answers:
        verb_tense_combos = Multiply(verb_list, language_tenses)
        verb_tense_combos = Multiply(verb_tense_combos, pronouns)

        # generating fake answers
        verb_tense_list = ListOfObjects(
            """Create the variations of the verb {verb} into {tense} tense in {language} language using pronoun {pronoun}.""", 
            model, 
            verb_tense_combos, 
            {"verb_variation": "..."})
        
        verb_tense_list = [item for item in verb_tense_list if '(' not in item['verb_variation'] and ')' not in item['verb_variation']]

        for i in range(len(enriched_list)):
            fake_answers = filter_by_field("verb", enriched_list[i]["verb"], verb_tense_list)

            fake_answers = [ans for ans in fake_answers if ans['verb_variation'] != enriched_list[i]["correct_verb_form"]]
            random.shuffle(fake_answers)

            #fake_answers = fake_answers[:3]
            enriched_list[i]["answer_suggestions"] = serialize_keys("verb_variation", fake_answers)

            # Add the correct variation to answer suggestions
            #enriched_list[i]["answer_suggestions"].append(enriched_list[i]["correct_verb_form"])

            # TODO: this is shuffling and fixating list
            # although this can be
            #random.shuffle(enriched_list[i]["answer_suggestions"])

            # eliminate duplicates
            enriched_list[i]["answer_suggestions"] = list(dict.fromkeys(enriched_list[i]["answer_suggestions"]))

            enriched_list[i]["answer"] = enriched_list[i]["correct_verb_form"]

            enriched_list[i]["masked_sentence"] = enriched_list[i]["sentence"].replace(enriched_list[i]["correct_verb_form"], '_')


            del enriched_list[i]["correct_verb_form"]
        
        all.extend(enriched_list)

        filtered_exercises = [exercise for exercise in all if not exercise['masked_sentence'] == exercise['sentence']]

    return filtered_exercises

if __name__ == "__main__":
    model = get_model(model_provider='groq', model='llama3-70b-8192')
    final_list = extract_language_exercises(model, [
        "Spanish", 
        "Portuguese",
        "French",
        "German",
        ], ["English"], limit_output=3, do_shuffle=True)
        #], ["English"], limit_output=10, do_shuffle=True)
        #], ["English"], limit_output=4, do_shuffle=True)
    
    output_data = {
        "title": "Language Tenses",
        "exercises": final_list
    }

    # Write to JSON file
    with open('language_exercises.json', 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    # Optional: keep the print for debugging
    for item in final_list:
        print(item)

