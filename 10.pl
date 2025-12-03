% Facts
father(john, paul).
father(paul, mark).
mother(mary, paul).
mother(linda, mark).

% Rules
parent(X, Y) :- father(X, Y).
parent(X, Y) :- mother(X, Y).

grandparent(X, Y) :- parent(X, Z), parent(Z, Y).

sibling(X, Y) :- parent(P, X), parent(P, Y), X \= Y.

ancestor(X, Y) :- parent(X, Y).
ancestor(X, Y) :- parent(X, Z), ancestor(Z, Y).

% Sample Queries:
% ?- parent(john, paul).
% ?- grandparent(john, mark).
% ?- mother(X, mark).
% ?- sibling(paul, X).
% ?- ancestor(john, mark).
