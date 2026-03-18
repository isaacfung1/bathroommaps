"""Scoring algorithm for bathroom recommendations.

Lower scores indicate a better bathroom choice.
"""


def compute_score(
    distance: float,
    avg_cleanliness: float,
    capacity: int,
    user_floor: int,
    bathroom_floor: int,
) -> float:
    """Compute a weighted recommendation score for a single bathroom.

    Parameters
    ----------
    distance:
        Distance from the user to the bathroom in metres.
    avg_cleanliness:
        Average cleanliness rating (1–5) from recent reports.
    capacity:
        Total capacity (stalls + urinals).
    user_floor:
        The floor the user is currently on.
    bathroom_floor:
        The floor the bathroom is on.

    Returns
    -------
    float
        A composite score where **lower is better**.
    """
    alpha = 0.5   # distance weight
    beta = 0.25   # dirtiness weight
    gamma = 0.1   # inverse-capacity weight
    delta = 0.15  # floor-difference weight

    dirtiness = 5 - avg_cleanliness
    floor_penalty = abs(user_floor - bathroom_floor)

    return (
        alpha * distance
        + beta * dirtiness
        + gamma * (1 / max(capacity, 1))
        + delta * floor_penalty
    )