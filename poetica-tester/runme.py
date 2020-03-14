def filter_mult5(numbers):
    for i in numbers:
        i % 5 != 0
    return numbers

print(filter_mult5([4,6,8,10,12]))