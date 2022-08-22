## AnonCreds Objects Methods

In the AnonCreds data flows are specifications of data models that contain
identifiers to AnonCreds objects ([[ref: Schemas]], [[ref: CredDefs]], [[ref:
Rev_Reg_Defs]] and [[ref: Rev_Reg_Entrys]]) that are published by issuers to
locations ([[ref: Verifiable Data Registries]] or VDR) accessible to holders and
verifiers. The format of the objects identifiers and the location of the objects
are not defined in this specification. Rather, similar to the approach of [[ref:
DID Methods]] defined in the [W3C DID
Specification](https://www.w3.org/TR/did-core/), [[ref: AnonCreds objects
methods]] allow for the registration and resolution mechanisms for AnonCreds
objects across a range of VDRs. A registry of supported [[ref: AnonCreds objects
methods]] can be found in the [AnonCreds Objects Method
Registry](#anoncreds-objects-method-registry).

Each [[ref: AnonCreds objects method]] specifies the format of the object
identifiers, to what [[ref: Verifiable Data Registry]] the objects are
published, how issuers register (publish) objects, and how anyone can resolve
the identifiers to retrieve the published objects. Implementations of an
AnonCreds should be organized so as to allow issuers access to at least one
[[ref: AnonCreds objects method]] for registration, and to allow holders and
verifiers to access one or more [[ref: AnonCreds Objects Methods]] for
resolution. AnonCreds issuers can then choose what AnonCreds registration
method(s) they will use, and all AnonCreds participants choose what AnonCreds
object resolvers they support. As with DIDs, an external Universal AnonCreds
Objects Resolver is possible, as is a Universal AnonCreds Object Registrar.

### AnonCreds Objects Identifiers

AnonCreds objects identifiers SHOULD be a Uniform Resource Identifier (URI)
conformant with [RFC3986](https://www.w3.org/TR/did-core/#bib-rfc3986), although
one notable exception is permitted. The exception is that for backwards
compatibility, the AnonCreds objects identifiers used in the early (pre
`did:indy`) open source Hyperledger Indy AnonCreds implementation are permitted.
In the [AnonCreds Objects Method Registry](#anoncreds-objects-method-registry),
this is the [Hyperledger Indy Legacy AnonCreds Objects Method](https://anoncreds-wg.github.io/anoncreds-objects-methods-registry/#hyperledger-indy-legacy-anoncreds-objects-method).

### Optional Revocation Support

To support [[ref: revocation registries]] as defined in this specification some
kind of "VDR-side" support is needed for enabling the efficient collection of
revocation registry entries by holders before generating a [[ref: non-revocation
proof]] (NRP). Since not all VDRs can provide such functionality (such as a
`did:web`-based method that uses a simple web server as a VDR), an [[ref:
AnonCreds objects method]] MAY choose to not support AnonCreds revocation.

### AnonCreds Objects Method Registry

The AnonCreds Objects Method Registry is published
[here](https://anoncreds-wg.github.io/anoncreds-objects-methods-registry/). The
registry contains a description, metadata and a link to a specification for each
AnonCreds object method submitted by VDR implementers. The registry is a web page
generated from [this
repository](https://github.com/AnonCreds-WG/anoncreds-objects-methods-registry).

The AnonCreds Objects Methods registry repository and published registry is
managed by the AnonCreds Specification Working Group based on this [governance
framework](https://anoncreds-wg.github.io/anoncreds-objects-methods-registry/#governance).

Each entry in the [AnonCreds Objects Method
Registry](https://anoncreds-wg.github.io/anoncreds-objects-methods-registry/)
links to a specification for the associated [[ref: AnonCreds objects method]].
The specifications include information about the AnonCreds objects identifiers
used by the method, along with the mechanisms for AnonCreds objects registration
and resolution. In some cases, the [[ref: AnonCreds objects method]]
specification is defined within a [[ref: DID Method]] specification, while in
other cases, the [[ref: AnonCreds objects method]] is a standalone
specification.
