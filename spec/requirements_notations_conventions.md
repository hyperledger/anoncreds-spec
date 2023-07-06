## Requirements, Notation and Conventions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED",
"MAY", and "OPTIONAL" in this document are to be interpreted as
described in BCP 14 [RFC2119] [RFC8174] when, and only when, they
appear in all capitals, as shown here.

`a || b` : Denotes the concatenation of octet strings a and b.

`I \ J` : For sets I and J, denotes the difference of the two sets i.e., all the elements of I that do not appear in J, in the same order as they were in I.

`X[a..b]` : Denotes a slice of the array X containing all elements from and including the value at index a until and including the value at index b. Note when this syntax is applied to an octet string, each element in the array X is assumed to be a single byte.

`range(a, b)` : For integers a and b, with a <= b, denotes the ascending ordered list of all integers between a and b inclusive (i.e., the integers "i" such that a <= i <= b).

`length(input)` : Takes as input either an array or an octet string. If the input is an array, returns the number of elements of the array. If the input is an octet string, returns the number of bytes of the inputted octet string.

`H(...)` : Any hash function.

Terms specific to pairing-friendly elliptic curves are:

`E1, E2` : elliptic curve groups defined over finite fields. This document assumes that E1 has a more compact representation than E2, i.e., because E1 is defined over a smaller field than E2.

`G1, G2` : subgroups of E1 and E2 (respectively) having prime order r.

`GT` : a subgroup, of prime order r, of the multiplicative group of a field extension.

`e` : G1 x G2 -> GT: a non-degenerate bilinear map.

`r` : The prime order of the G1 and G2 subgroups.

`P1, P2` : points on G1 and G2 respectively. For a pairing-friendly curve, this document denotes operations in E1 and E2 in additive notation, i.e., P + Q denotes point addition and x * P denotes scalar multiplication. Operations in GT are written in multiplicative notation, i.e., a * b is field multiplication.
