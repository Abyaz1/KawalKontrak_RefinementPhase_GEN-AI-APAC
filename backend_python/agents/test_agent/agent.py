from google import adk
from pydantic import BaseModel

class MyInput(BaseModel):
    query: str

class MyOutput(BaseModel):
    answer: str

agent = adk.Agent(
    name="test_agent",
    model="gemini-2.5-flash-lite",
    instruction="Answer the query",
    input_schema=MyInput,
    output_schema=MyOutput
)
