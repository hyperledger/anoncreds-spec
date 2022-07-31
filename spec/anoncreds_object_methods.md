## AnonCreds Object Methods

Throughout the AnonCreds data flows are specifications of data models that
contain identifiers to AnonCreds object that are published by issuers to
locations ([[ref: Verifiable Data Registries]]) accessible to holders and
verifiers. The format of the object identifiers and the location of the objects
are not defined in this specification. Rather, similar to the approach of [[ref:
DID Methods]] defined in the [W3C DID
Specification](https://www.w3.org/TR/did-core/), [[ref: AnonCreds Object
Methods]] define AnonCreds object registration and resolution specifications and
those Methods are referenced in the [AnonCreds
Object Method Registry](#anoncreds-object-method-registry) (below).

[[ref: AnonCreds Object Methods]] specify how to register AnonCreds objects
([[ref: Schemas]], [[ref: CredDefs]], [[ref: Rev_Reg_Defs]] and
[[Rev_Reg_Entrys]]), including the specification of the identifier formats,
where the objects are published, how issuers can register the objects, and how
anyone can resolve the identifiers to retrieve the published objects.
Implementations of the AnonCreds specification should be organized so as to
support for issuers at least one AnonCreds Object Method for registration, and
one or more AnonCreds Object Methods for resolution. AnonCreds issuers choose
what AnonCred registration method(s) they use, and all AnonCreds participants
choose what AnonCreds object resolvers they support. As with DIDs, a Universal
AnonCreds Object Resolver is possible, as is a Universal AnonCreds Object
Registrar.

### AnonCreds Object Identifiers

Unlike with the DID Core specification, the format of the AnonCreds object
identifiers are minimally constrained in this specification, other than needing to be
a unique identifier string.

::: todo
Add the ABNF for identifier Strings
:::

### AnonCreds Object Method Registry

The AnonCreds Object Method Registry 
contains a reference to each implementation's AnonCreds object registration and resolution
method. An AnonCreds implementation's resolver may be specified as part of a DID
Method specification, or may be a separate specification describing only the

::: todo
Add the AnonCreds Object Method table with entries for `did:sov`, `did:indy`, `http`, `did:web` and `did:cheqd`.
:::
