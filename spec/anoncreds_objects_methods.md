## AnonCreds Objects Methods

Throughout the AnonCreds data flows are specifications of data models that
contain identifiers to AnonCreds objects that are published by issuers to
locations ([[ref: Verifiable Data Registries]]) accessible to holders and
verifiers. The format of the objects identifiers and the location of the objects
are not defined in this specification. Rather, similar to the approach of [[ref:
DID Methods]] defined in the [W3C DID
Specification](https://www.w3.org/TR/did-core/), [[ref: AnonCreds Object
Methods]] specify registration and resolution mechanisms for AnonCreds objects.
The methods are added by their maintainers to the [AnonCreds
Objects Method Registry](#anoncreds-objects-method-registry).

[[ref: AnonCreds Objects Methods]] specify how issuers register AnonCreds
objects ([[ref: Schemas]], [[ref: CredDefs]], [[ref: Rev_Reg_Defs]] and [[ref:
Rev_Reg_Entrys]]), including the specification of the identifier format for each
type of object, to what [[ref: Verifiable Data Registry]] the objects are
published, how issuers register the objects, and how anyone can resolve the
identifiers to retrieve the published objects. Implementations of the AnonCreds
specification should be organized so as to support for issuers at least one
[[ref: AnonCreds Objects Methods]] for registration, and one or more [[ref:
AnonCreds Objects Methods]] for resolution. AnonCreds issuers choose what
AnonCred registration method(s) they use, and all AnonCreds participants choose
what AnonCreds object resolvers they support. As with DIDs, a Universal
AnonCreds Objects Resolver is possible, as is a Universal AnonCreds Object
Registrar.

### AnonCreds Objects Identifiers

AnonCred object identifiers SHOULD be a Uniform Resource Identifier (URI)
conformant with [RFC3986](https://www.w3.org/TR/did-core/#bib-rfc3986), although
one notable exception is defined. The lone exception is that for backwards
compatibility, the AnonCreds objects identifiers used in the early (pre
`did:indy`) open source Hyperledger Indy AnonCreds implementation are permitted.
In the [AnonCreds Objects Method Registry](#anoncreds-objects-method-registry),
this is the [Hyperledger Indy AnonCreds objects method](#hyperledger-indy-anoncreds-object-method).

### AnonCreds Objects Method Registry

The AnonCreds Objects Method Registry contains a description and reference to
each AnonCreds object method specification. The specification outlines the
AnonCreds objects identifiers used, along with mechanisms for AnonCreds objects
registration and resolution. In some cases, the AnonCreds objects method is
specified within a DID Method specification, while in other cases, the AnonCreds
objects method is a standalone specification.

::: note
This registry will be moved to a separate document, generated from a separate
git repository.
:::

#### Hyperledger Indy AnonCreds Objects Method

The Hyperledger Indy AnonCreds objects method is the mechanism implemented in
the early Hyperledger Indy instances, prior to the implementation of `did:indy`
support. It is unique in this registry in that its identifiers are **not** URIs,
but instead are as defined by the original open source developers of Indy. This
method is deprecated and issuers using Hyperledger Indy ledgers are recommended
to use the [`did:indy` AnonCreds Objects
method](#didindy-anoncreds-objects-method) wherever possible.

- Status: Deployed
- Verifiable Data Registry: Hyperledger Indy instances
- Contact Name: Stephen Curran
- Contact Email: stephen.curran@sovrin.org
- Contact Website: git repository to be created
- Specification: To be created

#### `did:indy` AnonCreds Objects Method

The `did:indy` AnonCreds objects method uses registration and resolution methods
implemented in later Hyperledger Indy clients (such as those based on [Indy
VDR](https://github.com/hyperledger/indy-vdr)). The `did:indy` AnonCreds objects
identifiers are URIs (to be precise DID URLs with path elements to identify the
specific AnonCreds object), evolved from the identifiers used initially in
Hyperledger Indy. The objects are registered and resolved using the same tools
as the [Hyperledger Indy AnonCreds objects
method](#hyperledger-indy-anoncreds-object-method), with the primary difference
being the AnonCreds objects identifiers within the objects themselves.

- Status: Not deployed
- Verifiable Data Registry: Hyperledger Indy instances
- Contact Name: Stephen Curran
- Contact Email: swcurran@cloudcompass.ca
- Contact Website: [https://github.com/hyperledger/indy-did-method](https://github.com/hyperledger/indy-did-method)
- Specification: [https://hyperledger.github.io/indy-did-method/#other-indy-ledger-object-identifiers](https://hyperledger.github.io/indy-did-method/#other-indy-ledger-object-identifiers)

#### HTTP AnonCreds Objects Method

The HTTP AnonCreds objects method uses HTTP URLs as AnonCreds object
identifiers. For this method, the resolution is simple: dereference the URL
to retrieve the published object. While this approach is fairly simple, it
is not recommended for production use for a number of reasons:

- the lack of proof of immutability in the approach (although this could be
  alleviated through the use of hashlinks),
- the lack of a forced relationship between the issuer entity and the AnonCreds
  objects (such as a DID),
- the centralization of the Verifiable Data Registry and hence the possiblity of
  surveillance by the web service operator,
- the possibility of rendering the issued credentials useless because the web
  service is removed by its operator, making the AnonCreds objects unresolvable.

The simplicity of this AnonCreds objects method may make it useful for testing.
Those considering using a web server as a Verifiable Data Registry would likely
be better to use an AnonCreds objects method based on
[`did:web`](https://w3c-ccg.github.io/did-method-web/).

- Status: Not yet deployed
- Verifiable Data Registry: Hyperledger Indy instances
- Contact Name: Stephen Curran
- Contact Email: swcurran@cloudcompass.ca
- Contact Website: [https://github.com/hyperledger/indy-did-method](https://github.com/hyperledger/indy-did-method)
- Specification: [https://hyperledger.github.io/indy-did-method/#other-indy-ledger-object-identifiers](https://hyperledger.github.io/indy-did-method/#other-indy-ledger-object-identifiers)

#### cheqd AnonCreds Objects Method

The cheqd AnonCreds objects method specifies how to register and resolve
AnonCreds objects as general purpose resources on the cheqd Verifiable Data
Registry. The identifiers for the resources are DID URLs that are dereferenced
to return the AnonCreds objects.

- Status: Not deployed
- Verifiable Data Registry: [cheqd Data Network](https://cheqd.io)
- Contact Name: Ankur Banerjee
- Contact Email: ankur@cheqd.io
- Contact Website: [https://cheqd.io](https://cheqd.io)
- Specification: [https://blog.cheqd.io/our-approach-to-resources-on-ledger-25bf5690c975](https://blog.cheqd.io/our-approach-to-resources-on-ledger-25bf5690c975)
