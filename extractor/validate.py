import json
from typing import List, Dict, Union

def load_language_exercises(file_path: str) -> Dict:
    """
    Load and validate the language exercises JSON file.
    
    Args:
        file_path: Path to the JSON file
        
    Returns:
        Dict containing the validated exercises data
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        #if data['exercises']['masked_sentence'] == data['exercises']['sentence']
        filtered_exercises = [exercise for exercise in data['exercises'] if not exercise['masked_sentence'] == exercise['sentence']]
        data['exercises'] = filtered_exercises

        # Write the filtered data back to JSON file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        return data

    except FileNotFoundError:
        raise FileNotFoundError(f"Exercise file not found at path: {file_path}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON format in exercise file: {str(e)}")
    except AttributeError:
        raise ValueError("Invalid exercise file format: 'exercises' key not found")
    
load_language_exercises("language_exercises.json")