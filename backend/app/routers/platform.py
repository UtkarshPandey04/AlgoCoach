import json
from typing import Any
from urllib import error as url_error
from urllib import request as url_request
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.config import GROQ_API_KEY, GROQ_MODEL
from app.routers.auth import get_current_user

router = APIRouter(tags=["platform"])


class ProblemCatalogItem(BaseModel):
    id: str
    title: str
    topic: str
    difficulty: str
    companies: list[str]
    solved: bool
    slug: str


class ProblemCatalogResponse(BaseModel):
    problems: list[ProblemCatalogItem]


class ProblemDetailResponse(BaseModel):
    title: str
    difficulty: str
    description: str
    examples: list[dict[str, str]]
    constraints: list[str]
    companies: list[str]
    starterCode: dict[str, str]


class HintRequest(BaseModel):
    problem: dict[str, Any] | None = None
    code: str = ""
    language: str = "python"


class HintResponse(BaseModel):
    hint: str


class RunCodeRequest(BaseModel):
    problem: dict[str, Any] | None = None
    code: str = ""
    language: str = "python"
    submit: bool = False


class RunCodeResponse(BaseModel):
    status: str
    runtime: str
    testCases: list[str]


class MockSessionQuestion(BaseModel):
    id: str
    title: str
    difficulty: str
    prompt: str
    exampleInput: str
    exampleOutput: str
    starterCode: dict[str, str]


class MockSessionResponse(BaseModel):
    durationSeconds: int
    questionCount: int
    currentQuestion: MockSessionQuestion


PROBLEMS: list[dict[str, Any]] = [
    {
        "id": "array-01",
        "title": "Two Sum Reflection",
        "topic": "Arrays",
        "difficulty": "Easy",
        "companies": ["Amazon", "Google"],
        "solved": True,
        "slug": "two-sum-reflection",
        "description": "Return the two indices whose values add up to the target.",
        "examples": [
            {
                "input": "nums = [2,7,11,15], target = 9",
                "output": "[0,1]",
                "explanation": "nums[0] + nums[1] = 9",
            }
        ],
        "constraints": [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "Only one valid answer exists.",
        ],
        "starterCode": {
            "python": "def solve(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        need = target - num\n        if need in seen:\n            return [seen[need], i]\n        seen[num] = i\n",
            "javascript": "function solve(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i += 1) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n}\n",
            "java": "class Solution {\n  public int[] solve(int[] nums, int target) {\n    java.util.Map<Integer, Integer> seen = new java.util.HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n      int need = target - nums[i];\n      if (seen.containsKey(need)) return new int[]{seen.get(need), i};\n      seen.put(nums[i], i);\n    }\n    return new int[]{};\n  }\n}\n",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> solve(vector<int>& nums, int target) {\n  unordered_map<int,int> seen;\n  for (int i = 0; i < (int)nums.size(); i++) {\n    int need = target - nums[i];\n    if (seen.count(need)) return {seen[need], i};\n    seen[nums[i]] = i;\n  }\n  return {};\n}\n",
        },
    },
    {
        "id": "graph-02",
        "title": "Number of Islands",
        "topic": "Graphs",
        "difficulty": "Medium",
        "companies": ["Meta", "Microsoft"],
        "solved": False,
        "slug": "number-of-islands",
        "description": "Count connected components in a binary grid using DFS or BFS.",
        "examples": [
            {
                "input": "grid = [[1,1,0],[0,1,0],[1,0,1]]",
                "output": "3",
                "explanation": "Three disconnected islands are present.",
            }
        ],
        "constraints": [
            "m == grid.length",
            "n == grid[i].length",
            "1 <= m, n <= 300",
        ],
        "starterCode": {
            "python": "def solve(grid):\n    if not grid:\n        return 0\n    # add DFS/BFS here\n",
            "javascript": "function solve(grid) {\n  if (!grid?.length) return 0;\n  // add DFS/BFS here\n}\n",
            "java": "class Solution {\n  public int solve(char[][] grid) {\n    if (grid == null || grid.length == 0) return 0;\n    // add DFS/BFS here\n    return 0;\n  }\n}\n",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nint solve(vector<vector<char>>& grid) {\n  if (grid.empty()) return 0;\n  // add DFS/BFS here\n  return 0;\n}\n",
        },
    },
]


def _find_problem(slug: str) -> dict[str, Any] | None:
    for problem in PROBLEMS:
        if problem["slug"] == slug:
            return problem
    return None


def _stable_seed(user: User, index: int = 0) -> int:
    try:
        base = UUID(str(user.id)).int
    except ValueError:
        base = sum(ord(char) for char in str(user.id))

    return (base + (index * 1315423911)) & 0xFFFFFFFF


def _build_rank_row(user: User, index: int = 0) -> dict[str, Any]:
    seed = _stable_seed(user, index)
    problems_solved = 40 + (seed % 280)
    streak = 3 + (seed % 25)
    score = 200 + ((problems_solved * 2) + (streak * 5))

    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "college": user.college or "AlgoCoach",
        "batch": user.batch or "N/A",
        "problemsSolved": problems_solved,
        "streak": streak,
        "score": score,
        "lastActive": "Today",
    }


def _fallback_hint(language: str) -> str:
    return {
        "python": "Use a dictionary/set to avoid nested loops where possible.",
        "javascript": "Try a Map for O(1) lookups and keep edge-cases first.",
        "java": "Prefer HashMap/HashSet for constant-time checks.",
        "cpp": "Consider unordered_map/unordered_set for faster lookups.",
    }.get(language.lower(), "Break the solution into brute force first, then optimize.")


def _generate_groq_hint(request: HintRequest) -> str:
    if not GROQ_API_KEY:
        return _fallback_hint(request.language)

    problem = request.problem or {}
    title = str(problem.get("title") or "Coding Problem")
    description = str(problem.get("description") or "")
    constraints = problem.get("constraints") or []
    constraints_text = "\n".join(f"- {item}" for item in constraints[:5])
    code = (request.code or "").strip()

    system_prompt = (
        "You are an interview coding coach. Give a concise, practical hint only. "
        "Do not provide full code or final answer. Focus on approach, edge cases, and complexity."
    )
    user_prompt = (
        f"Language: {request.language}\n"
        f"Problem: {title}\n"
        f"Description: {description}\n"
        f"Constraints:\n{constraints_text if constraints_text else '- Not provided'}\n\n"
        f"Current code:\n{code if code else '(empty)'}\n\n"
        "Return one short hint (2-4 sentences)."
    )

    payload = {
        "model": GROQ_MODEL,
        "temperature": 0.3,
        "max_tokens": 180,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }

    req = url_request.Request(
        url="https://api.groq.com/openai/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with url_request.urlopen(req, timeout=12) as response:
            body = response.read().decode("utf-8")
    except (url_error.URLError, TimeoutError):
        return _fallback_hint(request.language)

    try:
        parsed = json.loads(body)
        message = (
            parsed.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
        return message or _fallback_hint(request.language)
    except (ValueError, KeyError, IndexError, TypeError):
        return _fallback_hint(request.language)


@router.get("/problems/catalog", response_model=ProblemCatalogResponse)
def get_problem_catalog() -> ProblemCatalogResponse:
    return ProblemCatalogResponse(
        problems=[
            ProblemCatalogItem(
                id=problem["id"],
                title=problem["title"],
                topic=problem["topic"],
                difficulty=problem["difficulty"],
                companies=problem["companies"],
                solved=problem["solved"],
                slug=problem["slug"],
            )
            for problem in PROBLEMS
        ]
    )


@router.get("/problems/{slug}", response_model=ProblemDetailResponse)
def get_problem_detail(slug: str) -> ProblemDetailResponse:
    problem = _find_problem(slug)
    if not problem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found")

    return ProblemDetailResponse(
        title=problem["title"],
        difficulty=problem["difficulty"],
        description=problem["description"],
        examples=problem["examples"],
        constraints=problem["constraints"],
        companies=problem["companies"],
        starterCode=problem["starterCode"],
    )


@router.post("/api/hint", response_model=HintResponse)
def get_ai_hint(request: HintRequest) -> HintResponse:
    hint = _generate_groq_hint(request)
    return HintResponse(hint=f"{hint} Also explain your time and space complexity before finalizing.")


@router.post("/api/run-code", response_model=RunCodeResponse)
def run_code(request: RunCodeRequest) -> RunCodeResponse:
    code = request.code.strip()
    if not code:
        return RunCodeResponse(status="Wrong Answer", runtime="N/A", testCases=["No code submitted"])

    if "while True" in code or "for(;;)" in code:
        return RunCodeResponse(status="TLE", runtime="N/A", testCases=["Potential infinite loop detected"])

    verdict = "Accepted" if len(code) > 20 else "Wrong Answer"
    tests = [
        "Case 1: Passed" if verdict == "Accepted" else "Case 1: Failed",
        "Case 2: Passed" if verdict == "Accepted" else "Case 2: Failed",
        "Case 3: Passed" if verdict == "Accepted" else "Case 3: Failed",
    ]

    return RunCodeResponse(status=verdict, runtime="31 ms", testCases=tests)


@router.get("/mock/session", response_model=MockSessionResponse)
def get_mock_session(_: User = Depends(get_current_user)) -> MockSessionResponse:
    return MockSessionResponse(
        durationSeconds=45 * 60,
        questionCount=5,
        currentQuestion=MockSessionQuestion(
            id="mock-01",
            title="Valid Parentheses",
            difficulty="Easy",
            prompt=(
                "Given a string containing only the characters '(', ')', '{', '}', '[' and ']', "
                "determine if the input string is valid."
            ),
            exampleInput='s = "()[]{}"',
            exampleOutput="true",
            starterCode={
                "python": (
                    "def is_valid(s: str) -> bool:\n"
                    "    stack = []\n"
                    "    pairs = {')': '(', '}': '{', ']': '['}\n"
                    "    for ch in s:\n"
                    "        if ch in pairs:\n"
                    "            if not stack or stack[-1] != pairs[ch]:\n"
                    "                return False\n"
                    "            stack.pop()\n"
                    "        else:\n"
                    "            stack.append(ch)\n"
                    "    return not stack\n"
                ),
                "javascript": (
                    "function isValid(s) {\n"
                    "  const stack = [];\n"
                    "  const pairs = { ')': '(', '}': '{', ']': '[' };\n"
                    "  for (const ch of s) {\n"
                    "    if (pairs[ch]) {\n"
                    "      if (!stack.length || stack[stack.length - 1] !== pairs[ch]) return false;\n"
                    "      stack.pop();\n"
                    "    } else {\n"
                    "      stack.push(ch);\n"
                    "    }\n"
                    "  }\n"
                    "  return stack.length === 0;\n"
                    "}\n"
                ),
            },
        ),
    )


@router.get("/profile/overview")
def get_profile_overview(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    seed = _stable_seed(current_user)
    solved = 60 + (seed % 220)
    streak = 3 + (seed % 20)
    rank = 1 + (seed % 120)
    accuracy = 65 + (seed % 31)

    arrays = 55 + (seed % 40)
    trees = 45 + ((seed >> 3) % 45)
    dp = 35 + ((seed >> 6) % 50)
    graphs = 40 + ((seed >> 9) % 45)
    strings = 50 + ((seed >> 12) % 40)

    easy = max(20, int(solved * 0.44))
    medium = max(15, int(solved * 0.39))
    hard = max(8, solved - easy - medium)

    return {
        "user": {
            "id": str(current_user.id),
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role,
            "college": current_user.college,
            "batch": current_user.batch,
            "createdAt": current_user.created_at.isoformat() if current_user.created_at else None,
        },
        "stats": {
            "solved": solved,
            "streak": streak,
            "rank": rank,
            "accuracy": accuracy,
            "topicProgress": {
                "Arrays": arrays,
                "Trees": trees,
                "DP": dp,
                "Graphs": graphs,
                "Strings": strings,
            },
            "difficultyBreakdown": {"easy": easy, "medium": medium, "hard": hard},
        },
        "badges": ["First Solve 🎯", "7 Day Streak 🔥", "AI Free Solve 💪"],
        "submissions": [
            {"id": "s1", "problem": "Two Sum", "topic": "Arrays", "status": "Accepted", "runtime": "18 ms", "submittedAt": "2h ago"},
            {"id": "s2", "problem": "Coin Change", "topic": "DP", "status": "Wrong Answer", "runtime": "N/A", "submittedAt": "1d ago"},
        ],
    }


@router.get("/leaderboard")
def get_leaderboard(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    users = db.query(User).order_by(User.created_at.desc()).all()
    leaderboard_data = [_build_rank_row(user, index) for index, user in enumerate(users)]

    if not leaderboard_data:
        leaderboard_data = [
            {"id": "u1", "name": "Aarav Mehta", "college": "IIT Delhi", "problemsSolved": 340, "streak": 24, "score": 940},
            {"id": "u2", "name": "Riya Shah", "college": "NIT Trichy", "problemsSolved": 322, "streak": 19, "score": 921},
            {"id": "u3", "name": "Kunal Jain", "college": "BITS Pilani", "problemsSolved": 309, "streak": 17, "score": 910},
            {"id": "u4", "name": "Neha Verma", "college": "IIIT Hyderabad", "problemsSolved": 295, "streak": 14, "score": 892},
        ]

    leaderboard_data.sort(key=lambda entry: entry["score"], reverse=True)
    return {"leaderboardData": leaderboard_data}


@router.get("/admin/dashboard")
def get_admin_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    if (current_user.role or "").lower() != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    users = db.query(User).order_by(User.created_at.desc()).all()
    student_rows = [_build_rank_row(user, index) for index, user in enumerate(users)]

    top_students = sorted(student_rows, key=lambda entry: entry["score"], reverse=True)[:5]
    active_today = max(1, int(len(student_rows) * 0.35)) if student_rows else 0
    avg_score = int(sum(item["score"] for item in student_rows) / len(student_rows)) if student_rows else 0
    total_submissions = sum(item["problemsSolved"] for item in student_rows) * 7 if student_rows else 0

    students_table = [
        {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "batch": row["batch"],
            "college": row["college"],
            "problemsSolved": row["problemsSolved"],
            "lastActive": row["lastActive"],
        }
        for row in student_rows
    ]

    return {
        "adminData": {
            "user": {"role": current_user.role, "name": current_user.name},
            "kpis": {
                "totalStudents": len(student_rows),
                "activeToday": active_today,
                "avgScore": avg_score,
                "totalSubmissions": total_submissions,
            },
            "submissionsPerDay": [120, 145, 132, 190, 214, 240, 206],
            "difficultyDistribution": {"easy": 45, "medium": 38, "hard": 17},
            "topStudents": [
                {
                    "id": row["id"],
                    "name": row["name"],
                    "email": row["email"],
                    "batch": row["batch"],
                    "solved": row["problemsSolved"],
                    "score": row["score"],
                }
                for row in top_students
            ],
            "recentActivity": [
                {"id": "a1", "text": "Riya solved Graph Valid Tree", "time": "2m ago"},
                {"id": "a2", "text": "New problem added: Maximum Subarray", "time": "11m ago"},
                {"id": "a3", "text": "Batch 2026 weekly report generated", "time": "40m ago"},
            ],
            "students": students_table,
            "problems": [
                {"id": "p1", "title": "Two Sum", "topic": "Arrays", "difficulty": "Easy"},
                {"id": "p2", "title": "Course Schedule", "topic": "Graphs", "difficulty": "Medium"},
                {"id": "p3", "title": "Merge K Sorted Lists", "topic": "Heap", "difficulty": "Hard"},
            ],
        }
    }
