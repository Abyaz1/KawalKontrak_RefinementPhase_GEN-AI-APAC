from google import genai
client = genai.Client(vertexai=True, project='test', location='us-central1')
print("CLIENT ATTRS:", dir(client))
