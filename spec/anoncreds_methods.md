## AnonCreds Methods

In the AnonCreds data flows are specifications of data models that contain
identifiers to public AnonCreds objects ([[ref: Schemas]], [[ref: CredDefs]],
[[ref: Rev_Reg_Defs]] and [[ref: Rev_Reg_Entrys]]) that are published by issuers
to locations ([[ref: Verifiable Data Registries]] or VDRs) that must be
accessible to holders and verifiers to enable presentation generation and
verification. The format of the objects identifiers and the
location of the objects are not defined in this specification. Rather, similar
to the approach of [[ref: DID Methods]] defined in the [W3C DID
Specification](https://www.w3.org/TR/did-core/), [[ref: AnonCreds methods]]
allow for the registration and resolution mechanisms for AnonCreds objects
across a range of VDRs. A registry of supported [[ref: AnonCreds methods]] can
be found in the [AnonCreds Methods Registry](#anoncreds-methods-registry).

Each [[ref: AnonCreds method]] specifies the format of the object identifiers,
to what [[ref: Verifiable Data Registry]] the objects are published, how issuers
register (publish) objects, and how issuers and verifiers can resolve the
identifiers to retrieve the published objects. Implementations of agents
(issuers, holders, verifiers) with AnonCreds support should be organized so as
to allow issuers to use at least one [[ref: AnonCreds method]] for registration,
and to allow holders and verifiers to use one or more [[ref: AnonCreds Methods]]
for resolution. AnonCreds issuers will likely choose just a single AnonCreds
registration method(s) they will use, and all AnonCreds participants will choose
the set of AnonCreds resolvers they will require based on the issuers and types
of credentials they want to support. As with DIDs, an external Universal
AnonCreds Resolver is possible, as is a Universal AnonCreds Registrar.

### AnonCreds Identifiers

AnonCreds identifiers SHOULD be a Uniform Resource Identifier (URI)
conformant with [RFC3986](https://www.w3.org/TR/did-core/#bib-rfc3986), although
one notable exception is permitted. The exception is that for backwards
compatibility, the AnonCreds identifiers used in the early (pre
`did:indy`) open source Hyperledger Indy AnonCreds implementation are permitted.
In the [AnonCreds Method Registry](#anoncreds-method-registry),
this is the [Hyperledger Indy Legacy AnonCreds Method](https://anoncreds-wg.github.io/anoncreds-methods-registry/#hyperledger-indy-legacy-anoncreds-method).

### Revocation Support

Implementers only familiar with the "deltas"-style data format of Hyperledger Indy
[[ref: RevRegEntries]] may not be aware that other VDRs may
store the contents of each [[ref: RevRegEntry]] as
"full state", meaning the status of each credential in the registry
(revoked or not) is stored, vs. only the differences from the previous
[[ref: RevRegEntry]] as in Hyperledger Indy. Either approach is fine
as long as data is normalized by the AnonCreds method to the [[ref: RevReg]]
format expected for AnonCreds [generate presentation](#generate-presentation)
processing. This allows a AnonCreds Methods to trade-off the size of the
[[ref: RevRegEntry]] in the VDR with the need for VDR-side processing to collect
all of the deltas needed by the holder.

An AnonCreds Method may opt to not support [[ref: revocation]] at all, and generate
an error if the issuer attempts to create a [[ref: CredDef]] that includes revocation
support.

### AnonCreds Method Registry

The AnonCreds Method Registry is published
[here](https://anoncreds-wg.github.io/anoncreds-methods-registry/). The
registry contains a description, metadata and a link to a specification for each
AnonCreds Method submitted by its implementers/maintainers. The registry is a web page
generated from [this
repository](https://github.com/AnonCreds-WG/anoncreds-methods-registry).

The AnonCreds Methods registry repository and published registry is
managed by the AnonCreds Specification Working Group based on this [governance
framework](https://anoncreds-wg.github.io/anoncreds-methods-registry/#governance).

Each entry in the [AnonCreds Method
Registry](https://anoncreds-wg.github.io/anoncreds-methods-registry/)
links to a specification for the associated [[ref: AnonCreds objects method]].
The method specifications must include information about the AnonCreds identifiers
used by the method, along with the mechanisms for AnonCreds objects registration
and resolution. In some cases, the [[ref: AnonCreds method]]
specification is defined within a [[ref: DID Method]] specification, while in
other cases, the [[ref: AnonCreds method]] is a standalone
specification.
