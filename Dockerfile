# Use slim Python image
FROM python:3.10-slim

# Set environment and cache dirs
ENV HOME=/app
ENV TRANSFORMERS_CACHE=/app/cache
ENV HF_HOME=/app/cache
ENV LANGTOOL_CACHE_DIR=/app/.cache/language_tool_python

# Set working directory
WORKDIR /app

# Install system dependencies (language_tool_python needs Java)
RUN apt-get update && apt-get install -y \
    openjdk-17-jre-headless \
    && rm -rf /var/lib/apt/lists/*

# Create and set permissions for cache
RUN mkdir -p /app/.cache/language_tool_python /app/cache && \
    chmod -R 777 /app/.cache /app/cache

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download and link spaCy model
RUN python -m spacy download en_core_web_sm && \
    python -m spacy link en_core_web_sm en_core_web_sm

# Copy source code
COPY . .

# Expose port used in Hugging Face
EXPOSE 7860

# Run Flask app
CMD ["python", "app.py"]
