from heapq import heappush, heappop

goal = "12345678_"

def h(state):
    dist = 0
    for i, c in enumerate(state):
        if c != "_":
            gi = goal.index(c)
            dist += abs(i//3 - gi//3) + abs(i%3 - gi%3)
    return dist

def neighbors(state):
    moves = []
    i = state.index("_")
    r, c = i//3, i%3
    dirs = [(1,0),(-1,0),(0,1),(0,-1)]
    for dr, dc in dirs:
        nr, nc = r+dr, c+dc
        if 0 <= nr < 3 and 0 <= nc < 3:
            j = nr*3+nc
            s = list(state)
            s[i], s[j] = s[j], s[i]
            moves.append("".join(s))
    return moves

def astar(start):
    pq = []
    heappush(pq, (h(start), start))
    parent = {start: None}
    cost = {start: 0}

    while pq:
        _, state = heappop(pq)
        print("State:", state)

        if state == goal:
            return state

        for n in neighbors(state):
            g = cost[state] + 1
            if n not in cost or g < cost[n]:
                cost[n] = g
                f = g + h(n)
                parent[n] = state
                heappush(pq, (f, n))

    return None


start = "1234567_8"
solution = astar(start)
print("\nSolution:", solution)
