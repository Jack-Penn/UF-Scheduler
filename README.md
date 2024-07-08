# UF Class Scheduler

This [Next.js](https://nextjs.org/) Web Application helps students of the University of Florida create possible semester schedules to fit in all the classes they want to take.

## About

The app's design was inspired by the schedule views in [One.UF](https://one.uf.edu/) and the class data is sourced from UF's [Schedule of Courses Catalog](https://one.uf.edu/soc/).

The app's idea originated from the UCF course scheduler, which suggests semester schedules for students picking their classes.

The app also implements professor rating data sourced from [Rate My Professor](https://www.ratemyprofessors.com/school/1100).

## Algorithm

### Testing Class Section Conflicts

To determine whether two class sections have conflicting meet times, this app implements the method described in [this](https://stackoverflow.com/questions/13257826/efficient-scheduling-of-university-courses#comment18068165_13257826) stack overflow comment.

First, the `meetTimes` of each section is converted to a bit array (implemented as a boolean array in javascript). Each of the 5 groupings of 11 bits in the array (55 bits total) reprersent a day Monday-Friday, where each bit corresponds to periods 1-11 on that day. A 1 or `true` bit in the array represents that the class section meets on that period that day, while a 0 or `false` reprersents not meeting.

For example, a class that meets on Monday period 1-2 and Tuesday periods 5-7 would have bits:

```
                  Monday                      Tuesday
Bits      1 1 0 0 0 0 0 0 0  0  0    0 0 0 0 1 1 1 0 0  0  0
Periods:  1 2 3 4 5 6 7 8 9 10 11    1 2 3 4 5 6 7 8 9 10 11   ...

```

```
11000000000 00001110000 00000000000 00000000000 00000000000
  Monday      Tuesday    Wednesday   Thursday      Friday
```

Using this representation, class conflicts can be quickly found by performing a bitwise OR opperation between the binary representation of two class' meetTimes, and then testing if the sum of the bits in the OR-ed binary array equals the added sums of the two class' bit arrays.

```
Class A: 11000000000 00001110000 00000000000 00000000000 00000000000
Class B: 10000000000 10000000000 10000000000 10000000000 00000000000
A | B :  11000000000 10001110000 10000000000 10000000000 00000000000

Count(A) = 5
Count(B) = 4
Count(A|B) = 8 ≠ Count(A) + Count(B)
  ∴ classes A and B have a conflict
```

### Scheduling Algorithm

The app uses the Bron-Kerbosch Maximal Cliques Algorithm as described in [this](https://www.youtube.com/watch?v=j_uQChgo72I) video.

A graph is created where each class section is represented as a node in a graph and node link are created whenever two sections don't conflict (using the algorithm described above). Then, the Bron-Kerbosch algorithm is implemented to find all maximal groups of section nodes where every node contains links to all other nodes in the group. The algorithm recursively generates all possible class schedules that are maximal such that no schedule found is contained within another schedule, and each schedule fits as many non-conflictinng classes from the list in as possible. Lastly, the schedules are sorted by total credits in descending order as to prioritize the most 'useful' schedules.
