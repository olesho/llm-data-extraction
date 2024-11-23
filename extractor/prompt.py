from lib import Prompt
from langchain_core.language_models import BaseLLM

# returns a single object
# input_variables can be a dict or a list of dicts
# output_example_variables is a dict or a list of dicts with example values for the output variables
# method returns single object
def SingleObject(
    prompt: str,
    model: BaseLLM,
    input_variables: object,
    output_example_variables: dict
):
    if isinstance(input_variables, dict):        
        p = Prompt(prompt, input_variables)
        return p.get_single(model, output_example_variables)
    if isinstance(input_variables, list):
        p = Prompt(prompt, input_variables[0])
        return p.for_each(input_variables).get_list(model, output_example_variables)

# returns a single object
# input_variables can be a dict or a list of dicts
# output_example_variables is a dict or a list of dicts with example values for the output variables
# method returns a list of objects
def ListOfObjects(
    prompt: str,
    model: BaseLLM,
    input_variables: object,
    output_example_variables: dict
):
    if isinstance(input_variables, dict):        
        p = Prompt(prompt, input_variables)
        return p.get_list(model, output_example_variables)
    if isinstance(input_variables, list):
        p = Prompt(prompt)
        return p.for_each(input_variables).get_list(model, output_example_variables)