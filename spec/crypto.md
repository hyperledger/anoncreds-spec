## Cryptographic protocols

### Terminology

_TODO: general terms here_

 - We use `PRNG(size)` to reference an invocation of a cryptographically secure pseudo-random number generator requiring the generation of a random integer in the range `[0, size-1]`. Alternatively we use `PRNG(min, max)` to refer to the generation of a random integer in the range `[min, max]`.

### Protocols

Most protocols described here are zero-knowledge proofs for different statements. They follow the patterns of three-move rounds protocols with a commit, a challenge and a response phase which we shall describe as three separate algorithms. The challenge phase is unique, whereas the commit and response phases have a specific instance for each of the statements being proved.

#### Issuer Setup

The issuer setup consists of a set of algorithms to generate the Issuer Public Key. The set of algorithms are:

 - `CredentialKeyGen` is used by the Issuer to generate the credential public/private keypair.
 - `RevocationKeyGen` is used by the Issuer to generate the revocation public/private keypair.

The reference implementation of `CredentialKeyGen` is [here](https://github.com/hyperledger/ursa/blob/ece6ce32a59df4e1f99fa38243c1236423066bc2/libursa/src/cl/issuer.rs#L774-L832).

```
( PK, SK ) = CredentialKeyGen( L )

Inputs:

 - L, the total number of attributes signed by this issuer

Parameters:

 -

Definitions:

 - l_n, the bitlength of the RSA modulus n of the issuer public key

Outputs:

 - PK, the credential public key of the issuer
 - SK, the credential secret key of the issuer

Procedure:

 1. p = SafePrime(l_n/2)                     # Generate a safe prime

 2. q = SafePrime(l_n/2)                     # Generate a safe prime

 3. n = p * q                                # The RSA modulus

 4. p' = (p-1)/2                             # The Sophie Germain prime of p

 5. q' = (q-1)/2                             # The Sophie Germain prime of q

 6. S = PRNG(l_n)^2 (mod n)                  # A quadratic residue mod n, it generates the subgroup mod n of size p' * q'

 7. Z = S^{PRNG(2, p'*q' - 1)} (mod n)       # The term Z of the CL public key

 8. R = ()                                   # Initialise the set of terms R_i of the CL public key

 9. foreach j in (1, ..., L):

10. R = R + {S^{PRNG(2, p'*q' - 1)} (mod n)} # Generate R_j

11. PK = ( n, S, Z, R )

12. SK = ( p, q )

13. return ( PK, SK )
```

#### Proving knowledge of a signature with selective disclosure of messages (`ProveCL`)

`ProveCLCommit` and `ProveCLResponse` are used by a Holder who possesses one or more signatures from one or more Issuers and uses them to derive a proof of knowledge for them. The algorithms are invoked once per signature.

_TODO: considerations about the algorithm and its security_

_TODO: clarify exact format and encoding of inputs and outputs_

The reference implementation of `ProveCLCommit` is [here](https://github.com/hyperledger/ursa/blob/ece6ce32a59df4e1f99fa38243c1236423066bc2/libursa/src/cl/prover.rs#L1313-L1394).

```
( A', v', e', Z~, e~, v~ ) = ProveCLCommit( PK, signature, (m_1,..., m_L), RevealedIndexes, R )

Inputs:

 - PK (REQUIRED), the public key of the issuer
 - signature (REQUIRED), the output of the issuance protocol
 - (m_1,..., m_L) (OPTIONAL), the set of signed messages
 - RevealedIndexes (OPTIONAL), indices of revealed messages
 - R (OPTIONAL), the set of random factors to blind unrevealed messages; each random has length l_m + l_0 + l_H

Parameters:

 - TBD

Definitions:

 - l_n, the bitlength of the RSA modulus n of the issuer public key
 - l_m, the bitlength of messages
 - l_e, the bitlength of the prime e
 - l_v, the bitlength of the randomization factor v
 - l'_e, the size of the interval in which e is chosen
 - l_0, security parameter that governs the statistical zero-knowledge property
 - l_H, the bitsize of values hashed by the hash function H used for the Fiat-Shamir heuristic
 - L, the number of messages signed by the issuer

Outputs:

 - A', term of the rerandomised signature
 - v', term of the rerandomised signature
 - e', term of the rerandomised signature
 - Z~. t-value for the signature
 - e~, randomness used to generate t-value
 - v~, randomness used to generate t-value

Procedure:

 1. (i1, i2,..., iR) = RevealedIndexes       # the indices of messages that are revealed in this proof

 2. (j1, j2,..., jU) = [L] \ RevealedIndexes # the indices of messages that are kept hidden

 3. (m~_1, m~_2,..., m~_U) = R               # the random factors blinding each hidden message

 4. (n, S, Z, R_1, ..., R_L) = PK            # unpack the issuer public key

 5. (A, e, v) = signature                    # unpack the signature

 6. r = PRNG(l_n + l_0)                      # choose random to blind the signature

 7. A' = A * S^r mod n                       # compute the randomised signature

 8. v' = v - e * r                           # recompute v given the randomisation

 9. e' = e - 2^{l_e - 1}                     # prepare value to prove that e is positive

10. e~ = PRNG(l'_e + l_0 + l_H)              # random for t-value of the signature

11. v~ = PRNG(l_v + l_0 + l_H)               # random for t-value of the signature

12. Z~ = A'^{e~} * S^{v~} mod n              # compute t-value for the signature

13. foreach j in (j1, j2,..., jU):

14.     Z~ = Z~ * R_j^{m~_j} mod n           # add component for each undisclosed message

15. return ( A', v', e', Z~, e~, v~ )
```

The reference implementation of `ProveCLResponse` is [here](https://github.com/hyperledger/ursa/blob/ece6ce32a59df4e1f99fa38243c1236423066bc2/libursa/src/cl/prover.rs#L1533-L1633).


```
pi = ProveCLResponse( (m_1,..., m_L), RevealedIndexes, R, c, ( A', v', e', Z~, e~, v~ ) )

Inputs:

 - (m_1,..., m_L) (OPTIONAL), the set of signed messages
 - R (OPTIONAL), the set of random factors to blind unrevealed messages; each random has length l_m + l_0 + l_H
 - c, an octet string representing the Fiat-Shamir challenge value
 - A', term of the rerandomised signature
 - v', term of the rerandomised signature
 - e', term of the rerandomised signature
 - Z~. t-value for the signature
 - e~, randomness used to generate t-value
 - v~, randomness used to generate t-value

Parameters:

 - TBD

Definitions:

 - TBD

Outputs:

 - A', term of the rerandomised signature
 - Z~. t-value for the signature
 - e^, s-value for the signature
 - v^, s-value for the signature
 - (m^_1,..., m^_L), s-value for the signature

Procedure:

 1. (j1, j2,..., jU) = [L] \ RevealedIndexes # the indices of messages that are kept hidden

 2. (m~_1, m~_2,..., m~_U) = R               # the random factors blinding each hidden message

 3. v^ = v~ + c * v'                         # the response for the term v'

 4. e^ = e~ + c * e'                         # the response for the term e'

 5. foreach j in (j1, j2,..., jU):

 6.     m^_j = m~_j + c * m_j                # the response for the undisclosed messages

 7. pi = (A', Z~, e^, v^, (m^_1,..., m^_L) ) # the terms that constitute the proof that will be verified

 8. return pi
```
