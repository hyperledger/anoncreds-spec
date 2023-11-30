## AnonCreds Conventions

Over the years of using Hyperledger AnonCreds, several conventions (listed here) have been defined can or must be used
in deploying AnonCreds. The conventions are not required in the current [AnonCreds implementation], but
are necessary to follow for interoperability with other AnonCreds implementations.

[AnonCreds implementation]: https://github.com/hyperledger/anoncreds-rs

### Encoding Credential Claims

As described in this specification, the claim data that is actually signed in
producing an AnonCreds verifiable credential is not the "raw", human-readable
data of the claims, but rather an integer derived from the raw data. The act of
encoding the data was defined to be done by the issuer. However, unless the
issuer implements exactly the encoding expected by all others in an ecosystem,
the signatures produced for a presentation will not verify. Thus, although the
issuer is nominally in control of the encoding, practically, all issuers MUST
follow the [encoding defined in this specification](#encoding-attribute-data).

In a future version of AnonCreds we expect to move the encoding process away
from the issuer and into AnonCreds.

### Date and Date/Time Predicates

A powerful capability in AnonCreds is the ability to use predicates on dates,
such as proving based on a date of birth (a strongly correlatable value) that a
person is older than a certain age without revealing the date of birth. However,
because of [how credential claims are encoded](#encoding-credential-claims)
(above), for a date-based predicate to work, the date must be an integer. Thus,
a "date of birth" claim in an [ISO 8601 Standard Date
String](https://www.iso.org/iso-8601-date-and-time-format.html) will not be able
to be used in a predicate. Rather, the convention of the AnonCreds community has
been to put the data into the form of the date as an integer of value `YYYYMMDD`
This convention was initially defined
[here](https://github.com/hyperledger/aries-rfcs/tree/main/concepts/0441-present-proof-best-practices#dates-and-predicates)
by the [Hyperledger Aries](https://www.hyperledger.org/projects/aries)
community.

For the same reasons, AnonCreds `datetime` claims that are to be used in predicates
SHOULD be issued in [Unix Time](https://en.wikipedia.org/wiki/Unix_time) format.

In a future version of AnonCreds we expect to define the type of each claim in a
credential so that the `date` and `datetime` values as strings can be
automatically encoded as integers and Unix Time values (respectively). This
enables supporting both human-friendly displaying of the claims as well as
support for predicates.

### Presentation Request Revocation Intervals

While the AnonCreds [[ref: Presentation Request]] format allows the flexible
application of `from` to `to` ranges for when the [[ref: Holder]] must prove
their credential was not revoked, those deploying AnonCreds have found that it is
rarely practical or necessary to use such flexibility, and the best practices
are to set the two values (`from`, `to`) to be the same in [[ref: Presentation
Requests]]. For [[ref: Verifiers]] interested in the current revocation status
of the credential, both values should be set to the current time, while if the
verifier wants to see the revocation status of the credential at some point in
the past, both values should be set to point in time.

Details about this convention can be found in the [Presentation Request section
of this specification](#request-non-revocation-proofs).

Since the [[ref:Holder]] must prove non-revocation based on a [[ref: Revocation
Registry Entry]] published by the issuer, the actual interval that the [[ref:
Holder]] must use is not `from` to `to`, but rather from the [[ref: Revocation
Registry Entry]] active at time `from` to the [[ref: Revocation Registry Entry]]
active at time `to`, where "time" is as determined by the transaction times
recorded at the location on which the issuer published the [[ref: Revocation
Registry]].
