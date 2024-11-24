# Extractor

## Usage

```bash
cd extractor
conda create -n my_env python=3.13
conda activate my_env
pip install -r requirements.txt
python extract_language_exercises.py
cp ../language_exercises.json ../ui/src/app/language_exercises.json
```