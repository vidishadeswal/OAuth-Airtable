from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB

texts = [
    "I love this product",
    "This is amazing",
    "Absolutely fantastic experience",
    "I hate this item",
    "This is terrible",
    "Worst thing ever"
]

labels = ["positive", "positive", "positive", "negative", "negative", "negative"]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

X_train, X_test, y_train, y_test = train_test_split(X, labels, test_size=0.3)

model = MultinomialNB()
model.fit(X_train, y_train)

sample = ["I love this", "This is bad", "Amazing experience"]
sample_vec = vectorizer.transform(sample)

print("Predictions:")
for s, p in zip(sample, model.predict(sample_vec)):
    print(s, "→", p)
