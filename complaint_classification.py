
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# Training examples: different ways people may report each issue
training_data = {
    "Pothole": [
        "There is a large pothole on the road",
        "The road is broken and full of potholes",
        "A deep hole has appeared on the street",
        "My bike nearly fell because of a road crater",
        "The road surface is damaged near the gate",
        "There are many holes in the road",
        "A pothole is causing traffic problems",
        "The road is uneven and damaged",
        "A large crater has formed on the street",
        "The road needs pothole repairs",
        "The road surface has collapsed in several places",
        "Vehicles are struggling to pass over damaged road sections",
        "The pavement has deep holes caused by road damage",
    ],
    "Garbage": [
        "Garbage is piling up near the hostel",
        "Waste has not been collected for days",
        "The dustbin is overflowing with rubbish",
        "There is a pile of trash on the roadside",
        "The area smells because of rotting waste",
        "Municipal garbage collection has not happened",
        "Litter is scattered all over the street",
        "The public bin is full and overflowing",
        "Waste is accumulating near the market",
        "The garbage truck has not visited our area",
    ],
    "Water Leakage": [
        "Water is leaking from a broken pipe",
        "There is a water leak near the main gate",
        "A pipeline has burst and water is flowing",
        "Clean water is being wasted from a pipe",
        "Water is coming out of a damaged pipeline",
        "A pipe is leaking continuously on the road",
        "There is a broken water supply pipe",
        "Water is flowing from a cracked pipe",
        "A leaking pipeline is flooding the street",
        "The municipal water pipe needs repair",
    ],
    "Streetlight": [
        "The streetlight is not working",
        "The road is dark because the lamp is broken",
        "Street lights have stopped working",
        "There is no light on the road at night",
        "The lamp post outside my house is broken",
        "Several streetlights are not turning on",
        "The road becomes unsafe due to darkness",
        "The public lighting system has failed",
        "A street lamp is flickering continuously",
        "The streetlight near the bus stop is broken",
    ],
    "Waterlogging": [
    "Rainwater is collecting on the road",
    "Water has accumulated at the street intersection",
    "The road is flooded after heavy rainfall",
    "Several streets are submerged in rainwater",
    "Water is standing outside houses after the rain",
    "The drainage system cannot handle the rainwater",
    "The street is waterlogged after a downpour",
    "Rainwater is trapped on the road and cannot drain",
    "Nearby intersections are flooded after rainfall",
    "The road has standing water following a storm",
    ],
    "Other": [
        "There is a stray dog near the road",
        "The park needs more benches",
        "A public wall has been damaged",
        "A tree branch is blocking the footpath",
        "The public toilet is not maintained",
        "A traffic sign has fallen down",
        "The park gate is broken",
        "A bench in the public garden is damaged",
        "A stray animal is wandering in the area",
        "The footpath is blocked by an obstruction",
        "Construction rubble has been dumped on the pavement",
        "Building debris is blocking the pedestrian walkway",
        "A pile of bricks and broken concrete is obstructing the footpath",
    ],
}

# Prepare text and labels from the training data
training_complaints = []
training_categories = []

for category, complaints in training_data.items():
    for complaint in complaints:
        training_complaints.append(complaint)
        training_categories.append(category)

# Build the machine-learning pipeline
model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            sublinear_tf=True
        )
    ),
    (
        "classifier",
        LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42
        )
    )
])

model.fit(training_complaints, training_categories)




def classify_complaint(description):
    if not isinstance(description, str) or not description.strip():
        raise ValueError("Complaint description cannot be empty")

    # Check whether the complaint contains enough information
    vague_phrases = [
    "there is a problem",
    "there is an issue",
    "there is a concern",
    "please fix this",
    "please fix the issue",
    "fix this problem",
    "something is wrong",
    "please solve this",
    "help us",
    "the issue near",
    "the problem near",
    "an issue near",
    "a problem near",
    ]

    text = description.lower().strip()

    if any(phrase in text for phrase in vague_phrases):
        return {
            "category": "Needs Clarification",
            "confidence": 0.0,
            "needs_review": True,
            "needs_clarification": True
        }

    # Predict the category for more informative complaints
    probabilities = model.predict_proba([description])[0]

    best_index = probabilities.argmax()
    best_probability = probabilities[best_index]

    sorted_probabilities = sorted(probabilities, reverse=True)
    second_probability = sorted_probabilities[1]

    confidence = round(float(best_probability) * 100, 2)
    margin = float(best_probability - second_probability)

    needs_review = margin < 0.10

    return {
        "category": model.classes_[best_index],
        "confidence": confidence,
        "needs_review": needs_review,
        "needs_clarification": False
    }


if __name__ == "__main__":
    # These complaints are deliberately different from our training examples.
    test_complaints = [
        "Cars keep swerving to avoid a deep crater on the road",
        "The municipal truck has skipped our lane for a week",
        "A burst pipe is flooding the footpath",
        "The lamp outside our building stays off after sunset",
        "Someone has dumped construction debris on the pavement",
        "Rainwater is accumulating at several nearby intersections",
        "The road has become dangerous because of broken asphalt",
        "The community waste bins have not been emptied",
        "Water is gushing out of a cracked underground pipe",
        "Pedestrians cannot see clearly because the public lights are out",
        "The situation near the road is getting worse",
        "There is a problem with water in our area",
        "Please fix the issue near the market",
    ]

    for complaint in test_complaints:
        result = classify_complaint(complaint)

        print("\nComplaint:", complaint)
        print("Predicted category:", result["category"])
        print("Model confidence:", result["confidence"], "%")
        print("Needs human review:", result["needs_review"])
        print("Needs clarification:", result["needs_clarification"])