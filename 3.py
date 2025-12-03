def dfs(capA, capB, target):
    stack = [(0, 0)]
    visited = set([(0, 0)])

    while stack:
        a, b = stack.pop()
        print(f"State: ({a}, {b})")
        if a == target or b == target:
            return (a, b)

        next_states = [
            (capA, b), (a, capB),
            (0, b), (a, 0),
            (max(0, a - (capB - b)), min(capB, b + a)),
            (min(capA, a + b), max(0, b - (capA - a)))
        ]

        for s in next_states:
            if s not in visited:
                visited.add(s)
                stack.append(s)

    return None


capA, capB, target = 4, 3, 2
solution = dfs(capA, capB, target)
print("\nSolution:", solution)
