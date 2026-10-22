
def calculate_priority(
    severity,
    safety_risk,
    community_impact,
    waiting_hours
):
    # 1. Validate the inputs
    scores = {
        "severity": severity,
        "safety_risk": safety_risk,
        "community_impact": community_impact
    }

    for name, value in scores.items():
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"{name} must be a number")

        if not 0 <= value <= 10:
            raise ValueError(f"{name} must be between 0 and 10")

    if isinstance(waiting_hours, bool) or not isinstance(waiting_hours, (int, float)):
        raise ValueError("waiting_hours must be a number")

    if waiting_hours < 0:
        raise ValueError("waiting_hours cannot be negative")

    # 2. Calculate the waiting-time score
    # Every 24 hours adds 1 point, up to 10 points
    waiting_score = min(waiting_hours / 24, 10)

    # 3. Calculate the weighted score out of 10
    score = (
        0.35 * severity
        + 0.35 * safety_risk
        + 0.20 * community_impact
        + 0.10 * waiting_score
    )

    # 4. Identify the reasons for the priority
    reasons = []

    if severity >= 7:
        reasons.append("high issue severity")

    if safety_risk >= 6:
        reasons.append("public safety risk")

    if community_impact >= 7:
        reasons.append("high community impact")

    if waiting_score >= 5:
        reasons.append("long waiting time")

    # 5. Apply a safety override
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

    # 6. Return structured results for integration
    return {
        "score": round(score, 2),
        "priority": priority,
        "safety_override": safety_override,
        "factors": {
            "severity": severity,
            "safety_risk": safety_risk,
            "community_impact": community_impact,
            "waiting_score": round(waiting_score, 2)
        },
        "reasons": reasons
    }


# Example complaint
if __name__ == "__main__":
    result = calculate_priority(
        severity=9,
        safety_risk=10,
        community_impact=8,
        waiting_hours=48
    )

    print("Priority score:", result["score"], "/ 10")
    print("Priority:", result["priority"])
    print("Safety override:", result["safety_override"])
    print("Factors:", result["factors"])
    print("Reasons:")

    for reason in result["reasons"]:
        print("-", reason)
