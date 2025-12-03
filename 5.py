from heapq import heappush, heappop

goal = "12345678_"

def heuristic(state):
    return sum(1 for i in range(9) if state[i] != goal[i] and state[i] != "_")

def get_neighbors(state):
    moves = []
    i = state.index("_")
    r, c = i // 3, i % 3
    dirs = [(1,0),(-1,0),(0,1),(0,-1)]
    for dr, dc in dirs:
        nr, nc = r + dr, c + dc
        if 0 <= nr < 3 and 0 <= nc < 3:
            j = nr * 3 + nc
            s = list(state)
            s[i], s[j] = s[j], s[i]
            moves.append("".join(s))
    return moves

def best_first(start):
    pq = []
    visited = set()
    heappush(pq, (heuristic(start), start))

    while pq:
        h, state = heappop(pq)
        print("State:", state)

        if state == goal:
            return state

        visited.add(state)

        for nxt in get_neighbors(state):
            if nxt not in visited:
                heappush(pq, (heuristic(nxt), nxt))

    return None


start = "1234567_8"
solution = best_first(start)
print("\nSolution:", solution)
