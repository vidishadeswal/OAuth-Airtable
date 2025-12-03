from collections import deque

def is_winner(board, player):
    wins = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]
    return any(all(board[i] == player for i in line) for line in wins)

def is_full(board):
    return '.' not in board

def next_states(board, player):
    nxt = 'O' if player == 'X' else 'X'
    return [(board[:i] + player + board[i+1:], nxt) for i, c in enumerate(board) if c == '.']

def bfs(start):
    queue = deque([(start, 'X')])
    visited = set([start])
    while queue:
        board, player = queue.popleft()
        if is_winner(board, 'X'):
            return board
        if is_winner(board, 'O') or is_full(board):
            continue
        for state, nxt in next_states(board, player):
            if state not in visited:
                visited.add(state)
                queue.append((state, nxt))
    return None

start_board = "........."
solution = bfs(start_board)
print("Initial:", start_board)
print("Winning Board Found:", solution)
