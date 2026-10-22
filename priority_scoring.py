
def calculate_priority(
    severity,
    safety_risk,
    community_impact,
    waiting_hours
):
    # Convert each input to a score from 0 to 10
    severity = max(0, min(severity, 10))
    safety_risk = max(0, min(safety_risk, 10))
    community_impact = max(0, min(community_impact, 10))

    # Waiting time increases priority, up to 10 points
    waiting_score = min(waiting_hours / 24, 10)

    # Weighted score out of 10
    score = (
        0.35 * severity
        + 0.35 * safety_risk
        + 0.20 * community_impact
        + 0.10 * waiting_score
    )

    # Explain the result
    reasons = []

    if severity >= 7:
        reasons.append("high issue severity")

    if safety_risk >= 7:
        reasons.append("significant public safety risk")

    if community_impact >= 7:
        reasons.append("high community impact")

    if waiting_score >= 5:
        reasons.append("long waiting time")

    if score >= 7:
        priority = "HIGH"
    elif score >= 4:
        priority = "MEDIUM"
    else:
        priority = "LOW"

    if not reasons:
        reasons.append("no individual factor reached the high threshold")

    return {
        "score": round(score, 2),
        "priority": priority,
        "reasons": reasons
    }


# Example complaint
result = calculate_priority(
    severity=9,
    safety_risk=10,
    community_impact=8,
    waiting_hours=48
)

print("Priority score:", result["score"], "/ 10")
print("Priority:", result["priority"])
print("Reasons:")

for reason in result["reasons"]:
    print("-", reason)