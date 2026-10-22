
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# Complaints already stored in our system (sample data)
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
    # Get descriptions of existing complaints
    old_descriptions = [
        complaint["description"]
        for complaint in existing_complaints
    ]

    # Combine existing complaints with the new complaint
    all_descriptions = old_descriptions + [new_description]

    # Convert text into numerical features using TF-IDF
    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    vectors = vectorizer.fit_transform(all_descriptions)

    # Calculate similarity between the new complaint and existing ones
    similarities = cosine_similarity(
        vectors[-1],
        vectors[:-1]
    )[0]

    # Identify potential duplicates
    threshold = 0.25
    matches = []

    for i, score in enumerate(similarities):
        if score >= threshold:
            matches.append({
                "id": existing_complaints[i]["id"],
                "description": existing_complaints[i]["description"],
                "similarity": round(float(score) * 100, 2)
            })

    # Sort matches by highest similarity
    matches.sort(
        key=lambda item: item["similarity"],
        reverse=True
    )

    return matches


# Test the program
if __name__ == "__main__":
    new_complaint = input("Enter a new civic complaint: ").strip()

    if not new_complaint:
        print("Please enter a valid complaint.")
    else:
        matches = detect_duplicates(new_complaint)

        if matches:
            print("\nPotential duplicate complaints found:")

            for match in matches:
                print(f"\nComplaint ID: {match['id']}")
                print(f"Description: {match['description']}")
                print(f"Similarity: {match['similarity']}%")
        else:
            print("\nNo potential duplicates found.")
