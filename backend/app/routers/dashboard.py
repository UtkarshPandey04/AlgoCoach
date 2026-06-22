from fastapi import APIRouter, Depends
from pydantic import BaseModel
from uuid import UUID

from app.models import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class StatCard(BaseModel):
    label: str
    value: str
    change: str


class FocusArea(BaseModel):
    title: str
    detail: str
    level: str


class DailyPlanItem(BaseModel):
    time: str
    title: str
    description: str


class ActivityItem(BaseModel):
    title: str
    description: str
    status: str


class RoadmapStep(BaseModel):
    phase: str
    title: str
    description: str


class ProblemItem(BaseModel):
    id: str
    title: str
    difficulty: str
    topic: str
    description: str
    starterCode: str


class DashboardResponse(BaseModel):
    headline: str
    subheadline: str
    stats: list[StatCard]
    focus_areas: list[FocusArea]
    daily_plan: list[DailyPlanItem]
    recent_activity: list[ActivityItem]
    roadmap: list[RoadmapStep]


class ProblemSetResponse(BaseModel):
    problems: list[ProblemItem]


def _stable_seed(user: User) -> int:
    try:
        base = UUID(str(user.id)).int
    except ValueError:
        base = sum(ord(char) for char in str(user.id))

    return base & 0xFFFFFFFF


def _compute_dashboard_stats(current_user: User) -> dict[str, str]:
    seed = _stable_seed(current_user)

    solved = 60 + (seed % 220)
    streak = 3 + (seed % 20)
    mock_score = 65 + (seed % 31)

    arrays = 55 + (seed % 40)
    trees = 45 + ((seed >> 3) % 45)
    dp = 35 + ((seed >> 6) % 50)
    graphs = 40 + ((seed >> 9) % 45)
    strings = 50 + ((seed >> 12) % 40)

    topics = {
        "Arrays": arrays,
        "Trees": trees,
        "DP": dp,
        "Graphs": graphs,
        "Strings": strings,
    }

    top_topic = max(topics, key=topics.get)
    weakest_topic = min(topics, key=topics.get)

    if mock_score >= 85:
        readiness = "Strong"
    elif mock_score >= 72:
        readiness = "Building"
    else:
        readiness = "Needs focus"

    return {
        "solved": str(solved),
        "streak": f"{streak} days",
        "mock_score": f"{mock_score}%",
        "readiness": readiness,
        "top_topic": top_topic,
        "weakest_topic": weakest_topic,
    }


@router.get("/overview", response_model=DashboardResponse)
def get_dashboard_overview(current_user: User = Depends(get_current_user)):
    first_name = current_user.name.split()[0] if current_user.name else "Coder"
    batch_suffix = f" for batch {current_user.batch}" if current_user.batch else ""
    stats = _compute_dashboard_stats(current_user)

    return DashboardResponse(
        headline=f"Welcome back, {first_name}",
        subheadline=(
            f"Your AlgoCoach workspace is tuned for interview prep, revision, and live coding reps{batch_suffix}."
        ),
        stats=[
            StatCard(label="Practice streak", value=stats["streak"], change="Keep your daily momentum alive"),
            StatCard(label="Problems solved", value=stats["solved"], change="Track consistency over speed"),
            StatCard(label="Mock score", value=stats["mock_score"], change=f"Focus next on {stats['weakest_topic']}"),
            StatCard(label="Readiness", value=stats["readiness"], change=f"{stats['top_topic']} is trending up"),
        ],
        focus_areas=[
            FocusArea(
                title="Graph traversal",
                detail="Review BFS vs DFS decision patterns and shortest path templates.",
                level="High impact",
            ),
            FocusArea(
                title="Dynamic programming",
                detail="Spend one focused block on state transitions and memoization shortcuts.",
                level="Warm-up",
            ),
            FocusArea(
                title="Behavioral storytelling",
                detail="Refine two STAR stories tied to ownership and debugging under pressure.",
                level="Interview ready",
            ),
        ],
        daily_plan=[
            DailyPlanItem(
                time="09:00",
                title="Warm-up set",
                description="Solve one easy array problem and narrate the brute-force approach first.",
            ),
            DailyPlanItem(
                time="13:30",
                title="Focused coding round",
                description="Use the code editor to implement one medium graph problem in 35 minutes.",
            ),
            DailyPlanItem(
                time="19:00",
                title="Reflection pass",
                description="Capture mistakes, edge cases, and one reusable interview insight.",
            ),
        ],
        recent_activity=[
            ActivityItem(
                title="Binary Search revision",
                description="Completed pattern recap with clean boundary handling notes.",
                status="Complete",
            ),
            ActivityItem(
                title="Two-pointer mock",
                description="Strong runtime explanation, but missed one duplicate edge case.",
                status="Needs follow-up",
            ),
            ActivityItem(
                title="Resume bullet cleanup",
                description="Converted project work into impact-oriented achievement statements.",
                status="Ready",
            ),
        ],
        roadmap=[
            RoadmapStep(
                phase="Phase 01",
                title="Sharpen core patterns",
                description="Build confidence with arrays, strings, hashing, and binary search.",
            ),
            RoadmapStep(
                phase="Phase 02",
                title="Simulate interview pressure",
                description="Practice timed mediums with explanation-first thinking and cleaner tradeoffs.",
            ),
            RoadmapStep(
                phase="Phase 03",
                title="Polish placement readiness",
                description="Blend coding, resume stories, and company-specific revision into one routine.",
            ),
        ],
    )


@router.get("/problems", response_model=ProblemSetResponse)
def get_practice_problems(_: User = Depends(get_current_user)):
    return ProblemSetResponse(
        problems=[
            ProblemItem(
                id="array-01",
                title="Two Sum Reflection",
                difficulty="Easy",
                topic="Arrays",
                description="Return the two indices whose values add up to the target.",
                starterCode=(
                    "def two_sum(nums, target):\n"
                    "    # Return a list with the two indices.\n"
                    "    # Example: two_sum([2, 7, 11, 15], 9) -> [0, 1]\n"
                    "    pass\n"
                ),
            ),
            ProblemItem(
                id="graph-02",
                title="Number of Islands",
                difficulty="Medium",
                topic="Graphs",
                description="Count connected components in a binary grid using DFS or BFS.",
                starterCode=(
                    "def num_islands(grid):\n"
                    "    if not grid:\n"
                    "        return 0\n"
                    "\n"
                    "    rows, cols = len(grid), len(grid[0])\n"
                    "    visited = set()\n"
                    "\n"
                    "    def dfs(r, c):\n"
                    "        pass\n"
                    "\n"
                    "    islands = 0\n"
                    "    for r in range(rows):\n"
                    "        for c in range(cols):\n"
                    "            pass\n"
                    "\n"
                    "    return islands\n"
                ),
            ),
            ProblemItem(
                id="dp-03",
                title="Climbing Stairs Plus",
                difficulty="Easy",
                topic="Dynamic Programming",
                description="Compute the number of distinct ways to reach the top of the staircase.",
                starterCode=(
                    "def climb_stairs(n):\n"
                    "    # Use an iterative DP approach with O(1) space.\n"
                    "    pass\n"
                ),
            ),
        ]
    )
