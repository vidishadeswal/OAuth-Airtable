from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB

texts = [
    "I love this product",
    "This is amazing",
    "I hate this item",
    "This is terrible",
    "Absolutely great experience",
    "Worst thing ever"
]

labels = ["positive", "positive", "negative", "negative", "positive", "negative"]

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(texts)

X_train, X_test, y_train, y_test = train_test_split(X, labels, test_size=0.3)

model = MultinomialNB()
model.fit(X_train, y_train)

sample = ["I love this", "This is bad"]
sample_vec = vectorizer.transform(sample)

print("Predictions:")
for s, p in zip(sample, model.predict(sample_vec)):
    print(s, "→", p)
