
import math

WEIGHTS = {
    "severity": 0.30,
    "safety_risk": 0.30,
    "community_impact": 0.15,
    "waiting_time": 0.10,
    "related_reports": 0.15,
}

WAITING_FULL_SCORE_HOURS = 7 * 24
POINTS_PER_RELATED_REPORT = 2

LABELS = {
    "severity": "issue severity",
    "safety_risk": "public safety risk",
    "community_impact": "community impact",
    "waiting_time": "waiting time",
    "related_reports": "number of related reports",
}


def _check_number(name, value, low=0, high=None):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be a number")

    if not math.isfinite(value):
        raise ValueError(f"{name} must be finite")

    if value < low:
        raise ValueError(f"{name} cannot be below {low}")

    if high is not None and value > high:
        raise ValueError(f"{name} must be between {low} and {high}")


def calculate_priority(
    severity,
    safety_risk,
    community_impact,
    waiting_hours,
    related_reports=0,
):
    _check_number("severity", severity, 0, 10)
    _check_number("safety_risk", safety_risk, 0, 10)
    _check_number("community_impact", community_impact, 0, 10)
    _check_number("waiting_hours", waiting_hours, 0)
    _check_number("related_reports", related_reports, 0)

    if not isinstance(related_reports, int):
        raise ValueError("related_reports must be a non-negative integer")

    waiting_score = min(
        waiting_hours / WAITING_FULL_SCORE_HOURS * 10, 10
    )
    related_score = min(
        related_reports * POINTS_PER_RELATED_REPORT, 10
    )

    factor_scores = {
        "severity": severity,
        "safety_risk": safety_risk,
        "community_impact": community_impact,
        "waiting_time": waiting_score,
        "related_reports": related_score,
    }

    contributions = {
        name: round(WEIGHTS[name] * value, 2)
        for name, value in factor_scores.items()
    }

    score = sum(
        WEIGHTS[name] * value
        for name, value in factor_scores.items()
    )

    reasons = []

    if severity >= 7:
        reasons.append("high issue severity")
    if safety_risk >= 6:
        reasons.append("public safety risk")
    if community_impact >= 7:
        reasons.append("high community impact")
    if waiting_score >= 5:
        reasons.append("long waiting time")
    if related_reports >= 2:
        reasons.append(f"{related_reports} related reports")

    safety_override = safety_risk >= 9

    if safety_override:
        priority = "HIGH"
        reasons.append("HIGH priority due to critical safety risk")
    elif score >= 7:
        priority = "HIGH"
    elif score >= 4 or safety_risk >= 6:
        priority = "MEDIUM"
    else:
        priority = "LOW"

    if not reasons:
        reasons.append("no high-risk factors identified")

    top = sorted(
        contributions.items(),
        key=lambda item: item[1],
        reverse=True,
    )[:3]

    explanation = (
        f"Score {score:.2f}/10 ({priority}). "
        "Main contributors: "
        + ", ".join(
            f"{LABELS[name]} (+{value:.2f})"
            for name, value in top
        )
    )

    if safety_override:
        explanation += " Critical safety override applied."

    return {
        "score": round(score, 2),
        "priority": priority,
        "safety_override": safety_override,
        "factors": {
            "severity": severity,
            "safety_risk": safety_risk,
            "community_impact": community_impact,
            "waiting_score": round(waiting_score, 2),
            "related_reports_score": round(related_score, 2),
        },
        "contributions": contributions,
        "reasons": reasons,
        "explanation": explanation,
    }


CATEGORY_BASELINES = {
    "Pothole": (6, 6, 6),
    "Garbage": (5, 3, 5),
    "Water Leakage": (6, 3, 6),
    "Streetlight": (5, 6, 5),
    "Waterlogging": (7, 6, 8),
    "Electrical Hazard": (9, 10, 6),
    "Other": (3, 2, 3),
    "Needs Clarification": (3, 2, 3),
}

TEXT_CUES = {
    "safety_risk": [
        "accident", "injur", "child", "school", "hospital",
        "fell", "fallen", "live wire", "spark", "fire",
        "electrocut", "dangerous", "elderly",
    ],
    "severity": [
        "burst", "collapsed", "flood", "blocked", "overflowing",
        "gushing", "completely", "no water", "not working for",
    ],
    "community_impact": [
        "entire", "whole", "hostel", "school", "hospital",
        "market", "main road", "main gate", "many",
        "several", "everyone",
    ],
}

NEGATIONS = {
    "no", "not", "never", "without", "hasn't", "haven't",
    "didn't", "doesn't", "isn't", "wasn't", "weren't",
}


def derive_scores(category, description=""):
    severity, safety_risk, community_impact = CATEGORY_BASELINES.get(
        category, CATEGORY_BASELINES["Other"]
    )

    values = {
        "severity": severity,
        "safety_risk": safety_risk,
        "community_impact": community_impact,
    }

    words = (description or "").lower().split()
    text = " ".join(words)
    matched = {}

    for dimension, cues in TEXT_CUES.items():
        hits = []

        for cue in cues:
            if cue not in text:
                continue

            cue_words = cue.split()
            positions = [
                i for i in range(len(words) - len(cue_words) + 1)
                if words[i:i + len(cue_words)] == cue_words
            ]

            # Skip cues preceded by a simple negation.
            negated = any(
                words[max(0, i - 3):i]
                and any(w in NEGATIONS for w in words[max(0, i - 3):i])
                for i in positions
            )

            if not negated:
                hits.append(cue)

        if hits:
            boost = min(2 + len(hits) - 1, 4)
            values[dimension] = min(values[dimension] + boost, 10)
            matched[dimension] = hits

    return {**values, "matched_cues": matched}


def prioritize(category, description, waiting_hours, related_reports=0):
    derived = derive_scores(category, description)

    result = calculate_priority(
        derived["severity"],
        derived["safety_risk"],
        derived["community_impact"],
        waiting_hours,
        related_reports,
    )

    result["derived_from"] = {
        "category": category,
        "matched_cues": derived["matched_cues"],
    }

    return result


if __name__ == "__main__":
    examples = [
        ("Pothole", "Deep pothole near the school gate, a child fell yesterday", 30, 3),
        ("Garbage", "Garbage not collected near the hostel", 20, 0),
        ("Electrical Hazard", "Live wire hanging near the hostel gate", 1, 0),
    ]

    for category, description, hours, related in examples:
        result = prioritize(category, description, hours, related)
        print(f"\nComplaint: {description}")
        print(result["explanation"])
        print("Reasons:", result["reasons"])
