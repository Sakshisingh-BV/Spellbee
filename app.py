from flask import Flask, request, jsonify
from flask_cors import CORS
import language_tool_python
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import spacy
import re
app = Flask(__name__)
CORS(app)

# Load tools and models
tool = language_tool_python.LanguageTool('en-US')
tokenizer = AutoTokenizer.from_pretrained("vennify/t5-base-grammar-correction")
model = AutoModelForSeq2SeqLM.from_pretrained("vennify/t5-base-grammar-correction")
nlp = spacy.load("en_core_web_sm")

# Efficient inference with GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

def correct_with_transformer(text):
    input_text = f"fix: {text}"
    tokens = tokenizer.encode(input_text, return_tensors="pt", max_length=512, truncation=True).to(device)
    outputs = model.generate(tokens, max_length=512, num_beams=5, early_stopping=True)
    decoded = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # ✅ Fix the repeated "fix:" issue
    decoded = re.sub(r"^(fix:\s*)+", "", decoded.strip(), flags=re.IGNORECASE)

    return decoded


def correct_with_languagetool(text):
    matches = tool.check(text)
    return language_tool_python.utils.correct(text, matches)

def correct_gender_conflicts(text):
    doc = nlp(text)
    gender_map = {
        "he": "male", "his": "male",
        "she": "female", "her": "female",
        "boy": "male", "man": "male", "father": "male",
        "girl": "female", "woman": "female", "mother": "female"
    }

    pronoun_gender = noun_gender = None

    for token in doc:
        lower = token.text.lower()
        if token.pos_ == "PRON" and lower in gender_map:
            pronoun_gender = gender_map[lower]
        elif token.pos_ in ["NOUN", "PROPN"] and lower in gender_map:
            noun_gender = gender_map[lower]

    if pronoun_gender and noun_gender and pronoun_gender != noun_gender:
        if pronoun_gender == "female":
            text = re.sub(r"\bboy\b", "girl", text, flags=re.IGNORECASE)
            text = re.sub(r"\bman\b", "woman", text, flags=re.IGNORECASE)
            text = re.sub(r"\bhis\b", "her", text, flags=re.IGNORECASE)
        else:
            text = re.sub(r"\bgirl\b", "boy", text, flags=re.IGNORECASE)
            text = re.sub(r"\bwoman\b", "man", text, flags=re.IGNORECASE)
            text = re.sub(r"\bher\b", "his", text, flags=re.IGNORECASE)
    return text

def correct_text_pipeline(text):
    transformer_corrected = correct_with_transformer(text)
    rule_corrected = correct_with_languagetool(transformer_corrected)
    gender_corrected = correct_gender_conflicts(rule_corrected)
    return gender_corrected

@app.route("/api/correct", methods=["POST"])
def correct_text():
    try:
        data = request.get_json()
        input_text = data.get("text", "")
        if not input_text.strip():
            return jsonify({"error": "No input text provided"}), 400

        corrected = correct_text_pipeline(input_text)
        return jsonify({"correctedText": corrected})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ ADD THIS
@app.route("/", methods=["GET"])
def home():
    return "✅ Flask backend is running successfully!"


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port)
