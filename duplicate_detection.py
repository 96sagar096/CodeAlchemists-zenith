
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# Complaints already stored in our system
existing_complaints = [
    {
        "id": 101,
        "description": "A large pothole near the main college gate"
    },
    {
        "id": 102,
        "description": "Garbage has not been collected near the hostel"
    },
    {
        "id": 103,
        "description": "Streetlight is not working near the library"
    }
]


def detect_duplicates(new_description):
    # Get the descriptions of existing complaints
    old_descriptions = [
        complaint["description"]
        for complaint in existing_complaints
    ]

    # Combine old descriptions with the new one
    all_descriptions = old_descriptions + [new_description]

    # Convert text into numerical features
    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    vectors = vectorizer.fit_transform(all_descriptions)

    # Compare the new complaint with every old complaint
    similarities = cosine_similarity(
        vectors[-1],
        vectors[:-1]
    )[0]

    # Store complaints that cross our threshold
    threshold = 0.25
    matches = []

    for i, score in enumerate(similarities):
        if score >= threshold:
            matches.append({
                "id": existing_complaints[i]["id"],
                "description": existing_complaints[i]["description"],
                "similarity": round(float(score) * 100, 2)
            })

    # Show the best match first
    matches.sort(
        key=lambda item: item["similarity"],
        reverse=True
    )

    return matches


# Test the program
new_complaint = input("Enter a new civic complaint: ")

matches = detect_duplicates(new_complaint)

if matches:
    print("\nPotential duplicate complaints found:")

    for match in matches:
        print(f"\nComplaint ID: {match['id']}")
        print(f"Description: {match['description']}")
        print(f"Similarity: {match['similarity']}%")
else:
    print("\nNo potential duplicates found.")