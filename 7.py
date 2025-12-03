def hanoi(n, source, auxiliary, target):
    if n == 1:
        print(f"Move Disk 1 from {source} → {target}")
        return
    hanoi(n-1, source, target, auxiliary)
    print(f"Move Disk {n} from {source} → {target}")
    hanoi(n-1, auxiliary, source, target)

n = 3
print(f"Towers of Hanoi with {n} disks:\n")
hanoi(n, "A", "B", "C")
