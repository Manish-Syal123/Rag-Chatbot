FROM chromadb/chroma:latest

# Expose the default ChromaDB port
EXPOSE 8000

# Set environment variables for production
ENV CHROMA_SERVER_HOST=0.0.0.0
ENV CHROMA_SERVER_HTTP_PORT=8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/heartbeat || exit 1

# Start ChromaDB
CMD ["python", "-m", "chromadb.app", "--host", "0.0.0.0", "--port", "8000"]
