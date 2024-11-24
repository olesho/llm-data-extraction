from langchain_openai import OpenAI
from langchain_anthropic import ChatAnthropic
from langchain_groq import ChatGroq
from langchain_ollama.llms import OllamaLLM

from langchain.output_parsers import YamlOutputParser
#from langchain_core.pydantic_v1 import BaseModel, Field
from pydantic.v1 import BaseModel, Field
from langchain.prompts import PromptTemplate
import yaml
from langchain.globals import set_llm_cache
from langchain_community.cache import SQLiteCache

from langchain.callbacks.base import BaseCallbackHandler
from langchain.schema import LLMResult


from typing import List
from pydantic import BaseModel, Field

#langchain.debug = True

# Define a custom dumper to force block style for strings
class PlaintextDumper(yaml.Dumper):
    def represent_scalar(self, tag, value, style=None):
        if isinstance(value, str):
            # Force block style for multiline strings
            style = '|'
        return super().represent_scalar(tag, value, style)

class LoggingCallbackHandler(BaseCallbackHandler):
    def on_llm_start(self, serialized, prompts, **kwargs):
        # print(f"LLM Request: {prompts}")
        pass

    def on_llm_end(self, response: LLMResult, **kwargs):
        # if response.generations:
        #     print(f"LLM Response: {response.generations[0][0].text}")
        # else:
        #     print("LLM Response: No response generated")
        pass

# Returns model based on model_provider, model and temperature
def get_model(model_provider='openai', model='', temperature=0.0, api_key=''):
    set_llm_cache(SQLiteCache(database_path=".langchain.db"))
    if model_provider == 'ollama':
        if model == '':
            return OllamaLLM(model='llama3.2')
        return OllamaLLM(model=model)
    if model_provider == 'groq':
        if model == '':
            return ChatGroq(temperature=temperature, callbacks=[LoggingCallbackHandler()], groq_api_key=api_key)
        return ChatGroq(temperature=temperature, model=model, callbacks=[LoggingCallbackHandler()], groq_api_key=api_key)

    if model_provider == 'anthropic':
        if model == '':
            return ChatAnthropic()
        return ChatAnthropic(model=model, anthropic_api_key=api_key)
    
    if model == '':
        return OpenAI(temperature=temperature, openai_api_key=api_key)
    return OpenAI(temperature=temperature, model=model, openai_api_key=api_key)

def provide_list(model, prompt_template, input_variables={}):
    class ResultsList(BaseModel):
        results: list = Field(description="List of results")

    parser = YamlOutputParser(pydantic_object=ResultsList)
    prompt = PromptTemplate(
        template=prompt_template + """
Provide results only in the YAML format. Example:

results:
  - 'result number 1'
  - 'result number 2'
  - 'result number 3'
""",
        input_variables=input_variables.keys(),
    )
    str_chain = prompt | model | parser
    return str_chain.invoke(input_variables).results

def provide_object_list(model, prompt_template, input_variables={}, output_example_variables={}, exclude_fields_from_output=[]):
    example_list = []
    if isinstance(output_example_variables, dict):
        for input_key in input_variables.keys():
            for output_key in output_example_variables.keys():
                if input_key == output_key:
                    raise Exception(f"Input key '{input_key}' and output key '{output_key}' cannot be the same.")

        for _ in range(3):
            example = {}
            example.update(input_variables)
            for excluded_field in exclude_fields_from_output:
                del example[excluded_field]
            example.update(output_example_variables)
            example_list.extend([example])
    
    if isinstance( output_example_variables, list):
        example_list = output_example_variables

    #output_example = yaml.safe_dump({"results": example_list}, allow_unicode=True)
    output_example = yaml.dump({"results": example_list}, Dumper=PlaintextDumper, default_flow_style=False, allow_unicode=True)

    class ResultsList(BaseModel):
        results: list = Field(description="List of results")

    parser = YamlOutputParser(pydantic_object=ResultsList)
    prompt = PromptTemplate(
        template=prompt_template + """
Provide results only in the YAML format. Example:

{output_example}
""".format(output_example=output_example),
        input_variables=input_variables.keys(),
    )
    #str_chain = prompt | model | QuotedStringOutputParser() | parser
    str_chain = prompt | model | parser

    chain_result = str_chain.invoke(input_variables)
    return chain_result.results

def provide_object(model, prompt_template, input_variables={}, output_example_variables={}):
    for input_key in input_variables.keys():
        for output_key in output_example_variables.keys():
            if input_key == output_key:
                raise Exception(f"Input key '{input_key}' and output key '{output_key}' cannot be the same.")

    example = {}
    example.update(input_variables)
    example.update(output_example_variables)

    #output_example = yaml.dump({"result": example}, Dumper=yaml.Dumper)
    output_example = yaml.dump({"result": example}, Dumper=PlaintextDumper, default_flow_style=False, allow_unicode=True)

    class ResultsObject(BaseModel):
        result: object = Field(description="Object")

    parser = YamlOutputParser(pydantic_object=ResultsObject)
    prompt = PromptTemplate(
        template=prompt_template + """
Provide result as a single YAML 'result' object. Example:

{output_example}
""".format(output_example=output_example),
        input_variables=input_variables.keys(),
    )
    str_chain = prompt | model | parser
    chain_result = str_chain.invoke(input_variables)
    return chain_result.result

def provide_string(model, prompt_template, input_variables={}):
    prompt = PromptTemplate(
        template=prompt_template + """
Provide result a single string.
""".format(),
        input_variables=input_variables.keys(),
    )
    str_chain = prompt | model
    chain_result = str_chain.invoke(input_variables)
    return chain_result


import time
import traceback

class Prompt():
    def __init__(self, query, context = None):
        self.query = query
        if context is None:
            context = {}
        self.context = context
        self.output = []
    
    def get_list(self, model, output_example_variables={}, exclude_fields_from_output=[]):
        self.output = provide_object_list(model, self.query, self.context, output_example_variables, exclude_fields_from_output)
        for i in range(len(self.output)):
            for k, v in self.context.items():
                if k not in exclude_fields_from_output:
                    self.output[i][k] = v
        return self.output
    
    def get_single(self, model, output_example_variables={}):
            self.output = provide_object(model, self.query, self.context, output_example_variables)
            return self.output

    def get_string(self, model):
            self.output = provide_string(model, self.query, self.context)
            return self.output

    def for_each(self, parameters_list):
        l = PromptList()
       
        initial_context = self.context
        for parameters in parameters_list:
            new_context = dict(initial_context)
            new_context.update(parameters)
            obj = Prompt(self.query.format(**parameters), new_context)
            l.add(obj)
        return l    

class PromptList():
    def __init__(self):
        self.prompts = []
        self.outputs = []
        self.delay = 0

    def add(self, prompt: Prompt):
        self.prompts.append(prompt)
        return self

    def execute_list(self, model):
        for prompt in self.prompts:        
            self.outputs.extend(prompt.execute_list(model))
    
    
    def get_list(self, model, output_example_variables={}, exclude_fields_from_output=[]):
        for prompt in self.prompts:  
            #print("get_list({})".format(prompt.context))
            try:    
                prompt.get_list(model, 
                    output_example_variables=output_example_variables, 
                    exclude_fields_from_output=exclude_fields_from_output)  
                self.outputs.extend(prompt.output)
            except Exception as e:
                print(traceback.format_exc())
            time.sleep(self.delay)
        return self.outputs
    
    def get_single(self, model, output_example_variables={}):
        for prompt in self.prompts:      
            prompt.get_single(model, output_example_variables)  
            self.outputs.append(prompt.output)
            time.sleep(self.delay)
        return self.outputs
    
    def get_string(self, model):
        for prompt in self.prompts:      
            prompt.get_string(model)  
            self.outputs.extend(prompt.output)
            time.sleep(self.delay)
        return self.outputs

def Multiply(list1, list2):
    results_list = []
    for item1 in list1:
        for item2 in list2:
            results_list.append({**item1, **item2})
    return results_list

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
    output_example_variables: dict,
    exclude_fields_from_output=[],
):
    if isinstance(input_variables, dict):        
        p = Prompt(prompt, input_variables)
        return p.get_list(model, output_example_variables, exclude_fields_from_output)
    if isinstance(input_variables, list):
        p = Prompt(prompt)
        return p.for_each(input_variables).get_list(model, output_example_variables, exclude_fields_from_output)
    

def Transform(
    prompt: str,
    model: BaseLLM,
    input_variables: object,
    output_example_variables: dict,
):
    if isinstance(input_variables, list):
        p = Prompt(prompt)
        return p.for_each(input_variables).get_single(model, output_example_variables)