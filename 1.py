class SimpleReflexAgent:
    def program(self, percept):
        if percept == 'dirty':
            return 'suck'
        return 'move'


class ModelBasedReflexAgent:
    def __init__(self):
        self.state = 'clean'

    def program(self, percept):
        self.state = percept
        if self.state == 'dirty':
            return 'suck'
        return 'move'


percepts = ['clean', 'dirty', 'clean', 'dirty']

simple_agent = SimpleReflexAgent()
model_agent = ModelBasedReflexAgent()

print("Simple Reflex Agent Actions:")
for p in percepts:
    print(f"Percept: {p}, Action: {simple_agent.program(p)}")

print("\nModel-Based Reflex Agent Actions:")
for p in percepts:
    print(f"Percept: {p}, State: {model_agent.state}, Action: {model_agent.program(p)}")
