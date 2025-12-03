from itertools import permutations

def tsp(graph, start=0):
    n = len(graph)
    nodes = [i for i in range(n) if i != start]
    best_cost = float('inf')
    best_path = None

    for perm in permutations(nodes):
        path = (start,) + perm + (start,)
        cost = sum(graph[path[i]][path[i+1]] for i in range(len(path)-1))
        if cost < best_cost:
            best_cost = cost
            best_path = path

    return best_path, best_cost


graph = [
    [0, 10, 15, 20],
    [10, 0, 35, 25],
    [15, 35, 0, 30],
    [20, 25, 30, 0]
]

path, cost = tsp(graph)
print("Best Path:", path)
print("Cost:", cost)
