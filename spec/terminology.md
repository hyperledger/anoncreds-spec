## Terminology

[[def: Accumulator, accumulator]]

~ A [cryptographic accumulator] is used in the AnonCreds v1.0 Revocation scheme as a space- and time-efficient method of proving a value membership in a set of values without revealing the individual members of the set. In AnonCreds v1, an accumulator is a core element of the [[ref: verifiable credential]] revocation mechanism.

[[def: AnonCreds Method, AnonCreds method, AnonCreds Methods, AnonCreds methods]]

~ AnonCreds methods specify how AnonCreds objects are written (registered) and read (resolved) on a given [[ref: verifiable data registry]] implementation. AnonCreds was originally written to use [Hyperledger Indy] as its only [[ref: VDR]] implementation, but the evolution of AnonCreds to enable storing objects on any [[ref: VDR]] implementation means that AnonCreds methods (comparable to [[ref: DID Methods]] from the [W3C DID Core specification]) are necessary. AnonCreds Methods are defined in the [AnonCreds Methods Registry] repository.

[Hyperledger Indy]: https://www.hyperledger.org/projects/hyperledger-indy
[W3C DID Core specification]: https://www.w3.org/TR/did-core/
[AnonCreds Methods Registry]: https://hyperledger.github.io/anoncreds-methods-registry/

[[def: AnonCreds Objects, AnonCreds objects]]

~ The published and shared data objects used in AnonCreds v1.0 including the published objects [[ref: schema]], [[ref: credential definition]], [[ref: revocation registry definition]], [[ref: revocation registry entry]] and the shared objects [[ref: credential offer]], [[ref: credential request]], and [[ref: presentation request]].

[[def: BigNumber, BigNumbers]]

~ A [BigNumber] is an data object which safely allows mathematical operations on numbers of any magnitude. BigNumbers are commonly used in cryptography schemes, including those underlying AnonCreds v1.0.

[BigNumber]: https://docs.ethers.org/v5/api/utils/bignumber/

[[def: Blinded Secret, Blinded secret, blinded secret, unblinded secret, Unblinded secret]]

~ A cryptographic technique where a secret value (a number) is blinded before it is shared such that the sender can later prove knowledge of the secret value without sharing it. The AnonCreds v1.0 [[ref: link secret]]
mechanism is based on the use of a blinded secret.

[[def: Blinded Secrets Correctness Proof]]

~ A [[ref: ZKP]]-based proof that can be verified to show that a [[ref: blinded secret]] was produced correctly from an [[ref: unblinded secret]] without exposing the secret.

[[def: Blinding Factor, blinding factor]]

~ A blinding factor is a random [[ref: BigNumber]] selected from the set of integers up to the order of the RSA group, `n`. It is generated by the [[ref:holder]] to blind their [[ref:link secret]] during credential issuance. Knowledge of the blinding factor can be used to create a [[ref: Blinded Secrets Correctness Proof]].The blinding factor can be removed from the signature the [[ref:issuer]] produces to retrieve a valid signature over the [[ref: unblinded link secret]]. A blinding factor and associated [[ref: Blinded Secrets Correctness Proof]] are similarly generated for each non-disclosed attribute during credential presentation, such that a [[ref: holder]] can prove they know these values without revealing them to the [[ref: verifier]].

[[def: Call Home, Call home, call home]]

~ Call home is a term used when evaluating the privacy characteristics of [[ref: verifiable credential]] deployments. If a [[ref: holder]] presenting data from a verifiable credential must always contact ("call home to") the [[ref: issuer]], [[ref: holder]] actions are open to the actual, or perception of, tracking of the holder by the issuer. [[ref: Verifiable credential]] schemes that do not make possible the tracking of [[ref: holder]] activities by [[ref: issuers]] are preferred.

[[def: Claim, claim, claims, Claims]]

~ A claim is a part of digital identity related to a [[ref: subject]]. A claim can be attested by the identity subject itself, or it can be asserted by another entity.

[[def: Correlatability, correlatability, correlation, Correlation, correlatable, Correlatable]]

~ When a verifiable credential scheme that has the attribute of [[ref: unlinkability]], the data from the process of sharing a [[ref: verifiable presentations]] with different verifiers cannot be correlated to identify the [[ref: holder]].

[[def: Credential, Credentials, credential, credentials, verifiable credential, verifiable credentials, Verifiable Credential, Verifiable Credentials]]

~ A credential is a set of [[ref: claims]] about an identity [[ref: subject]]. A verifiable credential is a tamper-proof credential whose authorship is cryptographically verifiable. An anonymous credential, also known as AnonCreds, is a verifiable credential that has privacy-preserving properties to enable data minimization and correlation resistance.

[[def: Credential Definition, Credential Definitions, Public Credential Definition, Private Credential Definition, CredDef, CredDefs, credential definition, CLAIM_DEF, CRED_DEF]]

~ A credential definition (also known as CRED_DEF or CLAIM_DEF) contains the public data required for [[ref: credential]] issuances (used by the [[ref:issuer]]) as well as [[ref: credential]] validation data (used by [[ref:holders]] and [[ref:verifiers]]). Any number of credentials can be issued based on a single credential definition. A credential definition is generated by the [[ref:issuer]] before [[ref:credential]] any issuances and published for anyone (primarily [[ref: holders]] and [[ref: verifiers]]) to use. In generating the published credential definition, related private data is also generated and held as a secret by the issuer. The secret data includes the private keys necessary to generate signed [[ref: verifiable credentials]] that can be presented and verified using the published credential definition. A credential definition can optionally be generated such that its generated credentials can be revoked.

[[def: Credential Key Correctness Proof]]

~ A proof generated during the creation of the [[ref: credential definition]] and included in the [[ref: credential offer]] so that the [[ref:holder]] can verify that the [[ref: issuer]] is in control of the private data associated with the published [[ref: credential definition]].

[[def: Credential Offer, credential offer, Credential offer]]

~ A credential offer is a data object sent by an [[ref: issuer]] to a [[ref: holder]] offering to issue a [[ref: credential]]. The credential offer contains the details about the claims the [[ref: issuer]] intends to issue to the [[ref: holder]]. A [[ref: holder]] can reply to the [[ref: issuer]] with a [[ref: credential request]]. A credential offer also includes a [[ref: nonce]] and a [[ref: Credential Key Correctness Proof]].

[[def: Credential Request, credential request, Credential request]]

~ A credential request is a request from an [[ref: holder]] towards a [[ref: issuer]] to get a credential issued by the [[ref: issuer]]. The credential request references a preceding [[ref: credential offer]] and defines the claims the [[ref: holder]] wants to get issued, including a [[ref: Blinded Secret]] and associated [[ref: Blinded Secrets Correctness Proof]]. A credential request also includes a [[ref: nonce]] that is used in issuing the credential.

[[def: Data Minimization, data minimization, Data minimization]]

~ An attribute of verifiable data sharing schemes that considers privacy of a scheme based on the amount of data shared in a given interaction. Ideally, the minimum amount of data is shared for the purpose of the interaction. Techniques such as [[ref: selective disclosure]], [[ref: predicates]], and [[ref: unlinkability]], all available in AnonCreds v1.0 support the goal of privacy-preserving, minimal data sharing.

[[def: DID, DIDs]]

~ A Decentralized Identifier (DID), defined by the [W3C DID Core Specification], is a type of identifier that is useful in enabling verifiable, decentralized digital identity. A DID refers to any subject (e.g., a person, organization, thing, data model, abstract entity, etc.) as determined by the controller of the DID. DIDs are not used in AnonCreds itself but there must be a verifiable identifier (usually a DID) with an enforced relationship between [[ref: schema publishers]] and [[ref: issuers]] and the AnonCreds objects they publish. This is outlined in a note in [this specification section](#anoncreds-setup-data-flow).

[[def: DID Method, DID method, DID Methods, DID methods]]

~ DID methods specify how DID documents are created and resolved (read) on a given [[ref: verifiable data registry]] implementation, allowing DIDs to be created and resolved in a wide variety of storage containers. The capabilities required by DID Methods are defined in the [DID Core specification], and the (many) DID Methods are defined in the [DID Methods Registry] repository.

[DID Methods Registry]: https://www.w3.org/TR/did-spec-registries/#did-methods

[[def: Holder, Holders, holder, holders, prover, Prover]]

~ In this specification, the holder is a software component (agent) used by an entity (person, organization, etc.) in possession of [[ref: credentials]] issued to them. Where "holder" is used in the specification we mean the software component. In some places where required, we clearly refer to an entity using holder software as separate from the holder software component. Holders interact with [[ref: issuers]] to obtain [[ref: credentials]], and derive [[ref: presentations]] from the [[ref: credentials]] they hold. 

[[def: Issuer, Issuers, issuer, issuers]]

~ An issuer is one of the three entities that interact with each other within the domain of digital identities. It can assert [[ref: claims]] about a [[ref: subject]] in the form of a tamper-proof credential whose origins are cryptographically verifiable.

[[def: Issuer Identifier, Issuer Identifiers, issuer identifier, issuer identifiers]]

~ An issuer identifier is a unique identifier for an [[ref: issuer]]. It is used to identify the [[ref: issuer]] of AnonCreds objects published to a [[ref: Verifiable Data Registry]].

[[def: Link secret, link secret, blinded link secret, unblinded link secret]]

~ A link secret is a unique identifier known only to the [[ref: holder]] used in AnonCreds to bind credentials issued to a [[ref: holder]] to that [[ref: holder]], and to demonstrate that all of the source verifiable credentials in a presentation are bound to the same link secret that is known to the [[ref: holder]]. During issuance and presentation processes the [[ref: holder]]'s link secret is blinded with a [[ref: blinding factor]] such that it is not correlatable, and a [[ref: Blinded Secrets Correctness Proof]] is provided by the holder to demonstrate they know the link secret without revealing it.

~ Link secret is also known by the deprecated term `master_secret` in some AnonCreds source code.

[[def: Nonce, nonce, nonces, Nonces]]

~ A nonce is an arbitrary unique number that is often required as an input to the generation of a cryptographic proof to ensure it is uniquely generated and once produced, cannot be replayed. Within AnonCreds, nonces are used during the issuance and presentation processes to prevent replay attacks.

[[def: Non-Revocation Proof, NRP, non-revocation proof, Non-revocation proof]]

~ A non-revocation proof is a proof provided by a [[ref: holder]] to demonstrate that a revocable credential they are presenting has not been revoked, without revealing a unique, correlatable identifier for the credential. A [[ref: verifier]] verifies a non-revocation proof using information from the [[ref: revocation registry]] to which the [[ref: credential]] belongs.

[[def: Predicates, predicates, predicate, Predicate]]

~ A [[ref: zero-knowledge proof]] predicate is a boolean assertion (operators `<=`, `<`, `>`, `>=`) in an presentation about the value of an integer [[ref: claim]] without disclosing the value of the claim.

[[def: Presentation Request, presentation request, presentation requests, Presentation Requests]]

~ An AnonCreds presentation request is an object constructed by the [[ref: verifier]] and sent to the [[ref: holder]] defining the verifiable data that the [[ref: verifier]] wants from the [[ref: holder]] for some purpose.

[[def: Prover, prover]]

~ A prover is a synonym for holder that is sometimes used in a [[ref: holder]]-[[ref: verifier]] interaction. In this specification, we use the term "holder" in all cases. However the underlying AnonCreds implementations use "prover" in code.

[[def: Revocation, revocation]]

~ A unilateral action by the [[ref: issuer]] of a [[ref: verifiable credential]] issued to a [[ref: holder]] to revoke that credential for some reason. Once an issued credential has been revoked, the [[ref: holder]] can no longer produce a [[ref: non-revocation proof]] for the [[ref: credential]]. [[ref: Verifiers]] usually (but not always) are interested if a data is presented from a revoked [[ref: credential]].

[[def: Revocation Registry, Revocation registry, revocation registry, RevReg]]

~ A Revocation registry is a set of objects related to one another and a [[ref: credential definition]] that holds information about the revocation status of a set of revocable credentials issued from the [[ref: credential definition]]. Each revocation registry consists of a [[ref: revocation registry definition]] and one or more [[ref: revocation registry entries]]. There can be 0 or more revocation registries related to a [[ref: credential definition]], and every issued AnonCreds revocable credential is in a revocation registry.

[[def: Revocation Registry Definition, revocation registry definition, RevRegDef]]

~ A revocation registry definition is an object with public and private information about a [[ref: revocation registry]]. The public part is published such that it an be resolved and used by anyone, while the private part is a secret held by the [[ref: issuer]] for use when publishing [[ref: revocation registry entries]] that update the revocation status of one or more credentials.

[[def: Revocation Registry Entry, Revocation Registry Entries, revocation registry entry, revocation registry entries, RevRegEntry, RevRegEntries]]

~ A revocation registry entry is an object that is published by the [[ref: issuer]] to set/update the revocation status of one or more issued credentials that are in a [[ref: revocation registry]]. Each revocation registry entry has an identifier (sometimes called a `timestamp`), a cryptographic accumulator that summarizes the revocation state of all the credentials in the [[ref: revocation registry]] and, depending on the [[ref: AnonCreds Method]] being used to publish the object, either the revocation state of all of the credentials in the registry, or the set of credentials whose revocation state has changed ("deltas") since the last revocation registry entry was published.

[[def: Revocation Status List, revocation status list]]

~ A Revocation status list is an object that contains the revocation status ("revoked" or "not revoked") of all credentials in a [[ref: Revocation Registry]] at the time of a given [[ref: revocation registry entry]]. For [[AnonCreds Methods]] that store [[ref: revocation registry entries]] as deltas (changes to the revocation state of credentials from the previous [[ref: revocation registry entry]]), the set of deltas from the initial publication of the [[ref: revocation registry]] must be collected and used to calculate the full revocation state of all of the credentials.

[[def: Schema, Schemas]]

~ A Schema is a object that defines the set of [[ref: claims]] (also known as attributes) that will be populated by [[ref: issuers]] in issuing a give type of AnonCreds [[ref: verifiable credentials]]. Schemas have a name, version, and are published to a [[ref: verifiable data registry]] by a [[ref: schema publisher]] using an [[ref: AnonCreds Method]]. [[ref: Credential definitions]] are generated from a specific schema.

[[def: Schema Publisher, schema publisher, Schema publisher, Schema Publishers, schema publishers, Schema publishers]]

~ A Schema publisher is an entity that publishes a [[ref: Schema]] to a [[ref: verifiable data registry]]. The schema publisher could be the one [[ref: issuer]] of a type of credential, but could also be another entity that creates a [[ref: Schema]] to be used by many [[ref: issuer]]s to issue the same type of credential.

[[def: Selective Disclosure, selective disclosure, Selective disclosure]]

~ Selective disclosure is the ability to minimize data the shared data from an issued [[ref: credential]] in a [[ref: presentation]] by revealing to a [[ref: verifier]] only a subset of [[ref: claims]] in the [[ref: credential]]. The source credential is still verified by the [[ref: verifier]], but only the revealed values are disclosed.

[[def: Signature Correctness Proof]]

~ A [[ref: ZKP]]-based proof that can be verified to show that a signature over a message is valid, without revealing the message or signature.

[[def: Subject, subject, Credential Subject, credential subject]]

~ A subject, also known as an identity subject, is the entity about whom the [[ref: claims]] in a credential are asserted. In AnonCreds, the credential subject is not formally defined in [[ref: credential]]. Rather, the issuance of a [[ref: credential]] is always to a specific [[ref: holder]]. The semantics of the credential defines the relationship between the [[ref: holder]] and the subject, with the [[ref: holder]] frequently being the subject.

[[def: Tails File, Tails file, tails file]]

~ A tails file is a part of the AnonCreds v1.0 scheme that enables a [[ref: holder]] to produce a [[ref: non-revocation proof]]. A tails file is a static file generated as part of the creation of a [[ref: revocation registry]] by the [[ref: issuer]], published, and retrieved by the [[ref: holder]] of a credential that is in the related [[ref: revocation registry]]. The [[ref: holder]] must have the tails file in order to generate a [[ref: non-revocation proof]] for a source [[ref: credential]] they are providing in a [[ref: presentation]].

[[def: Unlinkability, unlinkability, Unlinkable, unlinkable]]

~ Unlinkability is the attribute of some verifiable credentials schemes (notably AnonCreds) such that no [[ref: correlatable]] identifiers are shared in carrying out verifiable credential issuance and presentation processes. Unlinkability requires that when the processes are repeated with the same or different parties ([[ref: issuers]], [[ref: verifiers]]) no common unique identifiers are shared. Note that unlinkability may be lost if there are unique identifiers shared in the revealed [[ref: claim]] values of [[ref: presentations]].

[[def: Verifiable Data Registry, VDR, verifiable data registry]]

~ [[ref: DIDs]], DID documents and published [[ref: AnonCreds objects]] are stored in a verifiable data registry (VDR) such that an identifier for an object can be resolved (by anyone, in most cases), and the identified object returned. A VDR can be a distributed ledger, a blockchain, a web server, database or any other type of storage system. The process of going from the identifier to discovering and resolving the object is a DID Method (for DIDs) and [[ref: AnonCreds Method]] (for [[ref: AnonCreds objects]]). Resolved objects must adhere to their specified data model, regardless of the discover/resolution method used and the verifiable data registry in which the objects are stored.

[[def: Verifiable Presentation, verifiable presentation, presentation, Presentation, Verifiable Presentations, verifiable presentations, presentations, Presentations]]

~ An AnonCreds verifiable presentation is a collection of [[ref: claims]] and [[ref: predicates]] derived from one or more [[ref: credentials]] with an added proof that the [[ref; verifier]] can verifier. AnonCreds enable the holder to prove it holds a claim from a VC without revealing the VC itself. Verifying a presentation shows the [[ref: issuer]] of the source [[ref: credentials]], to whom the credentials where issued, that the [[ref: claims]] have not been tampered with, and, if applicable, that the source credentials have not been revoked. AnonCreds presentations are designed to maximize the privacy of the [[ref: holder]] sharing the presentation.

[[def: Verifier, verifier, Verifiers, verifiers]]

~ A verifier is an entity that verifies the information from a [[ref: holder]] in a [[ref: presentation]].

[[def: Zero-knowledge proof, zero-knowledge proof, zero-knowledge proofs, ZKP, Zero-knowledge proofs]]

~ In cryptography, a zero-knowledge proof is a method by which an entity can prove that they know a certain value without disclosing the value itself. Zero-knowledge proofs in AnonCreds enable a number of privacy-preserving capabilities.

~ - Prove knowledge of the value of the [[ref: link secret]] related to given a [[ref: blinded link secret]].

~ - Share data from multiple [[ref: credentials]] in a single [[ref: verifiable presentation]] without revealing to the [[ref: verifier]] any correlatable identifiers.

~ - Use [[ref: selective disclosure]] to reveal only necessary [[ref: claims]] in a [[ref: verifiable presentation]]. 

~ - Use [[ref: predicates]] to minimize the data shared by the [[ref: holder]], such as proving based on a date of birth [[ref: claim]] that they are older than 18 **without** sharing their date of birth. 

~ - Prove that the source [[ref: credentials]] shared in a presentation have not been revoked without sharing unique identifiers for the [[ref: credentials]].

### Cryptographic Notations

This specification contains the cryptographic calculations necessary to produce the data objects exchanged in using Hyperledger AnonCreds, and to verify the various proofs embedded in those objects. The following is information about the notations used in displaying the cryptographic calculations:

`a || b` : Denotes the concatenation of octet strings `a` and `b`.

`I \ J` : For sets `I` and `J`, denotes the difference of the two sets i.e., all the elements of `I` that do not appear in `J`, in the same order as they were in `I`.

`X[a..b]` : Denotes a slice of the array `X` containing all elements from and including the value at index `a` until and including the value at index `b`. Note when this syntax is applied to an octet string, each element in the array `X` is assumed to be a single byte.

`range(a, b)` : For integers `a` and `b`, with `a <= b`, denotes the ascending ordered list of all integers between `a` and `b` inclusive (i.e., the integers `i` such that `a <= i <= b`).

`length(input)` : Takes as input either an array or an octet string. If the input is an array, returns the number of elements of the array. If the input is an octet string, returns the number of bytes of the inputted octet string.

`H(...)` : Any hash function.

Terms specific to pairing-friendly elliptic curves are:

`E1, E2` : elliptic curve groups defined over finite fields. This document assumes that `E1` has a more compact representation than `E2`, i.e., because `E1` is defined over a smaller field than `E2`.

`G1, G2` : subgroups of `E1` and `E2` (respectively) having prime order `r`.

`GT` : a subgroup, of prime order `r`, of the multiplicative group of a field extension.

`e` : `G1 x G2 -> GT` a non-degenerate bilinear map.

`r` : The prime order of the `G1` and `G2` subgroups.

`P1, P2` : points on `G1` and `G2` respectively. For a pairing-friendly curve, this document denotes operations in `E1` and `E2` in additive notation, i.e., `P + Q` denotes point addition and `x * P` denotes scalar multiplication. Operations in `GT` are written in multiplicative notation, i.e., `a * b` is field multiplication.
